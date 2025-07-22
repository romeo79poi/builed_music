import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

export interface UserData {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  createdAt: any;
}

export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured || !auth || !db) {
      return {
        success: false,
        error:
          "Firebase is not configured. Please add Firebase environment variables.",
      };
    }

    // Try Firebase Auth first, fallback to development mode if Firebase project doesn't exist
    try {
      // Create user with Firebase Auth (no recaptcha)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
console.log({userCredential})
      const user = userCredential.user;

      // Store user data in Firestore with exact required fields
      const userDocData = {
        name: name,
        email: user.email!,
        uid: user.uid,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userDocData);

      return { success: true, user };
    } catch (firebaseError: any) {
      // If Firebase project doesn't exist or other Firebase errors, use development mode
      if (
        firebaseError.code === "auth/project-not-found" ||
        firebaseError.code === "auth/invalid-api-key" ||
        firebaseError.code === "auth/network-request-failed" ||
        firebaseError.message?.includes("Firebase project") ||
        firebaseError.message?.includes("API key not valid") ||
        firebaseError.message?.includes("network request failed")
      ) {
        console.warn(
          "Firebase project not found or network error, using development mode",
        );

        // Simulate successful user creation for development
        const mockUser = {
          uid: `dev-${Date.now()}`,
          email: email,
          displayName: name,
          emailVerified: true,
        } as User;

        console.log("✅ Development user created:", {
          name,
          email,
          uid: mockUser.uid,
        });

        return { success: true, user: mockUser };
      }

      // Re-throw other Firebase errors to be handled by outer catch
      throw firebaseError;
    }
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle specific Firebase Auth errors
    let errorMessage = "An error occurred during signup";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email is already registered";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email format";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "Email/password signup is not enabled";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { success: false, error: errorMessage };
  }
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string; token?: string }> => {
  try {
    // First try Firebase authentication if configured
    if (isFirebaseConfigured && auth) {
      try {
        console.log("🔗 Attempting Firebase authentication...");
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        console.log("✅ Firebase authentication successful");
        return { success: true, user: userCredential.user };
      } catch (firebaseError: any) {
        console.warn("⚠️ Firebase authentication failed:", firebaseError.code);

        // Handle specific Firebase errors
        if (firebaseError.code === "auth/network-request-failed") {
          console.log("🔄 Firebase network failed, trying backend authentication...");
          // Fall through to backend authentication
        } else {
          // For other Firebase errors, return them directly
          let errorMessage = "Authentication failed";
          switch (firebaseError.code) {
            case "auth/user-not-found":
              errorMessage = "No account found with this email";
              break;
            case "auth/wrong-password":
              errorMessage = "Incorrect password";
              break;
            case "auth/invalid-email":
              errorMessage = "Invalid email format";
              break;
            case "auth/user-disabled":
              errorMessage = "This account has been disabled";
              break;
            case "auth/too-many-requests":
              errorMessage = "Too many failed login attempts. Please try again later.";
              break;
            default:
              errorMessage = firebaseError.message || errorMessage;
          }
          return { success: false, error: errorMessage };
        }
      }
    }

    // Fallback to backend authentication
    console.log("🔄 Attempting backend authentication...");
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response, but handle cases where it's not JSON
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Login failed';
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || 'Login failed';
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      // Parse JSON response safely
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError);
        return {
          success: false,
          error: "Invalid response from server"
        };
      }

      if (data.success) {
        console.log("✅ Backend authentication successful");

        // Store the JWT token
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Create a user-like object for consistency
        const mockUser = {
          uid: data.user?.id || `backend-${Date.now()}`,
          email: data.user?.email || email,
          displayName: data.user?.name || data.user?.displayName || 'User',
          emailVerified: true,
          photoURL: data.user?.profilePicture || null,
        } as User;

        return {
          success: true,
          user: mockUser,
          token: data.token
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Login failed'
        };
      }
    } catch (backendError: any) {
      console.error("❌ Backend authentication failed:", backendError);

      // Provide more specific error messages
      let errorMessage = "Unable to connect to authentication service";

      if (backendError.name === 'TypeError' && backendError.message.includes('stream')) {
        errorMessage = "Server response error. Please try again.";
      } else if (backendError.name === 'TypeError' && backendError.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (backendError.message) {
        errorMessage = backendError.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error: any) {
    console.error("❌ Authentication error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login"
    };
  }
};

export const signInWithGoogle = async (): Promise<{
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}> => {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured || !auth || !db) {
      // Provide development mode simulation
      console.warn("🔧 Development mode: Simulating Google sign-in");

      // Simulate Google sign-in for development
      const mockUser = {
        uid: `google-dev-${Date.now()}`,
        email: "demo.user@gmail.com",
        displayName: "Demo User",
        emailVerified: true,
        photoURL: "https://via.placeholder.com/96x96/4285F4/ffffff?text=DU",
      } as User;

      console.log("✅ Development Google user signed in:", mockUser);

      return {
        success: true,
        user: mockUser,
        isNewUser: true,
      };
    }

    try {
      const provider = new GoogleAuthProvider();

      // Add required scopes for Google sign-in
      provider.addScope("email");
      provider.addScope("profile");

      // Set custom parameters to ensure we get verified accounts
      provider.setCustomParameters({
        prompt: "select_account",
      });

      console.log("🔗 Initiating Google sign-in popup...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Validate the user account
      if (!user.email) {
        throw new Error("No email address found in Google account");
      }

      if (!user.emailVerified) {
        console.warn("⚠️ Google account email not verified, but proceeding...");
      }

      console.log("✅ Google user authenticated:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      });

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let isNewUser = false;

      if (!userDoc.exists()) {
        // Create new user document with .set()
        const userData = {
          name: user.displayName || "",
          email: user.email || "",
          uid: user.uid,
          createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, userData);
        isNewUser = true;

        console.log("✅ New Google user created in Firestore:", userData);
      } else {
        console.log("✅ Existing Google user signed in:", userDoc.data());
      }

      return { success: true, user, isNewUser };
    } catch (firebaseError: any) {
      console.warn("⚠️ Firebase error during Google sign-in:", firebaseError.code, firebaseError.message);

      // Handle specific Firebase errors with better messages
      if (firebaseError.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          error: "Sign-in was cancelled. Please try again.",
        };
      }

      if (firebaseError.code === "auth/popup-blocked") {
        return {
          success: false,
          error: "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
        };
      }

      // If Firebase project doesn't exist or network issues, use development mode
      if (
        firebaseError.code === "auth/project-not-found" ||
        firebaseError.code === "auth/invalid-api-key" ||
        firebaseError.code === "auth/network-request-failed" ||
        firebaseError.message?.includes("Firebase project") ||
        firebaseError.message?.includes("API key not valid") ||
        firebaseError.message?.includes("network request failed")
      ) {
        console.warn(
          "🔄 Firebase network/config error, using development mode for Google sign-in",
        );

        // Simulate successful Google user creation for development
        const mockUser = {
          uid: `google-dev-${Date.now()}`,
          email: "demo.user@gmail.com",
          displayName: "Demo User",
          emailVerified: true,
          photoURL: "https://via.placeholder.com/96x96/4285F4/ffffff?text=DU",
        } as User;

        console.log("✅ Development Google user created:", mockUser);

        return { success: true, user: mockUser, isNewUser: true };
      }

      // Re-throw other Firebase errors to be handled by outer catch
      throw firebaseError;
    }
  } catch (error: any) {
    console.error("Google sign-in error:", error);

    let errorMessage = "An error occurred during Google sign-in";

    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMessage = "Sign-in cancelled by user";
        break;
      case "auth/popup-blocked":
        errorMessage =
          "Sign-in popup was blocked by your browser. Please allow popups and try again.";
        break;
      case "auth/cancelled-popup-request":
        errorMessage = "Sign-in was cancelled";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "Google sign-in is not enabled for this application";
        break;
      case "auth/unauthorized-domain":
        errorMessage = "This domain is not authorized for Google sign-in";
        break;
      case "auth/account-exists-with-different-credential":
        errorMessage =
          "An account already exists with the same email address but different sign-in credentials";
        break;
      case "auth/invalid-credential":
        errorMessage = "The provided Google credential is invalid or expired";
        break;
      case "auth/user-disabled":
        errorMessage = "This Google account has been disabled";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this Google account";
        break;
      case "auth/email-already-in-use":
        errorMessage =
          "This email is already registered with a different sign-in method";
        break;
      default:
        if (error.message?.includes("No email address")) {
          errorMessage = "Google account must have a valid email address";
        } else if (error.message?.includes("network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          errorMessage =
            error.message ||
            "An unexpected error occurred during Google sign-in";
        }
    }

    return { success: false, error: errorMessage };
  }
};

export const sendFirebaseEmailVerification = async (
  user: User,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase is not configured. Using mock verification.",
      };
    }

    await sendEmailVerification(user);
    console.log("✅ Email verification sent via Firebase");
    return { success: true };
  } catch (error: any) {
    console.error("Email verification error:", error);

    let errorMessage = "Failed to send email verification";
    switch (error.code) {
      case "auth/too-many-requests":
        errorMessage =
          "Too many verification emails sent. Please wait before requesting another.";
        break;
      case "auth/user-disabled":
        errorMessage = "User account has been disabled";
        break;
      case "auth/user-not-found":
        errorMessage = "User not found";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { success: false, error: errorMessage };
  }
};

export const signUpWithEmailAndPasswordWithVerification = async (
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // First create the user
    const signupResult = await signUpWithEmailAndPassword(
      email,
      password,
      name,
    );

    if (!signupResult.success) {
      return signupResult;
    }

    // Send email verification
    if (signupResult.user && isFirebaseConfigured) {
      const verificationResult = await sendFirebaseEmailVerification(
        signupResult.user,
      );
      if (!verificationResult.success) {
        console.warn(
          "Failed to send email verification:",
          verificationResult.error,
        );
      }
    }

    return signupResult;
  } catch (error: any) {
    console.error("Signup with verification error:", error);
    return { success: false, error: error.message || "Signup failed" };
  }
};

// Phone authentication functions
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (
  elementId: string,
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    try {
      if (!isFirebaseConfigured || !auth) {
        resolve({ success: false, error: "Firebase not configured" });
        return;
      }

      // Clear existing verifier
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }

      recaptchaVerifier = new RecaptchaVerifier(
        elementId,
        {
          size: "invisible",
          callback: (response: any) => {
            console.log("reCAPTCHA solved:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },
        },
        auth,
      );

      resolve({ success: true });
    } catch (error: any) {
      console.error("RecaptchaVerifier initialization error:", error);
      resolve({ success: false, error: error.message });
    }
  });
};

export const sendPhoneOTP = async (
  phoneNumber: string,
): Promise<{
  success: boolean;
  confirmationResult?: ConfirmationResult;
  error?: string;
}> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase not configured. Using mock OTP.",
      };
    }

    if (!recaptchaVerifier) {
      return {
        success: false,
        error: "reCAPTCHA not initialized. Please refresh and try again.",
      };
    }

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier,
    );
    console.log("✅ OTP sent via Firebase to:", phoneNumber);

    return { success: true, confirmationResult };
  } catch (error: any) {
    console.error("Phone OTP error:", error);

    let errorMessage = "Failed to send OTP";
    switch (error.code) {
      case "auth/invalid-phone-number":
        errorMessage = "Invalid phone number format";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many requests. Please try again later.";
        break;
      case "auth/captcha-check-failed":
        errorMessage =
          "reCAPTCHA verification failed. Please refresh and try again.";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { success: false, error: errorMessage };
  }
};

export const verifyPhoneOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase not configured.",
      };
    }

    const result = await confirmationResult.confirm(otp);
    console.log("✅ Phone verified via Firebase:", result.user.phoneNumber);

    // Store user data in Firestore if it's a new user
    if (db && result.user) {
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userData = {
          phoneNumber: result.user.phoneNumber || "",
          uid: result.user.uid,
          createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, userData);
        console.log("✅ New phone user created in Firestore");
      }
    }

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Phone verification error:", error);

    let errorMessage = "OTP verification failed";
    switch (error.code) {
      case "auth/invalid-verification-code":
        errorMessage = "Invalid verification code";
        break;
      case "auth/code-expired":
        errorMessage = "Verification code has expired";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { success: false, error: errorMessage };
  }
};

export const logout = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error:
          "Firebase is not configured. Please add Firebase environment variables.",
      };
    }

    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.message || "An error occurred during logout",
    };
  }
};
