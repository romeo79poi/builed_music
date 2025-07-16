import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MusicCatchLogo } from "../components/MusicCatchLogo";

export default function Signup() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

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

        {/* Email Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-4 mb-6"
        >
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full h-14 bg-slate-800/50 border border-slate-600 rounded-lg px-4 text-white placeholder-slate-400 focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>

          <p className="text-neon-green text-sm underline hover:text-emerald-400 transition-colors cursor-pointer">
            Use phone number instead.
          </p>

          <button className="w-full h-14 bg-gradient-to-r from-neon-green to-emerald-400 rounded-full text-slate-900 font-bold text-lg hover:from-emerald-400 hover:to-neon-green transition-all transform hover:scale-105">
            Next
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex items-center my-6"
        >
          <div className="flex-1 h-px bg-slate-600"></div>
          <span className="px-4 text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-600"></div>
        </motion.div>

        {/* Social Signup Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mb-8 flex flex-col"
        >
          <button className="w-full bg-slate-800/50 rounded-full flex justify-center text-white font-medium hover:bg-slate-700/50 transition-colors flex-row border-[0.727273px] border-slate-500">
            <div className="w-6 h-6 mr-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            Sign up with Google
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center"
        >
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white underline hover:text-neon-green transition-colors"
            >
              Log in here.
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
