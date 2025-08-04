import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SocialAuthTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testGoogleBackend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@gmail.com",
          name: "Test User",
          picture:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          googleId: "google_test_123",
          isNewUser: true,
        }),
      });

      const result = await response.json();

      setTestResults((prev) => [
        ...prev,
        {
          type: "Google Backend Test",
          success: result.success,
          data: result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (result.success) {
        toast({
          title: "✅ Google Backend Test Passed",
          description: `User: ${result.user.name}`,
        });
      } else {
        toast({
          title: "❌ Google Backend Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google backend test error:", error);
      setTestResults((prev) => [
        ...prev,
        {
          type: "Google Backend Test",
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      toast({
        title: "❌ Google Backend Test Error",
        description: "Network or server error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testFacebookBackend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@facebook.com",
          name: "Facebook Test User",
          picture:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
          facebookId: "facebook_test_456",
          isNewUser: true,
        }),
      });

      const result = await response.json();

      setTestResults((prev) => [
        ...prev,
        {
          type: "Facebook Backend Test",
          success: result.success,
          data: result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (result.success) {
        toast({
          title: "✅ Facebook Backend Test Passed",
          description: `User: ${result.user.name}`,
        });
      } else {
        toast({
          title: "❌ Facebook Backend Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Facebook backend test error:", error);
      setTestResults((prev) => [
        ...prev,
        {
          type: "Facebook Backend Test",
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      toast({
        title: "❌ Facebook Backend Test Error",
        description: "Network or server error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testUnifiedSocialAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "google",
          email: "unified@test.com",
          name: "Unified Test User",
          picture:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          socialId: "unified_test_789",
        }),
      });

      const result = await response.json();

      setTestResults((prev) => [
        ...prev,
        {
          type: "Unified Social Auth Test",
          success: result.success,
          data: result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (result.success) {
        toast({
          title: "✅ Unified Social Auth Test Passed",
          description: `User: ${result.user.name}`,
        });
      } else {
        toast({
          title: "❌ Unified Social Auth Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Unified social auth test error:", error);
      setTestResults((prev) => [
        ...prev,
        {
          type: "Unified Social Auth Test",
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      toast({
        title: "❌ Unified Social Auth Test Error",
        description: "Network or server error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark text-white">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-sm sticky top-0 z-20"
        >
          <button onClick={() => navigate("/login")}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold">Social Auth Backend Test</h1>
          <div className="w-6 h-6"></div>
        </motion.header>

        {/* Test Buttons */}
        <div className="flex-1 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4">Backend API Tests</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testGoogleBackend}
                disabled={isLoading}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                <span>Test Google Backend</span>
              </button>

              <button
                onClick={testFacebookBackend}
                disabled={isLoading}
                className="p-4 bg-blue-800 hover:bg-blue-900 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                <span>Test Facebook Backend</span>
              </button>

              <button
                onClick={testUnifiedSocialAuth}
                disabled={isLoading}
                className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                <span>Test Unified Social Auth</span>
              </button>

              <button
                onClick={clearResults}
                className="p-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Clear Results
              </button>
            </div>
          </motion.div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h3 className="text-xl font-bold mb-4">Test Results</h3>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      result.success
                        ? "bg-green-900/30 border border-green-500/30"
                        : "bg-red-900/30 border border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.type}</h4>
                      <span
                        className={`text-sm ${result.success ? "text-green-400" : "text-red-400"}`}
                      >
                        {result.success ? "✅ PASS" : "❌ FAIL"} -{" "}
                        {result.timestamp}
                      </span>
                    </div>

                    {result.success && result.data && (
                      <div className="text-sm text-gray-300">
                        <p>
                          <strong>User:</strong> {result.data.user?.name} (
                          {result.data.user?.email})
                        </p>
                        <p>
                          <strong>Message:</strong> {result.data.message}
                        </p>
                        <p>
                          <strong>Token:</strong>{" "}
                          {result.data.accessToken
                            ? "✅ Generated"
                            : "❌ Missing"}
                        </p>
                      </div>
                    )}

                    {!result.success && (
                      <div className="text-sm text-red-300">
                        <p>
                          <strong>Error:</strong>{" "}
                          {result.error ||
                            result.data?.message ||
                            "Unknown error"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
