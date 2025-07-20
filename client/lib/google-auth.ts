import { User } from "firebase/auth";
import { signInWithGoogle as firebaseSignInWithGoogle } from "./auth";

export interface GoogleAuthResult {
  success: boolean;
  user?: User | any;
  error?: string;
  isNewUser?: boolean;
  sessionToken?: string;
  googleUserInfo?: {
    sub: string;
    email: string;
    name: string;
    picture: string;
    emailVerified: boolean;
  };
}

export interface BackendAuthResult {
  success: boolean;
  message?: string;
  user?: any;
  sessionToken?: string;
  isNewUser?: boolean;
  googleUserInfo?: any;
}

// Enhanced Google Sign-In with backend verification
export const signInWithGoogleEnhanced = async (): Promise<GoogleAuthResult> => {
  try {
    console.log("🔑 Starting enhanced Google authentication...");

    // Step 1: Firebase Google Authentication
    const firebaseResult = await firebaseSignInWithGoogle();

    if (!firebaseResult.success) {
      return {
        success: false,
        error: firebaseResult.error || "Firebase Google authentication failed",
      };
    }

    console.log("✅ Firebase Google auth successful");

    // Step 2: Get ID token from Firebase user
    let idToken: string | undefined;
    let accessToken: string | undefined;

    try {
      if (firebaseResult.user) {
        idToken = await firebaseResult.user.getIdToken();
        console.log("✅ Firebase ID token obtained");
      }
    } catch (tokenError) {
      console.warn("⚠️ Could not get Firebase ID token:", tokenError);
    }

    // Step 3: Verify with backend
    try {
      const backendResult = await verifyWithBackend({
        idToken,
        accessToken,
        firebaseUser: firebaseResult.user,
      });

      if (backendResult.success) {
        console.log("✅ Backend verification successful");

        // Store session token for future requests
        if (backendResult.sessionToken) {
          localStorage.setItem(
            "musiccatch_session",
            backendResult.sessionToken,
          );
          localStorage.setItem(
            "musiccatch_user",
            JSON.stringify(backendResult.user),
          );
        }

        return {
          success: true,
          user: backendResult.user,
          isNewUser: backendResult.isNewUser,
          sessionToken: backendResult.sessionToken,
          googleUserInfo: backendResult.googleUserInfo,
        };
      } else {
        console.warn("⚠️ Backend verification failed, using Firebase user");
        return firebaseResult;
      }
    } catch (backendError) {
      console.warn(
        "⚠️ Backend verification error, using Firebase user:",
        backendError,
      );
      return firebaseResult;
    }
  } catch (error) {
    console.error("❌ Enhanced Google authentication error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
};

// Verify authentication with backend
async function verifyWithBackend(params: {
  idToken?: string;
  accessToken?: string;
  firebaseUser?: User | any;
}): Promise<BackendAuthResult> {
  const { idToken, accessToken, firebaseUser } = params;

  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
      accessToken,
      firebaseUid: firebaseUser?.uid,
      firebaseEmail: firebaseUser?.email,
      firebaseDisplayName: firebaseUser?.displayName,
      firebasePhotoURL: firebaseUser?.photoURL,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend verification failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

// Verify current session
export const verifySession = async (): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    const sessionToken = localStorage.getItem("musiccatch_session");

    if (!sessionToken) {
      return {
        success: false,
        error: "No session token found",
      };
    }

    const response = await fetch("/api/auth/google/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionToken }),
    });

    const result = await response.json();

    if (result.success) {
      // Update stored user data
      localStorage.setItem("musiccatch_user", JSON.stringify(result.user));
    } else {
      // Clear invalid session
      localStorage.removeItem("musiccatch_session");
      localStorage.removeItem("musiccatch_user");
    }

    return result;
  } catch (error) {
    console.error("Session verification error:", error);
    return {
      success: false,
      error: "Session verification failed",
    };
  }
};

// Link Google account to existing user
export const linkGoogleAccount = async (
  userId: string,
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    // First, authenticate with Google
    const firebaseResult = await firebaseSignInWithGoogle();

    if (!firebaseResult.success) {
      return {
        success: false,
        error: firebaseResult.error || "Google authentication failed",
      };
    }

    // Get ID token
    let idToken: string | undefined;
    try {
      if (firebaseResult.user) {
        idToken = await firebaseResult.user.getIdToken();
      }
    } catch (tokenError) {
      console.warn("Could not get ID token:", tokenError);
    }

    // Link with backend
    const response = await fetch("/api/auth/google/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        idToken,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Update stored user data
      localStorage.setItem("musiccatch_user", JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error("Link Google account error:", error);
    return {
      success: false,
      error: "Failed to link Google account",
    };
  }
};

// Unlink Google account
export const unlinkGoogleAccount = async (
  userId: string,
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    const response = await fetch(`/api/auth/google/unlink/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      // Update stored user data
      localStorage.setItem("musiccatch_user", JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error("Unlink Google account error:", error);
    return {
      success: false,
      error: "Failed to unlink Google account",
    };
  }
};

// Enhanced logout with backend cleanup
export const logoutEnhanced = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const sessionToken = localStorage.getItem("musiccatch_session");

    // Clear local storage first
    localStorage.removeItem("musiccatch_session");
    localStorage.removeItem("musiccatch_user");

    // Notify backend to invalidate session
    if (sessionToken) {
      try {
        await fetch("/api/auth/google/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken }),
        });
      } catch (backendError) {
        console.warn("Backend logout failed:", backendError);
        // Continue with local logout even if backend fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Enhanced logout error:", error);
    return {
      success: false,
      error: "Logout failed",
    };
  }
};

// Get stored user data
export const getStoredUser = (): any | null => {
  try {
    const userData = localStorage.getItem("musiccatch_user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting stored user:", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const sessionToken = localStorage.getItem("musiccatch_session");
  const userData = localStorage.getItem("musiccatch_user");
  return !!(sessionToken && userData);
};

// Get user profile with Google info
export const getUserProfile = async (
  userId: string,
): Promise<{
  success: boolean;
  user?: any;
  hasGoogleAccount?: boolean;
  isGoogleUser?: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`/api/auth/google/profile/${userId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      error: "Failed to get user profile",
    };
  }
};
