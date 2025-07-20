import { RequestHandler } from "express";

// In-memory storage for demo (in production, use a real database)
const users: Array<{
  id: string;
  email: string;
  username: string;
  name?: string;
  password: string; // In production, this should be hashed
  createdAt: Date;
  isVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
}> = [];

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

    // Check if user already exists
    const existingUser = users.find(
      (user) => user.email === email || user.username === username,
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
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

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      name,
      password, // In production, hash this password
      provider,
      createdAt: new Date(),
      isVerified: provider === "google", // Google users are pre-verified
    };

    users.push(newUser);

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

    // Log for demo purposes
    console.log("✅ New user registered:", {
      email,
      username,
      name,
      provider,
      createdAt: newUser.createdAt,
      isVerified: newUser.isVerified,
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

    const result: { emailAvailable?: boolean; usernameAvailable?: boolean } =
      {};

    if (email) {
      result.emailAvailable = !users.some(
        (user) => user.email === email.toString(),
      );
    }

    if (username) {
      result.usernameAvailable = !users.some(
        (user) => user.username === username.toString(),
      );
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

    // In production, send actual email via SendGrid, Nodemailer, etc.
    console.log(`📧 Email verification code for ${email}: ${verificationCode}`);
    console.log(`🕒 Code expires at: ${expiry.toISOString()}`);

    res.json({
      success: true,
      message: "Verification code sent successfully",
      // For development only - remove in production
      debugCode:
        process.env.NODE_ENV === "development" ? verificationCode : undefined,
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

    // Check if user already exists
    const existingUser = users.find(
      (user) => user.email === email || user.username === username,
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
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

    if (!/(?=.*[a-z])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter",
      });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number",
      });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      name,
      password, // In production, hash this password
      createdAt: new Date(),
      isVerified: true, // Email was verified in previous step
    };

    users.push(newUser);

    // Return success response (without password)
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

    console.log(`✅ New user registered successfully:`, {
      email,
      username,
      name,
      createdAt: newUser.createdAt,
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

    // Find user
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Return success response (without password)
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
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
    // Return users without passwords
    const usersResponse = users.map(
      ({ password, emailVerificationCode, ...user }) => user,
    );

    res.json({
      success: true,
      users: usersResponse,
      count: usersResponse.length,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
