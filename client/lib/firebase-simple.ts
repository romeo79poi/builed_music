/**
 * Lightweight Firebase Integration for CATCH Music App
 *
 * This provides a simple Firebase setup that can be easily integrated
 * with your existing authentication system without breaking the app.
 */

// Your Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAqlECno9m_k7b_vFf1qW6LBnP-1BGhnPA",
  authDomain: "music-catch-59b79.firebaseapp.com",
  projectId: "music-catch-59b79",
  storageBucket: "music-catch-59b79.firebasestorage.app",
  messagingSenderId: "185813176462",
  appId: "1:185813176462:web:8269607d16eb315f55b9df",
  measurementId: "G-PBGMC7JZR3",
};

// Simple Firebase setup using dynamic imports to avoid bundle issues
export const initializeFirebase = async () => {
  try {
    // Dynamic import to avoid loading Firebase unless explicitly called
    const { initializeApp } = await import("firebase/app");
    const {
      getAuth,
      GoogleAuthProvider,
      FacebookAuthProvider,
      signInWithPopup,
    } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");
    const { getStorage } = await import("firebase/storage");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    console.log("🔥 Firebase initialized for CATCH Music");

    return {
      app,
      auth,
      db,
      storage,

      // Simple authentication methods
      async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");

        try {
          const result = await signInWithPopup(auth, provider);
          console.log("✅ Google sign-in successful:", result.user.email);

          return {
            success: true,
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
            },
          };
        } catch (error: any) {
          console.error("❌ Google sign-in failed:", error);
          return {
            success: false,
            error: error.message,
          };
        }
      },

      async signInWithFacebook() {
        const provider = new FacebookAuthProvider();
        provider.addScope("public_profile");
        provider.addScope("email");

        try {
          const result = await signInWithPopup(auth, provider);
          console.log("✅ Facebook sign-in successful:", result.user.email);

          return {
            success: true,
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
            },
          };
        } catch (error: any) {
          console.error("❌ Facebook sign-in failed:", error);
          return {
            success: false,
            error: error.message,
          };
        }
      },
    };
  } catch (error) {
    console.warn("⚠️ Firebase not available:", error);
    return null;
  }
};

// Global Firebase instance
let firebaseInstance: any = null;

// Get Firebase instance (initialize if needed)
export const getFirebase = async () => {
  if (!firebaseInstance) {
    firebaseInstance = await initializeFirebase();
  }
  return firebaseInstance;
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Simple helper functions that can be used in your existing components
export const firebaseHelpers = {
  // Test Firebase connection
  async testConnection() {
    const firebase = await getFirebase();
    return firebase !== null;
  },

  // Google sign-in helper
  async googleSignIn() {
    const firebase = await getFirebase();
    if (!firebase) {
      return { success: false, error: "Firebase not available" };
    }
    return firebase.signInWithGoogle();
  },

  // Facebook sign-in helper
  async facebookSignIn() {
    const firebase = await getFirebase();
    if (!firebase) {
      return { success: false, error: "Firebase not available" };
    }
    return firebase.signInWithFacebook();
  },
};

export default firebaseHelpers;
