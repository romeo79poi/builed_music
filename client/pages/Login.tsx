import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useFirebase } from "../context/FirebaseContext";
import { loginWithEmailAndPassword, signInWithGoogle } from "../lib/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Save user profile data to Firestore
  const saveUserProfile = async (uid: string, profileData: any) => {
    try {
      if (!db) {
        console.warn("Firestore not available, skipping profile save");
        return;
      }

      await setDoc(doc(db, "users", uid), {
        ...profileData,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log("✅ User profile saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving profile to Firestore:", error);
    }
  };

  // Get existing user profile data
  const getUserProfile = async (uid: string) => {
    try {
      if (!db) return null;

      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use Firebase SDK login
      const result = await loginWithEmailAndPassword(email, password);

      if (result.success && result.user) {
        // Get existing profile data
        const existingProfile = await getUserProfile(result.user.uid);

        // Save/update user profile in Firestore
        await saveUserProfile(result.user.uid, {
          name: existingProfile?.name || result.user.displayName || "",
          username: existingProfile?.username || "",
          email: result.user.email || "",
          phone: existingProfile?.phone || result.user.phoneNumber || "",
          uid: result.user.uid,
          emailVerified: result.user.emailVerified,
        });

        toast({
          title: "Login successful! 🎉",
          description: `Welcome back!`,
        });

        console.log("✅ User logged in:", {
          uid: result.user.uid,
          email: result.user.email,
          emailVerified: result.user.emailVerified,
        });

        navigate("/profile");
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        title: "Login error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        // Save user profile to Firestore
        await saveUserProfile(result.user.uid, {
          name: result.user.displayName || "",
          username: result.user.email?.split("@")[0] || "",
          email: result.user.email || "",
          phone: result.user.phoneNumber || "",
          uid: result.user.uid,
          emailVerified: result.user.emailVerified,
        });

        const message = result.isNewUser
          ? `Welcome to Music Catch, ${result.user.displayName}!`
          : `Welcome back, ${result.user.displayName}!`;

        toast({
          title: "Google login successful! 🎉",
          description: message,
        });

        navigate("/profile");
      } else {
        toast({
          title: "Google login failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = () => {
    // Placeholder for other social logins
    toast({
      title: "Coming soon",
      description: "This login method will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

      <div className="relative z-10 w-full max-w-md px-2 sm:px-0">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <MusicCatchLogo
            animated={true}
            blinkMode={true}
            className="scale-90 sm:scale-100"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8"
        >
          Log in to Catch
        </motion.h1>

        {/* Social Login Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-4 mb-8"
        >
          <button
            onClick={handleSocialLogin}
            className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors"
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
            Continue with Google
          </button>

          <button
            onClick={handleSocialLogin}
            className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>

          <button
            onClick={handleSocialLogin}
            className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors"
          >
            Continue with phone number
          </button>
        </motion.div>

        {/* Email Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email,username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 sm:h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-3 sm:px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors text-sm sm:text-base"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full h-12 sm:h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-sm sm:text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105"
          >
            Continue
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-white underline hover:text-neon-green transition-colors"
            >
              signup for catch
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
