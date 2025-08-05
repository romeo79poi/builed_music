import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";
import { api } from "../lib/api";
import ConnectivityChecker, {
  getNetworkErrorMessage,
} from "../lib/connectivity";
import { firebaseHelpers } from "../lib/firebase-simple";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
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
  const [backendError, setBackendError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setBackendError(null);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        toast({
          title: "Login successful! 🎉",
          description: result.message,
        });

        navigate("/home");
      } else {
        setBackendError(result.message);
        toast({
          title: "Login failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setBackendError(error.message || "Network error occurred");
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setBackendError(null);

    try {
      const result = await signInWithGoogle();

      if (result.success) {
        toast({
          title: "Google login successful! 🎉",
          description: result.message,
        });
      } else {
        setBackendError(result.message);
        toast({
          title: "Google login failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setBackendError(error.message || "Google login failed");
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
    setBackendError(null);

    try {
      const result = await signInWithFacebook();

      if (result.success) {
        toast({
          title: "Facebook login successful! 🎉",
          description: result.message,
        });
      } else {
        setBackendError(result.message);
        toast({
          title: "Facebook login failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setBackendError(error.message || "Facebook login failed");
      toast({
        title: "Facebook login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      setBackendError(null);

      // Check if we can reach the backend
      const hasConnection = await ConnectivityChecker.checkInternetConnection();
      if (!hasConnection) {
        throw new Error("Unable to connect to the server");
      }

      // Use new auth context login
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });

        console.log("✅ Backend login successful");

        // Navigate to home - AuthRouter will handle the redirect
        navigate("/");
      } else {
        setBackendError(result.error || "Invalid email or password");
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        getNetworkErrorMessage(error) ||
        error.message ||
        "An unexpected error occurred";
      setBackendError(errorMessage);
      toast({
        title: "Login error",
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
              onClick={handleLogin}
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

        {/* Backend Error Display */}
        {backendError && (
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
                <p className="text-red-200 text-sm mt-1">{backendError}</p>
                <button
                  onClick={() => setBackendError(null)}
                  className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Dismiss
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

          {/* Backend Auth Status */}
          <p className="text-xs text-slate-500 mt-2">
            ✅ Backend authentication active
          </p>
        </motion.div>
      </div>
    </div>
  );
}
