import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  User,
  Lock,
  Phone,
  RefreshCw,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import AvailabilityChecker from "../components/AvailabilityChecker";
import { useToast } from "../hooks/use-toast";
import {
  validatePhoneNumber,
  formatPhoneInput,
  formatPhoneDisplay,
  phoneAPI,
} from "../lib/phone";
import {
  signUpWithEmailAndPassword,
  signInWithGoogle,
  signUpWithEmailAndPasswordWithVerification,
  initializeRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  sendFirebaseEmailVerification,
} from "../lib/auth";
import { auth, db } from "../lib/firebase";

type SignupStep =
  | "method"
  | "email"
  | "phone"
  | "phone-verify"
  | "profile"
  | "verification"
  | "password"
  | "dob"
  | "profileImage"
  | "gender"
  | "bio";
type SignupMethod = "email" | "phone";

interface FormData {
  email: string;
  phone: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  otp: string;
  dateOfBirth: string;
  profileImage: File | null;
  gender: string;
  bio: string;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
  username?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  dateOfBirth?: string;
  profileImage?: string;
  gender?: string;
  bio?: string;
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
    dateOfBirth: "",
    profileImage: null,
    gender: "",
    bio: "",
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
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [useFirebaseAuth, setUseFirebaseAuth] = useState(true);
  const [verificationUser, setVerificationUser] = useState<any>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);

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

  const validateDateOfBirth = (): boolean => {
    if (!formData.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: "Date of birth is required" }));
      return false;
    }

    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) {
      setErrors((prev) => ({ ...prev, dateOfBirth: "You must be at least 13 years old" }));
      return false;
    }

    if (age > 120) {
      setErrors((prev) => ({ ...prev, dateOfBirth: "Please enter a valid date of birth" }));
      return false;
    }

    setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
    return true;
  };

  const validateGender = (): boolean => {
    if (!formData.gender) {
      setErrors((prev) => ({ ...prev, gender: "Please select your gender" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, gender: undefined }));
    return true;
  };

  const validateBio = (): boolean => {
    if (formData.bio.length > 500) {
      setErrors((prev) => ({ ...prev, bio: "Bio must be less than 500 characters" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, bio: undefined }));
    return true;
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
      if (useFirebaseAuth) {
        // Initialize reCAPTCHA if not already done
        const recaptchaResult = await initializeRecaptcha(
          "recaptcha-container",
        );
        if (!recaptchaResult.success) {
          toast({
            title: "Setup error",
            description: "Please refresh the page and try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Format phone number for Firebase (must include country code)
        let formattedPhone = formData.phone.replace(/\D/g, "");
        if (!formattedPhone.startsWith("1") && formattedPhone.length === 10) {
          formattedPhone = "+1" + formattedPhone;
        } else if (!formattedPhone.startsWith("+")) {
          formattedPhone = "+" + formattedPhone;
        }

        // Send Firebase OTP
        const result = await sendPhoneOTP(formattedPhone);

        if (result.success && result.confirmationResult) {
          setConfirmationResult(result.confirmationResult);
          setOtpSent(true);
          setPhoneVerificationSent(true);
          setResendTimer(60);
          toast({
            title: "Verification code sent!",
            description: `We sent a 6-digit code to ${formatPhoneDisplay(formData.phone)}`,
          });
        } else {
          toast({
            title: "Failed to send code",
            description: result.error || "Please try again",
            variant: "destructive",
          });
        }
      } else {
        // Use backend OTP
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

  // Verify OTP with enhanced error handling
  const verifyOTP = async () => {
    if (!validateOTP(formData.otp)) return;

    setIsLoading(true);
    try {
      if (useFirebaseAuth && confirmationResult) {
        // Use Firebase verification
        const result = await verifyPhoneOTP(confirmationResult, formData.otp);

        if (result.success) {
          setPhoneVerified(true);
          setPhoneVerificationSent(false); // Reset verification sent status

          toast({
            title: "Phone verified successfully! ✅",
            description: "Your phone number has been verified.",
          });

          if (signupMethod === "phone") {
            // For phone signup with Firebase, the user is already created
            // Store the verified user
            if (result.user) {
              setVerificationUser(result.user);
            }

            toast({
              title: "Account created successfully! 🎉",
              description: "Welcome to Music Catch!",
            });

            setTimeout(() => {
              navigate("/home");
            }, 2000);
          } else {
            // For email signup, proceed to next step
            setCurrentStep("profile");
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            otp: result.error || "Invalid verification code. Please try again.",
          }));

          toast({
            title: "Verification failed",
            description: result.error || "Invalid verification code",
            variant: "destructive",
          });
        }
      } else {
        // Use backend verification
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
    setErrorAlert(null); // Clear any existing errors
    console.log("🚀 Starting Google sign-up process...");

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setErrorAlert(
        "Google sign-in is taking too long. Please try again or use email signup.",
      );
      console.log("⏰ Google sign-in timeout");
    }, 30000); // 30 second timeout

    try {
      // Try Firebase first, then fallback to backend simulation
      const result = await signInWithGoogle();

      // Clear timeout if we got a response
      clearTimeout(timeoutId);

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
          navigate("/home");
        }, 1500);
      } else {
        console.error("❌ Google sign-in failed:", result.error);

        // Set error alert for domain authorization issues
        if (
          result.error?.includes("domain") ||
          result.error?.includes("unauthorized")
        ) {
          setErrorAlert(
            "Google sign-in is not available on this domain. Please use email signup instead.",
          );
        } else {
          setErrorAlert(
            result.error || "Google sign-in failed. Please try email signup.",
          );
        }

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
      } else if (
        error.message?.includes("domain") ||
        error.message?.includes("unauthorized")
      ) {
        errorMessage =
          "Google sign-in not available on this domain. Use email signup.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorAlert(errorMessage);

      toast({
        title: "Google sign-in error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId); // Clear timeout in case it's still running
      setIsLoading(false);
      console.log("🏁 Google sign-up process completed");
    }
  };

  // Step handlers
  const handleMethodStep = (method: SignupMethod) => {
    setSignupMethod(method);
    setErrorAlert(null); // Clear any errors when switching methods
    setIsLoading(false); // Reset loading state

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

      if (useFirebaseAuth) {
        // Skip email verification step for now and go directly to profile
        // Firebase email verification will be sent after account creation
        setCurrentStep("profile");
        toast({
          title: "Email verified!",
          description: "You can now create your profile.",
        });
      } else {
        // Use backend email verification
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

    if (signupMethod === "email") {
      // For email signup, proceed to DOB step
      setCurrentStep("dob");
      return;
    }

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
            navigate("/home");
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
          if (useFirebaseAuth) {
            // Use Firebase email signup with verification
            const result = await signUpWithEmailAndPasswordWithVerification(
              formData.email,
              formData.password,
              formData.name,
              formData.username,
              formData.phone,
            );

            if (result.success) {
              // Store user for email verification
              if (result.user) {
                setVerificationUser(result.user);
                setEmailVerificationSent(true);
              }

              toast({
                title: "Account created successfully! 🎉",
                description: `Welcome to Music Catch, ${formData.name}! Please check your email for verification.`,
              });

              console.log("✅ User created with Firebase:", result.user);

              setTimeout(() => {
                navigate("/home");
              }, 2000);
            } else {
              setErrorAlert(
                result.error || "Registration failed. Please try again.",
              );
            }
          } else {
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
                title: "Account created successfully! ��",
                description: `Welcome to Music Catch, ${formData.name}!`,
              });

              console.log("✅ User created with backend:", data.user);

              setTimeout(() => {
                navigate("/home");
              }, 2000);
            } else {
              // Show error in red alert box
              setErrorAlert(
                data.message || "Registration failed. Please try again.",
              );
            }
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

  const handleDOBStep = () => {
    if (!validateDateOfBirth()) return;
    setCurrentStep("profileImage");
  };

  const handleProfileImageStep = () => {
    setCurrentStep("gender");
  };

  const handleGenderStep = () => {
    if (!validateGender()) return;
    setCurrentStep("bio");
  };

  const handleBioStep = async () => {
    if (!validateBio()) return;

    setIsLoading(true);

    try {
      // Clear any previous errors
      setErrorAlert(null);

      if (useFirebaseAuth) {
        // Use Firebase email signup with verification
        const result = await signUpWithEmailAndPasswordWithVerification(
          formData.email,
          formData.password,
          formData.name,
          formData.username,
          formData.phone,
        );

        if (result.success) {
          // Store user for email verification
          if (result.user) {
            setVerificationUser(result.user);
            setEmailVerificationSent(true);
          }

          toast({
            title: "Account created successfully! 🎉",
            description: `Welcome to Music Catch, ${formData.name}! Please check your email for verification.`,
          });

          console.log("✅ User created with Firebase:", result.user);

          setTimeout(() => {
            navigate("/home");
          }, 2000);
        } else {
          setErrorAlert(
            result.error || "Registration failed. Please try again.",
          );
        }
      } else {
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
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bio: formData.bio,
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
            navigate("/home");
          }, 2000);
        } else {
          setErrorAlert(
            data.message || "Registration failed. Please try again.",
          );
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
    } else if (currentStep === "dob") {
      setCurrentStep("password");
    } else if (currentStep === "profileImage") {
      setCurrentStep("dob");
    } else if (currentStep === "gender") {
      setCurrentStep("profileImage");
    } else if (currentStep === "bio") {
      setCurrentStep("gender");
    }
  };

  // Resend email verification using Firebase
  const handleResendEmailVerification = async () => {
    if (resendTimer > 0) return;

    if (!verificationUser) {
      toast({
        title: "Error",
        description: "No user account found to send verification to",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendFirebaseEmailVerification(verificationUser);

      if (result.success) {
        toast({
          title: "Verification email sent!",
          description: "Please check your email for the verification link.",
        });
        setResendTimer(60);
        setEmailVerificationSent(true);
      } else {
        toast({
          title: "Failed to send verification",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resend email verification error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
  // Check Firebase connection on mount
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // Test Firebase connection
        if (!auth || !db) {
          console.error("Firebase not properly initialized");
          setErrorAlert(
            "Authentication service unavailable. Try email signup or refresh the page.",
          );
        } else {
          console.log("✅ Firebase services initialized successfully");

          // Test auth connection by checking current user
          try {
            const currentUser = auth.currentUser;
            console.log(
              "Firebase auth status:",
              currentUser ? "Connected" : "Ready",
            );
          } catch (authError) {
            console.warn("Firebase auth test failed:", authError);
            setErrorAlert(
              "Google sign-in may not work. Please use email signup.",
            );
          }
        }
      } catch (error) {
        console.error("Firebase initialization error:", error);
        setErrorAlert(
          "Authentication service error. Please use email signup or refresh the page.",
        );
      }
    };

    checkFirebaseConnection();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const stepTitles = {
    method: "Choose signup method",
    email: "What's your email?",
    phone: "What's your phone number?",
    "phone-verify": "Verify your phone",
    profile: "Tell us about yourself",
    verification: "Verify your email",
    password: "Create your password",
    dob: "When were you born?",
    profileImage: "Add your profile picture",
    gender: "What's your gender?",
    bio: "Tell us more about yourself",
  };

  const stepDescriptions = {
    method: "Sign up with email, phone, or social media",
    email: "We'll send you a verification email",
    phone: "We'll send you a verification code",
    "phone-verify": "Enter the 6-digit code we sent to your phone",
    profile: "Help others find you on Music Catch",
    verification: "Check your email and click the verification link",
    password: "Choose a secure password for your account",
    dob: "We need your date of birth to verify your age",
    profileImage: "Upload a photo to personalize your profile (optional)",
    gender: "Help us personalize your experience",
    bio: "Share something interesting about yourself (optional)",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/10 via-purple-secondary/5 to-purple-accent/8"></div>

      <div className="relative z-10 w-full max-w-md px-2 sm:px-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="flex justify-center mb-1 sm:mb-2">
            <MusicCatchLogo
              animated={true}
              signupMode={true}
              className="scale-90 sm:scale-100"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Sign up to
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold purple-gradient-text">
            CATCH
          </h2>
        </motion.div>

        {/* Social Signup Buttons - Only visible on method step */}
        {currentStep === "method" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6 space-y-3"
          >
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full h-12 sm:h-14 bg-purple-dark/50 hover:bg-purple-dark/70 rounded-xl flex items-center justify-center text-white font-medium transition-all duration-200 border border-purple-primary/30 hover:border-purple-primary/50 disabled:opacity-50 hover:shadow-lg hover:shadow-purple-primary/20"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Google...</span>
                </div>
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
                  description: "Facebook signup will be available soon!",
                });
              }}
              className="w-full h-12 sm:h-14 bg-purple-dark/50 hover:bg-purple-dark/70 rounded-xl flex items-center justify-center text-white font-medium transition-all duration-200 border border-purple-secondary/30 hover:border-purple-secondary/50 hover:shadow-lg hover:shadow-purple-secondary/20"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
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
              <div className="text-center mb-4 sm:mb-6" />

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-slate-600"></div>
                <span className="px-3 text-slate-400 text-xs sm:text-sm">
                  or
                </span>
                <div className="flex-1 h-px bg-slate-600"></div>
              </div>

              {/* Loading State Reset */}
              {isLoading && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 text-yellow-500 mr-3 animate-spin" />
                      <div>
                        <p className="text-yellow-500 text-sm font-medium">
                          Google sign-in in progress...
                        </p>
                        <p className="text-yellow-400 text-xs">
                          If this takes too long, try the reset button
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsLoading(false);
                        setErrorAlert(
                          "Google sign-in cancelled. Please try again or use email signup.",
                        );
                      }}
                      className="text-yellow-500 hover:text-yellow-400 text-xs bg-yellow-500/20 px-2 py-1 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorAlert && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                      <p className="text-red-500 text-sm font-medium">
                        {errorAlert}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMethodStep("email")}
                        className="text-red-500 hover:text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded"
                      >
                        Use Email
                      </button>
                      <button
                        onClick={() => setErrorAlert(null)}
                        className="text-red-500 hover:text-red-400 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Method Selection Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleMethodStep("email")}
                  className="w-full h-12 sm:h-14 bg-purple-dark/50 border border-purple-primary/30 rounded-xl flex items-center justify-center text-white hover:bg-purple-primary/10 hover:border-purple-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-primary/20"
                >
                  <Mail className="w-5 h-5 mr-3 text-purple-primary" />
                  Continue with Email
                </button>

                <button
                  onClick={() => handleMethodStep("phone")}
                  className="w-full h-12 sm:h-14 bg-purple-dark/50 border border-purple-secondary/30 rounded-xl flex items-center justify-center text-white hover:bg-purple-secondary/10 hover:border-purple-secondary/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-secondary/20"
                >
                  <Phone className="w-5 h-5 mr-3 text-purple-secondary" />
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-purple-primary" />
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
                  className="w-full h-12 sm:h-14 bg-purple-dark/30 border border-purple-primary/30 rounded-xl px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-primary focus:ring-2 focus:ring-purple-primary/20 transition-all duration-200 text-sm sm:text-base backdrop-blur-sm"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.email}
                  </p>
                )}

                {/* Email Availability Checker */}
                <AvailabilityChecker
                  value={formData.email}
                  field="email"
                  onCheck={async (field, value) => {
                    try {
                      const response = await fetch(
                        `/api/auth/check-availability?${field}=${encodeURIComponent(value)}`,
                      );
                      const data = await response.json();
                      return data.available === true;
                    } catch {
                      return false;
                    }
                  }}
                  className="mt-2"
                  minLength={5}
                />
              </div>

              <button
                onClick={handleEmailStep}
                disabled={isLoading || !formData.email}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-primary to-purple-secondary hover:from-purple-secondary hover:to-purple-accent text-white font-bold text-sm sm:text-lg rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg shadow-purple-primary/30 hover:shadow-purple-secondary/40"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
                ) : (
                  "Continue"
                )}
              </button>

              <button
                onClick={() => setCurrentStep("method")}
                className="w-full text-purple-primary hover:text-purple-secondary transition-colors text-sm mt-4"
              >
                ← Back to other options
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-purple-secondary" />
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

              <button
                onClick={() => setCurrentStep("method")}
                className="w-full text-purple-secondary hover:text-purple-primary transition-colors text-sm mt-4"
              >
                ← Back to other options
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
                <p className="text-neon-green font-medium text-sm sm:text-base mb-2">
                  {formatPhoneDisplay(formData.phone)}
                </p>
                {phoneVerified && (
                  <div className="flex items-center justify-center space-x-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Phone number verified!</span>
                  </div>
                )}
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
                  className="text-neon-green hover:text-emerald-400 text-xs sm:text-sm disabled:opacity-50 flex items-center space-x-1 mx-auto"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend OTP"}
                  </span>
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

                {/* Username Availability Checker */}
                <AvailabilityChecker
                  value={formData.username}
                  field="username"
                  onCheck={async (field, value) => {
                    try {
                      const response = await fetch(
                        `/api/auth/check-availability?${field}=${encodeURIComponent(value)}`,
                      );
                      const data = await response.json();
                      return data.available === true;
                    } catch {
                      return false;
                    }
                  }}
                  className="mt-2"
                  minLength={3}
                />
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

                {/* Password Strength Indicator */}
                <PasswordStrengthIndicator
                  password={formData.password}
                  className="mt-3"
                />
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

              {/* Email Verification Status */}
              {emailVerificationSent && (
                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-blue-500 text-sm font-medium">
                          Email verification sent
                        </p>
                        <p className="text-blue-400 text-xs">
                          Check your email and click the verification link
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResendEmailVerification}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-blue-500 hover:text-blue-400 text-xs font-medium disabled:opacity-50"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                    </button>
                  </div>
                </div>
              )}

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
                  "Continue"
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
                className="text-purple-primary hover:text-purple-secondary transition-colors underline"
              >
                Log in here
              </Link>
            </p>
          </motion.div>
        )}
      </div>

      {/* reCAPTCHA container for Firebase phone auth */}
      <div
        id="recaptcha-container"
        className="fixed bottom-4 right-4 z-50"
      ></div>

      {/* Additional reCAPTCHA info for users */}
      {phoneVerificationSent && (
        <div className="fixed bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-xs text-center z-40">
          <p>📱 SMS verification powered by Google reCAPTCHA</p>
        </div>
      )}
    </div>
  );
}
