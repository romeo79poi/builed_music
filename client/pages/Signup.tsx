import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";

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

interface FieldValidation {
  isValid: boolean;
  message: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Real-time validation
  const validateEmail = (email: string): FieldValidation => {
    if (!email) return { isValid: false, message: "Email is required" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Invalid email format" };
    }
    return { isValid: true, message: "Valid email format" };
  };

  const validateUsername = (username: string): FieldValidation => {
    if (!username) return { isValid: false, message: "Username is required" };
    if (username.length < 3) {
      return {
        isValid: false,
        message: "Username must be at least 3 characters",
      };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        isValid: false,
        message: "Username can only contain letters, numbers, and underscores",
      };
    }
    return { isValid: true, message: "Valid username format" };
  };

  const validateName = (name: string): FieldValidation => {
    if (!name) return { isValid: false, message: "Name is required" };
    if (name.length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters" };
    }
    return { isValid: true, message: "Valid name" };
  };

  const validatePassword = (password: string): FieldValidation => {
    if (!password) return { isValid: false, message: "Password is required" };
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters",
      };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }
    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one number",
      };
    }
    return { isValid: true, message: "Strong password" };
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ): FieldValidation => {
    if (!confirmPassword)
      return { isValid: false, message: "Please confirm your password" };
    if (confirmPassword !== password) {
      return { isValid: false, message: "Passwords do not match" };
    }
    return { isValid: true, message: "Passwords match" };
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
      }
    } catch (error) {
      console.error("Availability check failed:", error);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // Real-time validation
    let validation: FieldValidation;
    switch (field) {
      case "email":
        validation = validateEmail(value);
        if (validation.isValid) {
          checkAvailability("email", value);
        }
        break;
      case "username":
        validation = validateUsername(value);
        if (validation.isValid) {
          checkAvailability("username", value);
        }
        break;
      case "name":
        validation = validateName(value);
        break;
      case "password":
        validation = validatePassword(value);
        // Also re-validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmValidation = validateConfirmPassword(
            formData.confirmPassword,
            value,
          );
          setErrors((prev) => ({
            ...prev,
            confirmPassword: confirmValidation.isValid
              ? undefined
              : confirmValidation.message,
          }));
        }
        break;
      case "confirmPassword":
        validation = validateConfirmPassword(value, formData.password);
        break;
      default:
        return;
    }

    // Set error if validation failed
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, [field]: validation.message }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const emailValidation = validateEmail(formData.email);
    const usernameValidation = validateUsername(formData.username);
    const nameValidation = validateName(formData.name);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validateConfirmPassword(
      formData.confirmPassword,
      formData.password,
    );

    const newErrors: ValidationErrors = {};
    if (!emailValidation.isValid) newErrors.email = emailValidation.message;
    if (!usernameValidation.isValid)
      newErrors.username = usernameValidation.message;
    if (!nameValidation.isValid) newErrors.name = nameValidation.message;
    if (!passwordValidation.isValid)
      newErrors.password = passwordValidation.message;
    if (!confirmPasswordValidation.isValid)
      newErrors.confirmPassword = confirmPasswordValidation.message;

    // Check availability
    if (availability.email === false)
      newErrors.email = "Email is already registered";
    if (availability.username === false)
      newErrors.username = "Username is already taken";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

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
          description: `Welcome to Music Catch, ${data.user.name || data.user.username}!`,
        });

        // Log the backend data for demonstration
        console.log("✅ User created in backend:", data.user);
        console.log("📊 Frontend data matched to backend:", {
          frontend: formData,
          backend: data.user,
          matched: true,
        });

        // Navigate to login or home
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

  // Get field validation status
  const getFieldStatus = (field: keyof FormData) => {
    const hasError = !!errors[field];
    const hasValue = !!formData[field];

    if (field === "email" || field === "username") {
      const isAvailable = availability[field];
      if (hasValue && !hasError && isAvailable !== undefined) {
        return isAvailable ? "success" : "error";
      }
    }

    if (hasValue && !hasError) return "success";
    if (hasError) return "error";
    return "default";
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
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join Music Catch today</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Email Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="your@email.com"
                className={`w-full h-14 bg-slate-800/50 border rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  getFieldStatus("email") === "success"
                    ? "border-neon-green focus:border-neon-green"
                    : getFieldStatus("email") === "error"
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-600 focus:border-neon-green"
                }`}
                disabled={isLoading}
              />
              {formData.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldStatus("email") === "success" ? (
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                  ) : getFieldStatus("email") === "error" ? (
                    <X className="w-5 h-5 text-red-400" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                placeholder="your_username"
                className={`w-full h-14 bg-slate-800/50 border rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  getFieldStatus("username") === "success"
                    ? "border-neon-green focus:border-neon-green"
                    : getFieldStatus("username") === "error"
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-600 focus:border-neon-green"
                }`}
                disabled={isLoading}
              />
              {formData.username && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldStatus("username") === "success" ? (
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                  ) : getFieldStatus("username") === "error" ? (
                    <X className="w-5 h-5 text-red-400" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.username && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Your full name"
                className={`w-full h-14 bg-slate-800/50 border rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  getFieldStatus("name") === "success"
                    ? "border-neon-green focus:border-neon-green"
                    : getFieldStatus("name") === "error"
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-600 focus:border-neon-green"
                }`}
                disabled={isLoading}
              />
              {formData.name && !errors.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder="Create a strong password"
                className={`w-full h-14 bg-slate-800/50 border rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  getFieldStatus("password") === "success"
                    ? "border-neon-green focus:border-neon-green"
                    : getFieldStatus("password") === "error"
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-600 focus:border-neon-green"
                }`}
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm your password"
                className={`w-full h-14 bg-slate-800/50 border rounded-lg px-4 pr-12 text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  getFieldStatus("confirmPassword") === "success"
                    ? "border-neon-green focus:border-neon-green"
                    : getFieldStatus("confirmPassword") === "error"
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-600 focus:border-neon-green"
                }`}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-bold text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Create Account"
            )}
          </button>
        </motion.form>

        {/* Footer */}
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
      </div>
    </div>
  );
}
