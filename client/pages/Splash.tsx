import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MusicCatchLogo } from "../components/MusicCatchLogo";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
    </div>
  );
}
