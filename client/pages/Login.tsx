import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MusicCatchLogo } from "../components/MusicCatchLogo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    // In a real app, you'd validate credentials here
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <MusicCatchLogo animated={false} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl font-bold text-white text-center mb-8"
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
          <button className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors">
            <div className="w-6 h-6 mr-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            Continue with Google
          </button>

          <button className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors">
            <div className="w-6 h-6 mr-3 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">f</span>
            </div>
            Continue with Facebook
          </button>

          <button className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-slate-700/50 transition-colors">
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
              Email or username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username"
              className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>

          <button className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105">
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
