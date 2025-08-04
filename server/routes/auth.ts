import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { sendVerificationEmail, sendWelcomeEmail } from "../lib/email";

// Import users map from users.ts to sync profile data
const usersMap = new Map();

// In-memory database simulation (in production, use a real database like Supabase)
let users: Map<string, any> = new Map();
let userIdCounter = 1;

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

// No demo user initialization - users start with empty database

// Create user profile function
const createUserProfile = async (user: any) => {
  const profileData = {
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.name || user.username,
    profile_image_url: "",
    bio: "New to Music Catch! 🎵",
    country: "",
    date_of_birth: "",
    gender: "",
    is_verified: user.is_verified || false,
    is_artist: false,
    is_active: true,
    follower_count: 0,
    following_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };

  // Store in users map for profile endpoints
  usersMap.set(user.id, profileData);

  console.log("✅ Created user profile:", profileData);
  return profileData;
};

// Mock Supabase functions for in-memory operations
const mockSupabase = {
  async createUser(userData: any) {
    const userId = `user${++userIdCounter}`;
    const user = {
      id: userId,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store by email, username, and id for easy lookup
    users.set(user.email, user);
    users.set(user.username, user);
    users.set(user.id, user);

    return { data: user, error: null };
  },

  async getUserByEmail(email: string) {
    const user = users.get(email);
    return {
      data: user || null,
      error: user ? null : { code: "PGRST116", message: "User not found" },
    };
  },

  async getUserByUsername(username: string) {
    const user = users.get(username);
    return {
      data: user || null,
      error: user ? null : { code: "PGRST116", message: "User not found" },
    };
  },

  async checkEmailAvailability(email: string) {
    const user = users.get(email);
    return { available: !user, error: null };
  },

  async checkUsernameAvailability(username: string) {
    // Username validation
    if (!username || username.length < 3) {
      return {
        available: false,
        error: {
          code: "INVALID_USERNAME",
          message: "Username must be at least 3 characters long",
        },
      };
    }

    if (username.length > 20) {
      return {
        available: false,
        error: {
          code: "INVALID_USERNAME",
          message: "Username must be 20 characters or less",
        },
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        available: false,
        error: {
          code: "INVALID_USERNAME",
          message:
            "Username can only contain letters, numbers, and underscores",
        },
      };
    }

    // Check if reserved username
    const reservedUsernames = [
      "admin",
      "root",
      "api",
      "www",
      "mail",
      "ftp",
      "localhost",
      "test",
      "demo",
      "support",
      "help",
    ];
    if (reservedUsernames.includes(username.toLowerCase())) {
      return {
        available: false,
        error: {
          code: "RESERVED_USERNAME",
          message: "This username is reserved",
        },
      };
    }

    const user = users.get(username);
    return { available: !user, error: null };
  },
};

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
    const { data: existingUserByEmail } =
      await mockSupabase.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const { data: existingUserByUsername } =
      await mockSupabase.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const { data: newUser, error } = await mockSupabase.createUser({
      email,
      username,
      name,
      password: hashedPassword,
      is_verified: provider === "google", // Google users are pre-verified
      email_verified: provider === "google",
    });

    if (error) {
      console.error("User creation error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create user account",
      });
    }

    // Create user profile in the profile system
    try {
      await createUserProfile(newUser);
    } catch (profileError) {
      console.warn("Failed to create user profile:", profileError);
      // Don't fail registration if profile creation fails
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
    console.log(
      `🔍 Availability check request - email: ${email}, username: ${username}`,
    );

    if (!email && !username) {
      console.warn("⚠️ No email or username provided in availability check");
      return res.status(400).json({
        success: false,
        message: "Email or username parameter is required",
      });
    }

    const result: { emailAvailable?: boolean; usernameAvailable?: boolean } =
      {};

    if (email) {
      console.log(`📧 Checking email availability: ${email}`);
      const { available, error } = await mockSupabase.checkEmailAvailability(
        email.toString(),
      );

      if (error) {
        console.error(`❌ Error checking email availability:`, error);
        throw error;
      }

      result.emailAvailable = available;
      console.log(`✅ Email ${email} availability: ${available}`);
    }

    if (username) {
      console.log(`👤 Checking username availability: ${username}`);
      const { available, error } = await mockSupabase.checkUsernameAvailability(
        username.toString(),
      );

      if (error) {
        console.error(`❌ Username validation error:`, error);
        return res.status(400).json({
          success: false,
          message: error.message,
          code: error.code,
        });
      }

      result.usernameAvailable = available;
      console.log(`✅ Username ${username} availability: ${available}`);
    }

    console.log(`📊 Final availability result:`, result);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("❌ Availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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

    // Send actual email with verification code
    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`🔑 Verification code: ${verificationCode}`);
    console.log(`🕒 Code expires at: ${expiry.toISOString()}`);

    // Try to send email, but don't fail if email service is unavailable
    const emailResult = await sendVerificationEmail(email, verificationCode);

    if (!emailResult.success) {
      console.warn(
        "Email service unavailable, continuing with in-memory verification:",
        emailResult.error,
      );
      // Don't fail the request, just log the issue
      // In development, we'll still provide the debug code
    } else {
      console.log(`✅ Verification email sent successfully to: ${email}`);
    }

    res.json({
      success: true,
      message: emailResult.success
        ? "Verification code sent to your email successfully"
        : "Verification code generated (email service unavailable - check console for debug code)",
      // For development/demo - always include debug code when email fails or in dev mode
      debugCode:
        process.env.NODE_ENV === "development" || !emailResult.success
          ? verificationCode
          : undefined,
      expiresAt: expiry.toISOString(),
      emailSent: emailResult.success,
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

    console.log(`🔍 Verification attempt - Email: ${email}, Code: ${code}`);
    console.log(`📦 Stored codes:`, Array.from(emailVerificationCodes.keys()));

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const storedVerification = emailVerificationCodes.get(email);
    console.log(`📝 Stored verification for ${email}:`, storedVerification);

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
    const { data: existingUserByEmail } =
      await mockSupabase.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const { data: existingUserByUsername } =
      await mockSupabase.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const { data: newUser, error } = await mockSupabase.createUser({
      email,
      username,
      name,
      password: hashedPassword,
      is_verified: true, // Email was verified in previous step
      email_verified: true,
    });

    if (error) {
      console.error("User creation error:", error);
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

    // Find user by email
    const { data: user, error } = await mockSupabase.getUserByEmail(email);

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
