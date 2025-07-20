import { motion } from "framer-motion";

interface MusicCatchLogoProps {
  className?: string;
  animated?: boolean;
  signupMode?: boolean;
}

export function MusicCatchLogo({
  className = "",
  animated = true,
  signupMode = false,
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

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative flex flex-col">
        {/* Circular background with gradient */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green/30 via-emerald-400/30 to-neon-blue/30 absolute -inset-2 blur-lg"></div>

        {/* Main logo container */}
        <div className="relative w-12 justify-center flex flex-row items-center">
          {/* Side dots */}
          <motion.div
            variants={barVariants}
            className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-neon-green rounded-full"
          />

          {/* Left side bars */}
          <div className="absolute left-0 flex items-end space-x-0.5">
            <motion.div
              variants={barVariants}
              className="w-0.5 h-2 bg-gradient-to-t from-neon-green to-emerald-400 rounded-full"
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-4 bg-gradient-to-t from-neon-green to-emerald-400 rounded-full"
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-3 bg-gradient-to-t from-neon-green to-emerald-400 rounded-full"
            />
          </div>

          {/* Center diamond with curved elements */}
          <div className="relative">
            <motion.div
              variants={diamondVariants}
              className="w-4 h-4 bg-gradient-to-br from-neon-green to-emerald-400 rotate-45 rounded-sm"
            />

            {/* Curved wave elements */}
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
              <motion.div
                variants={barVariants}
                className="w-5 h-0.5 bg-gradient-to-r from-neon-green to-transparent rounded-full transform -rotate-12"
              />
            </div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
              <motion.div
                variants={barVariants}
                className="w-5 h-0.5 bg-gradient-to-r from-transparent to-neon-blue rounded-full transform rotate-12"
              />
            </div>
          </div>

          {/* Right side bars */}
          <div className="absolute right-0 flex items-end space-x-0.5">
            <motion.div
              variants={barVariants}
              className="w-0.5 h-3 bg-gradient-to-t from-neon-blue to-cyan-400 rounded-full"
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-5 bg-gradient-to-t from-neon-blue to-cyan-400 rounded-full"
            />
            <motion.div
              variants={barVariants}
              className="w-0.5 h-2 bg-gradient-to-t from-neon-blue to-cyan-400 rounded-full"
            />
          </div>

          <motion.div
            variants={barVariants}
            className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-neon-blue rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
