import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Music, Heart, Play, Star, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export const ThemeDemo: React.FC = () => {
  const { theme, actualTheme } = useTheme();

  const demoCards = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "Alex Johnson",
      plays: "2.4M",
      likes: "45K",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    },
    {
      id: 2,
      title: "Summer Vibes",
      artist: "Luna Wave",
      plays: "1.8M",
      likes: "32K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    },
    {
      id: 3,
      title: "Electronic Pulse",
      artist: "Beat Master",
      plays: "3.2M",
      likes: "67K",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-purple-dark to-background dark:from-purple-darker dark:via-purple-dark dark:to-background light:from-gray-50 light:via-white light:to-purple-50 relative overflow-hidden theme-transition">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/8 via-purple-secondary/4 to-purple-accent/6 dark:from-purple-primary/8 dark:via-purple-secondary/4 dark:to-purple-accent/6 light:from-purple-primary/3 light:via-purple-secondary/2 light:to-purple-accent/3 theme-transition"></div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
              Theme Demo
            </h1>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
              Current theme: <span className="font-medium capitalize text-purple-accent">{theme}</span> 
              {theme === 'system' && <span className="text-sm"> (using {actualTheme})</span>}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle size="lg" showLabel />
          </div>
        </div>

        {/* Theme Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl border theme-transition ${
              theme === 'light' 
                ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/30' 
                : 'bg-purple-dark/30 border-purple-primary/20'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-yellow-400' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900">Light Mode</h3>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              Clean, bright interface for daytime use
            </p>
            {theme === 'light' && (
              <div className="mt-3 px-3 py-1 bg-yellow-400/20 rounded-full">
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Active</span>
              </div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl border theme-transition ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 border-blue-400/30' 
                : 'bg-purple-dark/30 border-purple-primary/20'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900">Dark Mode</h3>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              Easy on the eyes for nighttime listening
            </p>
            {theme === 'dark' && (
              <div className="mt-3 px-3 py-1 bg-blue-400/20 rounded-full">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Active</span>
              </div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl border theme-transition ${
              theme === 'system' 
                ? 'bg-gradient-to-r from-purple-400/20 to-pink-400/20 border-purple-400/30' 
                : 'bg-purple-dark/30 border-purple-primary/20'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-purple-400' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900">System</h3>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
              Automatically follows your device settings
            </p>
            {theme === 'system' && (
              <div className="mt-3 px-3 py-1 bg-purple-400/20 rounded-full">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Active</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sample Music Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
            Sample Music Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-purple-dark/30 dark:bg-purple-dark/30 light:bg-white light:border light:border-purple-primary/10 light:light-shadow-lg rounded-2xl p-4 border border-purple-primary/20 hover:border-purple-primary/40 transition-all theme-transition"
              >
                <div className="relative mb-4">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-neon-green to-purple-secondary rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </motion.button>
                </div>
                
                <h3 className="font-semibold text-white dark:text-white light:text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-3">
                  {card.artist}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-400 light:text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{card.plays}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-400 light:text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span>{card.likes}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-purple-primary/20 text-purple-primary hover:bg-purple-primary hover:text-white transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="bg-purple-dark/30 dark:bg-purple-dark/30 light:bg-white light:border light:border-purple-primary/10 light:light-shadow-lg rounded-2xl p-6 border border-purple-primary/20 theme-transition">
          <h2 className="text-xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
            Theme Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900 mb-2">
                🌟 Automatic Detection
              </h3>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-4">
                Automatically detects and follows your system's theme preference when set to "System" mode.
              </p>
              
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900 mb-2">
                🎨 Smooth Transitions
              </h3>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                Elegant 0.3s transitions between themes for a polished user experience.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900 mb-2">
                💾 Persistent Settings
              </h3>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-4">
                Your theme preference is saved in localStorage and restored on app reload.
              </p>
              
              <h3 className="font-semibold text-white dark:text-white light:text-gray-900 mb-2">
                📱 Responsive Design
              </h3>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                Optimized for both desktop and mobile devices with touch-friendly controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
