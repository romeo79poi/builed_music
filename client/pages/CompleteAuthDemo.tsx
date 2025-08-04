import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { authComplete, AuthUser } from "@/lib/auth-complete";
import { useToast } from "@/hooks/use-toast";

const CompleteAuthDemo: React.FC = () => {
  const { toast } = useToast();

  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("register-email");

  // Form states
  const [emailRegisterForm, setEmailRegisterForm] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });

  const [phoneRegisterForm, setPhoneRegisterForm] = useState({
    phone: "",
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [loginForm, setLoginForm] = useState({
    emailOrUsername: "",
    password: "",
    rememberMe: false,
    loginType: "email",
  });

  const [verificationForm, setVerificationForm] = useState({
    email: "",
    phone: "",
    emailCode: "",
    phoneOtp: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    forgotEmail: "",
    resetToken: "",
    newPassword: "",
    currentPassword: "",
    changeNewPassword: "",
  });

  const [availability, setAvailability] = useState<{
    email?: boolean;
    username?: boolean;
    phone?: boolean;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authComplete.isAuthenticated();
      const user = authComplete.getCurrentUser();
      setIsAuthenticated(authenticated);
      setCurrentUser(user);
    };

    checkAuth();

    // Check every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // REGISTRATION HANDLERS
  // ==========================================

  const handleEmailRegister = async () => {
    if (emailRegisterForm.password !== emailRegisterForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authComplete.registerWithEmail({
        email: emailRegisterForm.email,
        username: emailRegisterForm.username,
        name: emailRegisterForm.name,
        password: emailRegisterForm.password,
        bio: emailRegisterForm.bio,
      });

      if (result.success) {
        toast({
          title: "✅ Registration Successful!",
          description: `Welcome ${result.user?.name}! You are now logged in.`,
        });
        setIsAuthenticated(true);
        setCurrentUser(result.user || null);
        setDebugInfo(result);
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async () => {
    if (phoneRegisterForm.password !== phoneRegisterForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await authComplete.registerWithPhone({
        phone: phoneRegisterForm.phone,
        username: phoneRegisterForm.username,
        name: phoneRegisterForm.name,
        password: phoneRegisterForm.password,
      });

      if (result.success) {
        toast({
          title: "✅ Phone Registration Successful!",
          description: `Welcome ${result.user?.name}!`,
        });
        setIsAuthenticated(true);
        setCurrentUser(result.user || null);
        setDebugInfo(result);
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Phone registration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIN HANDLERS
  // ==========================================

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result =
        loginForm.loginType === "email"
          ? await authComplete.loginWithEmail(
              loginForm.emailOrUsername,
              loginForm.password,
              loginForm.rememberMe,
            )
          : await authComplete.loginWithUsername(
              loginForm.emailOrUsername,
              loginForm.password,
              loginForm.rememberMe,
            );

      if (result.success) {
        toast({
          title: "✅ Login Successful!",
          description: `Welcome back ${result.user?.name}!`,
        });
        setIsAuthenticated(true);
        setCurrentUser(result.user || null);
        setDebugInfo(result);
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFICATION HANDLERS
  // ==========================================

  const handleSendEmailVerification = async () => {
    setLoading(true);
    try {
      const result = await authComplete.sendEmailVerification(
        verificationForm.email,
      );

      if (result.success) {
        toast({
          title: "📧 Verification Email Sent!",
          description: result.debugCode
            ? `Debug Code: ${result.debugCode}`
            : "Check your email for the verification code",
        });
        setDebugInfo(result);
      } else {
        toast({
          title: "Failed to Send Email",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      const result = await authComplete.verifyEmailCode(
        verificationForm.email,
        verificationForm.emailCode,
      );

      if (result.success) {
        toast({
          title: "✅ Email Verified!",
          description: "Your email has been successfully verified",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Email verification failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    setLoading(true);
    try {
      const result = await authComplete.sendPhoneOTP(verificationForm.phone);

      if (result.success) {
        toast({
          title: "📱 OTP Sent!",
          description: result.debugOtp
            ? `Debug OTP: ${result.debugOtp}`
            : "Check your phone for the OTP",
        });
        setDebugInfo(result);
      } else {
        toast({
          title: "Failed to Send OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      const result = await authComplete.verifyPhoneOTP(
        verificationForm.phone,
        verificationForm.phoneOtp,
      );

      if (result.success) {
        toast({
          title: "✅ Phone Verified!",
          description: "Your phone number has been successfully verified",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Phone verification failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // AVAILABILITY CHECK
  // ==========================================

  const checkAvailability = async (
    field: "email" | "username" | "phone",
    value: string,
  ) => {
    if (!value) return;

    try {
      const result = await authComplete.checkAvailability({ [field]: value });

      if (result.success) {
        setAvailability((prev) => ({
          ...prev,
          [field]: result[`${field}Available` as keyof typeof result],
        }));
      }
    } catch (error) {
      console.error(`Availability check failed for ${field}:`, error);
    }
  };

  // ==========================================
  // PASSWORD MANAGEMENT
  // ==========================================

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const result = await authComplete.forgotPassword(
        passwordForm.forgotEmail,
      );

      if (result.success) {
        toast({
          title: "🔒 Password Reset Email Sent!",
          description: result.resetToken
            ? `Debug Token: ${result.resetToken}`
            : "Check your email for reset instructions",
        });
        setDebugInfo(result);
      } else {
        toast({
          title: "Failed to Send Reset Email",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password reset request failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const result = await authComplete.resetPassword(
        passwordForm.resetToken,
        passwordForm.newPassword,
      );

      if (result.success) {
        toast({
          title: "✅ Password Reset Successful!",
          description: "Your password has been reset successfully",
        });
      } else {
        toast({
          title: "Password Reset Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password reset failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const result = await authComplete.changePassword(
        passwordForm.currentPassword,
        passwordForm.changeNewPassword,
      );

      if (result.success) {
        toast({
          title: "✅ Password Changed!",
          description: "Your password has been updated successfully",
        });
      } else {
        toast({
          title: "Password Change Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password change failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authComplete.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setDebugInfo(null);
      toast({
        title: "👋 Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // AUTHENTICATED USER VIEW
  // ==========================================

  if (isAuthenticated && currentUser) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {currentUser.name}!
          </h1>
          <p className="text-muted-foreground">
            Complete Authentication System - You are successfully logged in
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">
                  {currentUser.name}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Email</Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {currentUser.email}
                  </p>
                  {currentUser.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Username</Label>
                <p className="text-sm text-muted-foreground">
                  @{currentUser.username}
                </p>
              </div>

              {currentUser.bio && (
                <div>
                  <Label className="text-sm font-medium">Bio</Label>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.bio}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <span>{currentUser.follower_count} followers</span>
                <span>{currentUser.following_count} following</span>
              </div>

              <div>
                <Label className="text-sm font-medium">Member since</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </p>
              </div>

              {currentUser.last_login && (
                <div>
                  <Label className="text-sm font-medium">Last login</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentUser.last_login).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label htmlFor="changeNewPassword">New Password</Label>
                <Input
                  id="changeNewPassword"
                  type="password"
                  value={passwordForm.changeNewPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      changeNewPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={
                  loading ||
                  !passwordForm.currentPassword ||
                  !passwordForm.changeNewPassword
                }
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={handleLogout} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Logout
          </Button>

          <Button
            onClick={() => {
              setIsAuthenticated(false);
              setCurrentUser(null);
            }}
            variant="ghost"
          >
            View Demo (Stay Logged In)
          </Button>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-muted p-3 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ==========================================
  // MAIN DEMO VIEW (NOT AUTHENTICATED)
  // ==========================================

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          Complete Authentication System
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Full-featured authentication with registration, login, verification,
          password management, and more.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="register-email">Email Register</TabsTrigger>
          <TabsTrigger value="register-phone">Phone Register</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Email Registration Tab */}
        <TabsContent value="register-email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Register with Email
              </CardTitle>
              <CardDescription>
                Create a new account using your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailRegisterForm.email}
                    onChange={(e) => {
                      setEmailRegisterForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      checkAvailability("email", e.target.value);
                    }}
                    placeholder="your@email.com"
                  />
                  {availability.email !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {availability.email ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs ${availability.email ? "text-green-500" : "text-red-500"}`}
                      >
                        {availability.email ? "Available" : "Already taken"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={emailRegisterForm.username}
                    onChange={(e) => {
                      setEmailRegisterForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }));
                      checkAvailability("username", e.target.value);
                    }}
                    placeholder="username"
                  />
                  {availability.username !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {availability.username ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs ${availability.username ? "text-green-500" : "text-red-500"}`}
                      >
                        {availability.username ? "Available" : "Already taken"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={emailRegisterForm.name}
                  onChange={(e) =>
                    setEmailRegisterForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={emailRegisterForm.password}
                      onChange={(e) =>
                        setEmailRegisterForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Choose a strong password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={emailRegisterForm.confirmPassword}
                    onChange={(e) =>
                      setEmailRegisterForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={emailRegisterForm.bio}
                  onChange={(e) =>
                    setEmailRegisterForm((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleEmailRegister}
                disabled={
                  loading ||
                  !emailRegisterForm.email ||
                  !emailRegisterForm.username ||
                  !emailRegisterForm.name ||
                  !emailRegisterForm.password
                }
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Register with Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Registration Tab */}
        <TabsContent value="register-phone">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Register with Phone
              </CardTitle>
              <CardDescription>
                Create a new account using your phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneRegisterForm.phone}
                    onChange={(e) => {
                      setPhoneRegisterForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      checkAvailability("phone", e.target.value);
                    }}
                    placeholder="+1 (555) 123-4567"
                  />
                  {availability.phone !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {availability.phone ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs ${availability.phone ? "text-green-500" : "text-red-500"}`}
                      >
                        {availability.phone
                          ? "Available"
                          : "Already registered"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneUsername">Username</Label>
                  <Input
                    id="phoneUsername"
                    value={phoneRegisterForm.username}
                    onChange={(e) =>
                      setPhoneRegisterForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneName">Full Name</Label>
                <Input
                  id="phoneName"
                  value={phoneRegisterForm.name}
                  onChange={(e) =>
                    setPhoneRegisterForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phonePassword">Password</Label>
                  <Input
                    id="phonePassword"
                    type="password"
                    value={phoneRegisterForm.password}
                    onChange={(e) =>
                      setPhoneRegisterForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Choose a strong password"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneConfirmPassword">Confirm Password</Label>
                  <Input
                    id="phoneConfirmPassword"
                    type="password"
                    value={phoneRegisterForm.confirmPassword}
                    onChange={(e) =>
                      setPhoneRegisterForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <Button
                onClick={handlePhoneRegister}
                disabled={
                  loading ||
                  !phoneRegisterForm.phone ||
                  !phoneRegisterForm.username ||
                  !phoneRegisterForm.name ||
                  !phoneRegisterForm.password
                }
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Register with Phone
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Tab */}
        <TabsContent value="login">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Login Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Login
                </CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Login Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={
                        loginForm.loginType === "email" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setLoginForm((prev) => ({
                          ...prev,
                          loginType: "email",
                        }))
                      }
                    >
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={
                        loginForm.loginType === "username"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setLoginForm((prev) => ({
                          ...prev,
                          loginType: "username",
                        }))
                      }
                    >
                      Username
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="emailOrUsername">
                    {loginForm.loginType === "email" ? "Email" : "Username"}
                  </Label>
                  <Input
                    id="emailOrUsername"
                    value={loginForm.emailOrUsername}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        emailOrUsername: e.target.value,
                      }))
                    }
                    placeholder={
                      loginForm.loginType === "email"
                        ? "your@email.com"
                        : "username"
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="loginPassword">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={loginForm.rememberMe}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        rememberMe: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me (30 days)
                  </Label>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={
                    loading || !loginForm.emailOrUsername || !loginForm.password
                  }
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Sign In
                </Button>
              </CardContent>
            </Card>

            {/* Password Reset */}
            <Card>
              <CardHeader>
                <CardTitle>Forgot Password?</CardTitle>
                <CardDescription>Reset your password via email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    value={passwordForm.forgotEmail}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        forgotEmail: e.target.value,
                      }))
                    }
                    placeholder="your@email.com"
                  />
                </div>

                <Button
                  onClick={handleForgotPassword}
                  disabled={loading || !passwordForm.forgotEmail}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send Reset Email
                </Button>

                <Separator />

                <div>
                  <Label htmlFor="resetToken">Reset Token (from email)</Label>
                  <Input
                    id="resetToken"
                    value={passwordForm.resetToken}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        resetToken: e.target.value,
                      }))
                    }
                    placeholder="Paste token from email"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={
                    loading ||
                    !passwordForm.resetToken ||
                    !passwordForm.newPassword
                  }
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Verification
                </CardTitle>
                <CardDescription>Verify your email address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="verifyEmail">Email Address</Label>
                  <Input
                    id="verifyEmail"
                    type="email"
                    value={verificationForm.email}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="your@email.com"
                  />
                </div>

                <Button
                  onClick={handleSendEmailVerification}
                  disabled={loading || !verificationForm.email}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send Verification Code
                </Button>

                <Separator />

                <div>
                  <Label htmlFor="emailCode">Verification Code</Label>
                  <Input
                    id="emailCode"
                    value={verificationForm.emailCode}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({
                        ...prev,
                        emailCode: e.target.value,
                      }))
                    }
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleVerifyEmail}
                  disabled={loading || !verificationForm.emailCode}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verify Email
                </Button>
              </CardContent>
            </Card>

            {/* Phone Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Verification
                </CardTitle>
                <CardDescription>Verify your phone number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="verifyPhone">Phone Number</Label>
                  <Input
                    id="verifyPhone"
                    type="tel"
                    value={verificationForm.phone}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <Button
                  onClick={handleSendPhoneOTP}
                  disabled={loading || !verificationForm.phone}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send OTP
                </Button>

                <Separator />

                <div>
                  <Label htmlFor="phoneOtp">OTP Code</Label>
                  <Input
                    id="phoneOtp"
                    value={verificationForm.phoneOtp}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({
                        ...prev,
                        phoneOtp: e.target.value,
                      }))
                    }
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleVerifyPhone}
                  disabled={loading || !verificationForm.phoneOtp}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verify Phone
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Complete Auth System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email Registration & Login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Phone Registration & Login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">JWT Access & Refresh Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Phone OTP Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Password Reset via Email</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Password Change for Users</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Username/Email Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Rate Limiting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Input Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Security Headers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Admin Routes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            All available authentication endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <strong>POST</strong> /api/v3/auth/register/email
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/register/phone
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/login/email
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/login/username
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/verification/email/send
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/verification/email/verify
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/verification/phone/send
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/verification/phone/verify
            </div>
            <div>
              <strong>GET</strong> /api/v3/auth/check-availability
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/token/refresh
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/logout
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/password/forgot
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/password/reset
            </div>
            <div>
              <strong>POST</strong> /api/v3/auth/password/change (protected)
            </div>
            <div>
              <strong>GET</strong> /api/v3/auth/profile (protected)
            </div>
            <div>
              <strong>GET</strong> /api/v3/auth/admin/* (admin only)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      {debugInfo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto bg-muted p-3 rounded max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompleteAuthDemo;
