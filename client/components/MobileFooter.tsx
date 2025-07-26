import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Upload,
  Library,
  BarChart3,
  Clock,
  User,
  Plus,
  Mic,
} from "lucide-react";

interface FooterProps {
  className?: string;
}

export default function MobileFooter({ className = "" }: FooterProps) {
  const location = useLocation();

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/home"
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      path: "/search"
    },
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
      path: "/upload"
    },
    {
      id: "library",
      label: "Library",
      icon: Library,
      path: "/library"
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile"
    },
  ];

  // Special handling for alternative paths
  const getActiveItem = () => {
    const currentPath = location.pathname;

    // Handle exact matches first
    const exactMatch = navItems.find(item => item.path === currentPath);
    if (exactMatch) return exactMatch;

    // Handle special cases
    if (currentPath === "/" || currentPath === "/index") {
      return navItems.find(item => item.id === "home");
    }

    // History page should show Library as active since it's part of library functionality
    if (currentPath === "/history") {
      return navItems.find(item => item.id === "library");
    }

    return null;
  };

  const activeItem = getActiveItem();

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      className={`fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl border-t border-purple-primary/20 z-50 ${className}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-primary/8 via-purple-secondary/4 to-transparent"></div>

      {/* Mobile Safe Area */}
      <div className="relative z-10 px-2 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Left Side - Home & Search */}
          <div className="flex items-center space-x-4">
            {navItems.slice(0, 2).map((item) => {
              const isActive = activeItem?.id === item.id;
              const Icon = item.icon;

              return (
                <Link key={item.id} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center transition-all duration-200 group"
                  >
                    <motion.div
                      animate={isActive ? {
                        boxShadow: [
                          "0 0 0px rgba(34, 197, 94, 0.3)",
                          "0 0 20px rgba(34, 197, 94, 0.6)",
                          "0 0 0px rgba(34, 197, 94, 0.3)"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? "bg-gradient-to-r from-neon-green to-purple-secondary shadow-lg shadow-neon-green/30"
                          : "bg-purple-dark/40 hover:bg-purple-primary/20 border border-purple-primary/20 hover:border-purple-primary/40"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-purple-primary"
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          animate={{
                            rotate: 360,
                            transition: { duration: 3, repeat: Infinity, ease: "linear" }
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
                        isActive
                          ? "text-neon-green"
                          : "text-gray-400 group-hover:text-purple-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Center - Floating Action Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -3, 0],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-gradient-to-r from-purple-primary via-purple-secondary to-purple-accent rounded-full flex items-center justify-center shadow-xl shadow-purple-primary/40 relative overflow-hidden border-2 border-white/20"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                transition: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            <Plus className="w-7 h-7 text-white relative z-10" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
                transition: { duration: 2, repeat: Infinity }
              }}
              className="absolute inset-0 bg-gradient-to-r from-purple-primary/50 to-purple-secondary/50 rounded-full"
            />
          </motion.button>

          {/* Right Side - Library & Profile */}
          <div className="flex items-center space-x-4">
            {navItems.slice(3, 5).map((item) => {
              const isActive = activeItem?.id === item.id;
              const Icon = item.icon;

              return (
                <Link key={item.id} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center transition-all duration-200 group"
                  >
                    <motion.div
                      animate={isActive ? {
                        boxShadow: [
                          "0 0 0px rgba(158, 64, 252, 0.3)",
                          "0 0 20px rgba(158, 64, 252, 0.6)",
                          "0 0 0px rgba(158, 64, 252, 0.3)"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? "bg-gradient-to-r from-purple-primary to-purple-secondary shadow-lg shadow-purple-primary/30"
                          : "bg-purple-dark/40 hover:bg-purple-primary/20 border border-purple-primary/20 hover:border-purple-primary/40"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-purple-primary"
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          animate={{
                            rotate: -360,
                            transition: { duration: 4, repeat: Infinity, ease: "linear" }
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                      {/* Notification badge for profile */}
                      {item.id === "profile" && (
                        <motion.span
                          animate={{
                            scale: [1, 1.2, 1],
                            transition: { duration: 1.5, repeat: Infinity }
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-neon-green/50"
                        >
                          2
                        </motion.span>
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
                        isActive
                          ? "text-purple-primary"
                          : "text-gray-400 group-hover:text-purple-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
