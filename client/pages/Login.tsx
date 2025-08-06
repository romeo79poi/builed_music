import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useFirebase } from "../context/FirebaseContext";
import { useToast } from "../hooks/use-toast";
import { firebaseHelpers } from "../lib/firebase-simple";
import { loginWithEmailAndPassword, saveUserData, fetchUserData, sendFirebaseEmailVerification } from "../lib/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: firebaseUser, signIn: firebaseSignIn, loading } = useFirebase();
  
  const [loginMethod, setLoginMethod] = useState<"social" | "email" | "phone">(
    "social",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    lastChecked: Date.now(),
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus({ isOnline: true, lastChecked: Date.now() });
      console.log('✅ Network connection restored');
    };

    const handleOffline = () => {
      setNetworkStatus({ isOnline: false, lastChecked: Date.now() });
      console.log('❌ Network connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (firebaseUser && !loading) {
      console.log("🔥 User already authenticated, redirecting to home");
      navigate("/home");
    }
  }, [firebaseUser, loading, navigate]);

  const checkUserExists = async (email: string) => {
    try {
      console.log("🔍 Checking user existence for:", email);

      // Check localStorage for recent signup data first (faster)
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          if (userData.email === email) {
            console.log("✅ User found in localStorage");
            return { exists: true, source: 'localStorage', data: userData };
          }
        } catch (error) {
          console.log("⚠️ Failed to parse localStorage user data");
        }
      }

      // For now, assume user exists if we reach here
      // The actual Firebase login will handle user-not-found errors
      console.log("🔍 User existence check completed");
      return { exists: true, source: 'assumed', data: null };

    } catch (error) {
      console.error("❌ Error checking user existence:", error);
      return { exists: true, source: 'error', data: null }; // Allow login attempt
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;

    setIsLoading(true);

    try {
      const result = await sendFirebaseEmailVerification(unverifiedUser);

      if (result.success) {
        toast({
          title: "Verification email sent! 📬",
          description: "Please check your email and click the verification link",
        });

        setShowResendVerification(false);
      } else {
        toast({
          title: "Failed to send verification email",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserActivityData = async (userId: string, userProfile: any) => {
    try {
      console.log("🎵 Loading user activity data...");

      // Fetch user profile data from backend
      try {
        const profileResponse = await fetch(`/api/profile/${userId}`, {
          headers: {
            'user-id': userId,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            console.log("✅ User profile data loaded:", profileData.data);

            // Store profile activity data
            const activityData = {
              profile: profileData.data,
              likedSongs: profileData.data.likedSongs || [],
              recentlyPlayed: profileData.data.recentlyPlayed || [],
              playlists: profileData.data.playlists || [],
              followers: profileData.data.followers || 0,
              following: profileData.data.following || 0,
              musicPreferences: profileData.data.musicPreferences || {},
            };

            localStorage.setItem('userActivity', JSON.stringify(activityData));
            console.log("💾 User activity data saved to localStorage");
          }
        }
      } catch (profileError) {
        console.warn("⚠️ Profile fetch failed:", profileError);
      }

      // Try to fetch liked songs
      try {
        const likedResponse = await fetch(`/api/profile/${userId}/liked-songs`, {
          headers: {
            'user-id': userId,
            'Content-Type': 'application/json',
          },
        });

        if (likedResponse.ok) {
          const likedData = await likedResponse.json();
          if (likedData.success) {
            localStorage.setItem('userLikedSongs', JSON.stringify(likedData.data.songs || []));
            console.log("✅ Liked songs loaded:", likedData.data.songs?.length || 0);
          }
        }
      } catch (likedError) {
        console.warn("⚠️ Liked songs fetch failed:", likedError);
      }

      // Try to fetch recently played
      try {
        const recentResponse = await fetch(`/api/profile/${userId}/recently-played`, {
          headers: {
            'user-id': userId,
            'Content-Type': 'application/json',
          },
        });

        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          if (recentData.success) {
            localStorage.setItem('userRecentlyPlayed', JSON.stringify(recentData.data.songs || []));
            console.log("✅ Recently played loaded:", recentData.data.songs?.length || 0);
          }
        }
      } catch (recentError) {
        console.warn("⚠️ Recently played fetch failed:", recentError);
      }

    } catch (error) {
      console.error("❌ Error loading user activity data:", error);
    }
  };

  const loadCompleteUserProfile = async (user: any) => {
    try {
      console.log("💾 Loading complete user profile for:", user.email);

      // Try to get complete profile data from Firestore
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const firestoreData = userDoc.data();
            console.log("✅ Firestore profile data found:", firestoreData);

            // Combine Firebase auth data with Firestore profile data
            const completeProfile = {
              uid: user.uid,
              email: user.email,
              name: firestoreData.name || user.displayName || "User",
              username: firestoreData.username || user.email?.split('@')[0] || "user",
              profileImageURL: firestoreData.profileImageURL || user.photoURL || "",
              dateOfBirth: firestoreData.dob || "",
              gender: firestoreData.gender || "",
              bio: firestoreData.bio || "",
              phone: firestoreData.phone || user.phoneNumber || "",
              emailVerified: user.emailVerified,
              verified: firestoreData.verified || user.emailVerified,
              createdAt: firestoreData.createdAt,
              lastLoginAt: new Date().toISOString(),
            };

            // Save to localStorage for immediate access
            localStorage.setItem('currentUser', JSON.stringify(completeProfile));
            localStorage.setItem('userAvatar', completeProfile.profileImageURL || '');

            console.log("💾 Complete profile saved to localStorage:", completeProfile);

            // Fetch user activity data
            await loadUserActivityData(user.uid, completeProfile);

            // Try to sync with backend API if available
            try {
              const backendSyncResponse = await fetch('/api/v1/users/sync', {
                method: 'POST',
                headers: {
                  'user-id': user.uid,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  firebase_uid: user.uid,
                  email: user.email,
                  display_name: completeProfile.name,
                  username: completeProfile.username,
                  profile_image_url: completeProfile.profileImageURL,
                  date_of_birth: completeProfile.dateOfBirth,
                  gender: completeProfile.gender,
                  bio: completeProfile.bio,
                  phone: completeProfile.phone,
                  email_verified: user.emailVerified,
                }),
              });

              if (backendSyncResponse.ok) {
                const syncResult = await backendSyncResponse.json();
                console.log("✅ Profile synced with backend:", syncResult);
              }
            } catch (backendError) {
              console.warn("⚠️ Backend sync failed (continuing with Firebase data):", backendError);
            }

            return completeProfile;
          }
        } catch (firestoreError) {
          console.warn("⚠️ Firestore fetch failed:", firestoreError);
        }
      }

      // Fallback: create basic profile from Firebase auth data
      const basicProfile = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || "User",
        username: user.email?.split('@')[0] || "user",
        profileImageURL: user.photoURL || "",
        emailVerified: user.emailVerified,
        lastLoginAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(basicProfile));
      localStorage.setItem('userAvatar', basicProfile.profileImageURL || '');

      console.log("💾 Basic profile saved to localStorage:", basicProfile);
      return basicProfile;

    } catch (error) {
      console.error("❌ Error loading user profile:", error);
      return null;
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("🔍 Checking if user exists for email:", email);

      // Check if user exists (mainly for localStorage cache)
      const userCheck = await checkUserExists(email);

      if (userCheck.exists && userCheck.source === 'localStorage') {
        console.log("✅ User found in cache, proceeding with login");
      }

      console.log("🔑 User exists, attempting Firebase email login...");

      // Use Firebase authentication
      const result = await loginWithEmailAndPassword(email, password);

      if (result.success && result.user) {
        // Check email verification status for signup users
        if (!result.user.emailVerified) {
          console.log("⚠️ User email not verified");

          toast({
            title: "Email verification required 📬",
            description: "Please check your email and verify your account before logging in",
            variant: "destructive",
          });

          setAuthError("Please verify your email address before logging in. Check your inbox for the verification link.");
          setShowResendVerification(true);
          setUnverifiedUser(result.user);
          return;
        }

        // Fetch complete user profile data
        await loadCompleteUserProfile(result.user);

        toast({
          title: "Welcome back! 🎉",
          description: "Successfully logged in",
        });

        console.log("✅ Firebase email login successful");
        navigate("/home");
      } else {
        // Handle specific error cases
        let errorMessage = result.error || "Login failed";
        let shouldRedirectToSignup = false;

        if (errorMessage.includes("user-not-found") || errorMessage.includes("auth/user-not-found")) {
          errorMessage = "Account not found. Redirecting to signup...";
          shouldRedirectToSignup = true;
        } else if (errorMessage.includes("wrong-password") || errorMessage.includes("auth/wrong-password")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (errorMessage.includes("invalid-email") || errorMessage.includes("auth/invalid-email")) {
          errorMessage = "Invalid email format.";
        } else if (errorMessage.includes("too-many-requests")) {
          errorMessage = "Too many failed attempts. Please try again later.";
        }

        if (shouldRedirectToSignup) {
          setTimeout(() => {
            navigate("/signup", { state: { email: email } });
          }, 2000);
        }

        setAuthError(errorMessage);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Email login error:", error);

      let errorMessage = error.message || "Login failed";

      // Handle Firebase error codes
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Account not found. Redirecting to signup...";
        setTimeout(() => {
          navigate("/signup", { state: { email: email } });
        }, 2000);
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      }

      setAuthError(errorMessage);
      toast({
        title: "Login error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("🔥 Attempting Firebase Google login...");

      const result = await firebaseHelpers.googleSignIn();

      if (result.success && result.user) {
        console.log("✅ Firebase Google login successful:", result.user);

        toast({
          title: "Welcome back to CATCH! 🎉",
          description: `Signed in as ${result.user.displayName || result.user.email}`,
        });

        // Navigate to home
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setAuthError(result.error || "Google login failed");
        toast({
          title: "Google login failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Google login error:", error);
      setAuthError(error.message || "Google login failed");
      toast({
        title: "Google login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("🔥 Attempting Firebase Facebook login...");

      const result = await firebaseHelpers.facebookSignIn();

      if (result.success && result.user) {
        console.log("✅ Firebase Facebook login successful:", result.user);

        toast({
          title: "Welcome back to CATCH! 🎉",
          description: `Signed in as ${result.user.displayName || result.user.email}`,
        });

        // Navigate to home
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setAuthError(result.error || "Facebook login failed");
        toast({
          title: "Facebook login failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Facebook login error:", error);
      setAuthError(error.message || "Facebook login failed");
      toast({
        title: "Facebook login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    toast({
      title: "Coming soon",
      description: "Phone login will be available soon!",
    });
  };

  // Show loading if Firebase is still initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark flex flex-col items-center justify-center p-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-purple-primary" />
          <span className="text-white">Initializing Firebase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/10 via-purple-secondary/5 to-purple-accent/8"></div>

      <div className="relative z-10 w-full max-w-md px-2 sm:px-0">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <MusicCatchLogo
            animated={true}
            blinkMode={true}
            className="scale-90 sm:scale-100"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8"
        >
          Log in to <span className="purple-gradient-text">Catch</span>
        </motion.h1>

        {/* Login Method Selection */}
        {loginMethod === "social" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4 mb-8"
          >
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-purple-dark/50 border border-purple-primary/30 rounded-full flex items-center justify-center text-white font-medium hover:bg-purple-dark/70 hover:border-purple-primary/50 transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-purple-primary/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full h-14 bg-purple-dark/50 border border-purple-secondary/30 rounded-full flex items-center justify-center text-white font-medium hover:bg-purple-dark/70 hover:border-purple-secondary/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-secondary/20 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="px-3 text-slate-400 text-sm">or</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>

            {/* Email and Phone Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setLoginMethod("email")}
                className="w-full h-12 sm:h-14 bg-purple-dark/50 border border-purple-primary/30 rounded-xl flex items-center justify-center text-white hover:bg-purple-primary/10 hover:border-purple-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-primary/20"
              >
                <Mail className="w-5 h-5 mr-3 text-purple-primary" />
                Continue with Email
              </button>

              <button
                onClick={() => setLoginMethod("phone")}
                className="w-full h-12 sm:h-14 bg-purple-dark/50 border border-purple-secondary/30 rounded-xl flex items-center justify-center text-white hover:bg-purple-secondary/10 hover:border-purple-secondary/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-secondary/20"
              >
                <Phone className="w-5 h-5 mr-3 text-purple-secondary" />
                Continue with Phone Number
              </button>
            </div>
          </motion.div>
        )}

        {/* Email Login Form */}
        {loginMethod === "email" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 sm:h-14 bg-purple-dark/30 border border-purple-primary/30 rounded-xl px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-primary focus:ring-2 focus:ring-purple-primary/20 transition-all duration-200 text-sm sm:text-base backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 sm:h-14 bg-purple-dark/30 border border-purple-primary/30 rounded-xl px-3 sm:px-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-purple-primary focus:ring-2 focus:ring-purple-primary/20 transition-all duration-200 text-sm sm:text-base backdrop-blur-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleEmailLogin}
              disabled={isLoading || !email || !password}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-bold text-sm sm:text-lg hover:from-purple-secondary hover:to-purple-accent transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg shadow-purple-primary/30 hover:shadow-purple-secondary/40"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Log In"
              )}
            </button>

            <button
              onClick={() => setLoginMethod("social")}
              className="w-full text-purple-primary hover:text-purple-secondary transition-colors text-sm mt-4"
            >
              ← Back to other options
            </button>
          </motion.div>
        )}

        {/* Phone Login Form */}
        {loginMethod === "phone" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full h-12 sm:h-14 bg-purple-dark/30 border border-purple-secondary/30 rounded-xl px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-secondary focus:ring-2 focus:ring-purple-secondary/20 transition-all duration-200 text-sm sm:text-base backdrop-blur-sm"
              />
            </div>

            <button
              onClick={handlePhoneLogin}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-secondary to-purple-accent hover:from-purple-accent hover:to-purple-primary text-white font-bold text-sm sm:text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-secondary/30 hover:shadow-purple-accent/40"
            >
              Send Verification Code
            </button>

            <button
              onClick={() => setLoginMethod("social")}
              className="w-full text-purple-secondary hover:text-purple-primary transition-colors text-sm"
            >
              ← Back to other options
            </button>
          </motion.div>
        )}

        {/* Authentication Error Display */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-500 font-medium text-sm">
                  Authentication Error
                </h4>
                <p className="text-red-200 text-sm mt-1">{authError}</p>
                <div className="flex items-center space-x-3 mt-3">
                  <button
                    onClick={() => setAuthError(null)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Dismiss
                  </button>

                  {showResendVerification && (
                    <button
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Mail className="w-3 h-3" />
                      )}
                      <span>Resend verification email</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Network Status Indicator */}
        {!networkStatus.isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <h4 className="text-yellow-500 font-medium text-sm">
                  No Internet Connection
                </h4>
                <p className="text-yellow-200 text-sm mt-1">
                  Please check your internet connection and try again.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Firebase Connection Status */}
        {networkStatus.isOnline && authError?.includes('network') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <h4 className="text-blue-500 font-medium text-sm">
                  Connection Issue
                </h4>
                <p className="text-blue-200 text-sm mt-1">
                  Having trouble connecting to Firebase. This might be due to:
                </p>
                <ul className="text-blue-200 text-xs mt-2 ml-4 list-disc space-y-1">
                  <li>Firewall or network restrictions</li>
                  <li>Temporary server issues</li>
                  <li>Browser security settings</li>
                </ul>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-white underline hover:text-purple-primary transition-colors"
            >
              Sign up here
            </Link>
          </p>

          {/* Firebase Status */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <p className="text-xs text-slate-500">
              🔥 Firebase authentication active
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
