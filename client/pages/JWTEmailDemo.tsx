import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Mail,
  Shield,
  Link as LinkIcon,
  Code,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JWTEmailDemo: React.FC = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: "",
    name: "",
  });

  const [verificationForm, setVerificationForm] = useState({
    token: "",
    email: "",
    code: "",
  });

  const [passwordResetForm, setPasswordResetForm] = useState({
    email: "",
    token: "",
    newPassword: "",
  });

  const [registrationForm, setRegistrationForm] = useState({
    email: "",
    username: "",
    name: "",
    password: "",
    bio: "",
  });

  const [results, setResults] = useState<any>(null);

  // ==========================================
  // EMAIL VERIFICATION FUNCTIONS
  // ==========================================

  const sendVerificationEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v4/auth/verification/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "📧 Verification Email Sent!",
          description: data.verificationLink
            ? "Email sent with secure JWT link"
            : "Verification code generated",
        });
      } else {
        toast({
          title: "Send Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyWithToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/v4/auth/verification/email/verify-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: verificationForm.token }),
        },
      );

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "✅ Email Verified with JWT!",
          description: "Email verified using secure token",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyWithCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/v4/auth/verification/email/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: verificationForm.email,
            code: verificationForm.code,
          }),
        },
      );

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "✅ Email Verified with Code!",
          description: "Email verified using backup code",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PASSWORD RESET FUNCTIONS
  // ==========================================

  const sendPasswordReset = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v4/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: passwordResetForm.email }),
      });

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "🔒 Password Reset Email Sent!",
          description: "Check your email for reset link",
        });
      } else {
        toast({
          title: "Send Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v4/auth/password/reset-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: passwordResetForm.token,
          newPassword: passwordResetForm.newPassword,
        }),
      });

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "✅ Password Reset Successful!",
          description: "Password updated with JWT token",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTRATION FUNCTION
  // ==========================================

  const registerWithEmailVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v4/auth/register/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationForm),
      });

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "🎉 Registration Successful!",
          description: "Account created with email verification",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">JWT Email Verification Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test Nodemailer + JWT token-based email verification and password
          reset system
        </p>
        <div className="mt-4 flex gap-2 justify-center flex-wrap">
          <Badge variant="outline">Nodemailer Integration</Badge>
          <Badge variant="outline">JWT Secure Links</Badge>
          <Badge variant="outline">Backup Code System</Badge>
          <Badge variant="outline">Password Reset</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Side - Demo Forms */}
        <div>
          <Tabs defaultValue="email-verification" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email-verification">Email Verify</TabsTrigger>
              <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
              <TabsTrigger value="registration">Registration</TabsTrigger>
            </TabsList>

            {/* Email Verification Tab */}
            <TabsContent value="email-verification">
              <div className="space-y-6">
                {/* Send Verification Email */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Send Verification Email
                    </CardTitle>
                    <CardDescription>
                      Send email with JWT token link + backup code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={emailForm.email}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Name (Optional)</Label>
                      <Input
                        id="name"
                        value={emailForm.name}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <Button
                      onClick={sendVerificationEmail}
                      disabled={loading || !emailForm.email}
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Send Verification Email
                    </Button>
                  </CardContent>
                </Card>

                {/* Verify with Token */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Verify with JWT Token
                    </CardTitle>
                    <CardDescription>
                      Verify email using JWT token from link
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="token">JWT Verification Token</Label>
                      <Input
                        id="token"
                        value={verificationForm.token}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            token: e.target.value,
                          }))
                        }
                        placeholder="Paste JWT token here"
                      />
                    </div>

                    <Button
                      onClick={verifyWithToken}
                      disabled={loading || !verificationForm.token}
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Verify with JWT Token
                    </Button>
                  </CardContent>
                </Card>

                {/* Verify with Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Verify with Backup Code
                    </CardTitle>
                    <CardDescription>
                      Verify email using 6-digit backup code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="verifyEmail">Email Address</Label>
                      <Input
                        id="verifyEmail"
                        value={verificationForm.email}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="code">Verification Code</Label>
                      <Input
                        id="code"
                        value={verificationForm.code}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            code: e.target.value,
                          }))
                        }
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>

                    <Button
                      onClick={verifyWithCode}
                      disabled={
                        loading ||
                        !verificationForm.email ||
                        !verificationForm.code
                      }
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Code className="w-4 h-4 mr-2" />
                      )}
                      Verify with Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Password Reset Tab */}
            <TabsContent value="password-reset">
              <div className="space-y-6">
                {/* Send Password Reset */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Send Password Reset Email
                    </CardTitle>
                    <CardDescription>
                      Send password reset email with JWT token link
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="resetEmail">Email Address</Label>
                      <Input
                        id="resetEmail"
                        value={passwordResetForm.email}
                        onChange={(e) =>
                          setPasswordResetForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>

                    <Button
                      onClick={sendPasswordReset}
                      disabled={loading || !passwordResetForm.email}
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      Send Reset Email
                    </Button>
                  </CardContent>
                </Card>

                {/* Reset Password */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Reset Password with JWT
                    </CardTitle>
                    <CardDescription>
                      Reset password using JWT token from email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="resetToken">JWT Reset Token</Label>
                      <Input
                        id="resetToken"
                        value={passwordResetForm.token}
                        onChange={(e) =>
                          setPasswordResetForm((prev) => ({
                            ...prev,
                            token: e.target.value,
                          }))
                        }
                        placeholder="Paste JWT reset token here"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordResetForm.newPassword}
                        onChange={(e) =>
                          setPasswordResetForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                      />
                    </div>

                    <Button
                      onClick={resetPassword}
                      disabled={
                        loading ||
                        !passwordResetForm.token ||
                        !passwordResetForm.newPassword
                      }
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      Reset Password
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="registration">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Register with Email Verification
                  </CardTitle>
                  <CardDescription>
                    Register user and automatically send verification email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="regEmail">Email</Label>
                      <Input
                        id="regEmail"
                        value={registrationForm.email}
                        onChange={(e) =>
                          setRegistrationForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="regUsername">Username</Label>
                      <Input
                        id="regUsername"
                        value={registrationForm.username}
                        onChange={(e) =>
                          setRegistrationForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        placeholder="johndoe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="regName">Full Name</Label>
                    <Input
                      id="regName"
                      value={registrationForm.name}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      value={registrationForm.password}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Choose a strong password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regBio">Bio (Optional)</Label>
                    <Input
                      id="regBio"
                      value={registrationForm.bio}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button
                    onClick={registerWithEmailVerification}
                    disabled={
                      loading ||
                      !registrationForm.email ||
                      !registrationForm.username ||
                      !registrationForm.name ||
                      !registrationForm.password
                    }
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Register with Email Verification
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Results */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                API Response
              </CardTitle>
              <CardDescription>Latest API response data</CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-4">
                  {/* Success/Error Status */}
                  <div className="flex items-center gap-2">
                    {results.success ? (
                      <Badge className="text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  {/* Message */}
                  <Alert>
                    <AlertDescription>{results.message}</AlertDescription>
                  </Alert>

                  {/* Verification Link (if available) */}
                  {results.verificationLink && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Verification Link:
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(results.verificationLink)
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLink(results.verificationLink)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs bg-muted p-2 rounded break-all">
                        {results.verificationLink}
                      </div>
                    </div>
                  )}

                  {/* Reset Link (if available) */}
                  {results.resetLink && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Reset Link:</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(results.resetLink)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLink(results.resetLink)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs bg-muted p-2 rounded break-all">
                        {results.resetLink}
                      </div>
                    </div>
                  )}

                  {/* Debug Code (if available) */}
                  {results.debugCode && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Debug Code:</Label>
                      <div className="text-lg font-mono bg-muted p-3 rounded text-center">
                        {results.debugCode}
                      </div>
                    </div>
                  )}

                  {/* JWT Token (if available) */}
                  {results.verificationToken && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">JWT Token:</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(results.verificationToken)
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs bg-muted p-2 rounded break-all">
                        {results.verificationToken}
                      </div>
                    </div>
                  )}

                  {/* Full Response */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Full Response
                    </summary>
                    <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-64">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No API response yet</p>
                  <p className="text-xs">
                    Make an API call to see results here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>JWT Email Verification Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Nodemailer Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">JWT Secure Links</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Backup Code System</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Beautiful HTML Emails</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Password Reset Links</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Auto Registration + Verification</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Endpoints (v4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <strong>POST</strong> /api/v4/auth/verification/email/send
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/verification/email/verify-token
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/verification/email/verify-code
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/verification/email/resend
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/password/forgot
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/password/reset-with-token
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/register/email-verification
            </div>
            <div>
              <strong>POST</strong> /api/v4/auth/login/enhanced
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JWTEmailDemo;
