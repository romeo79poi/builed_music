import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { sendVerificationEmail, sendWelcomeEmail } from "../lib/email";

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

// Initialize with demo user for consistency with profile data
initializeDemoUser();

function initializeDemoUser() {
  const demoUser = {
    id: "user1",
    email: "bio.spectra@musiccatch.com",
    username: "biospectra",
    name: "Bio Spectra",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqB5t8lIYfBW4AO", // hashed "password123"
    is_verified: true,
    email_verified: true,
    created_at: "2023-01-15T00:00:00.000Z",
    updated_at: "2023-01-15T00:00:00.000Z"
  };
  users.set("bio.spectra@musiccatch.com", demoUser);
  users.set("biospectra", demoUser);
  users.set("user1", demoUser);
}

// Mock Supabase functions for in-memory operations
const mockSupabase = {
  async createUser(userData: any) {
    const userId = `user${++userIdCounter}`;
    const user = {
      id: userId,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      error: user ? null : { code: 'PGRST116', message: 'User not found' }
    };
  },

  async getUserByUsername(username: string) {
    const user = users.get(username);
    return { 
      data: user || null, 
      error: user ? null : { code: 'PGRST116', message: 'User not found' }
    };
  },

  async checkEmailAvailability(email: string) {
    const user = users.get(email);
    return { available: !user, error: null };
  },

  async checkUsernameAvailability(username: string) {
    const user = users.get(username);
    return { available: !user, error: null };
  }
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
    const { data: existingUserByEmail } = await mockSupabase.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const { data: existingUserByUsername } = await mockSupabase.getUserByUsername(username);
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
      const { available } = await mockSupabase.checkEmailAvailability(email.toString());
      result.emailAvailable = available;
    }

    if (username) {
      const { available } = await mockSupabase.checkUsernameAvailability(username.toString());
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
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    emailVerificationCodes.set(email, {
      code: verificationCode,
      email,
      expiry,
      attempts: 0,
    });

    // For demo purposes, skip actual email sending and return debug info
    console.log(`📧 Verification email would be sent to: ${email}`);
    console.log(`🔑 Verification code: ${verificationCode}`);
    console.log(`🕒 Code expires at: ${expiry.toISOString()}`);

    res.json({
      success: true,
      message: "Verification code sent to your email successfully",
      // For development/demo - include debug code
      debugCode: verificationCode,
      expiresAt: expiry.toISOString(),
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
    const { data: existingUserByEmail } = await mockSupabase.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const { data: existingUserByUsername } = await mockSupabase.getUserByUsername(username);
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

// Get all users (for demo purposes)
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const allUsers = Array.from(users.values())
      .filter(user => user.email) // Only get users stored by email (to avoid duplicates)
      .map(({ password, ...user }) => user) // Remove password from response
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
