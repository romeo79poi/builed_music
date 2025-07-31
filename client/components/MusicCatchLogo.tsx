import { motion } from "framer-motion";
import { Music } from "lucide-react";

interface MusicCatchLogoProps {
  className?: string;
  animated?: boolean;
  signupMode?: boolean;
  blinkMode?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function MusicCatchLogo({
  className = "",
  animated = true,
  signupMode = false,
  blinkMode = false,
  size = "md",
}: MusicCatchLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16", 
    xl: "w-24 h-24"
  };

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

  const letterVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: signupMode ? 1.5 : 1,
        ease: "easeOut",
      },
    },
  };

  const noteVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -45 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0.8],
      transition: {
        duration: 1.5,
        ease: "easeOut",
        repeat: animated ? Infinity : 0,
        repeatType: "reverse" as const,
        repeatDelay: 2,
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
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 70%)",
            filter: "blur(8px)",
            transform: "scale(1.5)",
          }}
          animate={animated ? {
            scale: [1.3, 1.7, 1.3],
            opacity: [0.6, 0.8, 0.6],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main C Letter */}
        <motion.div
          variants={letterVariants}
          className="relative z-10 flex items-center justify-center text-4xl font-bold"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #ec4899 25%, #8b5cf6 50%, #f97316 75%, #eab308 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: size === "xl" ? "3rem" : size === "lg" ? "2rem" : size === "md" ? "1.5rem" : "1rem",
            fontWeight: "800",
            textShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
          }}
        >
          C
        </motion.div>

        {/* Musical Notes around the C */}
        {/* Top Left Note */}
        <motion.div
          variants={noteVariants}
          className="absolute"
          style={{ 
            top: size === "xl" ? "-8px" : size === "lg" ? "-6px" : "-4px", 
            left: size === "xl" ? "8px" : size === "lg" ? "6px" : "4px",
            color: "#ec4899",
            fontSize: size === "xl" ? "16px" : size === "lg" ? "12px" : "8px"
          }}
          animate={animated ? {
            y: [-2, 2, -2],
            rotate: [-10, 10, -10],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          ♪
        </motion.div>

        {/* Top Right Note */}
        <motion.div
          variants={noteVariants}
          className="absolute"
          style={{ 
            top: size === "xl" ? "4px" : size === "lg" ? "2px" : "0px", 
            right: size === "xl" ? "-12px" : size === "lg" ? "-8px" : "-6px",
            color: "#a855f7",
            fontSize: size === "xl" ? "20px" : size === "lg" ? "14px" : "10px"
          }}
          animate={animated ? {
            x: [2, -2, 2],
            rotate: [5, -5, 5],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        >
          ♫
        </motion.div>

        {/* Bottom Left Note */}
        <motion.div
          variants={noteVariants}
          className="absolute"
          style={{ 
            bottom: size === "xl" ? "8px" : size === "lg" ? "6px" : "4px", 
            left: size === "xl" ? "-8px" : size === "lg" ? "-6px" : "-4px",
            color: "#8b5cf6",
            fontSize: size === "xl" ? "14px" : size === "lg" ? "10px" : "7px"
          }}
          animate={animated ? {
            y: [2, -2, 2],
            rotate: [-15, 15, -15],
          } : {}}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
        >
          ♪
        </motion.div>

        {/* Bottom Right Note */}
        <motion.div
          variants={noteVariants}
          className="absolute"
          style={{ 
            bottom: size === "xl" ? "-4px" : size === "lg" ? "-2px" : "0px", 
            right: size === "xl" ? "8px" : size === "lg" ? "6px" : "4px",
            color: "#f97316",
            fontSize: size === "xl" ? "18px" : size === "lg" ? "12px" : "9px"
          }}
          animate={animated ? {
            x: [-1, 1, -1],
            y: [1, -1, 1],
            rotate: [8, -8, 8],
            scale: [1, 1.15, 1],
          } : {}}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          ♫
        </motion.div>

        {/* Far Right Note */}
        <motion.div
          variants={noteVariants}
          className="absolute"
          style={{ 
            top: size === "xl" ? "50%" : "50%", 
            right: size === "xl" ? "-20px" : size === "lg" ? "-16px" : "-12px",
            transform: "translateY(-50%)",
            color: "#eab308",
            fontSize: size === "xl" ? "16px" : size === "lg" ? "11px" : "8px"
          }}
          animate={animated ? {
            x: [3, -1, 3],
            rotate: [12, -12, 12],
          } : {}}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        >
          ♪
        </motion.div>

        {/* Sparkle Elements */}
        {/* Top Sparkle */}
        <motion.div
          variants={sparkleVariants}
          className="absolute"
          style={{ 
            top: size === "xl" ? "-12px" : size === "lg" ? "-8px" : "-6px", 
            right: size === "xl" ? "-4px" : size === "lg" ? "-2px" : "0px",
            color: "#ec4899",
            fontSize: size === "xl" ? "12px" : size === "lg" ? "8px" : "6px"
          }}
        >
          ✦
        </motion.div>

        {/* Bottom Sparkle */}
        <motion.div
          variants={sparkleVariants}
          className="absolute"
          style={{ 
            bottom: size === "xl" ? "-8px" : size === "lg" ? "-6px" : "-4px", 
            left: size === "xl" ? "-12px" : size === "lg" ? "-8px" : "-6px",
            color: "#a855f7",
            fontSize: size === "xl" ? "10px" : size === "lg" ? "7px" : "5px"
          }}
          animate={animated ? {
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
        >
          ��
        </motion.div>

        {/* Side Sparkles */}
        <motion.div
          variants={sparkleVariants}
          className="absolute"
          style={{ 
            top: size === "xl" ? "20%" : "25%", 
            left: size === "xl" ? "-16px" : size === "lg" ? "-12px" : "-8px",
            color: "#f97316",
            fontSize: size === "xl" ? "8px" : size === "lg" ? "6px" : "4px"
          }}
        >
          ✦
        </motion.div>

        <motion.div
          variants={sparkleVariants}
          className="absolute"
          style={{ 
            bottom: size === "xl" ? "20%" : "25%", 
            right: size === "xl" ? "-16px" : size === "lg" ? "-12px" : "-8px",
            color: "#eab308",
            fontSize: size === "xl" ? "8px" : size === "lg" ? "6px" : "4px"
          }}
          animate={animated ? {
            rotate: [0, -180, -360],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
            delay: 1,
          }}
        >
          ✦
        </motion.div>
      </div>
    </motion.div>
  );
}
