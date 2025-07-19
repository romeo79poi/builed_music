import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { Button } from "../components/ui/button";

export default function Splash() {
  const navigate = useNavigate();
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 3000); // Show buttons after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background geometric patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border border-slate-600 rotate-45 rounded-lg"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border border-slate-600 rotate-12 rounded-lg"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 border border-slate-600 -rotate-12 rounded-lg"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 border border-slate-600 rotate-45 rounded-lg"></div>
      </div>

      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-blue/10 bg-black"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated logo */}
        <MusicCatchLogo className="mb-8" animated />

        {/* App title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wider">
            MUSIC CATCH
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-neon-green text-sm tracking-[0.2em] font-medium"
          >
            APPS
          </motion.p>
        </motion.div>

        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-8 mb-12"
        >
          <p className="text-slate-300 text-lg mb-2">Welcome to Music Catch</p>
          <p className="text-slate-400 text-sm max-w-md">
            Experience music like never before. Discover, catch, and enjoy your
            favorite tracks.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
        >
          <Button
            onClick={() => navigate("/signup")}
            className="flex-1 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Sign Up
          </Button>

          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="flex-1 border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Log In
          </Button>
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>

      {/* Floating music notes animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-neon-green/30 text-xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            ♪
          </motion.div>
        ))}
      </div>
    </div>
  );
}
