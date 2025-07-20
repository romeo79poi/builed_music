import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  variant?: "default" | "glass" | "solid";
  size?: "sm" | "md" | "lg";
}

export function BackButton({
  onClick,
  className,
  variant = "default",
  size = "md",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantStyles = {
    default: "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600",
    glass:
      "bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20",
    solid: "bg-slate-700 hover:bg-slate-600 border border-slate-500",
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200 text-white hover:scale-105 active:scale-95",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
    >
      <ArrowLeft className={iconSizes[size]} />
    </button>
  );
}
