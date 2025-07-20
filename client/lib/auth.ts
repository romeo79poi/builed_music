import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

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
  name: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Create user with Firebase Auth (no recaptcha)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore with exact required fields
    const userDocData = {
      name: name,
      email: user.email!,
      uid: user.uid,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userDocData);

    return { success: true, user };
  } catch (error: any) {
    console.error("Signup error:", error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = "An error occurred during signup";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Email is already registered";
        break;
      case 'auth/weak-password':
        errorMessage = "Password is too weak";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email format";
        break;
      case 'auth/operation-not-allowed':
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
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Login error:", error);
    
    let errorMessage = "An error occurred during login";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No account found with this email";
        break;
      case 'auth/wrong-password':
        errorMessage = "Incorrect password";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email format";
        break;
      case 'auth/user-disabled':
        errorMessage = "This account has been disabled";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string; isNewUser?: boolean }> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let isNewUser = false;

        if (!userDoc.exists()) {
      // Create new user document with .set()
      const userData = {
        name: user.displayName || '',
        email: user.email || '',
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
  } catch (error: any) {
    console.error("Google sign-in error:", error);

    let errorMessage = "An error occurred during Google sign-in";

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = "Sign-in cancelled";
        break;
      case 'auth/popup-blocked':
        errorMessage = "Popup blocked by browser";
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = "Sign-in cancelled";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "Google sign-in is not enabled";
        break;
      case 'auth/unauthorized-domain':
        errorMessage = "This domain is not authorized for Google sign-in";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { success: false, error: errorMessage };
  }
};

export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return { success: false, error: error.message || "An error occurred during logout" };
  }
};
