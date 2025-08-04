import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
  sendVerificationEmailWithLink,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
} from "../lib/email-jwt";
import { connectDB, isMongoConnected } from "../lib/mongodb";
import User from "../models/User";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '30d';

// In-memory storage for refresh tokens and verification codes
const refreshTokens = new Set<string>();
const emailVerificationCodes = new Map<string, {
  code: string;
  email: string;
  expiry: Date;
  attempts: number;
}>();

// Helper Functions
const generateToken = (userId: string, type: 'access' | 'refresh' = 'access'): string => {
  const expiresIn = type === 'access' ? JWT_EXPIRES_IN : REFRESH_EXPIRES_IN;
  return jwt.sign(
    { 
      userId, 
      type,
      iat: Math.floor(Date.now() / 1000) 
    },
    JWT_SECRET,
    { 
      expiresIn,
      issuer: 'music-catch-api',
      audience: 'music-catch-app'
    }
  );
};

const verifyToken = (token: string): { userId: string; type: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'music-catch-api',
      audience: 'music-catch-app'
    }) as any;
    return { userId: decoded.userId, type: decoded.type || 'access' };
  } catch (error) {
    return null;
  }
};

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Initialize MongoDB
connectDB();

// ==========================================
// ENHANCED EMAIL VERIFICATION WITH JWT LINKS
// ==========================================

// Send verification email with JWT token link
export const sendEmailVerificationWithJWT: RequestHandler = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Generate both JWT token and backup code
    const verificationCode = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for code

    // Store verification code as backup
    emailVerificationCodes.set(email, {
      code: verificationCode,
      email,
      expiry,
      attempts: 0
    });

    // Check if user exists to get their info
    let userId: string | undefined;
    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      userId = user?._id?.toString();
    }

    // Send email with both JWT link and backup code
    const emailResult = await sendVerificationEmailWithLink(
      email, 
      verificationCode, 
      name, 
      userId
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: "Verification email sent with secure link",
        verificationToken: emailResult.verificationToken,
        verificationLink: emailResult.verificationLink, // Only in development
        emailSent: true,
        debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
        expiresAt: expiry.toISOString(),
        methods: ['link', 'code'] // Available verification methods
      });
    } else {
      res.json({
        success: true,
        message: "Verification code generated (email service unavailable)",
        emailSent: false,
        debugCode: verificationCode,
        expiresAt: expiry.toISOString(),
        methods: ['code'] // Only code method available
      });
    }

  } catch (error) {
    console.error("Send email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Verify email using JWT token from link
export const verifyEmailWithJWT: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    // Verify JWT token
    const decoded = verifyEmailVerificationToken(token);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    // Mark user as email verified if they exist
    if (isMongoConnected() && decoded.userId) {
      const user = await User.findById(decoded.userId);
      if (user) {
        user.email_verified = true;
        user.is_verified = true;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);

        res.json({
          success: true,
          message: "Email verified successfully with secure token",
          user: user.toJSON(),
          verified_with: 'jwt_token'
        });
        return;
      }
    }

    // If no user found but token is valid, still mark as success for the email
    res.json({
      success: true,
      message: "Email verified successfully",
      email: decoded.email,
      verified_with: 'jwt_token'
    });

  } catch (error) {
    console.error("Verify email with JWT error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Verify email using backup code (fallback method)
export const verifyEmailWithCode: RequestHandler = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    const storedVerification = emailVerificationCodes.get(email);
    if (!storedVerification) {
      return res.status(400).json({
        success: false,
        message: "No verification code found for this email"
      });
    }

    // Check if code is expired
    if (new Date() > storedVerification.expiry) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired"
      });
    }

    // Check if too many attempts
    if (storedVerification.attempts >= 5) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Too many verification attempts"
      });
    }

    // Verify code
    if (storedVerification.code !== code) {
      storedVerification.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
        attemptsRemaining: 5 - storedVerification.attempts
      });
    }

    // Code is valid - remove from storage
    emailVerificationCodes.delete(email);

    // Mark user as email verified if they exist
    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (user) {
        user.email_verified = true;
        user.is_verified = true;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);

        res.json({
          success: true,
          message: "Email verified successfully with code",
          user: user.toJSON(),
          verified_with: 'verification_code'
        });
        return;
      }
    }

    res.json({
      success: true,
      message: "Email verified successfully",
      email,
      verified_with: 'verification_code'
    });

  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==========================================
// PASSWORD RESET WITH JWT LINKS
// ==========================================

// Send password reset email with JWT token link
export const sendPasswordResetWithJWT: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists or not
      return res.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link"
      });
    }

    // Send password reset email with JWT token
    const emailResult = await sendPasswordResetEmail(email, user._id.toString(), user.name);

    if (emailResult.success) {
      res.json({
        success: true,
        message: "Password reset link sent to your email",
        resetToken: process.env.NODE_ENV === 'development' ? emailResult.resetToken : undefined,
        resetLink: emailResult.resetLink // Only in development
      });
    } else {
      res.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link"
      });
    }

  } catch (error) {
    console.error("Send password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reset password using JWT token from link
export const resetPasswordWithJWT: RequestHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Verify JWT token
    const decoded = verifyPasswordResetToken(token);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully with secure token"
    });

  } catch (error) {
    console.error("Reset password with JWT error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==========================================
// ENHANCED REGISTRATION WITH EMAIL VERIFICATION
// ==========================================

// Register user with automatic email verification
export const registerWithEmailVerification: RequestHandler = async (req, res) => {
  try {
    const { email, username, name, password, dateOfBirth, gender, bio, profileImageURL } = req.body;

    // Validation
    if (!email || !username || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, username, name, and password are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (not verified initially)
    const newUser = new User({
      email,
      username,
      name,
      password: hashedPassword,
      display_name: name,
      bio: bio || '',
      dob: dateOfBirth ? new Date(dateOfBirth) : undefined,
      profile_image_url: profileImageURL || '',
      is_verified: false,
      email_verified: false
    });

    await newUser.save();

    // Send verification email with JWT link
    const verificationCode = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    emailVerificationCodes.set(email, {
      code: verificationCode,
      email,
      expiry,
      attempts: 0
    });

    const emailResult = await sendVerificationEmailWithLink(
      email, 
      verificationCode, 
      name, 
      newUser._id.toString()
    );

    // Generate tokens for immediate login (user can access app but some features locked until verified)
    const accessToken = generateToken(newUser._id.toString(), 'access');
    const refreshToken = generateToken(newUser._id.toString(), 'refresh');
    refreshTokens.add(refreshToken);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      user: newUser.toJSON(),
      accessToken,
      refreshToken,
      emailVerification: {
        sent: emailResult.success,
        verificationToken: emailResult.verificationToken,
        verificationLink: emailResult.verificationLink, // Only in development
        debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
        expiresAt: expiry.toISOString(),
        methods: emailResult.success ? ['link', 'code'] : ['code']
      }
    });

    console.log("✅ New user registered with email verification:", newUser.email);

  } catch (error) {
    console.error("Registration with email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==========================================
// LOGIN WITH ENHANCED FEATURES
// ==========================================

// Enhanced login with verification status
export const loginWithEnhancedFeatures: RequestHandler = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const accessExpiry = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const accessToken = jwt.sign(
      { userId: user._id.toString(), type: 'access' },
      JWT_SECRET,
      { expiresIn: accessExpiry }
    );
    
    const refreshToken = generateToken(user._id.toString(), 'refresh');
    refreshTokens.add(refreshToken);

    const response: any = {
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      accessToken,
      refreshToken,
      rememberMe: !!rememberMe,
      verification_status: {
        email_verified: user.email_verified,
        account_verified: user.is_verified
      }
    };

    // If email not verified, provide verification options
    if (!user.email_verified) {
      response.verification_options = {
        can_resend_email: true,
        resend_endpoint: '/api/v4/auth/verification/email/resend'
      };
      response.message += " (Email verification pending)";
    }

    res.json(response);

    console.log(`✅ User logged in: ${email} (verified: ${user.email_verified})`);

  } catch (error) {
    console.error("Enhanced login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==========================================
// UTILITY ROUTES
// ==========================================

// Resend verification email
export const resendVerificationEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.email_verified) {
      return res.json({
        success: true,
        message: "Email is already verified"
      });
    }

    // Generate new verification
    const verificationCode = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    emailVerificationCodes.set(email, {
      code: verificationCode,
      email,
      expiry,
      attempts: 0
    });

    const emailResult = await sendVerificationEmailWithLink(
      email, 
      verificationCode, 
      user.name, 
      user._id.toString()
    );

    res.json({
      success: true,
      message: "Verification email resent",
      emailSent: emailResult.success,
      verificationToken: emailResult.verificationToken,
      verificationLink: emailResult.verificationLink, // Only in development
      debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      expiresAt: expiry.toISOString()
    });

  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export { refreshTokens };
