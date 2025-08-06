import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, isFirebaseConfigured } from "./firebase";
import { apiPost } from "./api-utils";

export interface UserData {
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImageURL: string;
  createdAt: any;
  verified: boolean;
  dob?: string;
  gender?: string;
  bio?: string;
}

// Upload profile image to Firebase Storage
export const uploadProfileImage = async (
  imageFile: File,
): Promise<{ success: boolean; imageURL?: string; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth || !storage) {
      return {
        success: false,
        error: "Firebase storage is not configured",
      };
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        error: "No authenticated user found",
      };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: "Only JPEG, PNG, and WebP images are allowed",
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return {
        success: false,
        error: "Image size must be less than 5MB",
      };
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${currentUser.uid}_${timestamp}.${fileExtension}`;

    // Create storage reference
    const profilePicRef = ref(storage, `profilePics/${fileName}`);

    // Upload file
    console.log("📤 Uploading profile image...");
    const uploadResult = await uploadBytes(profilePicRef, imageFile);

    // Get download URL
    const imageURL = await getDownloadURL(uploadResult.ref);
    console.log("✅ Profile image uploaded successfully:", imageURL);

    // Update user document in Firestore
    if (db) {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        profileImageURL: imageURL,
        updatedAt: serverTimestamp(),
      });
      console.log("✅ User profile updated with image URL");
    }

    return { success: true, imageURL };
  } catch (error: any) {
    console.error("Profile image upload error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to upload profile image" 
    };
  }
};

// Save user data to Firestore
export const saveUserData = async (
  user: User,
  additionalData?: {
    username?: string;
    name?: string;
    dob?: string;
    gender?: string;
    bio?: string;
    profileImage?: string;
  },
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth || !db) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    const userData: UserData = {
      email: user.email || "",
      name: additionalData?.name || user.displayName || "User",
      username: additionalData?.username || user.email?.split("@")[0] || "user",
      dob: additionalData?.dob || "",
      gender: additionalData?.gender || "",
      bio: additionalData?.bio || "",
      phone: user.phoneNumber || "",
      profileImageURL: additionalData?.profileImage || user.photoURL || "",
      createdAt: serverTimestamp(),
      verified: user.emailVerified || false,
    };

    await setDoc(doc(db, "users", user.uid), userData);
    console.log("✅ User data saved to Firestore:", userData);

    return { success: true };
  } catch (error: any) {
    console.error("Save user data error:", error);
    return {
      success: false,
      error: error.message || "Failed to save user data",
    };
  }
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
  username?: string,
  phone?: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase authentication is not configured",
      };
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    console.log("✅ Firebase user created:", user.email);

    // Save user data to Firestore
    const saveResult = await saveUserData(user, {
      name,
      username: username || email.split("@")[0],
    });

    if (!saveResult.success) {
      console.warn("⚠️ Failed to save user data:", saveResult.error);
    }

    return { success: true, user };
  } catch (error: any) {
    console.error("Signup error:", error);

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

// Sign up with email and password with verification
export const signUpWithEmailAndPasswordWithVerification = async (
  email: string,
  password: string,
  name: string,
  username?: string,
  phone?: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const signupResult = await signUpWithEmailAndPassword(
      email,
      password,
      name,
      username,
      phone,
    );

    if (!signupResult.success || !signupResult.user) {
      return signupResult;
    }

    // Send email verification
    try {
      await sendEmailVerification(signupResult.user);
      console.log("✅ Email verification sent");
    } catch (verifyError: any) {
      console.warn("⚠️ Failed to send email verification:", verifyError.message);
      // Don't fail the signup if email verification fails
    }

    return signupResult;
  } catch (error: any) {
    console.error("Signup with verification error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create account" 
    };
  }
};

// Login with email and password
// Check network connectivity
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Check if online
    if (!navigator.onLine) {
      return false;
    }

    // Try to reach Firebase auth domain
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://identitytoolkit.googleapis.com/v1/projects', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn('⚠️ Network connectivity check failed:', error);
    return false;
  }
};

// Retry function with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry for auth errors that aren't network related
      if (error.code && !error.code.includes('network') && !error.code.includes('timeout')) {
        throw error;
      }

      if (attempt === maxAttempts) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`🔄 Retrying Firebase request in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase authentication is not configured",
      };
    }

    // Check network connectivity first
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      return {
        success: false,
        error: "Network connection failed. Please check your internet connection and try again.",
      };
    }

    console.log('🔑 Attempting Firebase login with retry logic...');

    // Attempt login with retry logic
    const userCredential = await retryWithBackoff(
      () => signInWithEmailAndPassword(auth, email, password),
      3,
      1000
    );

    console.log("✅ Firebase authentication successful");
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Login error:", error);

    let errorMessage = "Authentication failed";
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email";
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMessage = "Incorrect email or password";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email format";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
        break;
      case "auth/timeout":
        errorMessage = "Request timed out. Please try again.";
        break;
      case "auth/internal-error":
        errorMessage = "Internal error occurred. Please try again.";
        break;
      default:
        // For unknown errors, provide a helpful message
        if (error.message?.includes('network')) {
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        } else {
          errorMessage = error.message || errorMessage;
        }
    }

    return { success: false, error: errorMessage };
  }
};

// Google sign-in
export const signInWithGoogle = async (): Promise<{
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase authentication is not configured",
      };
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("✅ Google sign-in successful:", user.email);

    // Check if user exists in Firestore, if not save their data
    if (db) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await saveUserData(user);
        console.log("✅ New Google user data saved");
      }
    }

    return { 
      success: true, 
      user, 
      message: "Google sign-in successful" 
    };
  } catch (error: any) {
    console.error("Google sign-in error:", error);

    let errorMessage = "Google sign-in failed";
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in was cancelled";
    } else if (error.code === "auth/popup-blocked") {
      errorMessage = "Popup blocked by browser. Please allow popups and try again";
    }

    return { success: false, error: errorMessage };
  }
};

// Facebook sign-in
export const signInWithFacebook = async (): Promise<{
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase authentication is not configured",
      };
    }

    const provider = new FacebookAuthProvider();
    provider.addScope("public_profile");
    provider.addScope("email");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("✅ Facebook sign-in successful:", user.email);

    // Check if user exists in Firestore, if not save their data
    if (db) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await saveUserData(user);
        console.log("✅ New Facebook user data saved");
      }
    }

    return { 
      success: true, 
      user, 
      message: "Facebook sign-in successful" 
    };
  } catch (error: any) {
    console.error("Facebook sign-in error:", error);

    let errorMessage = "Facebook sign-in failed";
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in was cancelled";
    } else if (error.code === "auth/popup-blocked") {
      errorMessage = "Popup blocked by browser. Please allow popups and try again";
    }

    return { success: false, error: errorMessage };
  }
};

// Send Firebase email verification
export const sendFirebaseEmailVerification = async (
  user: User,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    await sendEmailVerification(user);
    console.log("✅ Email verification sent via Firebase");
    return { success: true };
  } catch (error: any) {
    console.error("Email verification error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to send email verification" 
    };
  }
};

// Initialize reCAPTCHA
export const initializeRecaptcha = async (
  containerId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    // Clear any existing reCAPTCHA
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        console.log("✅ reCAPTCHA solved");
      },
    });

    (window as any).recaptchaVerifier = recaptchaVerifier;
    console.log("✅ reCAPTCHA initialized");
    return { success: true };
  } catch (error: any) {
    console.error("reCAPTCHA initialization error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to initialize reCAPTCHA" 
    };
  }
};

// Send phone OTP
export const sendPhoneOTP = async (
  phoneNumber: string,
): Promise<{ 
  success: boolean; 
  confirmationResult?: ConfirmationResult; 
  error?: string 
}> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    const recaptchaVerifier = (window as any).recaptchaVerifier;
    if (!recaptchaVerifier) {
      return {
        success: false,
        error: "reCAPTCHA not initialized",
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
    console.error("Send OTP error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to send OTP" 
    };
  }
};

// Verify phone OTP
export const verifyPhoneOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    const result = await confirmationResult.confirm(otp);
    console.log("✅ Phone verified via Firebase:", result.user.phoneNumber);

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return { 
      success: false, 
      error: error.message || "Invalid verification code" 
    };
  }
};

// Fetch user data from Firestore
export const fetchUserData = async (
  userId: string,
): Promise<{ success: boolean; userData?: any; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !db) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("✅ User data fetched from Firestore");
      return { success: true, userData };
    } else {
      return {
        success: false,
        error: "User not found",
      };
    }
  } catch (error: any) {
    console.error("Fetch user data error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch user data" 
    };
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updateData: Partial<UserData>,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isFirebaseConfigured || !db) {
      return {
        success: false,
        error: "Firebase is not configured",
      };
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ User profile updated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update profile" 
    };
  }
};
