import { RequestHandler } from "express";
import { serverSupabase } from "../lib/supabase";
import bcrypt from "bcrypt";
import { sendVerificationEmail, sendWelcomeEmail } from "../lib/email";

// In-memory storage for email verification codes
const emailVerificationCodes: Map<
  string,
  {
    code: string;
    email: string;
    expiry: Date;
    attempts: number;
  }
> = new Map();

// User registration endpoint
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const { email, username, name, password, provider = "email" } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, username, and password are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const { data: existingUserByEmail } = await serverSupabase.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const { data: existingUserByUsername } = await serverSupabase.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in Supabase
    const { data: newUser, error } = await serverSupabase.createUser({
      email,
      username,
      name,
      password: hashedPassword,
      is_verified: provider === "google", // Google users are pre-verified
      email_verified: provider === "google",
    });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create user account",
      });
    }

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

    console.log("✅ New user registered:", {
      id: newUser.id,
      email,
      username,
      name,
      provider,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if email or username is available
export const checkAvailability: RequestHandler = async (req, res) => {
  try {
    const { email, username } = req.query;

    const result: { emailAvailable?: boolean; usernameAvailable?: boolean } = {};

    if (email) {
      const { available } = await serverSupabase.checkEmailAvailability(email.toString());
      result.emailAvailable = available;
    }

    if (username) {
      const { available } = await serverSupabase.checkUsernameAvailability(username.toString());
      result.usernameAvailable = available;
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Send email verification code
export const sendEmailVerification: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    emailVerificationCodes.set(email, {
      code: verificationCode,
      email,
      expiry,
      attempts: 0,
    });

    // Send actual email with beautiful design
    const emailResult = await sendVerificationEmail(email, verificationCode);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Still return success for development but log the error
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }
    }

    console.log(`📧 Verification email sent to: ${email}`);
    console.log(`🕒 Code expires at: ${expiry.toISOString()}`);

    // In development, also show preview URL and debug code
    if (process.env.NODE_ENV === "development") {
      console.log(`🔗 Email preview: ${emailResult.previewUrl || 'N/A'}`);
      console.log(`🔑 Debug code: ${verificationCode}`);
    }

    res.json({
      success: true,
      message: "Verification code sent to your email successfully",
      // For development only - remove in production
      debugCode: process.env.NODE_ENV === "development" ? verificationCode : undefined,
      previewUrl: process.env.NODE_ENV === "development" ? emailResult.previewUrl : undefined,
    });
  } catch (error) {
    console.error("Send email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify email verification code
export const verifyEmailCode: RequestHandler = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const storedVerification = emailVerificationCodes.get(email);

    if (!storedVerification) {
      return res.status(400).json({
        success: false,
        message: "No verification code found for this email",
      });
    }

    // Check if code is expired
    if (new Date() > storedVerification.expiry) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Check if too many attempts
    if (storedVerification.attempts >= 5) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Too many verification attempts. Please request a new code.",
      });
    }

    // Verify code
    if (storedVerification.code !== code) {
      storedVerification.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
        attemptsRemaining: 5 - storedVerification.attempts,
      });
    }

    // Code is valid - remove from storage
    emailVerificationCodes.delete(email);

    res.json({
      success: true,
      message: "Email verified successfully",
    });

    console.log(`✅ Email verified successfully: ${email}`);
  } catch (error) {
    console.error("Verify email code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Complete user registration (after email verification)
export const completeRegistration: RequestHandler = async (req, res) => {
  try {
    const { email, username, name, password } = req.body;

    // Validation
    if (!email || !username || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters long",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    // Name validation
    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const { data: existingUserByEmail } = await serverSupabase.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const { data: existingUserByUsername } = await serverSupabase.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in Supabase
    const { data: newUser, error } = await serverSupabase.createUser({
      email,
      username,
      name,
      password: hashedPassword,
      is_verified: true, // Email was verified in previous step
      email_verified: true,
    });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create user account",
      });
    }

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

    console.log(`✅ New user registered successfully:`, {
      id: newUser.id,
      email,
      username,
      name,
    });
  } catch (error) {
    console.error("Complete registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login endpoint
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user in Supabase
    const { data: user, error } = await serverSupabase.getUserByEmail(email);

    if (error || !user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Generate a simple token (in production, use proper JWT)
    const token = `token-${user.id}-${Date.now()}`;

    // Return success response (without password)
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token: token,
    });

    console.log(`✅ User logged in successfully: ${email}`);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all users (for demo purposes)
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { data: users, error } = await serverSupabase.supabase
      .from('users')
      .select('id, email, username, name, created_at, is_verified')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }

    res.json({
      success: true,
      users: users || [],
      count: users?.length || 0,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
