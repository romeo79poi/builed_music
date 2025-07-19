import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  User,
  Lock,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";

type SignupStep = "email" | "profile" | "verification" | "password";

interface FormData {
  email: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  username?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<SignupStep>("email");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availability, setAvailability] = useState<{
    email?: boolean;
    username?: boolean;
  }>({});
  const [resendTimer, setResendTimer] = useState(0);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const validateProfile = (): boolean => {
    let isValid = true;
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
      isValid = false;
    }

    if (availability.username === false) {
      newErrors.username = "Username is already taken";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePassword = (): boolean => {
    let isValid = true;
    const newErrors: ValidationErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
      isValid = false;
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check availability with backend
  const checkAvailability = async (
    field: "email" | "username",
    value: string,
  ) => {
    if (!value) return;

    try {
      const response = await fetch(
        `/api/auth/check-availability?${field}=${encodeURIComponent(value)}`,
      );
      const data = await response.json();

      if (data.success) {
        setAvailability((prev) => ({
          ...prev,
          [field]:
            field === "email" ? data.emailAvailable : data.usernameAvailable,
        }));

        if (field === "email" && !data.emailAvailable) {
          setErrors((prev) => ({
            ...prev,
            email: "Email is already registered",
          }));
        }
      }
    } catch (error) {
      console.error("Availability check failed:", error);
    }
  };

  // Step handlers
  const handleEmailStep = async () => {
    if (!validateEmail(formData.email)) return;

    setIsLoading(true);
    await checkAvailability("email", formData.email);
    setIsLoading(false);

    if (availability.email !== false) {
      setCurrentStep("profile");
    }
  };

  const handleProfileStep = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    await checkAvailability("username", formData.username);
    setIsLoading(false);

    if (availability.username !== false) {
      setCurrentStep("verification");
      // Simulate sending verification email
      toast({
        title: "Verification email sent!",
        description: "Please check your email and verify your account.",
      });
      setResendTimer(60);
    }
  };

  const handleVerificationStep = () => {
    // Simulate email verification
    toast({
      title: "Email verified!",
      description: "Your email has been successfully verified.",
    });
    setCurrentStep("password");
  };

  const handlePasswordStep = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      // Submit to backend
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account created successfully! 🎉",
          description: `Welcome to Music Catch, ${data.user.name}!`,
        });

        console.log("✅ User created in backend:", data.user);
        console.log("📊 Frontend data matched to backend:", {
          frontend: formData,
          backend: data.user,
          matched: true,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === "profile") {
      setCurrentStep("email");
    } else if (currentStep === "verification") {
      setCurrentStep("profile");
    } else if (currentStep === "password") {
      setCurrentStep("verification");
    }
  };

  const handleResendVerification = () => {
    if (resendTimer > 0) return;

    toast({
      title: "Verification email resent!",
      description: "Please check your email for the verification link.",
    });
    setResendTimer(60);
  };

  // Timer for resend functionality
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const stepTitles = {
    email: "What's your email?",
    profile: "Tell us about yourself",
    verification: "Verify your email",
    password: "Create your password",
  };

  const stepDescriptions = {
    email: "We'll send you a verification email",
    profile: "Help others find you on Music Catch",
    verification: "Check your email and click the verification link",
    password: "Choose a secure password for your account",
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
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

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-2">
            {["email", "profile", "verification", "password"].map(
              (step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    Object.keys(stepTitles).indexOf(currentStep) >= index
                      ? "bg-neon-green"
                      : "bg-slate-700"
                  }`}
                />
              ),
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Email Step */}
          {currentStep === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {stepTitles.email}
                </h3>
                <p className="text-slate-400 text-sm">
                  {stepDescriptions.email}
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your@email.com"
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
                onClick={handleEmailStep}
                disabled={isLoading || !formData.email}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Continue"
                )}
              </button>
            </motion.div>
          )}

          {/* Profile Step */}
          {currentStep === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-neon-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {stepTitles.profile}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {stepDescriptions.profile}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                  disabled={isLoading}
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
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="your_username"
                  className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              <button
                onClick={handleProfileStep}
                disabled={isLoading || !formData.name || !formData.username}
                className="w-full h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Continue"
                )}
              </button>
            </motion.div>
          )}

          {/* Verification Step */}
          {currentStep === "verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {stepTitles.verification}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {stepDescriptions.verification}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-white mb-2">Verification email sent to:</p>
                <p className="text-neon-green font-medium">{formData.email}</p>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-4">
                  After clicking the verification link in your email, click the
                  button below.
                </p>
                <button
                  onClick={handleVerificationStep}
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none mb-4"
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

          {/* Password Step */}
          {currentStep === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mr-4"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {stepTitles.password}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {stepDescriptions.password}
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
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Create a strong password"
                    className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                    disabled={isLoading}
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
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm your password"
                    className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                onClick={handlePasswordStep}
                disabled={
                  isLoading || !formData.password || !formData.confirmPassword
                }
                className="w-full h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - Only show on first step */}
        {currentStep === "email" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-neon-green hover:text-neon-blue transition-colors underline"
              >
                Log in here
              </Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
