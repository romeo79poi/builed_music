import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Local types (Supabase removed)
interface User {
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
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
  
  // Legacy methods for backward compatibility
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for legacy localStorage auth (Supabase removed)
      await checkLegacyAuth();
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLegacyAuth = async () => {
    try {
      // Check localStorage for existing session
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ Legacy auth restored:', userData.email);
      }
    } catch (error) {
      console.error('Legacy auth check failed:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 Sign up (Supabase removed, using backend):', email);
    
    try {
      // Use backend API for signup
      const response = await fetch('/api/v2/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...userData })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true, message: 'Account created successfully!' };
      } else {
        return { success: false, message: result.message || 'Signup failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Signup error' };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Sign in (Supabase removed, using backend):', email);
    
    try {
      // Use backend API for signin
      const response = await fetch('/api/v2/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Store user data and token
        if (result.user) {
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        return { success: true, message: 'Welcome back!' };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Login error' };
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔑 Google sign in (Supabase removed, using Firebase)');
    return { success: false, message: 'Google sign-in moved to Firebase - use Firebase integration' };
  };

  const signInWithFacebook = async () => {
    console.log('🔑 Facebook sign in (Supabase removed, using Firebase)');
    return { success: false, message: 'Facebook sign-in moved to Firebase - use Firebase integration' };
  };

  const signOut = async () => {
    console.log('👋 Sign out (Supabase removed)');
    
    // Clear local state
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
  };

  const updateProfile = async (updates: Partial<User>) => {
    console.log('👤 Update profile (Supabase removed):', updates);
    
    if (!user) {
      return { success: false, message: 'Not authenticated' };
    }
    
    try {
      // Use backend API for profile updates
      const response = await fetch('/api/v2/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        return { success: false, message: result.message || 'Update failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Update error' };
    }
  };

  // Legacy method compatibility
  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return { 
      success: result.success, 
      error: result.success ? undefined : result.message 
    };
  };

  const logout = async () => {
    await signOut();
  };

  const checkAuthState = async () => {
    await checkLegacyAuth();
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
