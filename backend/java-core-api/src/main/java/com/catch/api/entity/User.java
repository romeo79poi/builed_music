package com.catch.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "country")
    private String country;
    
    @Column(name = "birth_date")
    private LocalDateTime birthDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType = SubscriptionType.FREE;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "is_artist")
    private Boolean isArtist = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "follower_count", columnDefinition = "BIGINT DEFAULT 0")
    private Long followerCount = 0L;
    
    @Column(name = "following_count", columnDefinition = "BIGINT DEFAULT 0")
    private Long followingCount = 0L;
    
    @Column(name = "total_play_time_ms", columnDefinition = "BIGINT DEFAULT 0")
    private Long totalPlayTimeMs = 0L;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<UserRole> roles;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum SubscriptionType {
        FREE, PREMIUM, FAMILY, STUDENT
    }
    
    public enum UserRole {
        USER, ARTIST, ADMIN, MODERATOR
    }
    
    // Business methods
    public void incrementFollowerCount() {
        this.followerCount = (this.followerCount == null ? 0 : this.followerCount) + 1;
    }
    
    public void decrementFollowerCount() {
        this.followerCount = (this.followerCount == null || this.followerCount <= 0) ? 0 : this.followerCount - 1;
    }
    
    public void incrementFollowingCount() {
        this.followingCount = (this.followingCount == null ? 0 : this.followingCount) + 1;
    }
    
    public void decrementFollowingCount() {
        this.followingCount = (this.followingCount == null || this.followingCount <= 0) ? 0 : this.followingCount - 1;
    }
    
    public void addPlayTime(Long milliseconds) {
        this.totalPlayTimeMs = (this.totalPlayTimeMs == null ? 0 : this.totalPlayTimeMs) + milliseconds;
    }
    
    public boolean isPremiumUser() {
        return subscriptionType == SubscriptionType.PREMIUM || 
               subscriptionType == SubscriptionType.FAMILY || 
               subscriptionType == SubscriptionType.STUDENT;
    }
}
