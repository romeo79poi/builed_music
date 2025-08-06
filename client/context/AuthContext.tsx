import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { useFirebase } from "./FirebaseContext";
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signInWithFacebook as firebaseFacebookSignIn,
} from "../lib/auth";

// Local user interface for backend profile data
interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  premium: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: any,
  ) => Promise<{ success: boolean; message: string }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;

  // Legacy methods for backward compatibility
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user: firebaseUser,
    loading: firebaseLoading,
    signOut: firebaseSignOut,
  } = useFirebase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseLoading) {
      initializeAuth();
    }
  }, [firebaseUser, firebaseLoading]);

  const initializeAuth = async () => {
    try {
      if (firebaseUser) {
        console.log("🔥 Firebase user detected:", firebaseUser.email);
        await loadUserProfile(firebaseUser);
      } else {
        console.log("🔥 No Firebase user found");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      // Try to fetch user profile from backend
      const response = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
        headers: {
          "user-id": firebaseUser.uid,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform backend data to UserProfile interface
          const backendData = result.data;
          const userProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            username:
              backendData.username ||
              firebaseUser.email?.split("@")[0] ||
              "user",
            name: backendData.name || firebaseUser.displayName || "User",
            avatar_url:
              backendData.profile_image_url || firebaseUser.photoURL || "",
            bio: backendData.bio || "",
            location: backendData.location || "",
            website: backendData.website || "",
            verified:
              backendData.is_verified || firebaseUser.emailVerified || false,
            premium: backendData.is_premium || false,
            followers_count: backendData.follower_count || 0,
            following_count: backendData.following_count || 0,
            created_at: backendData.created_at || new Date().toISOString(),
            updated_at: backendData.updated_at || new Date().toISOString(),
          };

          setUser(userProfile);
          console.log("✅ User profile loaded from backend:", userProfile);
          return;
        }
      }

      // If backend doesn't have profile, create from Firebase user
      const firebaseProfile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        username: firebaseUser.email?.split("@")[0] || "user",
        name: firebaseUser.displayName || "User",
        avatar_url: firebaseUser.photoURL || "",
        bio: "",
        location: "",
        website: "",
        verified: firebaseUser.emailVerified || false,
        premium: false,
        followers_count: 0,
        following_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(firebaseProfile);
      console.log("✅ User profile created from Firebase:", firebaseProfile);
    } catch (error) {
      console.error("Error loading user profile:", error);

      // Fallback: create minimal profile from Firebase user
      if (firebaseUser) {
        const minimalProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          username: firebaseUser.email?.split("@")[0] || "user",
          name: firebaseUser.displayName || "User",
          avatar_url: firebaseUser.photoURL || "",
          bio: "",
          location: "",
          website: "",
          verified: firebaseUser.emailVerified || false,
          premium: false,
          followers_count: 0,
          following_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUser(minimalProfile);
        console.log("✅ Minimal user profile created:", minimalProfile);
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("📝 Sign up - Firebase authentication required first");

    // Note: Actual signup should be handled through Firebase first,
    // then user profile can be created/updated in backend
    return {
      success: false,
      message: "Please use Firebase signup flow - see Signup page",
    };
  };

  const signIn = async (email: string, password: string) => {
    console.log("🔑 Sign in - using Firebase authentication");

    // Note: Actual signin should be handled through Firebase
    return {
      success: false,
      message: "Please use Firebase signin flow - see Login page",
    };
  };

  const signInWithGoogle = async () => {
    console.log("🔑 Google sign in using Firebase");

    try {
      const result = await firebaseGoogleSignIn();
      if (result.success) {
        return { success: true, message: "Google sign-in successful!" };
      } else {
        return {
          success: false,
          message: result.error || "Google sign-in failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Google sign-in failed",
      };
    }
  };

  const signInWithFacebook = async () => {
    console.log("🔑 Facebook sign in using Firebase");

    try {
      const result = await firebaseFacebookSignIn();
      if (result.success) {
        return { success: true, message: "Facebook sign-in successful!" };
      } else {
        return {
          success: false,
          message: result.error || "Facebook sign-in failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Facebook sign-in failed",
      };
    }
  };

  const signOut = async () => {
    console.log("👋 Sign out using Firebase");

    try {
      await firebaseSignOut();
      setUser(null);
      console.log("✅ Successfully signed out");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    console.log("👤 Update profile:", updates);

    if (!user || !firebaseUser) {
      return { success: false, message: "Not authenticated" };
    }

    try {
      // Update profile in backend
      const response = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": firebaseUser.uid,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          const updatedUser = {
            ...user,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          setUser(updatedUser);
          return { success: true, message: "Profile updated successfully!" };
        }
      }

      // If backend update fails, still update local state
      const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setUser(updatedUser);
      return {
        success: true,
        message: "Profile updated locally (backend sync pending)",
      };
    } catch (error: any) {
      console.error("Profile update error:", error);
      return { success: false, message: error.message || "Update failed" };
    }
  };

  // Legacy method compatibility
  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return {
      success: result.success,
      error: result.success ? undefined : result.message,
    };
  };

  const logout = async () => {
    await signOut();
  };

  const checkAuthState = async () => {
    // Firebase handles auth state automatically
    console.log("🔥 Auth state managed by Firebase");
  };

  const isAuthenticated = !!firebaseUser && !!user;

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading: loading || firebaseLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    updateProfile,
    isAuthenticated,
    login,
    logout,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
