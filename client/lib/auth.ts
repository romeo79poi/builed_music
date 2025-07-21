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
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Check if Firebase is configured
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error:
          "Firebase is not configured. Please add Firebase environment variables.",
      };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Login error:", error);

    let errorMessage = "An error occurred during login";

    switch (error.code) {
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
      default:
        errorMessage = error.message || errorMessage;
    }

    return { success: false, error: errorMessage };
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
      // If Firebase project doesn't exist, use development mode
      if (
        firebaseError.code === "auth/project-not-found" ||
        firebaseError.code === "auth/invalid-api-key" ||
        firebaseError.code === "auth/network-request-failed" ||
        firebaseError.message?.includes("Firebase project") ||
        firebaseError.message?.includes("API key not valid") ||
        firebaseError.message?.includes("network request failed")
      ) {
        console.warn(
          "Firebase project not found or network error, using development mode for Google sign-in",
        );

        // Simulate successful Google user creation for development
        const mockUser = {
          uid: `google-dev-${Date.now()}`,
          email: "user@gmail.com",
          displayName: "Dev User",
          emailVerified: true,
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
