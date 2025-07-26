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
      className={`fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-purple-primary/30 z-50 ${className}`}
    >
      {/* Mobile Safe Area */}
      <div className="px-3 py-2" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeItem?.id === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center py-1 px-2 min-w-0 flex-1"
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center transition-all duration-200 group"
                >
                  {/* Icon Container */}
                  <motion.div
                    animate={isActive ? {
                      boxShadow: [
                        "0 0 0px rgba(34, 197, 94, 0.3)",
                        "0 0 15px rgba(34, 197, 94, 0.5)",
                        "0 0 0px rgba(34, 197, 94, 0.3)"
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-neon-green/20 border border-neon-green/50"
                        : "hover:bg-purple-primary/20 group-hover:border group-hover:border-purple-primary/40"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                        isActive
                          ? "text-neon-green"
                          : "text-gray-400 group-hover:text-purple-primary"
                      }`}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className={`text-[10px] sm:text-xs mt-1 font-medium transition-colors duration-300 truncate max-w-full leading-tight ${
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
      </div>
      
      {/* iOS Home Indicator Safe Area */}
      <div className="h-safe-bottom bg-black/95"></div>
    </motion.footer>
  );
}
