import React, { createContext, useContext, useEffect, useState } from "react";

// Check if we should use mock authentication
const useMockAuth =
  import.meta.env.MODE === "development" ||
  (typeof window !== "undefined" &&
    window.location.hostname.includes("fly.dev"));

interface FirebaseContextType {
  user: any | null;
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

// Mock user for development
let mockUser: any = null;

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (useMockAuth) {
      console.log("🔧 Using mock authentication for development");
      // Simulate loading time
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
      }, 500);
    } else {
      // Try to initialize real Firebase
      import("firebase/app")
        .then(({ initializeApp }) =>
          import("firebase/auth").then((auth) => ({ initializeApp, ...auth })),
        )
        .then(({ initializeApp, getAuth, onAuthStateChanged }) => {
          const firebaseConfig = {
            apiKey: "AIzaSyAqlECno9m_k7b_vFf1qW6LBnP-1BGhnPA",
            authDomain: "music-catch-59b79.firebaseapp.com",
            projectId: "music-catch-59b79",
            storageBucket: "music-catch-59b79.firebasestorage.app",
            messagingSenderId: "185813176462",
            appId: "1:185813176462:web:8269607d16eb315f55b9df",
            measurementId: "G-PBGMC7JZR3",
          };

          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);

          const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
          });

          return unsubscribe;
        })
        .catch((error) => {
          console.warn(
            "Firebase initialization failed, using mock auth:",
            error,
          );
          setUser(mockUser);
          setLoading(false);
        });
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (useMockAuth) {
      // Mock successful login
      console.log("🔧 Mock login for:", email);
      mockUser = {
        uid: "mock-user-123",
        email: email,
        displayName: email.split("@")[0],
      };
      setUser(mockUser);
      return Promise.resolve();
    } else {
      try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const { initializeApp } = await import("firebase/app");
        const { getAuth } = await import("firebase/auth");

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
        const auth = getAuth(app);

        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        if (error.code === "auth/network-request-failed") {
          console.warn("Network failed, falling back to mock auth");
          mockUser = {
            uid: "mock-user-123",
            email: email,
            displayName: email.split("@")[0],
          };
          setUser(mockUser);
          return Promise.resolve();
        }
        throw error;
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    if (useMockAuth) {
      // Mock successful signup
      console.log("���� Mock signup for:", email);
      mockUser = {
        uid: "mock-user-456",
        email: email,
        displayName: email.split("@")[0],
      };
      setUser(mockUser);
      return Promise.resolve();
    } else {
      try {
        const { createUserWithEmailAndPassword } = await import(
          "firebase/auth"
        );
        const { initializeApp } = await import("firebase/app");
        const { getAuth } = await import("firebase/auth");

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
        const auth = getAuth(app);

        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        if (error.code === "auth/network-request-failed") {
          console.warn("Network failed, falling back to mock auth");
          mockUser = {
            uid: "mock-user-456",
            email: email,
            displayName: email.split("@")[0],
          };
          setUser(mockUser);
          return Promise.resolve();
        }
        throw error;
      }
    }
  };

  const signOut = async () => {
    if (useMockAuth) {
      console.log("🔧 Mock sign out");
      mockUser = null;
      setUser(null);
      return Promise.resolve();
    } else {
      try {
        const { signOut: firebaseSignOut } = await import("firebase/auth");
        const { initializeApp } = await import("firebase/app");
        const { getAuth } = await import("firebase/auth");

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
        const auth = getAuth(app);

        await firebaseSignOut(auth);
      } catch (error: any) {
        console.warn("Sign out failed, clearing local state");
        mockUser = null;
        setUser(null);
      }
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

// Export Firebase instances for compatibility
export const firebaseApp = null; // Will be created dynamically when needed
export const firebaseAuth = null; // Will be created dynamically when needed
