import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useFirebase } from "../context/FirebaseContext";
import { loginWithEmailAndPassword, signInWithGoogle, sendFirebaseEmailVerification } from "../lib/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";
import ConnectivityChecker, {
  getNetworkErrorMessage,
} from "../lib/connectivity";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<"social" | "email" | "phone">(
    "social",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(
    ConnectivityChecker.getConnectionStatus(),
  );
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  // Save user profile data to Firestore
  const saveUserProfile = async (uid: string, profileData: any) => {
    try {
      if (!db) {
        console.warn("Firestore not available, skipping profile save");
        return;
      }

      await setDoc(
        doc(db, "users", uid),
        {
          ...profileData,
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log("✅ User profile saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving profile to Firestore:", error);
    }
  };

  // Get existing user profile data from Firestore
  const getUserProfile = async (uid: string) => {
    try {
      if (!db) return null;

      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("✅ User profile fetched from Firestore:", userDoc.data());
        return userDoc.data();
      }
      console.warn("⚠️ No user profile found in Firestore for UID:", uid);
      return null;
    } catch (error) {
      console.error("❌ Error getting user profile:", error);
      return null;
    }
  };

  // Check if email verification is required
  const checkVerificationStatus = (user: any) => {
    if (!user.emailVerified && user.email) {
      setVerificationNeeded(true);
      setCurrentUser(user);
      return false;
    }
    return true;
  };

  // Resend email verification
  const handleResendVerification = async () => {
    if (!currentUser) return;

    setSendingVerification(true);
    try {
      const result = await sendFirebaseEmailVerification(currentUser);
      if (result.success) {
        toast({
          title: "Verification email sent!",
          description: "Please check your email and click the verification link.",
        });
      } else {
        toast({
          title: "Failed to send verification",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    // Check connectivity before attempting login
    if (!ConnectivityChecker.getConnectionStatus()) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Check if we can reach the backend
      const hasConnection = await ConnectivityChecker.checkInternetConnection();
      if (!hasConnection) {
        throw new Error("Unable to connect to the server");
      }

      const result = await loginWithEmailAndPassword(email, password);

      if (result.success && result.user) {
        // Check email verification status
        if (!checkVerificationStatus(result.user)) {
          toast({
            title: "Email verification required",
            description: "Please verify your email before continuing",
            variant: "destructive",
          });
          return;
        }

        // Store token if provided (for backend auth)
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // Fetch existing user profile from Firestore
        const userProfile = await getUserProfile(result.user.uid);

        if (userProfile) {
          console.log("✅ User data loaded from Firestore:", userProfile);
        } else {
          // Create profile if it doesn't exist (fallback)
          const profileData = {
            name: result.user.displayName || "User",
            username: result.user.email?.split("@")[0] || "",
            email: result.user.email || "",
            phone: "",
            profileImageURL: result.user.photoURL || "",
            createdAt: serverTimestamp(),
          };

          await saveUserProfile(result.user.uid, profileData);
          console.log("✅ Created missing user profile:", profileData);
        }

        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });

        // Redirect to homepage
        navigate("/home");
      } else {
        const errorMessage =
          getNetworkErrorMessage(result) ||
          result.error ||
          "Please check your credentials";
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        getNetworkErrorMessage(error) ||
        error.message ||
        "An unexpected error occurred";
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
    // Check connectivity before attempting Google login
    if (!ConnectivityChecker.getConnectionStatus()) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        // Google accounts are typically verified, but check anyway
        if (!result.user.emailVerified && result.user.email) {
          console.warn("⚠️ Google user email not verified, but proceeding...");
        }

        // Store token if provided (for backend auth)
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        // Fetch existing user profile from Firestore
        const userProfile = await getUserProfile(result.user.uid);

        if (userProfile) {
          console.log("✅ Google user data loaded from Firestore:", userProfile);
        } else {
          // Create profile if it doesn't exist (for new Google users)
          const profileData = {
            name: result.user.displayName ||
              result.user.email?.split("@")[0] ||
              "User",
            username: result.user.email?.split("@")[0] || "",
            email: result.user.email || "",
            phone: "",
            profileImageURL: result.user.photoURL || "",
            createdAt: serverTimestamp(),
          };

          await saveUserProfile(result.user.uid, profileData);
          console.log("✅ Created Google user profile:", profileData);
        }

        toast({
          title: "Welcome!",
          description: "Successfully logged in with Google",
        });

        // Redirect to homepage
        navigate("/home");
      } else {
        const errorMessage =
          getNetworkErrorMessage(result) || result.error || "Please try again";
        toast({
          title: "Google login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      const errorMessage =
        getNetworkErrorMessage(error) ||
        error.message ||
        "An unexpected error occurred";
      toast({
        title: "Google login error",
        description: errorMessage,
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

  // Monitor connectivity status
  useEffect(() => {
    const unsubscribe = ConnectivityChecker.addListener((online) => {
      setIsOnline(online);
      if (online) {
        toast({
          title: "Back online",
          description: "Your connection has been restored",
        });
      } else {
        toast({
          title: "Connection lost",
          description: "Please check your internet connection",
          variant: "destructive",
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

      <div className="relative z-10 w-full max-w-md px-2 sm:px-0">
        {/* Back Button - Top Left Corner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-4 left-4 z-20"
        >
          <button
            onClick={() => navigate("/")}
            className="w-12 h-12 bg-black/80 hover:bg-black/90 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </motion.div>

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
          Log in to Catch
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
              className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors disabled:opacity-50"
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
              onClick={() => {
                toast({
                  title: "Coming soon",
                  description: "Facebook login will be available soon!",
                });
              }}
              className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors"
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
                className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
              >
                <Mail className="w-5 h-5 mr-3 text-neon-green" />
                Continue with Email
              </button>

              <button
                onClick={() => setLoginMethod("phone")}
                className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
              >
                <Phone className="w-5 h-5 mr-3 text-neon-blue" />
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
                className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
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
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
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
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-lg text-black font-bold text-sm sm:text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Log In"
              )}
            </button>

            <button
              onClick={() => setLoginMethod("social")}
              className="w-full text-neon-green hover:text-neon-blue transition-colors text-sm mt-4"
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
                className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-blue transition-colors text-sm sm:text-base"
              />
            </div>

            <button
              onClick={handlePhoneLogin}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-blue to-purple-600 hover:from-neon-blue/80 hover:to-purple-600/80 text-white font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105"
            >
              Send Verification Code
            </button>

            <button
              onClick={() => setLoginMethod("social")}
              className="w-full text-neon-blue hover:text-neon-green transition-colors text-sm"
            >
              ← Back to other options
            </button>
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
              className="text-white underline hover:text-neon-green transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
