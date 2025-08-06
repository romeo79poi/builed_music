// Firebase configuration for CATCH Music App
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp as firestoreServerTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqlECno9m_k7b_vFf1qW6LBnP-1BGhnPA",
  authDomain: "music-catch-59b79.firebaseapp.com",
  projectId: "music-catch-59b79",
  storageBucket: "music-catch-59b79.firebasestorage.app",
  messagingSenderId: "185813176462",
  appId: "1:185813176462:web:8269607d16eb315f55b9df",
  measurementId: "G-PBGMC7JZR3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const serverTimestamp = firestoreServerTimestamp;

// Check if Firebase is configured
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

console.log("🔥 Firebase services initialized:", {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  configured: isFirebaseConfigured,
});

export default app;
