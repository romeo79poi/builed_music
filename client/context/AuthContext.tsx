import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<{ success: boolean; message: string }>;
  checkAvailability: (
    email?: string,
    username?: string,
  ) => Promise<{ available: boolean; message: string }>;

  // OTP Authentication methods
  requestSignupOTP: (
    email: string,
    password: string,
    name: string,
    username: string,
  ) => Promise<{ success: boolean; message: string }>;
  verifySignupOTP: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; message: string }>;
  requestLoginOTP: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  verifyLoginOTP: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; message: string }>;

  // OAuth methods
  signInWithGoogle: (
    token: string,
  ) => Promise<{ success: boolean; message: string }>;
  signInWithFacebook: (
    token: string,
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for stored token or session
      const token = localStorage.getItem('authToken');
      if (token) {
        await loadUserProfile(token);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUser(result.data);
          console.log("✅ User profile loaded:", result.data);
        }
      } else {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { name, username } = userData;
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: name || userData.displayName || 'User',
          username: username || userData.username || email.split('@')[0]
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          setUser(result.data);
        }
        return { success: true, message: result.message || 'Account created successfully!' };
      } else {
        return { success: false, message: result.message || 'Signup failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          setUser(result.data);
        }
        return { success: true, message: result.message || 'Login successful!' };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Call logout endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      localStorage.removeItem('authToken');
      setUser(null);
      console.log("✅ Successfully signed out");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still remove token even if endpoint fails
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: false, message: "No authentication token" };
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const updatedUser = {
            ...user,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          setUser(updatedUser);
          return { success: true, message: "Profile updated successfully!" };
        }
      }

      return { success: false, message: "Update failed" };
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

  const checkAvailability = async (email?: string, username?: string) => {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (username) params.append('username', username);

      const response = await fetch(`/api/auth/check-availability?${params.toString()}`);
      const result = await response.json();

      return {
        available: result.available || false,
        message: result.message || 'Unknown error'
      };
    } catch (error: any) {
      return {
        available: false,
        message: error.message || 'Failed to check availability'
      };
    }
  };

  const checkAuthState = async () => {
    await initializeAuth();
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    checkAvailability,
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
