import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check if all required Firebase environment variables are present
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName],
);

// Check if we're using demo/development credentials
const isDemoConfig = import.meta.env.VITE_FIREBASE_API_KEY?.includes("Demo") ||
                     import.meta.env.VITE_FIREBASE_API_KEY?.includes("demo") ||
                     import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes("dev");

let app: any = null;
let auth: any = null;
let db: any = null;

if (missingEnvVars.length > 0 || isDemoConfig) {
  if (missingEnvVars.length > 0) {
    console.warn(
      "Firebase environment variables missing:",
      missingEnvVars.join(", "),
    );
  } else {
    console.warn("Demo Firebase credentials detected - using development mode");
  }
  console.warn("Firebase authentication will be mocked for development");

  // Create mock auth object for development
  auth = null;

  // Create mock Firestore object for development
  db = null;
} else {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    console.warn("Falling back to development mode");
    app = null;
    auth = null;
    db = null;
  }
}

export { auth, db };
export const isFirebaseConfigured = missingEnvVars.length === 0 && !isDemoConfig && app !== null;
export default app;
