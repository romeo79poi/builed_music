import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { isMongoConnected } from "../lib/mongodb";
import { rateLimit, validateRegistrationInput, validateLoginInput } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;

// Store OTP codes temporarily (in production, use Redis)
const otpStore = new Map<string, { code: string; email: string; expiresAt: Date; userData?: any }>();

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "music-catch-api",
      audience: "music-catch-app",
    }
  );
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email (mock implementation)
const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // TODO: Implement actual email sending with NodeMailer
    console.log(`📧 Sending OTP ${otp} to ${email}`);
    
    // For development, just log the OTP
    console.log(`🔢 OTP for ${email}: ${otp}`);
    
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
};

// Step 1: Request OTP for signup
const requestSignupOTP: RequestHandler = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const { email, username, password, name } = req.body;

    // Validate input
    if (!email || !username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? "Email already registered" : "Username already taken",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP and user data
    const otpKey = `signup_${email}`;
    otpStore.set(otpKey, {
      code: otp,
      email,
      expiresAt,
      userData: { email, username, password, name }
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.json({
      success: true,
      message: "Verification code sent to your email",
      email,
    });
  } catch (error: any) {
    console.error("Request signup OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

// Step 2: Verify OTP and create account
const verifySignupOTP: RequestHandler = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Get stored OTP
    const otpKey = `signup_${email}`;
    const storedOTP = otpStore.get(otpKey);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // Check expiration
    if (new Date() > storedOTP.expiresAt) {
      otpStore.delete(otpKey);
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified, create user account
    const { email: userEmail, username, password, name } = storedOTP.userData;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = new User({
      email: userEmail,
      username,
      password: hashedPassword,
      name,
      display_name: name,
      provider: "email",
      is_verified: true,
      email_verified: true,
    });

    await newUser.save();

    // Clean up OTP
    otpStore.delete(otpKey);

    // Generate token
    const token = generateToken(newUser._id.toString());

    // Return user data
    const userData = {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      avatar_url: newUser.profile_image_url,
      bio: newUser.bio,
      verified: newUser.is_verified,
      premium: false,
      followers_count: newUser.follower_count,
      following_count: newUser.following_count,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      data: userData,
    });
  } catch (error: any) {
    console.error("Verify signup OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// Step 1: Request OTP for login
const requestLoginOTP: RequestHandler = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    const otpKey = `login_${email}`;
    otpStore.set(otpKey, {
      code: otp,
      email,
      expiresAt,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.json({
      success: true,
      message: "Verification code sent to your email",
      email,
    });
  } catch (error: any) {
    console.error("Request login OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

// Step 2: Verify OTP and login
const verifyLoginOTP: RequestHandler = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Get stored OTP
    const otpKey = `login_${email}`;
    const storedOTP = otpStore.get(otpKey);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // Check expiration
    if (new Date() > storedOTP.expiresAt) {
      otpStore.delete(otpKey);
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Get user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clean up OTP
    otpStore.delete(otpKey);

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data
    const userData = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      avatar_url: user.profile_image_url,
      bio: user.bio,
      verified: user.is_verified,
      premium: false,
      followers_count: user.follower_count,
      following_count: user.following_count,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: userData,
    });
  } catch (error: any) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// Google OAuth
const googleAuth: RequestHandler = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // TODO: Verify Google token with Google API
    // For now, accepting any token for development
    console.log("🔍 Verifying Google token:", token);

    // Generate unique mock data based on token to avoid conflicts
    const uniqueId = token.slice(-6); // Use last 6 chars of token for uniqueness
    const googleUser = {
      id: `google_user_${uniqueId}`,
      email: `user_${uniqueId}@gmail.com`,
      name: `Google User ${uniqueId}`,
      picture: "https://example.com/avatar.jpg",
    };

    console.log("📝 Generated Google user data:", googleUser);

    // Validate required fields
    if (!googleUser.email || !googleUser.id || !googleUser.name) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google user data - missing required fields",
      });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        { google_id: googleUser.id }
      ]
    });

    console.log("🔍 Existing user found:", user ? "Yes" : "No");

    if (!user) {
      // Create new user with validation
      const userData = {
        email: googleUser.email,
        username: `google_${googleUser.email.split('@')[0]}_${uniqueId}`,
        name: googleUser.name,
        display_name: googleUser.name,
        profile_image_url: googleUser.picture || "",
        provider: "google",
        google_id: googleUser.id,
        is_verified: true,
        email_verified: true,
      };

      console.log("👤 Creating new user with data:", userData);

      user = new User(userData);
      await user.save();
      console.log("✅ New Google user created:", user._id);
    } else {
      // Update existing user
      user.last_login = new Date();
      if (!user.google_id) {
        user.google_id = googleUser.id;
      }
      await user.save();
      console.log("✅ Existing Google user updated:", user._id);
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id.toString());

    // Return user data
    const userData = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      avatar_url: user.profile_image_url,
      bio: user.bio,
      verified: user.is_verified,
      premium: false,
      followers_count: user.follower_count,
      following_count: user.following_count,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      message: "Google authentication successful",
      token: jwtToken,
      data: userData,
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// Facebook OAuth
export const facebookAuth: RequestHandler = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Facebook token is required",
      });
    }

    // TODO: Verify Facebook token with Facebook API
    // For now, accepting any token for development
    console.log("🔍 Verifying Facebook token:", token);

    // Generate unique mock data based on token to avoid conflicts
    const uniqueId = token.slice(-6); // Use last 6 chars of token for uniqueness
    const facebookUser = {
      id: `facebook_user_${uniqueId}`,
      email: `user_${uniqueId}@facebook.com`,
      name: `Facebook User ${uniqueId}`,
      picture: {
        data: {
          url: "https://example.com/fb-avatar.jpg"
        }
      },
    };

    console.log("📝 Generated Facebook user data:", facebookUser);

    // Validate required fields
    if (!facebookUser.email || !facebookUser.id || !facebookUser.name) {
      return res.status(400).json({
        success: false,
        message: "Invalid Facebook user data - missing required fields",
      });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: facebookUser.email },
        { facebook_id: facebookUser.id }
      ]
    });

    console.log("🔍 Existing user found:", user ? "Yes" : "No");

    if (!user) {
      // Create new user with validation
      const userData = {
        email: facebookUser.email,
        username: `facebook_${facebookUser.email.split('@')[0]}_${uniqueId}`,
        name: facebookUser.name,
        display_name: facebookUser.name,
        profile_image_url: facebookUser.picture.data.url || "",
        provider: "facebook",
        facebook_id: facebookUser.id,
        is_verified: true,
        email_verified: true,
      };

      console.log("👤 Creating new user with data:", userData);

      user = new User(userData);
      await user.save();
      console.log("✅ New Facebook user created:", user._id);
    } else {
      // Update existing user
      user.last_login = new Date();
      if (!user.facebook_id) {
        user.facebook_id = facebookUser.id;
      }
      await user.save();
      console.log("✅ Existing Facebook user updated:", user._id);
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id.toString());

    // Return user data
    const userData = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      avatar_url: user.profile_image_url,
      bio: user.bio,
      verified: user.is_verified,
      premium: false,
      followers_count: user.follower_count,
      following_count: user.following_count,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      message: "Facebook authentication successful",
      token: jwtToken,
      data: userData,
    });
  } catch (error: any) {
    console.error("Facebook auth error:", error);
    res.status(500).json({
      success: false,
      message: "Facebook authentication failed",
    });
  }
};

// Apply rate limiting and export using CommonJS
const requestSignupOTPWithRateLimit = [rateLimit(3, 15 * 60 * 1000), requestSignupOTP];
const verifySignupOTPWithRateLimit = [rateLimit(5, 15 * 60 * 1000), verifySignupOTP];
const requestLoginOTPWithRateLimit = [rateLimit(3, 15 * 60 * 1000), requestLoginOTP];
const verifyLoginOTPWithRateLimit = [rateLimit(5, 15 * 60 * 1000), verifyLoginOTP];
const googleAuthWithRateLimit = [rateLimit(10, 15 * 60 * 1000), googleAuth];
const facebookAuthWithRateLimit = [rateLimit(10, 15 * 60 * 1000), facebookAuth];

// CommonJS exports
module.exports = {
  requestSignupOTP,
  verifySignupOTP,
  requestLoginOTP,
  verifyLoginOTP,
  googleAuth,
  facebookAuth,
  requestSignupOTPWithRateLimit,
  verifySignupOTPWithRateLimit,
  requestLoginOTPWithRateLimit,
  verifyLoginOTPWithRateLimit,
  googleAuthWithRateLimit,
  facebookAuthWithRateLimit,
};
