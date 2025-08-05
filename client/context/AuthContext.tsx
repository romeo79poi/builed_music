import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, supabaseAPI, type User } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setSupabaseUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        // Check for legacy localStorage auth
        await checkLegacyAuth();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  };

  const checkLegacyAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("currentUser");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          ...parsedUser,
          verified: parsedUser.is_verified || false,
          premium: parsedUser.premium || false,
          followers_count: parsedUser.follower_count || 0,
          following_count: parsedUser.following_count || 0,
          avatar_url: parsedUser.profile_image_url,
          created_at: parsedUser.created_at || new Date().toISOString(),
          updated_at: parsedUser.updated_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Legacy auth check failed:', error);
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabaseAPI.getUserProfile(userId);
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create one
        const { data: supabaseUser } = await supabase.auth.getUser();
        if (supabaseUser.user) {
          const newProfile: Partial<User> = {
            id: userId,
            email: supabaseUser.user.email!,
            username: supabaseUser.user.user_metadata?.username || supabaseUser.user.email!.split('@')[0],
            name: supabaseUser.user.user_metadata?.name || supabaseUser.user.user_metadata?.full_name || 'User',
            avatar_url: supabaseUser.user.user_metadata?.avatar_url,
            verified: false,
            premium: false,
            followers_count: 0,
            following_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Create user profile in database
          const { data: createdProfile } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single();
          
          setUser(createdProfile || newProfile as User);
        }
      } else if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabaseAPI.signUp(email, password, {
        username: userData.username,
        name: userData.name,
        full_name: userData.name
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Account created successfully. Please check your email for verification.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseAPI.signIn(email, password);

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error occurred' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabaseAPI.signInWithGoogle();
      
      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Redirecting to Google...' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Google sign-in failed' };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabaseAPI.signInWithFacebook();
      
      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Redirecting to Facebook...' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Facebook sign-in failed' };
    }
  };

  const signOut = async () => {
    await supabaseAPI.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, message: 'Not authenticated' };
      }

      const { data, error } = await supabaseAPI.updateUserProfile(user.id, updates);
      
      if (error) {
        return { success: false, message: error.message };
      }

      if (data) {
        setUser(data);
        return { success: true, message: 'Profile updated successfully' };
      }

      return { success: false, message: 'Update failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error occurred' };
    }
  };

  // Legacy methods for backward compatibility
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
    if (!loading) {
      await initializeAuth();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      updateProfile,
      isAuthenticated: !!user || !!supabaseUser,
      
      // Legacy methods
      login,
      logout,
      checkAuthState
    }}>
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
