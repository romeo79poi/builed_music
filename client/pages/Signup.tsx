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
  Phone,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";
import {
  validatePhoneNumber,
  formatPhoneInput,
  formatPhoneDisplay,
  phoneAPI,
} from "../lib/phone";
import { signUpWithEmailAndPassword, signInWithGoogle } from "../lib/auth";

type SignupStep =
  | "method"
  | "email"
  | "phone"
  | "phone-verify"
  | "profile"
  | "verification"
  | "password";
type SignupMethod = "email" | "phone";

interface FormData {
  email: string;
  phone: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
  username?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<SignupStep>("method");
  const [signupMethod, setSignupMethod] = useState<SignupMethod>("email");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availability, setAvailability] = useState<{
    email?: boolean;
    phone?: boolean;
    username?: boolean;
  }>({});
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

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

  const validatePhone = (phone: string): boolean => {
    const result = validatePhoneNumber(phone);
    if (!result.isValid) {
      setErrors((prev) => ({ ...prev, phone: result.error }));
      return false;
    }
    setErrors((prev) => ({ ...prev, phone: undefined }));
    return true;
  };

  const validateOTP = (otp: string): boolean => {
    if (!otp) {
      setErrors((prev) => ({ ...prev, otp: "Verification code is required" }));
      return false;
    }
    if (otp.length !== 6) {
      setErrors((prev) => ({
        ...prev,
        otp: "Verification code must be 6 digits",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, otp: undefined }));
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
    field: "email" | "username" | "phone",
    value: string,
  ) => {
    if (!value) return;

    try {
      let response, data;

      if (field === "phone") {
        response = await fetch(
          `/api/phone/check-availability?phone=${encodeURIComponent(value)}`,
        );
        data = await response.json();

        if (data.success) {
          setAvailability((prev) => ({
            ...prev,
            phone: data.phoneAvailable,
          }));

          if (!data.phoneAvailable) {
            setErrors((prev) => ({
              ...prev,
              phone: "Phone number is already registered",
            }));
          }
        }
      } else {
        response = await fetch(
          `/api/auth/check-availability?${field}=${encodeURIComponent(value)}`,
        );
        data = await response.json();

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
      }
    } catch (error) {
      console.error("Availability check failed:", error);
    }
  };

  // Send OTP to phone
  const sendOTP = async () => {
    if (!validatePhone(formData.phone)) return;

    setIsLoading(true);
    try {
      const result = await phoneAPI.sendOTP(formData.phone);

      if (result.success) {
        setOtpSent(true);
        setResendTimer(60);
        toast({
          title: "Verification code sent!",
          description: `We sent a 6-digit code to ${formatPhoneDisplay(formData.phone)}`,
        });

        // For development, show OTP in console
        if (result.debugOtp) {
          console.log(`📱 OTP for ${formData.phone}: ${result.debugOtp}`);
        }
      } else {
        toast({
          title: "Failed to send code",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast({
        title: "Failed to send code",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!validateOTP(formData.otp)) return;

    setIsLoading(true);
    try {
      const result = await phoneAPI.verifyOTP(formData.phone, formData.otp);

      if (result.success) {
        setPhoneVerified(true);
        toast({
          title: "Phone verified!",
          description: "Your phone number has been successfully verified.",
        });

        if (signupMethod === "phone") {
          setCurrentStep("profile");
        }
      } else {
        setErrors((prev) => ({ ...prev, otp: result.message }));
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setErrors((prev) => ({
        ...prev,
        otp: "Verification failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Google signup handler
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    console.log("🚀 Starting Google sign-up process...");

    try {
      // Try Firebase first, then fallback to backend simulation
      const result = await signInWithGoogle();

      console.log("📋 Google sign-in result:", {
        success: result.success,
        hasUser: !!result.user,
        isNewUser: result.isNewUser,
        error: result.error,
      });

      if (result.success && result.user) {
        // Validate user data
        if (!result.user.email) {
          throw new Error("Google account must have a valid email address");
        }

        const displayName =
          result.user.displayName || result.user.email?.split("@")[0] || "User";
        const message = result.isNewUser
          ? `Welcome to Music Catch, ${displayName}!`
          : `Welcome back, ${displayName}!`;

        toast({
          title: "Google sign-in successful! 🎉",
          description: message,
        });

        console.log("✅ Google authentication successful:", {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          isNewUser: result.isNewUser,
          emailVerified: result.user.emailVerified,
        });

        // If this is a new user and we're in development mode, also register with backend
        if (
          (result.isNewUser && result.user.email?.includes("demo")) ||
          result.user.email?.includes("dev")
        ) {
          try {
            const backendResponse = await fetch("/api/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: result.user.email,
                username: result.user.email.split("@")[0] + "_google",
                name: displayName,
                password: "google_auth_" + Date.now(), // Dummy password for Google users
                provider: "google",
              }),
            });

            const backendData = await backendResponse.json();
            if (backendData.success) {
              console.log(
                "✅ Google user also registered in backend:",
                backendData.user,
              );
            }
          } catch (backendError) {
            console.warn(
              "Backend registration failed for Google user, continuing:",
              backendError,
            );
          }
        }

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        console.error("❌ Google sign-in failed:", result.error);

        toast({
          title: "Google sign-in failed",
          description:
            result.error || "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("💥 Google signup error:", error);

      let errorMessage = "An unexpected error occurred";
      if (error.message?.includes("email")) {
        errorMessage = "Google account must have a valid email address";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("popup")) {
        errorMessage =
          "Sign-in popup was blocked. Please allow popups and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Google sign-in error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("🏁 Google sign-up process completed");
    }
  };

  // Step handlers
  const handleMethodStep = (method: SignupMethod) => {
    setSignupMethod(method);
    if (method === "email") {
      setCurrentStep("email");
    } else {
      setCurrentStep("phone");
    }
  };

  const handleEmailStep = async () => {
    if (!validateEmail(formData.email)) return;

    setIsLoading(true);

    try {
      // Check email availability first
      await checkAvailability("email", formData.email);

      if (availability.email === false) {
        setIsLoading(false);
        return;
      }

      // Send email verification code
      const response = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep("verification");
        toast({
          title: "Verification code sent!",
          description:
            "Please check your email for the 6-digit verification code.",
        });

        // For development, show code in console
        if (data.debugCode) {
          console.log(`📧 Email verification code: ${data.debugCode}`);
        }

        setResendTimer(60);
      } else {
        toast({
          title: "Failed to send verification code",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast({
        title: "Network error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneStep = async () => {
    if (!validatePhone(formData.phone)) return;

    setIsLoading(true);
    await checkAvailability("phone", formData.phone);
    setIsLoading(false);

    if (availability.phone !== false) {
      setCurrentStep("phone-verify");
      await sendOTP();
    }
  };

  const handleProfileStep = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    await checkAvailability("username", formData.username);
    setIsLoading(false);

    if (availability.username !== false) {
      if (signupMethod === "phone") {
        // Complete phone signup
        await handlePasswordStep();
      } else {
        setCurrentStep("password");
      }
    }
  };

  const handleVerificationStep = async () => {
    if (!validateOTP(formData.otp)) return;

    if (signupMethod === "email") {
      setIsLoading(true);

      try {
        // Verify email code with backend
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            code: formData.otp,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Email verified!",
            description: "Your email has been successfully verified.",
          });
          setCurrentStep("profile");
        } else {
          setErrors((prev) => ({ ...prev, otp: data.message }));

          if (data.attemptsRemaining !== undefined) {
            toast({
              title: "Invalid code",
              description: `${data.attemptsRemaining} attempts remaining`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setErrors((prev) => ({
          ...prev,
          otp: "Verification failed. Please try again.",
        }));
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep("password");
    }
  };

  const handlePhoneVerifyStep = async () => {
    await verifyOTP();
  };

  const handlePasswordStep = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      if (signupMethod === "phone") {
        // Keep existing phone registration logic
        const response = await fetch("/api/phone/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: formData.phone,
            name: formData.name,
            username: formData.username,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Account created successfully! 🎉",
            description: `Welcome to Music Catch, ${data.user.name}!`,
          });

          setTimeout(() => {
            navigate("/profile");
          }, 2000);
        } else {
          toast({
            title: "Registration failed",
            description: data.message || "Please try again",
            variant: "destructive",
          });
        }
      } else {
        // Clear any previous errors
        setErrorAlert(null);

        try {
          // Use backend API for email registration
          const response = await fetch("/api/auth/complete-registration", {
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
              description: `Welcome to Music Catch, ${formData.name}!`,
            });

            console.log("✅ User created with backend:", data.user);

            setTimeout(() => {
              navigate("/profile");
            }, 2000);
          } else {
            // Show error in red alert box
            setErrorAlert(
              data.message || "Registration failed. Please try again.",
            );
          }
        } catch (error) {
          console.error("Registration error:", error);
          setErrorAlert("Network error. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorAlert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === "email") {
      setCurrentStep("method");
    } else if (currentStep === "phone") {
      setCurrentStep("method");
    } else if (currentStep === "phone-verify") {
      setCurrentStep("phone");
    } else if (currentStep === "profile") {
      if (signupMethod === "email") {
        setCurrentStep("email");
      } else {
        setCurrentStep("phone-verify");
      }
    } else if (currentStep === "verification") {
      setCurrentStep("profile");
    } else if (currentStep === "password") {
      setCurrentStep("verification");
    }
  };

  const handleResendVerification = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Verification code resent!",
          description:
            "Please check your email for the new 6-digit verification code.",
        });

        // For development, show code in console
        if (data.debugCode) {
          console.log(`📧 Resent email verification code: ${data.debugCode}`);
        }

        setResendTimer(60);
      } else {
        toast({
          title: "Failed to resend code",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        title: "Network error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Timer for resend functionality
  useEffect(() => {
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5"></div>

      <div className="relative z-10 w-full max-w-md px-2 sm:px-0">
        {/* Back Button - Always visible */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 z-20"
        >
          <button
            onClick={() => {
              if (currentStep === "method") {
                navigate("/");
              } else {
                goBack();
              }
            }}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex justify-center mb-3 sm:mb-4">
            <MusicCatchLogo
              animated={true}
              signupMode={true}
              className="scale-90 sm:scale-100"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Sign up to
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            MUSIC CATCH
          </h2>
        </motion.div>

        {/* Google Signup Button - Only visible on method step */}
        {currentStep === "method" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6"
          >
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full h-12 sm:h-14 bg-slate-800/70 hover:bg-slate-700/70 rounded-lg flex items-center justify-center text-white font-medium transition-colors border border-slate-600 disabled:opacity-50"
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
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Method Selection Step */}
          {currentStep === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  {stepTitles.method}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
                  {stepDescriptions.method}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-slate-600"></div>
                <span className="px-3 text-slate-400 text-xs sm:text-sm">
                  or
                </span>
                <div className="flex-1 h-px bg-slate-600"></div>
              </div>

              {/* Method Selection Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleMethodStep("email")}
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-3 text-neon-green" />
                  Continue with Email
                </button>

                <button
                  onClick={() => handleMethodStep("phone")}
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-3 text-neon-blue" />
                  Continue with Phone Number
                </button>
              </div>
            </motion.div>
          )}

          {/* Email Step */}
          {currentStep === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-neon-green" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  {stepTitles.email}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
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
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                onClick={handleEmailStep}
                disabled={isLoading || !formData.email}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : (
                  "Continue"
                )}
              </button>
            </motion.div>
          )}

          {/* Phone Step */}
          {currentStep === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-neon-blue" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  {stepTitles.phone}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
                  {stepDescriptions.phone}
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneInput(
                      e.target.value,
                      formData.phone,
                    );
                    setFormData((prev) => ({ ...prev, phone: formatted }));
                  }}
                  placeholder="(555) 123-4567"
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <button
                onClick={handlePhoneStep}
                disabled={isLoading || !formData.phone}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : (
                  "Send Code"
                )}
              </button>
            </motion.div>
          )}

          {/* Phone Verification Step */}
          {currentStep === "phone-verify" && (
            <motion.div
              key="phone-verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  {stepTitles["phone-verify"]}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
                  {stepDescriptions["phone-verify"]}
                </p>
              </div>

              <div className="text-center">
                <p className="text-white mb-2 text-sm sm:text-base">
                  Code sent to:
                </p>
                <p className="text-neon-green font-medium text-sm sm:text-base">
                  {formatPhoneDisplay(formData.phone)}
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Verification code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setFormData((prev) => ({ ...prev, otp: value }));
                  }}
                  placeholder="123456"
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base text-center tracking-wider"
                  disabled={isLoading}
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.otp}
                  </p>
                )}
              </div>

              <button
                onClick={handlePhoneVerifyStep}
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center">
                <p className="text-slate-400 text-xs sm:text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={sendOTP}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-neon-green hover:text-emerald-400 text-xs sm:text-sm disabled:opacity-50"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend code"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Profile Step */}
          {currentStep === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-neon-blue" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  {stepTitles.profile}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
                  {stepDescriptions.profile}
                </p>
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
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              <button
                onClick={handleProfileStep}
                disabled={isLoading || !formData.name || !formData.username}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : signupMethod === "phone" ? (
                  "Create Account"
                ) : (
                  "Continue"
                )}
              </button>
            </motion.div>
          )}

          {/* Email Verification Step */}
          {currentStep === "verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  Verify your email
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
                  Enter the 6-digit code we sent to your email
                </p>
              </div>

              <div className="text-center">
                <p className="text-white mb-2 text-sm sm:text-base">
                  Verification code sent to:
                </p>
                <p className="text-neon-green font-medium text-sm sm:text-base break-all">
                  {formData.email}
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Verification code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setFormData((prev) => ({ ...prev, otp: value }));
                  }}
                  placeholder="123456"
                  className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base text-center tracking-wider"
                  disabled={isLoading}
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.otp}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerificationStep}
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center">
                <p className="text-slate-400 text-xs sm:text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-neon-green hover:text-emerald-400 text-xs sm:text-sm disabled:opacity-50"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend code"}
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
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                  {stepTitles.password}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm px-2">
                  {stepDescriptions.password}
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }));
                      setErrorAlert(null); // Clear error when user types
                    }}
                    placeholder="Create a strong password"
                    className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 pr-10 sm:pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                    className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 pr-10 sm:pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Red Error Alert Box */}
              {errorAlert && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <p className="text-red-500 text-sm font-medium">
                      {errorAlert}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handlePasswordStep}
                disabled={
                  isLoading || !formData.password || !formData.confirmPassword
                }
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-sm sm:text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - Only show on method step */}
        {currentStep === "method" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center mt-6 sm:mt-8"
          >
            <p className="text-slate-400 text-xs sm:text-sm px-2">
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
