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
  ArrowRight,
  Shield,
  Loader2,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

type SignupStep =
  | "method-selection"
  | "email-signup"
  | "phone-signup"
  | "email-verification"
  | "phone-verification"
  | "profile-setup"
  | "password-setup"
  | "google-connecting"
  | "success";

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  password?: string;
  isGoogleUser?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] =
    useState<SignupStep>("method-selection");
  const [signupMethod, setSignupMethod] = useState<
    "email" | "phone" | "google" | null
  >(null);
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

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
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
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

  // Handle method selection
  const handleMethodSelection = (method: "email" | "phone" | "google") => {
    setSignupMethod(method);

    if (method === "google") {
      handleGoogleSignup();
    } else if (method === "email") {
      setCurrentStep("email-signup");
    } else {
      setCurrentStep("phone-signup");
    }
  };

  // Handle email signup
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
      // Simulate API call to send verification email
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Verification email sent!",
        description: `We've sent a verification code to ${email}`,
      });

      setResendTimer(60);
      setCurrentStep("email-verification");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone signup
  const handlePhoneSignup = async () => {
    const phone = userData.phone?.trim();

    if (!phone) {
      setErrors({ phone: "Phone number is required" });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({ phone: "Please enter a valid phone number" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call to send SMS verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Verification SMS sent!",
        description: `We've sent a verification code to ${phone}`,
      });

      setResendTimer(60);
      setCurrentStep("phone-verification");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification SMS. Please try again.",
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
        firstName: "John",
        lastName: "Doe",
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
      setCurrentStep("method-selection");
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

      if (signupMethod === "email") {
        setUserData((prev) => ({ ...prev, isEmailVerified: true }));
      } else {
        setUserData((prev) => ({ ...prev, isPhoneVerified: true }));
      }

      toast({
        title: "Verification successful!",
        description: `Your ${signupMethod} has been verified`,
      });

      setCurrentStep("profile-setup");
    } catch (error) {
      setErrors({ code: "Invalid verification code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile setup
  const handleProfileSetup = () => {
    const { firstName, lastName, birthDate } = userData;

    if (!firstName?.trim()) {
      setErrors({ firstName: "First name is required" });
      return;
    }

    if (!lastName?.trim()) {
      setErrors({ lastName: "Last name is required" });
      return;
    }

    if (!birthDate) {
      setErrors({ birthDate: "Birth date is required" });
      return;
    }

    // Validate age (must be 13+)
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();

    if (age < 13) {
      setErrors({ birthDate: "You must be at least 13 years old to sign up" });
      return;
    }

    setErrors({});
    setCurrentStep("password-setup");
  };

  // Handle password setup
  const handlePasswordSetup = async () => {
    const password = userData.password?.trim();

    if (!password) {
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
        description: `New code sent to your ${signupMethod}`,
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

  const goBack = () => {
    switch (currentStep) {
      case "email-signup":
      case "phone-signup":
        setCurrentStep("method-selection");
        break;
      case "email-verification":
        setCurrentStep("email-signup");
        break;
      case "phone-verification":
        setCurrentStep("phone-signup");
        break;
      case "profile-setup":
        setCurrentStep(
          signupMethod === "email"
            ? "email-verification"
            : "phone-verification",
        );
        break;
      case "password-setup":
        setCurrentStep("profile-setup");
        break;
      default:
        setCurrentStep("method-selection");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5"></div>

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
          {/* Method Selection */}
          {currentStep === "method-selection" && (
            <motion.div
              key="method-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Choose signup method
                </h3>
                <p className="text-slate-400">
                  How would you like to create your account?
                </p>
              </div>

              <Button
                onClick={() => handleMethodSelection("google")}
                className="w-full h-14 bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 mr-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                Continue with Google
              </Button>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-slate-600"></div>
                <span className="px-4 text-slate-400 text-sm">or</span>
                <div className="flex-1 h-px bg-slate-600"></div>
              </div>

              <Button
                onClick={() => handleMethodSelection("email")}
                variant="outline"
                className="w-full h-14 border-slate-600 text-white hover:bg-slate-800"
              >
                <Mail className="w-5 h-5 mr-3" />
                Sign up with Email
              </Button>

              <Button
                onClick={() => handleMethodSelection("phone")}
                variant="outline"
                className="w-full h-14 border-slate-600 text-white hover:bg-slate-800"
              >
                <Phone className="w-5 h-5 mr-3" />
                Sign up with Phone
              </Button>
            </motion.div>
          )}

          {/* Email Signup */}
          {currentStep === "email-signup" && (
            <motion.div
              key="email-signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-4 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Enter your email
                  </h3>
                  <p className="text-slate-400 text-sm">
                    We'll send you a verification code
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email address
                </label>
                <Input
                  type="email"
                  value={userData.email || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@domain.com"
                  className="w-full h-14 bg-slate-800/50 border-slate-600 text-white"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                onClick={handleEmailSignup}
                disabled={isLoading || !userData.email?.trim()}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 text-slate-900 font-bold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Phone Signup */}
          {currentStep === "phone-signup" && (
            <motion.div
              key="phone-signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-4 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Enter your phone
                  </h3>
                  <p className="text-slate-400 text-sm">
                    We'll send you a verification SMS
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone number
                </label>
                <Input
                  type="tel"
                  value={userData.phone || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 123-4567"
                  className="w-full h-14 bg-slate-800/50 border-slate-600 text-white"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <Button
                onClick={handlePhoneSignup}
                disabled={isLoading || !userData.phone?.trim()}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 text-slate-900 font-bold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Email/Phone Verification */}
          {(currentStep === "email-verification" ||
            currentStep === "phone-verification") && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-4 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Verify your {signupMethod}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Enter the 6-digit code sent to{" "}
                    {signupMethod === "email" ? userData.email : userData.phone}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-neon-green" />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  className="w-full h-14 bg-slate-800/50 border-slate-600 text-white text-center text-2xl tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.code && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.code}
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  onClick={handleResendVerification}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-neon-green hover:text-emerald-400"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend code"}
                </Button>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 text-slate-900 font-bold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify
                    <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Profile Setup */}
          {currentStep === "profile-setup" && (
            <motion.div
              key="profile-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-4 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Complete your profile
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Tell us about yourself
                  </p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={userData.firstName || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="John"
                    className="w-full h-12 bg-slate-800/50 border-slate-600 text-white"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={userData.lastName || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Doe"
                    className="w-full h-12 bg-slate-800/50 border-slate-600 text-white"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Birth Date
                </label>
                <Input
                  type="date"
                  value={userData.birthDate || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  className="w-full h-12 bg-slate-800/50 border-slate-600 text-white"
                />
                {errors.birthDate && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.birthDate}
                  </p>
                )}
              </div>

              <Button
                onClick={handleProfileSetup}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 text-slate-900 font-bold"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Password Setup */}
          {currentStep === "password-setup" && (
            <motion.div
              key="password-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-4 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Create a password
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Choose a secure password for your account
                  </p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-neon-green" />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={userData.password || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                    className="w-full h-14 bg-slate-800/50 border-slate-600 text-white pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}

                <div className="mt-3 space-y-1">
                  <p className="text-slate-400 text-xs">
                    Password must contain:
                  </p>
                  <div className="flex items-center text-xs">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${userData.password && userData.password.length >= 8 ? "bg-green-500" : "bg-slate-600"}`}
                    ></div>
                    <span
                      className={
                        userData.password && userData.password.length >= 8
                          ? "text-green-400"
                          : "text-slate-400"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${userData.password && /[A-Z]/.test(userData.password) ? "bg-green-500" : "bg-slate-600"}`}
                    ></div>
                    <span
                      className={
                        userData.password && /[A-Z]/.test(userData.password)
                          ? "text-green-400"
                          : "text-slate-400"
                      }
                    >
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${userData.password && /[a-z]/.test(userData.password) ? "bg-green-500" : "bg-slate-600"}`}
                    ></div>
                    <span
                      className={
                        userData.password && /[a-z]/.test(userData.password)
                          ? "text-green-400"
                          : "text-slate-400"
                      }
                    >
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${userData.password && /\d/.test(userData.password) ? "bg-green-500" : "bg-slate-600"}`}
                    ></div>
                    <span
                      className={
                        userData.password && /\d/.test(userData.password)
                          ? "text-green-400"
                          : "text-slate-400"
                      }
                    >
                      One number
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePasswordSetup}
                disabled={isLoading || !userData.password?.trim()}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 text-slate-900 font-bold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
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
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
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
                Your account has been created successfully
                {userData.firstName && `, ${userData.firstName}`}!
              </p>
              <div className="text-sm text-slate-500">
                Redirecting to home page...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {currentStep === "method-selection" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mt-8"
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
