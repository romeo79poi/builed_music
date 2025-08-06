import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeFirebase } from "../lib/firebase-simple";

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined,
);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [firebaseInstance, setFirebaseInstance] = useState<any>(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log("🔥 Initializing Firebase...");
        const firebase = await initializeFirebase();
        
        if (firebase && firebase.auth) {
          setFirebaseInstance(firebase);
          setInitialized(true);
          console.log("✅ Firebase initialized successfully");

          // Set up auth state listener
          const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
            console.log("🔐 Auth state changed:", user?.email || "No user");
            setUser(user);
            setLoading(false);
          });

          return unsubscribe;
        } else {
          console.error("❌ Failed to initialize Firebase");
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        setLoading(false);
      }
    };

    const unsubscribePromise = initFirebase();
    
    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!firebaseInstance?.auth) {
      throw new Error("Firebase not initialized");
    }
    
    await signInWithEmailAndPassword(firebaseInstance.auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!firebaseInstance?.auth) {
      throw new Error("Firebase not initialized");
    }
    
    await createUserWithEmailAndPassword(firebaseInstance.auth, email, password);
  };

  const signOut = async () => {
    if (!firebaseInstance?.auth) {
      throw new Error("Firebase not initialized");
    }
    
    await firebaseSignOut(firebaseInstance.auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    initialized,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Export Firebase instances for compatibility
export const firebaseApp = null; // Will be created dynamically when needed
export const firebaseAuth = null; // Will be created dynamically when needed
