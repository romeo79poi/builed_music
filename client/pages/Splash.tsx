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
            className="min-h-screen bg-black flex flex-col items-center justify-center relative"
          >
            {/* Background geometric patterns */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 border border-slate-600 rotate-45 rounded-lg"></div>
              <div className="absolute top-20 right-20 w-24 h-24 border border-slate-600 rotate-12 rounded-lg"></div>
              <div className="absolute bottom-20 left-20 w-20 h-20 border border-slate-600 -rotate-12 rounded-lg"></div>
              <div className="absolute bottom-10 right-10 w-28 h-28 border border-slate-600 rotate-45 rounded-lg"></div>
            </div>

            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/20 via-purple-secondary/10 to-purple-accent/15"></div>

            {/* Splash content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Animated logo */}
              <MusicCatchLogo className="mb-8" animated />

              {/* App title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-center text-white text-6xl font-bold tracking-[3px] leading-[64px] pb-2"
              >
                CATCH
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
                    className="w-1 h-8 bg-gradient-to-t from-purple-primary via-purple-secondary to-purple-accent rounded-full"
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
              <p className="text-transparent bg-gradient-to-r from-purple-primary via-purple-secondary to-purple-accent bg-clip-text text-sm font-medium">
                Feel the Music, Catch the Vibe ✨
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
            className="min-h-screen bg-black flex flex-col items-center justify-center relative pt-15"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/10 via-purple-secondary/5 to-purple-accent/8"></div>

            <div className="relative z-10 flex flex-col items-center max-w-md mx-auto px-3 sm:px-6">
              {/* Welcome text with enhanced logo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-center mb-12 sm:mb-16"
              >
                {/* Enhanced logo display */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/30 via-purple-secondary/25 to-purple-accent/30 rounded-full blur-xl scale-150"></div>
                    <MusicCatchLogo className="relative scale-150" animated />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-wide">
                  Welcome to Catch
                </h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-transparent bg-gradient-to-r from-purple-primary via-purple-secondary to-purple-accent bg-clip-text text-lg sm:text-xl font-semibold tracking-wide"
                >
                  Feel the Music
                </motion.div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col gap-4 sm:gap-6 w-full"
              >
                <Button
                  onClick={() => navigate("/signup")}
                  className="w-full bg-black text-green-400 hover:bg-green-400/10 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200 text-base sm:text-lg border-2 border-[rgba(79,214,57,1)]"
                >
                  Start Your Journey
                </Button>

                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full bg-black border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200 text-base sm:text-lg"
                >
                  Log In
                </Button>
              </motion.div>

              {/* Additional info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-slate-600 text-sm mb-2">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
                <p className="text-transparent bg-gradient-to-r from-neon-green/70 to-neon-blue/70 bg-clip-text text-xs font-medium">
                  🎶 Where Every Beat Tells a Story 🎶
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
