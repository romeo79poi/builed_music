# 🔐 Complete Authentication System Documentation

Yeh complete, production-ready authentication system hai jo aapke music app ke liye banaya gaya hai. Ismein saare modern features hain jo ek professional app mein hone chahiye.

## 🚀 **Quick Start**

### Demo Access Karein
1. **Complete Auth Demo**: http://localhost:8080/complete-auth-demo
2. **Mongo Auth Demo**: http://localhost:8080/mongo-auth-demo

### Features Overview
- ✅ **Email & Phone Registration**
- ✅ **Multiple Login Methods** (Email/Username)
- ✅ **JWT Authentication** with refresh tokens  
- ✅ **Email & Phone Verification**
- ✅ **Password Reset via Email**
- ✅ **Rate Limiting & Security**
- ✅ **Admin Panel Features**
- ✅ **Real-time Availability Check**
- ✅ **Complete Frontend Integration**

## 📁 **File Structure**

```
server/
├── models/
│   └── User.ts                    # MongoDB User Schema
├── routes/
│   ├── auth-complete.ts           # Complete auth handlers
│   ├── auth-main.ts              # Auth routes with middleware
│   └── auth-mongodb.ts           # Simple MongoDB auth
├── middleware/
│   └── auth.ts                   # JWT middleware & validation
└── lib/
    ├── mongodb.ts                # Database connection
    └── jwt.ts                    # JWT utilities

client/
├── lib/
│   ├── auth-complete.ts          # Complete frontend client
│   └── auth-mongodb.ts           # Simple MongoDB client
├── pages/
│   ├── CompleteAuthDemo.tsx      # Full demo page
│   └── MongoAuthDemo.tsx         # Simple demo page
└── components/
    ├── MongoSignUpForm.tsx       # Registration components
    ├── MongoLoginForm.tsx        # Login components
    └── MongoProfile.tsx          # Profile management
```

## 🎯 **API Endpoints**

### **Registration**
```bash
# Email Registration
POST /api/v3/auth/register/email
{
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "password": "SecurePass123",
  "bio": "Music lover",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "profileImageURL": "https://example.com/avatar.jpg"
}

# Phone Registration  
POST /api/v3/auth/register/phone
{
  "phone": "+1234567890",
  "username": "johndoe",
  "name": "John Doe", 
  "password": "SecurePass123"
}
```

### **Login**
```bash
# Email Login
POST /api/v3/auth/login/email
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}

# Username Login
POST /api/v3/auth/login/username  
{
  "username": "johndoe",
  "password": "SecurePass123",
  "rememberMe": false
}
```

### **Verification**
```bash
# Send Email Verification
POST /api/v3/auth/verification/email/send
{
  "email": "user@example.com"
}

# Verify Email Code
POST /api/v3/auth/verification/email/verify
{
  "email": "user@example.com", 
  "code": "123456"
}

# Send Phone OTP
POST /api/v3/auth/verification/phone/send
{
  "phone": "+1234567890"
}

# Verify Phone OTP
POST /api/v3/auth/verification/phone/verify
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

### **Availability Check**
```bash
# Check Email/Username/Phone Availability
GET /api/v3/auth/check-availability?email=test@example.com&username=johndoe&phone=+1234567890

Response:
{
  "success": true,
  "emailAvailable": true,
  "usernameAvailable": false,
  "phoneAvailable": true
}
```

### **Password Management**
```bash
# Forgot Password
POST /api/v3/auth/password/forgot
{
  "email": "user@example.com"
}

# Reset Password
POST /api/v3/auth/password/reset
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}

# Change Password (Authenticated)
POST /api/v3/auth/password/change
Headers: Authorization: Bearer <access_token>
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass123"
}
```

### **Token Management**
```bash
# Refresh Access Token
POST /api/v3/auth/token/refresh
{
  "refreshToken": "your_refresh_token"
}

# Logout
POST /api/v3/auth/logout
{
  "refreshToken": "your_refresh_token"
}
```

### **Protected Routes**
```bash
# Get User Profile
GET /api/v3/auth/profile
Headers: Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "display_name": "John Doe",
    "bio": "Music lover",
    "is_verified": true,
    "is_artist": false,
    "follower_count": 0,
    "following_count": 0,
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": "2023-01-01T12:00:00.000Z"
  }
}
```

### **Admin Routes** (Admin Only)
```bash
# Get All Users
GET /api/v3/auth/admin/users?page=1&limit=20
Headers: Authorization: Bearer <admin_access_token>

# Ban/Unban User
POST /api/v3/auth/admin/users/:userId/ban
{
  "banned": true,
  "reason": "Violation of terms"
}

# Get Auth Statistics
GET /api/v3/auth/admin/stats
```

## 💻 **Frontend Usage**

### **Installation**
```typescript
import { authComplete } from '@/lib/auth-complete';
```

### **Registration**
```typescript
// Email Registration
const result = await authComplete.registerWithEmail({
  email: 'user@example.com',
  username: 'johndoe', 
  name: 'John Doe',
  password: 'SecurePass123',
  bio: 'Music lover'
});

if (result.success) {
  console.log('User registered:', result.user);
  console.log('Access token:', result.accessToken);
}

// Phone Registration
const phoneResult = await authComplete.registerWithPhone({
  phone: '+1234567890',
  username: 'johndoe',
  name: 'John Doe', 
  password: 'SecurePass123'
});
```

### **Login**
```typescript
// Email Login
const loginResult = await authComplete.loginWithEmail(
  'user@example.com',
  'SecurePass123',
  true // rememberMe
);

// Username Login
const usernameResult = await authComplete.loginWithUsername(
  'johndoe',
  'SecurePass123',
  false // rememberMe
);

if (loginResult.success) {
  console.log('Logged in:', loginResult.user);
  // Tokens automatically saved to localStorage
}
```

### **Verification**
```typescript
// Send Email Verification
const emailSent = await authComplete.sendEmailVerification('user@example.com');
if (emailSent.success) {
  console.log('Debug code:', emailSent.debugCode); // Development only
}

// Verify Email
const emailVerified = await authComplete.verifyEmailCode('user@example.com', '123456');

// Send Phone OTP
const otpSent = await authComplete.sendPhoneOTP('+1234567890'); 
if (otpSent.success) {
  console.log('Debug OTP:', otpSent.debugOtp); // Development only
}

// Verify Phone OTP
const phoneVerified = await authComplete.verifyPhoneOTP('+1234567890', '123456');
```

### **Availability Check**
```typescript
const availability = await authComplete.checkAvailability({
  email: 'test@example.com',
  username: 'johndoe'
});

if (availability.success) {
  console.log('Email available:', availability.emailAvailable);
  console.log('Username available:', availability.usernameAvailable);
}
```

### **Password Management**
```typescript
// Forgot Password
const forgotResult = await authComplete.forgotPassword('user@example.com');
if (forgotResult.success) {
  console.log('Reset token:', forgotResult.resetToken); // Development only
}

// Reset Password
const resetResult = await authComplete.resetPassword('reset_token', 'NewPassword123');

// Change Password (for authenticated users)
const changeResult = await authComplete.changePassword('OldPassword', 'NewPassword123');
```

### **Profile Management**
```typescript
// Get Profile (automatically handles token refresh)
const profile = await authComplete.getProfile();
if (profile.success) {
  console.log('User profile:', profile.user);
}
```

### **Authentication State**
```typescript
// Check if user is authenticated
const isLoggedIn = authComplete.isAuthenticated();

// Get current user
const currentUser = authComplete.getCurrentUser();

// Get tokens
const accessToken = authComplete.getAccessToken();
const refreshToken = authComplete.getRefreshToken();

// Logout
await authComplete.logout();
```

### **Session Maintenance**
```typescript
// Auto-maintain session (call periodically)
await authComplete.maintainSession();

// Or set up automatic maintenance
setInterval(() => {
  authComplete.maintainSession();
}, 5 * 60 * 1000); // Every 5 minutes
```

## 🔒 **Security Features**

### **Rate Limiting**
- **Auth endpoints**: 5 attempts per 15 minutes
- **Login endpoints**: 10 attempts per 15 minutes  
- **Verification**: 3 attempts per 5-10 minutes
- **Availability check**: 20 checks per 5 minutes

### **Password Security**
- Minimum 8 characters
- bcrypt hashing with 12 salt rounds
- Password change requires current password

### **JWT Security**
- Access tokens: 7 days (30 days with "Remember Me")
- Refresh tokens: 30 days
- Automatic token refresh
- Secure token storage

### **Input Validation**
- Email format validation
- Username validation (3-20 chars, alphanumeric + underscore)
- Phone number validation
- Reserved username protection
- SQL injection protection

### **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Cache-Control for auth endpoints

## 🛠️ **Database Schema**

### **User Model** (MongoDB)
```javascript
{
  email: String,              // Unique email
  username: String,           // Unique username 
  password: String,           // bcrypt hashed
  name: String,               // Full name
  display_name: String,       // Display name
  bio: String,                // User bio
  profile_image_url: String,  // Profile picture URL
  dob: Date,                  // Date of birth
  phone: String,              // Phone number
  is_verified: Boolean,       // Account verified
  email_verified: Boolean,    // Email verified
  is_artist: Boolean,         // Artist account
  is_admin: Boolean,          // Admin privileges
  is_banned: Boolean,         // Account banned
  ban_reason: String,         // Ban reason
  follower_count: Number,     // Follower count
  following_count: Number,    // Following count
  last_login: Date,           // Last login time
  provider: String,           // email/phone/google/facebook
  created_at: Date,           // Account creation
  updated_at: Date            // Last update
}
```

## 🚨 **Error Handling**

### **Common Error Codes**
```javascript
// Authentication Errors
TOKEN_MISSING      // No token provided
TOKEN_EXPIRED      // Token has expired  
TOKEN_INVALID      // Invalid token format
USER_NOT_FOUND     // User doesn't exist
ACCOUNT_NOT_VERIFIED // Account not verified

// Rate Limiting
RATE_LIMITED       // Too many requests

// Database
DB_UNAVAILABLE     // Database connection issue

// Admin
ADMIN_REQUIRED     // Admin access needed
```

### **Error Response Format**
```javascript
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "retryAfter": 300  // For rate limiting
}
```

## 🔧 **Environment Variables**

```bash
# Database
MONGO_URI=mongodb://localhost:27017/music_catch

# JWT Configuration  
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
REFRESH_EXPIRES_IN=30d

# Email Service (Optional)
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM=noreply@yourdomain.com

# SMS Service (Optional)
SMS_SERVICE_API_KEY=your_sms_service_key
SMS_FROM=+1234567890
```

## 📊 **Development vs Production**

### **Development Features**
- Debug codes/tokens in API responses
- Console logging for verification codes
- Relaxed rate limiting
- Detailed error messages

### **Production Setup**
1. **Environment**: Set `NODE_ENV=production`
2. **JWT Secret**: Use strong, random secret key
3. **Database**: Use MongoDB Atlas or production DB
4. **Email Service**: Integrate Sendgrid/AWS SES
5. **SMS Service**: Integrate Twilio/AWS SNS
6. **Rate Limiting**: Enable strict limits
7. **Security**: Enable all security headers

## 🎉 **Complete Feature List**

### ✅ **Authentication**
- [x] Email registration & login
- [x] Phone registration & login  
- [x] Username login
- [x] JWT access & refresh tokens
- [x] Remember me functionality
- [x] Auto token refresh
- [x] Secure logout

### ✅ **Verification**
- [x] Email verification with codes
- [x] Phone OTP verification
- [x] Resend verification codes
- [x] Expiry & attempt limits

### ✅ **Password Management**
- [x] Password reset via email
- [x] Password change for users
- [x] Strong password validation
- [x] Secure password hashing

### ✅ **User Management**
- [x] Real-time availability check
- [x] Profile management
- [x] User search & discovery
- [x] Account verification status

### ✅ **Security**
- [x] Rate limiting per endpoint
- [x] Input validation & sanitization
- [x] SQL injection protection  
- [x] Security headers
- [x] CORS configuration

### ✅ **Admin Features**
- [x] User management panel
- [x] Ban/unban users
- [x] Authentication statistics
- [x] Admin-only routes

### ✅ **Frontend Integration**
- [x] Complete React client
- [x] TypeScript support
- [x] Automatic token management
- [x] Error handling
- [x] Demo pages

## 📞 **Support & Customization**

Agar aapko koi specific feature chahiye ya koi customization karni hai, to bataiye:

1. **Social Login** (Google/Facebook/Apple)
2. **Two-Factor Authentication** (2FA)
3. **Email Templates** customization
4. **Advanced Admin Panel**
5. **Analytics Integration**
6. **Role-based Access Control**
7. **API Documentation** (Swagger)

Is authentication system mein saab kuch production-ready hai aur easily scalable hai. Aap isko directly use kar sakte hain ya customize kar sakte hain apni requirements ke according! 🚀
