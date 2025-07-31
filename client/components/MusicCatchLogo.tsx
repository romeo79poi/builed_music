import { motion } from "framer-motion";

interface MusicCatchLogoProps {
  className?: string;
  animated?: boolean;
  signupMode?: boolean;
  blinkMode?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function MusicCatchLogo({
  className = "",
  animated = false, // Disable animations for Google-style simplicity
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

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        {/* Simple logo image - Google style */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F11b0bf53d4ba4f5c86221ab6187efb65%2F1060ba8f2e1d4dfc9c0f6fd0cb6b1ebc?format=webp&width=800"
          alt="MusicCatch Logo"
          className="w-full h-full object-contain"
          style={{
            // Clean, crisp rendering like Google's logo
            imageRendering: "crisp-edges",
            WebkitImageRendering: "crisp-edges",
          }}
        />
      </div>
    </div>
  );
}
