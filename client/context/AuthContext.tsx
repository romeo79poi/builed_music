import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  display_name?: string;
  profile_image_url?: string;
  bio?: string;
  is_verified?: boolean;
  is_artist?: boolean;
  follower_count?: number;
  following_count?: number;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in based on stored data and validate with backend
  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("currentUser");

      if (!token || !userData) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Validate token with backend if possible
        try {
          const response = await fetch(`/api/v1/users/${parsedUser.id || parsedUser.uid}`, {
            headers: {
              'user-id': parsedUser.id || parsedUser.uid,
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const profileData = await response.json();
            if (profileData.success && profileData.data) {
              // Update user data with latest profile info
              const updatedUser = {
                ...parsedUser,
                ...profileData.data,
                id: profileData.data.id || parsedUser.id || parsedUser.uid
              };
              setUser(updatedUser);
              localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            } else {
              setUser(parsedUser);
            }
          } else if (response.status === 401) {
            // Token is invalid, clear auth data
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            setUser(null);
          } else {
            // Backend might be down, use cached data
            setUser(parsedUser);
          }
        } catch (backendError) {
          console.warn("Backend validation failed, using cached user data:", backendError);
          setUser(parsedUser);
        }
      } catch (parseError) {
        console.error("Failed to parse user data:", parseError);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth state check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Store token
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // Fetch and store complete profile data
        try {
          const profileResponse = await fetch(`/api/v1/users/${result.user.id}`, {
            headers: {
              'user-id': result.user.id,
              'Authorization': result.token ? `Bearer ${result.token}` : ''
            }
          });

          let finalUserData = result.user;
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.data) {
              finalUserData = {
                ...result.user,
                ...profileData.data
              };
            }
          }

          localStorage.setItem("currentUser", JSON.stringify(finalUserData));
          setUser(finalUserData);

          return { success: true };
        } catch (profileError) {
          console.warn("Failed to fetch profile data, using basic user data:", profileError);
          localStorage.setItem("currentUser", JSON.stringify(result.user));
          setUser(result.user);
          return { success: true };
        }
      } else {
        return { 
          success: false, 
          error: result.message || "Invalid email or password" 
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: "Network error. Please check your connection." 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userAvatar");
      
      // Clear state
      setUser(null);
      
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server call fails
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userAvatar");
      setUser(null);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
