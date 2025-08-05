import { firebaseAuth } from './firebase';

/**
 * Simple Firebase Authentication wrapper for CATCH
 * Integrates with existing signup/login flow
 */

export interface FirebaseAuthResult {
  success: boolean;
  user?: any;
  error?: string;
  needsEmailVerification?: boolean;
}

export const catchFirebaseAuth = {
  // Google Sign In - for your existing "Continue with Google" button
  async signInWithGoogle(): Promise<FirebaseAuthResult> {
    if (!firebaseAuth.isAvailable()) {
      return {
        success: false,
        error: 'Firebase not available'
      };
    }

    try {
      const result = await firebaseAuth.signInWithGoogle();
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        user: {
          uid: result.user!.uid,
          email: result.user!.email,
          displayName: result.user!.displayName,
          photoURL: result.user!.photoURL,
          emailVerified: result.user!.emailVerified
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google sign-in failed'
      };
    }
  },

  // Facebook Sign In - for your existing "Continue with Facebook" button
  async signInWithFacebook(): Promise<FirebaseAuthResult> {
    if (!firebaseAuth.isAvailable()) {
      return {
        success: false,
        error: 'Firebase not available'
      };
    }

    try {
      const result = await firebaseAuth.signInWithFacebook();
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        user: {
          uid: result.user!.uid,
          email: result.user!.email,
          displayName: result.user!.displayName,
          photoURL: result.user!.photoURL,
          emailVerified: result.user!.emailVerified
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Facebook sign-in failed'
      };
    }
  },

  // Email Sign Up - for your existing "Continue with Email" button
  async signUpWithEmail(email: string, password: string, username?: string): Promise<FirebaseAuthResult> {
    if (!firebaseAuth.isAvailable()) {
      return {
        success: false,
        error: 'Firebase not available'
      };
    }

    try {
      const result = await firebaseAuth.signUpWithEmail(email, password, {
        username: username || email.split('@')[0],
        displayName: username || email.split('@')[0]
      });
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        user: {
          uid: result.user!.uid,
          email: result.user!.email,
          displayName: result.user!.displayName,
          photoURL: result.user!.photoURL,
          emailVerified: result.user!.emailVerified
        },
        needsEmailVerification: !result.user!.emailVerified
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email signup failed'
      };
    }
  },

  // Email Sign In
  async signInWithEmail(email: string, password: string): Promise<FirebaseAuthResult> {
    if (!firebaseAuth.isAvailable()) {
      return {
        success: false,
        error: 'Firebase not available'
      };
    }

    try {
      const result = await firebaseAuth.signInWithEmail(email, password);
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        user: {
          uid: result.user!.uid,
          email: result.user!.email,
          displayName: result.user!.displayName,
          photoURL: result.user!.photoURL,
          emailVerified: result.user!.emailVerified
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email sign-in failed'
      };
    }
  },

  // Sign Out
  async signOut(): Promise<FirebaseAuthResult> {
    if (!firebaseAuth.isAvailable()) {
      return { success: true }; // Already signed out
    }

    try {
      const result = await firebaseAuth.signOut();
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign out failed'
      };
    }
  },

  // Check Firebase availability
  isAvailable(): boolean {
    return firebaseAuth.isAvailable();
  },

  // Get current user
  getCurrentUser() {
    return firebaseAuth.getCurrentUser();
  }
};

export default catchFirebaseAuth;
