import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";
import { auth } from "../lib/firebase";

// Mock Firebase functions for development when Firebase is not configured
const createMockUser = (email: string) => ({
  uid: "mock-uid-" + Date.now(),
  email,
  emailVerified: false,
  displayName: null,
  reload: () => Promise.resolve(),
});

// Check if Firebase is properly configured
const isFirebaseConfigured =
  auth && typeof auth.onAuthStateChanged === "function";

const mockFirebaseFunctions = {
  createUserWithEmailAndPassword: (
    auth: any,
    email: string,
    password: string,
  ) => Promise.resolve({ user: createMockUser(email) }),
  sendEmailVerification: (user: any) => {
    console.log("Mock: Email verification sent to", user.email);
    return Promise.resolve();
  },
  updateProfile: (user: any, profile: any) => {
    console.log("Mock: Profile updated", profile);
    return Promise.resolve();
  },
  onAuthStateChanged: (auth: any, callback: any) => {
    // Return unsubscribe function
    return () => {};
  },
};

// Use real Firebase functions if configured, otherwise use mocks
const firebaseFunctions = isFirebaseConfigured
  ? {
      createUserWithEmailAndPassword:
        require("firebase/auth").createUserWithEmailAndPassword,
      sendEmailVerification: require("firebase/auth").sendEmailVerification,
      updateProfile: require("firebase/auth").updateProfile,
      onAuthStateChanged: require("firebase/auth").onAuthStateChanged,
    }
  : mockFirebaseFunctions;

type FirebaseUser = any;

type SignupStep =
  | "email-input"
  | "email-verification"
  | "profile-setup"
  | "password-setup"
  | "google-connecting"
  | "success";

interface UserData {
  email?: string;
  name?: string;
  username?: string;
  password?: string;
  isGoogleUser?: boolean;
  isEmailVerified?: boolean;
}

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<SignupStep>("email-input");
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = firebaseFunctions.onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.emailVerified && currentStep === "email-verification") {
        setUserData((prev) => ({ ...prev, isEmailVerified: true }));
        setCurrentStep("profile-setup");
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        });
      }
    });

    return () => unsubscribe();
  }, [currentStep, toast]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\\d/.test(password)
    );
  };

  // Handle email signup and send verification
  const handleEmailSignup = async () => {
    const email = userData.email?.trim();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Create a temporary password for Firebase user creation
      const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

      // Create user with email and temporary password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        tempPassword,
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      toast({
        title: "Verification email sent!",
        description: "Please check your email and click the verification link.",
      });

      setResendTimer(60);
      setCurrentStep("email-verification");
    } catch (error: any) {
      let errorMessage = "Failed to send verification email. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please try logging in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    setCurrentStep("google-connecting");
    setIsLoading(true);

    try {
      // Simulate Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate successful Google authentication
      const googleUserData = {
        email: "user@gmail.com",
        username: "user123",
        isGoogleUser: true,
        isEmailVerified: true,
      };

      setUserData((prev) => ({ ...prev, ...googleUserData }));
      setCurrentStep("success");

      toast({
        title: "Google account connected!",
        description: "Successfully connected your Google account",
      });

      // Auto redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error) {
      toast({
        title: "Google signup failed",
        description: "Failed to connect with Google. Please try again.",
        variant: "destructive",
      });
      setCurrentStep("email-input");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email verification check
  const handleCheckEmailVerification = async () => {
    if (!firebaseUser) return;

    setIsLoading(true);

    try {
      await firebaseUser.reload();

      if (firebaseUser.emailVerified) {
        setUserData((prev) => ({ ...prev, isEmailVerified: true }));
        setCurrentStep("profile-setup");
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        });
      } else {
        toast({
          title: "Email not verified yet",
          description:
            "Please check your email and click the verification link.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check verification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile setup
  const handleProfileSetup = () => {
    const { username, name } = userData;

    if (!username?.trim()) {
      setErrors({ username: "Username is required" });
      return;
    }

    if (!name?.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    setErrors({});
    setCurrentStep("password-setup");
  };

  // Handle password setup and complete signup
  const handleCompleteSignup = async () => {
    const { password, username, name } = userData;

    if (!password?.trim()) {
      setErrors({ password: "Password is required" });
      return;
    }

    if (!validatePassword(password)) {
      setErrors({
        password:
          "Password must be at least 8 characters with uppercase, lowercase, and number",
      });
      return;
    }

    if (!firebaseUser) {
      setErrors({ password: "Authentication error. Please try again." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Update user profile with display name
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      toast({
        title: "Account created successfully!",
        description: "Welcome to Music Catch!",
      });

      setCurrentStep("success");

      // Auto redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Failed to complete account setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (resendTimer > 0 || !firebaseUser) return;

    setIsLoading(true);
    try {
      await sendEmailVerification(firebaseUser);

      toast({
        title: "Verification email resent!",
        description: "Please check your email for the verification link.",
      });

      setResendTimer(60);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === "email-verification") {
      setCurrentStep("email-input");
    } else if (currentStep === "profile-setup") {
      setCurrentStep("email-verification");
    } else if (currentStep === "password-setup") {
      setCurrentStep("profile-setup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <MusicCatchLogo animated={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sign up to</h1>
          <h2 className="text-3xl font-bold text-white">MUSIC CATCH</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Email Input */}
          {currentStep === "email-input" && (
            <motion.div
              key="email-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-4 mb-6"
            >
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={userData.email || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@domain.com"
                  className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                onClick={handleEmailSignup}
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Send Verification Email"
                )}
              </button>
            </motion.div>
          )}

          {/* Email Verification */}
          {currentStep === "email-verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Verify your email
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Check your email and click the verification link
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-neon-green" />
                </div>
                <p className="text-white mb-2">Verification email sent to:</p>
                <p className="text-neon-green font-medium">{userData.email}</p>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-4">
                  After clicking the verification link in your email, click the
                  button below.
                </p>
                <button
                  onClick={handleCheckEmailVerification}
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50 mb-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "I've verified my email"
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">
                  Didn't receive the email?
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-neon-green hover:text-emerald-400 text-sm disabled:opacity-50"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend email"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Profile Setup */}
          {currentStep === "profile-setup" && (
            <motion.div
              key="profile-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Set up your profile
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Tell us about yourself
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={userData.username || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Choose a username"
                  className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              <button
                onClick={handleProfileSetup}
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50"
              >
                Next
              </button>
            </motion.div>
          )}

          {/* Password Setup */}
          {currentStep === "password-setup" && (
            <motion.div
              key="password-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Create your password
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Choose a secure password for your account
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Create a password"
                    className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-1">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              <button
                onClick={handleCompleteSignup}
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>
          )}

          {/* Google Connecting */}
          {currentStep === "google-connecting" && (
            <motion.div
              key="google-connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
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
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Connecting with Google
              </h3>
              <p className="text-slate-400">
                Please wait while we set up your account...
              </p>
            </motion.div>
          )}

          {/* Success */}
          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Welcome to Music Catch!
              </h3>
              <p className="text-slate-400 mb-6">
                Your account has been created successfully!
              </p>
              <div className="text-sm text-slate-500">
                Redirecting to home page...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider - Only show on main email input screen */}
        {currentStep === "email-input" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center my-6"
          >
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="px-4 text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </motion.div>
        )}

        {/* Google Signup Button - Only show on main email input screen */}
        {currentStep === "email-input" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-8"
          >
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full h-14 bg-slate-800/50 rounded-full flex justify-center items-center text-white font-medium hover:bg-slate-700/50 transition-colors border-[0.727273px] border-slate-500 disabled:opacity-50"
            >
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
              Sign up with Google
            </button>
          </motion.div>
        )}

        {/* Footer - Only show on main email input screen */}
        {currentStep === "email-input" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center"
          >
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white underline hover:text-neon-green transition-colors"
              >
                Log in here.
              </Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
