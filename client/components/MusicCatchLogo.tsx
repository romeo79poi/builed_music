import { motion } from "framer-motion";

interface MusicCatchLogoProps {
  className?: string;
  animated?: boolean;
  signupMode?: boolean;
  blinkMode?: boolean;
}

export function MusicCatchLogo({
  className = "",
  animated = true,
  signupMode = false,
  blinkMode = false,
}: MusicCatchLogoProps) {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.5, rotateY: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: signupMode ? 1.2 : 1,
        ease: "easeOut",
        staggerChildren: signupMode ? 0.15 : 0.1,
      },
    },
  };

  const barVariants = {
    hidden: { scaleY: 0.2, opacity: 0, y: 10 },
    visible: {
      scaleY: signupMode ? [0.2, 1.4, 0.9, 1] : [0.3, 1.2, 0.8, 1],
      opacity: 1,
      y: 0,
      transition: {
        duration: signupMode ? 2 : 1.5,
        ease: "easeOut",
        repeat: animated ? Infinity : 0,
        repeatType: "reverse" as const,
        repeatDelay: signupMode ? 3 : 2,
      },
    },
  };

  const diamondVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: [0, 1.2, 1],
      rotate: signupMode ? [0, 180, 360] : 360,
      transition: {
        duration: signupMode ? 2.5 : 1.5,
        ease: "easeOut",
        repeat: signupMode && animated ? Infinity : 0,
        repeatType: "loop" as const,
        repeatDelay: signupMode ? 4 : 0,
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: signupMode ? [0.3, 0.8, 0.3] : 0.5,
      scale: signupMode ? [0.8, 1.2, 0.8] : 1,
      transition: {
        duration: signupMode ? 3 : 2,
        ease: "easeInOut",
        repeat: signupMode && animated ? Infinity : 0,
        repeatType: "loop" as const,
      },
    },
  };

    const waveVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: [0, 1, 0.7],
      transition: {
        duration: signupMode ? 2.5 : 1.8,
        ease: "easeOut",
        repeat: animated ? Infinity : 0,
        repeatType: "reverse" as const,
        repeatDelay: signupMode ? 2.5 : 2,
      },
    },
  };

  // Blink animation variants for login page
  const blinkVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: blinkMode ? [1, 0.3, 1, 0.1, 1] : 1,
      transition: {
        duration: blinkMode ? 1.5 : 0.8,
        ease: "easeInOut",
        repeat: blinkMode && animated ? Infinity : 0,
        repeatType: "loop" as const,
        repeatDelay: blinkMode ? 2 : 0,
      },
    },
  };

    return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      variants={blinkMode ? blinkVariants : containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative flex flex-col">
        {/* Enhanced circular background with multiple glows */}
        <motion.div
          variants={glowVariants}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green/40 via-emerald-400/40 to-neon-blue/40 absolute -inset-4 blur-xl"
        />
        <motion.div
          variants={glowVariants}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green/30 via-emerald-400/30 to-neon-blue/30 absolute -inset-2 blur-lg"
        />

        {/* Main logo container */}
        <div className="relative w-12 justify-center flex flex-row items-center">
          {/* Animated side dots with pulse effect */}
                    <motion.div
            variants={barVariants}
            className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-neon-green rounded-full shadow-lg shadow-neon-green/50"
            animate={
              animated && signupMode
                ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }
                : animated && blinkMode
                ? {
                    opacity: [1, 0.1, 1, 0.3, 1, 0.1, 1],
                    scale: [1, 1.2, 1, 1.1, 1, 1.3, 1],
                  }
                : {}
            }
                        transition={{
              duration: blinkMode ? 1.8 : 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: blinkMode ? 0.5 : 0,
            }}
          />

          {/* Left side bars with stagger */}
          <div className="absolute left-0 flex items-end space-x-0.5">
            <motion.div
              variants={barVariants}
              className="w-0.5 h-2 bg-gradient-to-t from-neon-green to-emerald-400 rounded-full shadow-sm shadow-neon-green/30"
              style={{ animationDelay: "0.1s" }}
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-4 bg-gradient-to-t from-neon-green to-emerald-400 rounded-full shadow-sm shadow-neon-green/30"
              style={{ animationDelay: "0.2s" }}
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-3 bg-gradient-to-t from-neon-green to-emerald-400 rounded-full shadow-sm shadow-neon-green/30"
              style={{ animationDelay: "0.3s" }}
            />
          </div>

          {/* Center diamond with enhanced effects */}
          <div className="relative">
                        <motion.div
              variants={diamondVariants}
              className="w-4 h-4 bg-gradient-to-br from-neon-green to-emerald-400 rotate-45 rounded-sm shadow-lg shadow-neon-green/50"
              animate={
                animated && signupMode
                  ? {
                      boxShadow: [
                        "0 0 10px rgba(60, 221, 116, 0.5)",
                        "0 0 20px rgba(60, 221, 116, 0.8)",
                        "0 0 10px rgba(60, 221, 116, 0.5)",
                      ],
                    }
                  : animated && blinkMode
                  ? {
                      opacity: [1, 0.2, 1, 0.4, 1],
                      scale: [1, 0.9, 1, 0.95, 1],
                      boxShadow: [
                        "0 0 15px rgba(60, 221, 116, 0.8)",
                        "0 0 5px rgba(60, 221, 116, 0.3)",
                        "0 0 25px rgba(60, 221, 116, 1)",
                        "0 0 8px rgba(60, 221, 116, 0.4)",
                        "0 0 15px rgba(60, 221, 116, 0.8)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: blinkMode ? 2 : 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: blinkMode ? 1 : 0,
              }}
            />

            {/* Enhanced curved wave elements */}
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
              <motion.div
                variants={waveVariants}
                className="w-5 h-0.5 bg-gradient-to-r from-neon-green to-transparent rounded-full transform -rotate-12 shadow-sm shadow-neon-green/30"
              />
            </div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
              <motion.div
                variants={waveVariants}
                className="w-5 h-0.5 bg-gradient-to-r from-transparent to-neon-blue rounded-full transform rotate-12 shadow-sm shadow-neon-blue/30"
              />
            </div>
          </div>

          {/* Right side bars with stagger */}
          <div className="absolute right-0 flex items-end space-x-0.5">
            <motion.div
              variants={barVariants}
              className="w-0.5 h-3 bg-gradient-to-t from-neon-blue to-cyan-400 rounded-full shadow-sm shadow-neon-blue/30"
              style={{ animationDelay: "0.4s" }}
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-5 bg-gradient-to-t from-neon-blue to-cyan-400 rounded-full shadow-sm shadow-neon-blue/30"
              style={{ animationDelay: "0.5s" }}
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-2 bg-gradient-to-t from-neon-blue to-cyan-400 rounded-full shadow-sm shadow-neon-blue/30"
              style={{ animationDelay: "0.6s" }}
            />
          </div>

                    <motion.div
            variants={barVariants}
            className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-neon-blue rounded-full shadow-lg shadow-neon-blue/50"
            animate={
              animated && signupMode
                ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }
                : animated && blinkMode
                ? {
                    opacity: [1, 0.2, 1, 0.1, 1, 0.4, 1],
                    scale: [1, 1.1, 1, 1.3, 1, 1.2, 1],
                  }
                : {}
            }
                        transition={{
              duration: blinkMode ? 1.8 : 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: blinkMode ? 0.3 : 1,
              repeatDelay: blinkMode ? 0.7 : 0,
            }}
          />
        </div>

        {/* Additional signup mode effects */}
        {signupMode && animated && (
          <>
            {/* Floating particles */}
            <motion.div
              className="absolute -top-2 -left-2 w-1 h-1 bg-neon-green rounded-full"
              animate={{
                y: [-4, -8, -4],
                x: [-2, 2, -2],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-1 h-1 bg-neon-blue rounded-full"
              animate={{
                y: [4, 8, 4],
                x: [2, -2, 2],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
