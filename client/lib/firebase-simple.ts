/**
 * Firebase Integration for CATCH Music App
 * 
 * Properly configured Firebase with Google Authentication
 */

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAqlECno9m_k7b_vFf1qW6LBnP-1BGhnPA",
  authDomain: "music-catch-59b79.firebaseapp.com",
  projectId: "music-catch-59b79",
  storageBucket: "music-catch-59b79.firebasestorage.app",
  messagingSenderId: "185813176462",
  appId: "1:185813176462:web:8269607d16eb315f55b9df",
  measurementId: "G-PBGMC7JZR3",
};

// Initialize Firebase
export const initializeFirebase = async () => {
  try {
    // Dynamic import to avoid loading Firebase unless explicitly called
    const { initializeApp } = await import("firebase/app");
    const {
      getAuth,
      GoogleAuthProvider,
      FacebookAuthProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");
    const { getStorage } = await import("firebase/storage");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    console.log("🔥 Firebase initialized successfully");

    return {
      app,
      auth,
      db,
      storage,

      // Google authentication
      async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");

        try {
          console.log("🔑 Starting Google sign-in...");
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
          
          // Handle specific errors
          if (error.code === "auth/popup-closed-by-user") {
            return {
              success: false,
              error: "Sign-in was cancelled. Please try again.",
            };
          }
          
          if (error.code === "auth/popup-blocked") {
            return {
              success: false,
              error: "Popup blocked by browser. Please allow popups and try again.",
            };
          }

          return {
            success: false,
            error: error.message || "Google sign-in failed",
          };
        }
      },

      // Facebook authentication
      async signInWithFacebook() {
        const provider = new FacebookAuthProvider();
        provider.addScope("public_profile");
        provider.addScope("email");

        try {
          console.log("🔑 Starting Facebook sign-in...");
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
          
          // Handle specific errors
          if (error.code === "auth/popup-closed-by-user") {
            return {
              success: false,
              error: "Sign-in was cancelled. Please try again.",
            };
          }
          
          if (error.code === "auth/popup-blocked") {
            return {
              success: false,
              error: "Popup blocked by browser. Please allow popups and try again.",
            };
          }

          return {
            success: false,
            error: error.message || "Facebook sign-in failed",
          };
        }
      },
    };
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    throw new Error("Firebase configuration error");
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

// Firebase helper functions
export const firebaseHelpers = {
  // Test Firebase connection
  async testConnection() {
    try {
      const firebase = await getFirebase();
      return firebase !== null;
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error);
      return false;
    }
  },

  // Google sign-in helper
  async googleSignIn() {
    try {
      const firebase = await getFirebase();
      if (!firebase) {
        throw new Error("Firebase not available");
      }
      return await firebase.signInWithGoogle();
    } catch (error: any) {
      console.error("❌ Google sign-in helper failed:", error);
      return { 
        success: false, 
        error: error.message || "Google sign-in failed" 
      };
    }
  },

  // Facebook sign-in helper
  async facebookSignIn() {
    try {
      const firebase = await getFirebase();
      if (!firebase) {
        throw new Error("Firebase not available");
      }
      return await firebase.signInWithFacebook();
    } catch (error: any) {
      console.error("❌ Facebook sign-in helper failed:", error);
      return { 
        success: false, 
        error: error.message || "Facebook sign-in failed" 
      };
    }
  },
};

export default firebaseHelpers;
