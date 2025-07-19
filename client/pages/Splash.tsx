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
    <div className="min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!showButtons ? (
          // Initial Splash Screen
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center relative"
          >
            {/* Background geometric patterns */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 border border-slate-600 rotate-45 rounded-lg"></div>
              <div className="absolute top-20 right-20 w-24 h-24 border border-slate-600 rotate-12 rounded-lg"></div>
              <div className="absolute bottom-20 left-20 w-20 h-20 border border-slate-600 -rotate-12 rounded-lg"></div>
              <div className="absolute bottom-10 right-10 w-28 h-28 border border-slate-600 rotate-45 rounded-lg"></div>
            </div>

            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-blue/10"></div>

            {/* Splash content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Animated logo */}
              <MusicCatchLogo className="mb-8" animated />

              {/* App title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wider">
                  MUSIC CATCH
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="text-neon-green text-sm tracking-[0.2em] font-medium"
                >
                  APPS
                </motion.p>
              </motion.div>

              {/* Loading animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="mt-12 flex space-x-1"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scaleY: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className="w-1 h-8 bg-gradient-to-t from-neon-green to-neon-blue rounded-full"
                  />
                ))}
              </motion.div>
            </div>

            {/* Bottom text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="absolute bottom-8 text-center"
            >
              <p className="text-slate-400 text-sm">
                Experience music like never before
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // Black Screen with Buttons
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="min-h-screen bg-black flex flex-col items-center justify-center relative pt-20"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5"></div>

            <div className="relative z-10 flex flex-col items-center max-w-md mx-auto px-6">
              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
                  Welcome to Music Catch
                </h2>
                <p className="text-slate-400 text-lg">
                  Get started with your musical journey
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col gap-6 w-full max-w-sm"
              >
                <Button
                  onClick={() => navigate("/signup")}
                  className="w-full bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/80 hover:to-neon-blue/80 text-black font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Sign Up
                </Button>

                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Log In
                </Button>
              </motion.div>

              {/* Additional info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-slate-600 text-sm">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
