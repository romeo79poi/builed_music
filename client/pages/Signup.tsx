import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  Shield,
  Loader2,
  User,
  Globe,
  AlertCircle,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";

type SignupStep =
  | "email-input"
  | "phone-input"
  | "email-verification"
  | "phone-verification"
  | "profile-setup"
  | "google-connecting"
  | "success";

interface UserData {
  email?: string;
  phone?: string;
  countryCode?: string;
  username?: string;
  password?: string;
  isGoogleUser?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

// Country codes data
const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+1", country: "CA", flag: "🇨🇦" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
];

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<SignupStep>("email-input");
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryList, setShowCountryList] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  // Handle email/phone signup
  const handleSignup = async () => {
    if (isPhoneMode) {
      const phone = userData.phone?.trim();
      if (!phone) {
        setErrors({ phone: "Phone number is required" });
        return;
      }
      if (!validatePhone(phone)) {
        setErrors({ phone: "Please enter a valid phone number" });
        return;
      }
    } else {
      const email = userData.email?.trim();
      if (!email) {
        setErrors({ email: "Email is required" });
        return;
      }
      if (!validateEmail(email)) {
        setErrors({ email: "Please enter a valid email address" });
        return;
      }
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: `Verification ${isPhoneMode ? "SMS" : "email"} sent!`,
        description: `We've sent a verification code to your ${isPhoneMode ? "phone" : "email"}`,
      });

      setResendTimer(60);
      setCurrentStep(isPhoneMode ? "phone-verification" : "email-verification");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send verification ${isPhoneMode ? "SMS" : "email"}. Please try again.`,
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

  // Handle verification code submission
  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setErrors({ code: "Please enter a valid 6-digit code" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isPhoneMode) {
        setUserData((prev) => ({ ...prev, isPhoneVerified: true }));
      } else {
        setUserData((prev) => ({ ...prev, isEmailVerified: true }));
      }

      toast({
        title: "Verification successful!",
        description: `Your ${isPhoneMode ? "phone" : "email"} has been verified`,
      });

      setCurrentStep("profile-setup");
    } catch (error) {
      setErrors({ code: "Invalid verification code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile completion
  const handleCompleteSignup = async () => {
    const { username, password } = userData;

    if (!username?.trim()) {
      setErrors({ username: "Username is required" });
      return;
    }

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

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate account creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

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
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Verification code resent!",
        description: `New code sent to your ${isPhoneMode ? "phone" : "email"}`,
      });

      setResendTimer(60);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between email and phone mode
  const switchToPhoneMode = () => {
    setIsPhoneMode(true);
    setCurrentStep("phone-input");
    setErrors({});
  };

  const switchToEmailMode = () => {
    setIsPhoneMode(false);
    setCurrentStep("email-input");
    setErrors({});
  };

  const goBack = () => {
    if (currentStep === "phone-input") {
      switchToEmailMode();
    } else if (
      currentStep === "email-verification" ||
      currentStep === "phone-verification"
    ) {
      setCurrentStep(isPhoneMode ? "phone-input" : "email-input");
    } else if (currentStep === "profile-setup") {
      setCurrentStep(isPhoneMode ? "phone-verification" : "email-verification");
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

              <p
                onClick={switchToPhoneMode}
                className="text-neon-green text-sm underline hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Use phone number instead.
              </p>

              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Next"
                )}
              </button>
            </motion.div>
          )}

          {/* Phone Input */}
          {currentStep === "phone-input" && (
            <motion.div
              key="phone-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center mb-4">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h3 className="text-lg font-semibold text-white">
                  Enter your phone number
                </h3>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone number
                </label>
                <div className="flex">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryList(!showCountryList)}
                      className="h-14 px-3 bg-slate-800/50 border border-slate-600 rounded-l-lg flex items-center space-x-2 text-white hover:bg-slate-700/50"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-sm">{selectedCountry.code}</span>
                    </button>

                    {/* Country Code Dropdown */}
                    {showCountryList && (
                      <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {countryCodes.map((country, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedCountry(country);
                              setUserData((prev) => ({
                                ...prev,
                                countryCode: country.code,
                              }));
                              setShowCountryList(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-center space-x-3 text-white"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm">
                              {country.code} {country.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    value={userData.phone || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        phone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="1234567890"
                    className="flex-1 h-14 bg-slate-800/50 border border-slate-600 rounded-r-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <p
                onClick={switchToEmailMode}
                className="text-neon-green text-sm underline hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Use email instead.
              </p>

              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Next"
                )}
              </button>
            </motion.div>
          )}

          {/* Verification Steps */}
          {(currentStep === "email-verification" ||
            currentStep === "phone-verification") && (
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
                    Verify your {isPhoneMode ? "phone" : "email"}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Enter the 6-digit code we sent
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-neon-green" />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-neon-green"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.code && (
                  <p className="text-red-400 text-sm mt-2 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.code}
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-neon-green hover:text-emerald-400 text-sm disabled:opacity-50"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend code"}
                </button>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Verify"
                )}
              </button>
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
                    Complete your profile
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Create your username and password
                  </p>
                </div>
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
