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

  const elementVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: signupMode ? 1.5 : 1,
        ease: "easeOut",
        repeat: animated ? Infinity : 0,
        repeatType: "reverse" as const,
        repeatDelay: signupMode ? 3 : 2,
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

  const particleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0.8],
      transition: {
        duration: 2,
        ease: "easeOut",
        repeat: animated ? Infinity : 0,
        repeatType: "reverse" as const,
        repeatDelay: 1.5,
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
      <div className="relative flex items-center justify-center w-8 h-8">
        {/* Background Glow */}
        <motion.div
          variants={glowVariants}
          className="absolute inset-0 w-12 h-12 -translate-x-2 -translate-y-2 rounded-full bg-gradient-to-br from-purple-primary/40 via-purple-secondary/40 to-purple-accent/40 blur-lg"
        />
        
        {/* C Shape - Top Arc */}
        <motion.div
          variants={elementVariants}
          className="absolute w-6 h-3 border-2 border-purple-primary rounded-t-full border-b-0"
          style={{ top: '2px', left: '4px' }}
        />
        
        {/* C Shape - Bottom Arc */}
        <motion.div
          variants={elementVariants}
          className="absolute w-6 h-3 border-2 border-purple-primary rounded-b-full border-t-0"
          style={{ bottom: '2px', left: '4px' }}
        />
        
        {/* C Shape - Left Vertical */}
        <motion.div
          variants={elementVariants}
          className="absolute w-2 h-4 bg-gradient-to-b from-purple-primary to-purple-secondary rounded-l-full"
          style={{ left: '4px', top: '6px' }}
        />
        
        {/* Animated Elements around C */}
        
        {/* Top Left Particle */}
        <motion.div
          variants={particleVariants}
          className="absolute w-1 h-1 bg-purple-accent rounded-full shadow-sm shadow-purple-accent/50"
          style={{ top: '0px', left: '1px' }}
          animate={animated ? {
            y: [-2, -4, -2],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Top Right Particle */}
        <motion.div
          variants={particleVariants}
          className="absolute w-1 h-1 bg-purple-secondary rounded-full shadow-sm shadow-purple-secondary/50"
          style={{ top: '1px', right: '0px' }}
          animate={animated ? {
            x: [2, 4, 2],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        
        {/* Bottom Left Particle */}
        <motion.div
          variants={particleVariants}
          className="absolute w-1 h-1 bg-purple-primary rounded-full shadow-sm shadow-purple-primary/50"
          style={{ bottom: '0px', left: '2px' }}
          animate={animated ? {
            y: [2, 4, 2],
            opacity: [0.7, 1, 0.7],
          } : {}}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Bottom Right Particle */}
        <motion.div
          variants={particleVariants}
          className="absolute w-1 h-1 bg-purple-accent rounded-full shadow-sm shadow-purple-accent/50"
          style={{ bottom: '1px', right: '1px' }}
          animate={animated ? {
            x: [2, 3, 2],
            y: [1, 3, 1],
            opacity: [0.4, 0.9, 0.4],
          } : {}}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
        
        {/* Center Accent Dot */}
        <motion.div
          variants={elementVariants}
          className="absolute w-1 h-1 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-full shadow-md shadow-purple-primary/60"
          style={{ top: '50%', left: '6px', transform: 'translateY(-50%)' }}
          animate={animated ? {
            scale: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
            boxShadow: [
              "0 0 4px rgba(139, 92, 246, 0.6)",
              "0 0 8px rgba(139, 92, 246, 0.9)",
              "0 0 4px rgba(139, 92, 246, 0.6)",
            ],
          } : {}}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Side Elements */}
        <motion.div
          variants={particleVariants}
          className="absolute w-0.5 h-2 bg-gradient-to-b from-purple-secondary to-purple-accent rounded-full"
          style={{ right: '-4px', top: '4px' }}
          animate={animated ? {
            scaleY: [0.8, 1.3, 0.8],
            opacity: [0.6, 1, 0.6],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
        
        <motion.div
          variants={particleVariants}
          className="absolute w-0.5 h-1.5 bg-gradient-to-b from-purple-primary to-purple-secondary rounded-full"
          style={{ right: '-6px', bottom: '6px' }}
          animate={animated ? {
            scaleY: [1, 1.4, 1],
            opacity: [0.5, 0.9, 0.5],
          } : {}}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        />
      </div>
    </motion.div>
  );
}
