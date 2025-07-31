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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
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
      <motion.img
        src="https://cdn.builder.io/api/v1/image/assets%2F1fb5a7352bf940ee8ca56f08d2a50bd7%2F3a45c23044eb44e8bd3833b80541721e?format=webp&width=800"
        alt="C Logo"
        variants={logoVariants}
        className="w-8 h-8 object-contain"
        whileHover={animated ? { scale: 1.1 } : {}}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
