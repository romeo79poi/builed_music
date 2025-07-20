# Signup API Documentation

## Overview
The Music Catch application now has a complete signup system with both Firebase integration and backend API fallback. The system supports email verification with 6-digit codes and comprehensive validation.

## Environment Setup

### Firebase Configuration
Add these environment variables to `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## API Endpoints

### 1. Send Email Verification
**POST** `/api/auth/send-email-verification`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "debugCode": "123456" // Only in development
}
```

### 2. Verify Email Code
**POST** `/api/auth/verify-email`

Request:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

Error Response:
```json
{
  "success": false,
  "message": "Invalid verification code",
  "attemptsRemaining": 4
}
```

### 3. Check Availability
**GET** `/api/auth/check-availability?email={email}&username={username}`

Response:
```json
{
  "success": true,
  "emailAvailable": true,
  "usernameAvailable": false
}
```

### 4. Complete Registration
**POST** `/api/auth/complete-registration`

Request:
```json
{
  "email": "user@example.com",
  "username": "username123",
  "name": "John Doe",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "username": "username123",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isVerified": true
  }
}
```

### 5. User Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "username": "username123",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isVerified": true
  }
}
```

## Frontend Signup Flow

### 1. Method Selection
- User sees Google button and email/phone options
- Google button is hidden after selecting email

### 2. Email Input
- User enters email
- System checks availability
- Sends verification code to email

### 3. Email Verification
- User enters 6-digit code
- System verifies code with backend
- Max 5 attempts before requiring new code

### 4. Profile Setup
- User enters name and username
- System validates and checks username availability

### 5. Password Creation
- User creates password with requirements:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number

### 6. Registration Complete
- System creates user account
- Redirects to profile page

## Validation Rules

### Email
- Must be valid email format
- Must be unique

### Username
- At least 3 characters
- Only letters, numbers, and underscores
- Must be unique

### Name
- At least 2 characters

### Password
- At least 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Verification Code
- Exactly 6 digits
- Expires after 10 minutes
- Max 5 attempts

## Error Handling

The system handles various error scenarios:
- Network errors
- Firebase configuration issues
- Validation errors
- Duplicate emails/usernames
- Expired verification codes
- Invalid verification codes

## Development Features

### Debug Mode
- Verification codes are logged to console
- Firebase fallback for missing configuration
- Demo users for testing

### Testing
```bash
# Test email verification
curl -X POST http://localhost:8080/api/auth/send-email-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test code verification
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Test availability check
curl -X GET "http://localhost:8080/api/auth/check-availability?email=test@example.com&username=testuser"
```

## Security Notes

⚠️ **Production Considerations:**
- Hash passwords before storage
- Use real email service (SendGrid, SES, etc.)
- Implement rate limiting
- Use HTTPS only
- Add CSRF protection
- Use secure session management
- Implement proper user authentication tokens

## Firebase Integration

The system works with or without Firebase:
- **With Firebase**: Uses Firebase Auth and Firestore
- **Without Firebase**: Uses backend API with in-memory storage
- **Fallback**: Automatically switches to development mode if Firebase is unavailable

This ensures the application works in all environments while providing a complete signup experience.
