import { RequestHandler } from "express";
import { randomBytes, createHash } from "crypto";

// In-memory storage for demo (in production, use a real database)
interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  profilePicture?: string;
  googleId?: string;
  provider: "google" | "email" | "phone";
  createdAt: Date;
  lastLogin: Date;
  isVerified: boolean;
  emailVerified: boolean;
  refreshToken?: string;
  accessToken?: string;
}

interface GoogleTokenInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale?: string;
}

// In-memory users storage
const users: User[] = [];
const userSessions: Map<string, { userId: string; expiresAt: Date }> =
  new Map();

// Generate secure session token
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

// Hash tokens for storage
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Verify Google OAuth token
async function verifyGoogleToken(
  accessToken: string,
): Promise<GoogleTokenInfo | null> {
  try {
    // In production, verify with Google's tokeninfo endpoint
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
    );

    if (!response.ok) {
      console.error("Google token verification failed:", response.statusText);
      return null;
    }

    const tokenInfo = await response.json();

    // Validate required fields
    if (!tokenInfo.sub || !tokenInfo.email) {
      console.error("Invalid Google token info:", tokenInfo);
      return null;
    }

    return tokenInfo;
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return null;
  }
}

// Alternative method: Verify Google ID token (JWT)
async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleTokenInfo | null> {
  try {
    // In production, use Google's libraries like google-auth-library
    // For demo, we'll validate the structure
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (in production, verify signature too)
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

    // Validate audience, issuer, expiration, etc.
    if (
      !payload.sub ||
      !payload.email ||
      payload.iss !== "https://accounts.google.com"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name || "",
      picture: payload.picture || "",
      given_name: payload.given_name || "",
      family_name: payload.family_name || "",
      locale: payload.locale,
    };
  } catch (error) {
    console.error("Error verifying Google ID token:", error);
    return null;
  }
}

// Generate username from email or name
function generateUsername(email: string, name: string): string {
  let baseUsername = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, "")
    : email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

  // Ensure uniqueness
  let username = baseUsername;
  let counter = 1;

  while (users.some((user) => user.username === username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

// Google OAuth callback handler
export const handleGoogleAuth: RequestHandler = async (req, res) => {
  try {
    const { accessToken, idToken, code } = req.body;

    if (!accessToken && !idToken && !code) {
      return res.status(400).json({
        success: false,
        message: "Missing authentication credentials",
      });
    }

    let googleUserInfo: GoogleTokenInfo | null = null;

    // Try different verification methods
    if (idToken) {
      googleUserInfo = await verifyGoogleIdToken(idToken);
    } else if (accessToken) {
      googleUserInfo = await verifyGoogleToken(accessToken);
    }

    if (!googleUserInfo) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google authentication credentials",
      });
    }

    // Check if user exists
    let user = users.find(
      (u) =>
        u.googleId === googleUserInfo!.sub || u.email === googleUserInfo!.email,
    );
    let isNewUser = false;

    if (!user) {
      // Create new user
      const username = generateUsername(
        googleUserInfo.email,
        googleUserInfo.name,
      );

      user = {
        id: Date.now().toString(),
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        username,
        profilePicture: googleUserInfo.picture,
        googleId: googleUserInfo.sub,
        provider: "google",
        createdAt: new Date(),
        lastLogin: new Date(),
        isVerified: true,
        emailVerified: googleUserInfo.email_verified,
        accessToken: accessToken || undefined,
      };

      users.push(user);
      isNewUser = true;

      console.log("✅ New Google user created:", {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        googleId: user.googleId,
        emailVerified: user.emailVerified,
      });
    } else {
      // Update existing user
      user.lastLogin = new Date();
      user.profilePicture = googleUserInfo.picture; // Update profile picture
      user.emailVerified = googleUserInfo.email_verified;
      if (accessToken) {
        user.accessToken = accessToken;
      }

      console.log("✅ Existing Google user logged in:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const hashedToken = hashToken(sessionToken);

    // Store session (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    userSessions.set(hashedToken, { userId: user.id, expiresAt });

    // Return user data (without sensitive info)
    const { accessToken: _, refreshToken: __, ...userResponse } = user;

    res.json({
      success: true,
      message: isNewUser ? "Account created successfully" : "Login successful",
      user: userResponse,
      sessionToken,
      isNewUser,
      googleUserInfo: {
        sub: googleUserInfo.sub,
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture,
        emailVerified: googleUserInfo.email_verified,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during Google authentication",
    });
  }
};

// Verify Google user session
export const verifyGoogleSession: RequestHandler = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: "Session token required",
      });
    }

    const hashedToken = hashToken(sessionToken);
    const session = userSessions.get(hashedToken);

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        userSessions.delete(hashedToken);
      }

      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const user = users.find((u) => u.id === session.userId);

    if (!user) {
      userSessions.delete(hashedToken);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data (without sensitive info)
    const { accessToken: _, refreshToken: __, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      sessionValid: true,
    });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during session verification",
    });
  }
};

// Link existing account with Google
export const linkGoogleAccount: RequestHandler = async (req, res) => {
  try {
    const { userId, accessToken, idToken } = req.body;

    if (!userId || (!accessToken && !idToken)) {
      return res.status(400).json({
        success: false,
        message: "User ID and Google credentials required",
      });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.googleId) {
      return res.status(400).json({
        success: false,
        message: "Google account already linked",
      });
    }

    // Verify Google credentials
    let googleUserInfo: GoogleTokenInfo | null = null;

    if (idToken) {
      googleUserInfo = await verifyGoogleIdToken(idToken);
    } else if (accessToken) {
      googleUserInfo = await verifyGoogleToken(accessToken);
    }

    if (!googleUserInfo) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credentials",
      });
    }

    // Check if Google account is already linked to another user
    const existingGoogleUser = users.find(
      (u) => u.googleId === googleUserInfo!.sub,
    );
    if (existingGoogleUser && existingGoogleUser.id !== userId) {
      return res.status(400).json({
        success: false,
        message: "This Google account is already linked to another user",
      });
    }

    // Link Google account
    user.googleId = googleUserInfo.sub;
    user.profilePicture = user.profilePicture || googleUserInfo.picture;
    user.emailVerified = googleUserInfo.email_verified;

    console.log("✅ Google account linked:", {
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
    });

    const { accessToken: _, refreshToken: __, ...userResponse } = user;

    res.json({
      success: true,
      message: "Google account linked successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Link Google account error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during account linking",
    });
  }
};

// Unlink Google account
export const unlinkGoogleAccount: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.googleId) {
      return res.status(400).json({
        success: false,
        message: "No Google account linked",
      });
    }

    // Ensure user has another login method
    if (user.provider === "google" && !user.username) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot unlink Google account: no alternative login method available",
      });
    }

    user.googleId = undefined;
    user.accessToken = undefined;
    user.refreshToken = undefined;

    console.log("✅ Google account unlinked:", {
      userId: user.id,
      email: user.email,
    });

    const { accessToken: _, refreshToken: __, ...userResponse } = user;

    res.json({
      success: true,
      message: "Google account unlinked successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Unlink Google account error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during account unlinking",
    });
  }
};

// Get user profile with Google info
export const getGoogleUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken: _, refreshToken: __, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      hasGoogleAccount: !!user.googleId,
      isGoogleUser: user.provider === "google",
    });
  } catch (error) {
    console.error("Get Google user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout and invalidate session
export const logoutGoogleUser: RequestHandler = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (sessionToken) {
      const hashedToken = hashToken(sessionToken);
      userSessions.delete(hashedToken);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

// Admin endpoint to get all users (for demo)
export const getAllGoogleUsers: RequestHandler = async (req, res) => {
  try {
    const usersResponse = users.map(
      ({ accessToken, refreshToken, ...user }) => ({
        ...user,
        hasGoogleAccount: !!user.googleId,
        isGoogleUser: user.provider === "google",
      }),
    );

    res.json({
      success: true,
      users: usersResponse,
      count: usersResponse.length,
      googleUsers: usersResponse.filter((u) => u.isGoogleUser).length,
      linkedAccounts: usersResponse.filter(
        (u) => u.hasGoogleAccount && !u.isGoogleUser,
      ).length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
