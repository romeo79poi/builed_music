import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
  weight: number;
}

const passwordRules: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
    weight: 100,
  },
];

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, className }) => {
  if (!password) return null;

  const passedRules = passwordRules.filter((rule) => rule.test(password));
  const strength = passedRules.reduce((total, rule) => total + rule.weight, 0);

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "from-red-500 to-red-600";
    if (strength < 70) return "from-yellow-500 to-orange-500";
    if (strength < 90) return "from-blue-500 to-blue-600";
    return "from-neon-green to-neon-blue";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 40) return { label: "Weak", color: "text-red-400" };
    if (strength < 70) return { label: "Fair", color: "text-yellow-400" };
    if (strength < 90) return { label: "Good", color: "text-blue-400" };
    return { label: "Strong", color: "text-neon-green" };
  };

  const strengthInfo = getStrengthLabel(strength);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-3", className)}
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Password Strength</span>
          <span className={cn("text-sm font-medium", strengthInfo.color)}>
            {strengthInfo.label}
          </span>
        </div>

        <div className="relative">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full bg-gradient-to-r transition-all duration-500",
                getStrengthColor(strength),
              )}
            />
          </div>

          {/* Strength markers */}
          <div className="absolute inset-0 flex justify-between px-1">
            {[25, 50, 75].map((marker) => (
              <div
                key={marker}
                className="w-px h-full bg-black/20"
                style={{ marginLeft: `${marker}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="space-y-2">
        <span className="text-sm text-gray-400">Requirements:</span>
        <div className="grid grid-cols-1 gap-1">
          {passwordRules.map((rule) => {
            const passed = rule.test(password);
            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-2"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300",
                    passed
                      ? "bg-neon-green text-black"
                      : "bg-white/10 text-gray-400",
                  )}
                >
                  {passed ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <X className="w-2.5 h-2.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs transition-colors duration-300",
                    passed ? "text-neon-green" : "text-gray-400",
                  )}
                >
                  {rule.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Security Tips */}
      {strength >= 90 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-neon-green font-medium">
              Excellent! Your password is strong and secure.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PasswordStrengthIndicator;
