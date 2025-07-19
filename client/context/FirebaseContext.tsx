import React, { createContext, useContext, useEffect, useState } from "react";

// Check if we're in a development environment or if Firebase should be mocked
const isDevelopment = import.meta.env.MODE === 'development';
const useMockAuth = isDevelopment || window.location.hostname.includes('fly.dev');

let firebaseAuth: any = null;
let mockUser: any = null;

if (!useMockAuth) {
  // Only import and initialize Firebase in production environments
  try {
    const { initializeApp } = await import("firebase/app");
    const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = await import("firebase/auth");

    const firebaseConfig = {
      apiKey: "AIzaSyBHgFXBalLyzs_Li2ApkmUNVrtkCWyKmzM",
      authDomain: "music-catch.firebaseapp.com",
      projectId: "music-catch",
      storageBucket: "music-catch.firebasestorage.app",
      messagingSenderId: "75793608464",
      appId: "1:75793608464:web:ee96c2079f2b3353ab3f95",
      measurementId: "G-J8D7LKCMPB",
    };

    const app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to mock auth:", error);
    useMockAuth = true;
  }
}

// Mock authentication for development
if (useMockAuth) {
  console.log("Using mock authentication for development/demo");

  // Create mock auth object
  firebaseAuth = {
    currentUser: mockUser,
    onAuthStateChanged: (callback: (user: any) => void) => {
      // Simulate auth state change
      setTimeout(() => callback(mockUser), 100);
      return () => {}; // Unsubscribe function
    },
    signInWithEmailAndPassword: async (auth: any, email: string, password: string) => {
      // Mock successful login
      mockUser = {
        uid: "mock-user-123",
        email: email,
        displayName: email.split('@')[0],
      };
      return { user: mockUser };
    },
    createUserWithEmailAndPassword: async (auth: any, email: string, password: string) => {
      // Mock successful signup
      mockUser = {
        uid: "mock-user-123",
        email: email,
        displayName: email.split('@')[0],
      };
      return { user: mockUser };
    },
    signOut: async () => {
      mockUser = null;
      return Promise.resolve();
    }
  };
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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

    useEffect(() => {
    if (useMockAuth) {
      // For mock auth, simulate auth state change
      const unsubscribe = firebaseAuth.onAuthStateChanged((user: any) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Real Firebase auth
      const { onAuthStateChanged } = require("firebase/auth");
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

    const signIn = async (email: string, password: string) => {
    if (useMockAuth) {
      await firebaseAuth.signInWithEmailAndPassword(firebaseAuth, email, password);
      setUser(mockUser);
    } else {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    }
  };

    const signUp = async (email: string, password: string) => {
    if (useMockAuth) {
      await firebaseAuth.createUserWithEmailAndPassword(firebaseAuth, email, password);
      setUser(mockUser);
    } else {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
    }
  };

    const signOut = async () => {
    if (useMockAuth) {
      await firebaseAuth.signOut();
      setUser(null);
    } else {
      const { signOut as firebaseSignOut } = await import("firebase/auth");
      await firebaseSignOut(firebaseAuth);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Export Firebase instances
export const firebaseApp = app;
export { firebaseAuth };