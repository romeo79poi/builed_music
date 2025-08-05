import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Loader2, CheckCircle, XCircle, User, Zap } from "lucide-react";
import { firebaseHelpers, isFirebaseConfigured } from "../lib/firebase-simple";

export default function FirebaseDemo() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [connectionTest, setConnectionTest] = useState<boolean | null>(null);

  // Test Firebase connection on mount
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      const isAvailable = await firebaseHelpers.testConnection();
      setConnectionTest(isAvailable);
      console.log(
        "🔥 Firebase connection test:",
        isAvailable ? "SUCCESS" : "FAILED",
      );
    } catch (error) {
      setConnectionTest(false);
      console.error("❌ Firebase connection test failed:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔥 Starting Google sign-in...");
      const result = await firebaseHelpers.googleSignIn();

      if (result.success) {
        setUser(result.user);
        setSuccess(`Welcome ${result.user.displayName || result.user.email}!`);
        console.log("✅ Google sign-in successful:", result.user);
      } else {
        setError(result.error || "Google sign-in failed");
        console.error("❌ Google sign-in failed:", result.error);
      }
    } catch (error: any) {
      setError(error.message || "Google sign-in error");
      console.error("❌ Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔥 Starting Facebook sign-in...");
      const result = await firebaseHelpers.facebookSignIn();

      if (result.success) {
        setUser(result.user);
        setSuccess(`Welcome ${result.user.displayName || result.user.email}!`);
        console.log("✅ Facebook sign-in successful:", result.user);
      } else {
        setError(result.error || "Facebook sign-in failed");
        console.error("❌ Facebook sign-in failed:", result.error);
      }
    } catch (error: any) {
      setError(error.message || "Facebook sign-in error");
      console.error("❌ Facebook sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Firebase Integration Demo
            </CardTitle>
            <CardDescription>
              Test Firebase authentication for CATCH Music App
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configuration Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Configuration:</span>
              {isFirebaseConfigured() ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Connection:</span>
              {connectionTest === null ? (
                <Badge variant="secondary">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Testing...
                </Badge>
              ) : connectionTest ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={testFirebaseConnection}
                disabled={loading}
              >
                Retry
              </Button>
            </div>

            {/* Current User */}
            {user && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        {user.displayName || "Unknown"}
                      </p>
                      <p className="text-sm text-green-600">{user.email}</p>
                      <p className="text-xs text-green-500">UID: {user.uid}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Authentication Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading || !connectionTest}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Sign in with Google
              </Button>

              <Button
                onClick={handleFacebookSignIn}
                disabled={loading || !connectionTest}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                Sign in with Facebook
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• This demo uses your actual Firebase configuration</p>
              <p>• Google/Facebook authentication will work in production</p>
              <p>• Check browser console for detailed logs</p>
              <p>• Integration is ready for your signup page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
