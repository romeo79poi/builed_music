package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"golang.org/x/crypto/bcrypt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// User represents the user entity
type User struct {
	ID              string    `json:"id" db:"id"`
	Email           string    `json:"email" db:"email"`
	Username        string    `json:"username" db:"username"`
	DisplayName     string    `json:"display_name" db:"display_name"`
	PasswordHash    string    `json:"-" db:"password_hash"`
	ProfileImageURL string    `json:"profile_image_url" db:"profile_image_url"`
	Bio             string    `json:"bio" db:"bio"`
	Country         string    `json:"country" db:"country"`
	IsVerified      bool      `json:"is_verified" db:"is_verified"`
	IsArtist        bool      `json:"is_artist" db:"is_artist"`
	IsActive        bool      `json:"is_active" db:"is_active"`
	FollowerCount   int64     `json:"follower_count" db:"follower_count"`
	FollowingCount  int64     `json:"following_count" db:"following_count"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
	LastLogin       time.Time `json:"last_login" db:"last_login"`
}

// UserService handles user-related operations
type UserService struct {
	db       *pgxpool.Pool
	redis    *redis.Client
	producer *kafka.Producer
	metrics  *UserMetrics
}

// UserMetrics for Prometheus monitoring
type UserMetrics struct {
	UserRegistrations prometheus.Counter
	UserLogins        prometheus.Counter
	ActiveUsers       prometheus.Gauge
	RequestDuration   prometheus.HistogramVec
}

// NewUserMetrics creates new metrics
func NewUserMetrics() *UserMetrics {
	return &UserMetrics{
		UserRegistrations: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "user_registrations_total",
			Help: "Total number of user registrations",
		}),
		UserLogins: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "user_logins_total",
			Help: "Total number of user logins",
		}),
		ActiveUsers: prometheus.NewGauge(prometheus.GaugeOpts{
			Name: "active_users_count",
			Help: "Number of currently active users",
		}),
		RequestDuration: *prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name: "http_request_duration_seconds",
				Help: "HTTP request duration in seconds",
			},
			[]string{"method", "endpoint", "status"},
		),
	}
}

// RegisterMetrics registers metrics with Prometheus
func (m *UserMetrics) RegisterMetrics() {
	prometheus.MustRegister(m.UserRegistrations)
	prometheus.MustRegister(m.UserLogins)
	prometheus.MustRegister(m.ActiveUsers)
	prometheus.MustRegister(m.RequestDuration)
}

// CreateUserRequest represents user creation request
type CreateUserRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Username    string `json:"username" binding:"required,min=3,max=50"`
	DisplayName string `json:"display_name" binding:"required,min=1,max=100"`
	Password    string `json:"password" binding:"required,min=8"`
	Country     string `json:"country"`
	IsArtist    bool   `json:"is_artist"`
}

// UpdateUserRequest represents user update request
type UpdateUserRequest struct {
	DisplayName     string `json:"display_name"`
	Bio             string `json:"bio"`
	Country         string `json:"country"`
	ProfileImageURL string `json:"profile_image_url"`
}

// LoginRequest represents login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// FollowRequest represents follow/unfollow request
type FollowRequest struct {
	FolloweeID string `json:"followee_id" binding:"required"`
}

// NewUserService creates a new user service
func NewUserService(db *pgxpool.Pool, redisClient *redis.Client, producer *kafka.Producer) *UserService {
	metrics := NewUserMetrics()
	metrics.RegisterMetrics()
	
	return &UserService{
		db:       db,
		redis:    redisClient,
		producer: producer,
		metrics:  metrics,
	}
}

// HashPassword hashes a password using bcrypt
func (s *UserService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword verifies a password against its hash
func (s *UserService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, req CreateUserRequest) (*User, error) {
	// Hash password
	hashedPassword, err := s.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Check if email or username already exists
	var exists bool
	err = s.db.QueryRow(ctx, 
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 OR username = $2)", 
		req.Email, req.Username).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("user with email or username already exists")
	}

	// Create user
	user := &User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		Username:     req.Username,
		DisplayName:  req.DisplayName,
		PasswordHash: hashedPassword,
		Country:      req.Country,
		IsArtist:     req.IsArtist,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	query := `
		INSERT INTO users (id, email, username, display_name, password_hash, 
						  country, is_artist, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	
	_, err = s.db.Exec(ctx, query,
		user.ID, user.Email, user.Username, user.DisplayName, user.PasswordHash,
		user.Country, user.IsArtist, user.IsActive, user.CreatedAt, user.UpdatedAt)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Cache user in Redis
	s.cacheUser(ctx, user)

	// Send user registration event to Kafka
	s.publishUserEvent("user.registered", user)

	// Update metrics
	s.metrics.UserRegistrations.Inc()

	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(ctx context.Context, userID string) (*User, error) {
	// Try to get from cache first
	if user := s.getCachedUser(ctx, userID); user != nil {
		return user, nil
	}

	// Get from database
	user := &User{}
	query := `
		SELECT id, email, username, display_name, profile_image_url, bio, 
			   country, is_verified, is_artist, is_active, follower_count, 
			   following_count, created_at, updated_at, last_login
		FROM users 
		WHERE id = $1 AND is_active = true
	`
	
	err := s.db.QueryRow(ctx, query, userID).Scan(
		&user.ID, &user.Email, &user.Username, &user.DisplayName,
		&user.ProfileImageURL, &user.Bio, &user.Country, &user.IsVerified,
		&user.IsArtist, &user.IsActive, &user.FollowerCount, &user.FollowingCount,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)
	
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Cache the user
	s.cacheUser(ctx, user)

	return user, nil
}

// UpdateUser updates user information
func (s *UserService) UpdateUser(ctx context.Context, userID string, req UpdateUserRequest) (*User, error) {
	query := `
		UPDATE users 
		SET display_name = COALESCE($2, display_name),
			bio = COALESCE($3, bio),
			country = COALESCE($4, country),
			profile_image_url = COALESCE($5, profile_image_url),
			updated_at = $6
		WHERE id = $1 AND is_active = true
		RETURNING id, email, username, display_name, profile_image_url, bio,
				  country, is_verified, is_artist, is_active, follower_count,
				  following_count, created_at, updated_at, last_login
	`
	
	user := &User{}
	err := s.db.QueryRow(ctx, query, userID, req.DisplayName, req.Bio, 
		req.Country, req.ProfileImageURL, time.Now()).Scan(
		&user.ID, &user.Email, &user.Username, &user.DisplayName,
		&user.ProfileImageURL, &user.Bio, &user.Country, &user.IsVerified,
		&user.IsArtist, &user.IsActive, &user.FollowerCount, &user.FollowingCount,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)
	
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Update cache
	s.cacheUser(ctx, user)

	// Publish user updated event
	s.publishUserEvent("user.updated", user)

	return user, nil
}

// AuthenticateUser authenticates a user with email and password
func (s *UserService) AuthenticateUser(ctx context.Context, req LoginRequest) (*User, error) {
	query := `
		SELECT id, email, username, display_name, password_hash, profile_image_url,
			   bio, country, is_verified, is_artist, is_active, follower_count,
			   following_count, created_at, updated_at, last_login
		FROM users 
		WHERE email = $1 AND is_active = true
	`
	
	user := &User{}
	err := s.db.QueryRow(ctx, query, req.Email).Scan(
		&user.ID, &user.Email, &user.Username, &user.DisplayName, &user.PasswordHash,
		&user.ProfileImageURL, &user.Bio, &user.Country, &user.IsVerified,
		&user.IsArtist, &user.IsActive, &user.FollowerCount, &user.FollowingCount,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLogin,
	)
	
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Check password
	if !s.CheckPassword(req.Password, user.PasswordHash) {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Update last login
	s.db.Exec(ctx, "UPDATE users SET last_login = $1 WHERE id = $2", time.Now(), user.ID)
	user.LastLogin = time.Now()

	// Cache user
	s.cacheUser(ctx, user)

	// Publish login event
	s.publishUserEvent("user.login", user)

	// Update metrics
	s.metrics.UserLogins.Inc()

	return user, nil
}

// FollowUser creates a follow relationship
func (s *UserService) FollowUser(ctx context.Context, followerID, followeeID string) error {
	if followerID == followeeID {
		return fmt.Errorf("cannot follow yourself")
	}

	// Check if already following
	var exists bool
	err := s.db.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM user_follows WHERE follower_id = $1 AND followee_id = $2)",
		followerID, followeeID).Scan(&exists)
	
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("already following this user")
	}

	// Create follow relationship
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Insert follow record
	_, err = tx.Exec(ctx,
		"INSERT INTO user_follows (follower_id, followee_id, created_at) VALUES ($1, $2, $3)",
		followerID, followeeID, time.Now())
	if err != nil {
		return err
	}

	// Update follower count
	_, err = tx.Exec(ctx,
		"UPDATE users SET following_count = following_count + 1 WHERE id = $1",
		followerID)
	if err != nil {
		return err
	}

	// Update followee count
	_, err = tx.Exec(ctx,
		"UPDATE users SET follower_count = follower_count + 1 WHERE id = $1",
		followeeID)
	if err != nil {
		return err
	}

	err = tx.Commit(ctx)
	if err != nil {
		return err
	}

	// Invalidate caches
	s.invalidateUserCache(ctx, followerID)
	s.invalidateUserCache(ctx, followeeID)

	// Publish follow event
	followEvent := map[string]interface{}{
		"follower_id": followerID,
		"followee_id": followeeID,
		"action":      "follow",
		"timestamp":   time.Now(),
	}
	s.publishEvent("user.follow", followEvent)

	return nil
}

// Cache operations
func (s *UserService) cacheUser(ctx context.Context, user *User) {
	userJSON, _ := json.Marshal(user)
	s.redis.Set(ctx, fmt.Sprintf("user:%s", user.ID), userJSON, time.Hour).Err()
}

func (s *UserService) getCachedUser(ctx context.Context, userID string) *User {
	userJSON, err := s.redis.Get(ctx, fmt.Sprintf("user:%s", userID)).Result()
	if err != nil {
		return nil
	}
	
	var user User
	if json.Unmarshal([]byte(userJSON), &user) != nil {
		return nil
	}
	
	return &user
}

func (s *UserService) invalidateUserCache(ctx context.Context, userID string) {
	s.redis.Del(ctx, fmt.Sprintf("user:%s", userID))
}

// Kafka event publishing
func (s *UserService) publishUserEvent(eventType string, user *User) {
	event := map[string]interface{}{
		"event_type": eventType,
		"user_id":    user.ID,
		"user_data":  user,
		"timestamp":  time.Now(),
	}
	s.publishEvent(eventType, event)
}

func (s *UserService) publishEvent(topic string, event map[string]interface{}) {
	eventJSON, _ := json.Marshal(event)
	
	s.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          eventJSON,
	}, nil)
}

// HTTP Handlers
func (s *UserService) SetupRoutes() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	
	// Middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(s.prometheusMiddleware())

	// Routes
	v1 := r.Group("/api/v1")
	{
		v1.POST("/users", s.handleCreateUser)
		v1.GET("/users/:id", s.handleGetUser)
		v1.PUT("/users/:id", s.handleUpdateUser)
		v1.POST("/auth/login", s.handleLogin)
		v1.POST("/users/:id/follow", s.handleFollow)
		v1.DELETE("/users/:id/follow", s.handleUnfollow)
		v1.GET("/users/:id/followers", s.handleGetFollowers)
		v1.GET("/users/:id/following", s.handleGetFollowing)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "user-service"})
	})

	// Metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	return r
}

func (s *UserService) handleCreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := s.CreateUser(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": user})
}

func (s *UserService) handleGetUser(c *gin.Context) {
	userID := c.Param("id")
	
	user, err := s.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

func (s *UserService) handleUpdateUser(c *gin.Context) {
	userID := c.Param("id")
	
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := s.UpdateUser(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

func (s *UserService) handleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := s.AuthenticateUser(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

func (s *UserService) handleFollow(c *gin.Context) {
	followerID := c.GetHeader("User-ID")
	followeeID := c.Param("id")

	err := s.FollowUser(c.Request.Context(), followerID, followeeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully followed user"})
}

func (s *UserService) handleUnfollow(c *gin.Context) {
	// Implementation for unfollow
	c.JSON(http.StatusOK, gin.H{"message": "Successfully unfollowed user"})
}

func (s *UserService) handleGetFollowers(c *gin.Context) {
	// Implementation for getting followers
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

func (s *UserService) handleGetFollowing(c *gin.Context) {
	// Implementation for getting following
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

// Prometheus middleware
func (s *UserService) prometheusMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)
		
		s.metrics.RequestDuration.WithLabelValues(
			c.Request.Method,
			c.FullPath(),
			strconv.Itoa(c.Writer.Status()),
		).Observe(duration.Seconds())
	}
}

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://catch_user:catch_password@localhost:5432/catch_music?sslmode=disable"
	}
	
	db, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Redis connection
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Kafka producer
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BROKERS"),
		"acks":              "all",
		"retries":           3,
	})
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	defer producer.Close()

	// Initialize service
	userService := NewUserService(db, redisClient, producer)
	
	// Setup routes
	router := userService.SetupRoutes()

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
