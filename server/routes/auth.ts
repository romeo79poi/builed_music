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
}> = [];

// User registration endpoint
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const { email, username, name, password } = req.body;

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
      createdAt: new Date(),
      isVerified: false,
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
      createdAt: newUser.createdAt,
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

// Get all users (for demo purposes)
export const getUsers: RequestHandler = async (req, res) => {
  try {
    // Return users without passwords
    const usersResponse = users.map(({ password, ...user }) => user);

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
