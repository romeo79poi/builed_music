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

let app: any = null;
let auth: any = null;
let db: any = null;

if (missingEnvVars.length > 0) {
  console.warn(
    "Firebase environment variables missing:",
    missingEnvVars.join(", "),
  );
  console.warn("Firebase authentication will be mocked for development");

      // Create mock auth object for development
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
    // Mock Firebase Auth methods for development
    createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured. Please add Firebase environment variables.")),
    signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured. Please add Firebase environment variables.")),
    signInWithPopup: () => Promise.reject(new Error("Firebase not configured. Please add Firebase environment variables.")),
    _getRecaptchaConfig: () => Promise.resolve({}), // Mock recaptcha config
  };

  // Create mock Firestore object for development
  db = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      doc: () => ({
        set: () => Promise.resolve(),
        get: () => Promise.resolve({ exists: false }),
      }),
    }),
  };
} else {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

    // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
export default app;
