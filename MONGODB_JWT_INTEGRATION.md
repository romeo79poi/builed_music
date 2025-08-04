# MongoDB + JWT Authentication Integration

This document explains how JWT (JSON Web Token) and MongoDB have been integrated with your Node.js/Express backend and React frontend.

## 🎯 Overview

The integration provides:
- **JWT Authentication** for secure user sessions
- **MongoDB** for persistent user data storage
- **Refresh Token** mechanism for extended sessions
- **Protected API routes** with middleware
- **Complete React components** for signup, login, and profile management

## 🏗️ Architecture

### Backend Components

1. **MongoDB Connection** (`server/lib/mongodb.ts`)
   - Handles database connection with proper error handling
   - Connection pooling and reconnection logic
   - Environment-based configuration

2. **User Model** (`server/models/User.ts`)
   - Mongoose schema with all user fields
   - Automatic password exclusion from JSON responses
   - Proper indexing for performance

3. **JWT Utilities** (`server/lib/jwt.ts`)
   - Token generation and verification
   - Authentication middleware
   - Refresh token handling

4. **Auth Routes** (`server/routes/auth-mongodb.ts`)
   - Complete authentication endpoints
   - MongoDB integration
   - Email verification support

### Frontend Components

1. **API Client** (`client/lib/auth-mongodb.ts`)
   - Complete authentication API wrapper
   - Automatic token management
   - Token refresh mechanism

2. **React Components**
   - `MongoSignUpForm.tsx` - User registration
   - `MongoLoginForm.tsx` - User authentication
   - `MongoProfile.tsx` - Profile management

## 🚀 Quick Start

### 1. Environment Setup

The following environment variables are already configured:

```bash
MONGO_URI=mongodb://localhost:27017/music_catch
JWT_SECRET=your_jwt_secret_key_change_in_production_12345
JWT_EXPIRES_IN=7d
```

### 2. Access the Demo

Visit: `http://localhost:8080/mongo-auth-demo`

This demo page includes:
- Complete signup/login forms
- Profile management
- Real-time authentication state

### 3. Test the API Endpoints

#### Authentication Endpoints

```bash
# Register a new user
POST /api/v2/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

# Login
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

# Check availability
GET /api/v2/auth/check-availability?email=john@example.com&username=johndoe

# Refresh token
POST /api/v2/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

#### Protected Profile Endpoints

```bash
# Get profile (requires JWT)
GET /api/v2/profile
Authorization: Bearer your_jwt_token_here

# Update profile (requires JWT)
PUT /api/v2/profile
Authorization: Bearer your_jwt_token_here
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio",
  "profile_image_url": "https://example.com/image.jpg"
}
```

## 🔐 Security Features

### JWT Implementation
- **Access tokens**: Short-lived (7 days by default)
- **Refresh tokens**: Long-lived (30 days)
- **Automatic refresh**: Handles token renewal transparently
- **Secure storage**: Tokens stored in localStorage with proper management

### Password Security
- **bcrypt hashing**: Salt rounds set to 12
- **Minimum length**: 8 characters required
- **No plaintext storage**: Passwords never stored in plain text

### MongoDB Security
- **Data validation**: Server-side validation for all inputs
- **Unique constraints**: Email and username uniqueness enforced
- **Indexed fields**: Optimized queries with proper indexing

## 📚 Usage Examples

### Frontend Integration

#### Basic Authentication Check
```typescript
import { authAPI } from '@/lib/auth-mongodb';

// Check if user is authenticated
if (authAPI.isAuthenticated()) {
  // User is logged in
  const token = authAPI.getAccessToken();
}
```

#### User Registration
```typescript
const result = await authAPI.register({
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  password: 'securepassword123'
});

if (result.success) {
  // User registered and logged in
  console.log('User:', result.user);
  console.log('Token:', result.accessToken);
}
```

#### Profile Management
```typescript
// Get user profile
const profile = await authAPI.getProfile();

// Update profile
const updated = await authAPI.updateProfile({
  name: 'New Name',
  bio: 'Updated bio'
});
```

### Backend Middleware Usage

#### Protecting Routes
```typescript
import { authenticateJWT } from '../lib/jwt';

// Protected route
app.get('/api/protected', authenticateJWT, (req, res) => {
  const userId = (req as any).userId; // Available from JWT
  res.json({ message: 'Access granted', userId });
});
```

#### Optional Authentication
```typescript
import { optionalAuthJWT } from '../lib/jwt';

// Route that works with or without authentication
app.get('/api/public', optionalAuthJWT, (req, res) => {
  const userId = (req as any).userId; // May be undefined
  // Customize response based on authentication status
});
```

## 🛠️ Customization

### Extending the User Model

Add new fields to `server/models/User.ts`:

```typescript
const userSchema = new mongoose.Schema({
  // Existing fields...
  
  // New custom fields
  phone: { type: String },
  country: { type: String },
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true }
  }
});
```

### Adding New Protected Routes

```typescript
// server/routes/auth-mongodb.ts
export const getCustomData: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    // Your custom logic here
    res.json({ success: true, data: customData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// server/index.ts
app.get("/api/v2/custom", authenticateJWT, getCustomData);
```

### Customizing JWT Configuration

Modify `server/lib/jwt.ts`:

```typescript
// Customize token expiration
const JWT_EXPIRES_IN = '1h'; // Shorter for higher security
const REFRESH_EXPIRES_IN = '7d'; // Shorter refresh period

// Add custom claims
export const generateToken = (userId: string, role?: string) => {
  return jwt.sign(
    { 
      userId,
      role, // Custom claim
      iat: Math.floor(Date.now() / 1000)
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
};
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   # For local MongoDB:
   brew services start mongodb/brew/mongodb-community
   # Or: sudo systemctl start mongod
   ```

2. **JWT Token Invalid**
   - Check if JWT_SECRET is set correctly
   - Verify token expiration
   - Clear localStorage and re-authenticate

3. **CORS Issues**
   - Ensure frontend and backend are on same origin
   - Check CORS configuration in server setup

### Debug Logging

Enable debug mode by setting NODE_ENV:
```bash
NODE_ENV=development npm run dev
```

This provides:
- Detailed error messages
- MongoDB connection status
- JWT verification logs
- Email verification debug codes

## 🔄 Migration from In-Memory to MongoDB

The implementation maintains backward compatibility with your existing in-memory user store. Both systems can run simultaneously:

- **Legacy routes**: `/api/auth/*` (in-memory)
- **New routes**: `/api/v2/auth/*` (MongoDB + JWT)

You can gradually migrate users by:
1. Running both systems in parallel
2. Migrating user data from in-memory to MongoDB
3. Switching frontend to use v2 endpoints
4. Eventually deprecating legacy endpoints

## 📈 Production Considerations

### Security Hardening
- Change JWT_SECRET to a strong, random key
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Enable MongoDB authentication

### Performance Optimization
- Set up MongoDB replica sets
- Implement connection pooling
- Add Redis for token blacklisting
- Use CDN for static assets

### Monitoring
- Add MongoDB monitoring
- Implement JWT token analytics
- Set up error tracking (Sentry integration available)
- Monitor authentication success/failure rates

This integration provides a production-ready authentication system that can scale with your application's growth.
