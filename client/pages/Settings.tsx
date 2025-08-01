import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Camera,
  Bell,
  Shield,
  Palette,
  Download,
  Volume2,
  Headphones,
  Smartphone,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  Trash2,
  Edit3,
  Save,
  X,
  Check,
  AlertTriangle,
  Settings as SettingsIcon,
  Globe,
  HelpCircle,
  Star,
  Share,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MobileFooter from "../components/MobileFooter";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, actualTheme, setTheme } = useTheme();

  // User data state
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    joinDate: "January 2024",
    premium: true,
  });

  // Settings state
  const [settings, setSettings] = useState({
    darkTheme: true,
    notifications: true,
    autoDownload: true,
    highQuality: true,
    offlineMode: true,
    publicProfile: true,
    showActivity: true,
    autoPlay: true,
    crossfade: true,
    normalization: true,
    language: "English",
    region: "United States",
  });



  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);

  // Edit account states
  const [editAccountForm, setEditAccountForm] = useState({
    email: userProfile.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      items: [
        {
          key: "editAccount",
          label: "Edit Account",
          icon: Edit3,
          action: () => setShowEditAccountModal(true),
          description: "Change email and password",
        },
        // Only show subscription section if user has premium
        ...(userProfile.premium ? [{
          key: "subscription",
          label: "Premium Subscription",
          icon: Star,
          action: () => navigate("/premium-dashboard"),
          description: "Manage your premium membership",
          badge: "PREMIUM",
          isPremium: true,
        }] : []),
        {
          key: "privacy",
          label: "Privacy Settings",
          icon: Shield,
          action: () => {},
          description: "Control who can see your activity",
        },
      ],
    },
    {
      title: "Audio & Playback",
      icon: Volume2,
      items: [
        {
          key: "highQuality",
          label: "High Quality Audio",
          icon: Headphones,
          toggle: true,
          value: settings.highQuality,
          description: "Stream music in higher quality",
        },
        {
          key: "autoPlay",
          label: "Autoplay",
          icon: Volume2,
          toggle: true,
          value: settings.autoPlay,
          description: "Automatically play similar songs when your music ends",
        },
        {
          key: "crossfade",
          label: "Crossfade",
          icon: Volume2,
          toggle: true,
          value: settings.crossfade,
          description: "Smooth transition between songs",
        },
        {
          key: "normalization",
          label: "Audio Normalization",
          icon: Volume2,
          toggle: true,
          value: settings.normalization,
          description: "Set the same volume level for all tracks",
        },
      ],
    },
    {
      title: "App Preferences",
      icon: SettingsIcon,
      items: [
        {
          key: "theme",
          label: "Appearance",
          icon: actualTheme === "dark" ? Moon : Sun,
          description: `Switch between light and dark theme`,
          action: () => {},
          customComponent: true,
        },
        {
          key: "notifications",
          label: "Push Notifications",
          icon: Bell,
          toggle: true,
          value: settings.notifications,
          description: "Get notified about new releases and updates",
        },
        {
          key: "autoDownload",
          label: "Auto Download",
          icon: Download,
          toggle: true,
          value: settings.autoDownload,
          description:
            "Automatically download liked songs for offline listening",
        },
        {
          key: "language",
          label: "Language",
          icon: Globe,
          action: () => {},
          description: settings.language,
        },
      ],
    },
    {
      title: "Social",
      icon: Share,
      items: [
        {
          key: "publicProfile",
          label: "Public Profile",
          icon: User,
          toggle: true,
          value: settings.publicProfile,
          description: "Make your profile visible to other users",
        },
        {
          key: "showActivity",
          label: "Show Activity",
          icon: User,
          toggle: true,
          value: settings.showActivity,
          description: "Let others see what you're listening to",
        },
      ],
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        {
          key: "help",
          label: "Help Center",
          icon: HelpCircle,
          action: () => {},
          description: "Get help and find answers",
        },
        {
          key: "feedback",
          label: "Send Feedback",
          icon: Share,
          action: () => {},
          description: "Share your thoughts about the app",
        },
        {
          key: "about",
          label: "About Catch",
          icon: SettingsIcon,
          action: () => {},
          description: "Version 1.0.0",
        },
      ],
    },
  ];

  const handleToggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));

    toast({
      title: "Setting Updated",
      description: `${key} has been ${settings[key as keyof typeof settings] ? "disabled" : "enabled"}`,
    });
  };



  const handleLogout = () => {
    // Add logout logic here
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    // Add delete account logic here
    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted",
      variant: "destructive",
    });
    navigate("/login");
  };

  const handleSaveAccountChanges = () => {
    // Validate passwords match
    if (editAccountForm.newPassword && editAccountForm.newPassword !== editAccountForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    // Validate current password (in real app, this would be verified against backend)
    if (editAccountForm.newPassword && !editAccountForm.currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required to change password",
        variant: "destructive",
      });
      return;
    }

    // Update user profile
    setUserProfile(prev => ({
      ...prev,
      email: editAccountForm.email,
    }));

    setShowEditAccountModal(false);

    toast({
      title: "Account Updated",
      description: "Your account details have been updated successfully",
    });

    // Reset form
    setEditAccountForm({
      email: editAccountForm.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-purple-dark to-background dark:from-purple-darker dark:via-purple-dark dark:to-background light:from-gray-50 light:via-white light:to-purple-50 text-white dark:text-white light:text-gray-900 relative overflow-hidden theme-transition">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/8 via-purple-secondary/4 to-purple-accent/6 dark:from-purple-primary/8 dark:via-purple-secondary/4 dark:to-purple-accent/6 light:from-purple-primary/3 light:via-purple-secondary/2 light:to-purple-accent/3 theme-transition"></div>

      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-24 h-24 border border-purple-primary/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-purple-secondary/20 rounded-full"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 bg-black/20 dark:bg-black/20 light:bg-white/80 backdrop-blur-xl border-b border-purple-primary/20 theme-transition"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-purple-dark/50 backdrop-blur-sm flex items-center justify-center border border-purple-primary/30"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          <h1 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
            Settings
          </h1>

          <div className="w-10 h-10"></div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32">
          {/* Profile Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            <div className="bg-gradient-to-r from-purple-dark/40 to-purple-primary/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-primary/30">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={userProfile.profileImage}
                    alt={userProfile.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-neon-green/50"
                  />
                  {userProfile.premium && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 text-white fill-current" />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">
                    {userProfile.name}
                  </h2>
                  <p className="text-gray-400">{userProfile.email}</p>
                  <p className="text-sm text-purple-primary">
                    Member since {userProfile.joinDate}
                  </p>
                </div>


              </div>
            </div>
          </motion.section>

          {/* Settings Sections */}
          <div className="px-6 space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <motion.section
                key={section.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + sectionIndex * 0.1 }}
                className="bg-purple-dark/30 backdrop-blur-sm rounded-2xl border border-purple-primary/20 overflow-hidden"
              >
                <div className="p-4 border-b border-purple-primary/20">
                  <div className="flex items-center space-x-3">
                    <section.icon className="w-5 h-5 text-purple-primary" />
                    <h3 className="text-lg font-semibold text-white">
                      {section.title}
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-purple-primary/10">
                  {section.items.map((item) => (
                    <motion.div
                      key={item.key}
                      whileHover={{
                        backgroundColor: item.isPremium ? "rgba(251, 191, 36, 0.1)" : "rgba(158, 64, 252, 0.1)",
                      }}
                      className={`p-4 transition-all ${
                        item.isPremium
                          ? "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-l-4 border-yellow-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-white">
                                {item.label}
                              </h4>
                              {item.badge && (
                                <motion.span
                                  animate={{
                                    boxShadow: ["0 0 0 0 rgba(251, 191, 36, 0.4)", "0 0 0 6px rgba(251, 191, 36, 0)", "0 0 0 0 rgba(251, 191, 36, 0.4)"]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 text-black rounded-full shadow-lg flex items-center space-x-1"
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{item.badge}</span>
                                </motion.span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {item.key === "theme" && item.customComponent ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const newTheme = actualTheme === "dark" ? "light" : "dark";
                              setTheme(newTheme);
                              toast({
                                title: "Theme Changed",
                                description: `Switched to ${newTheme} mode`,
                              });
                            }}
                            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                              actualTheme === "dark"
                                ? "bg-gradient-to-r from-purple-primary to-purple-secondary shadow-lg shadow-purple-primary/30"
                                : "bg-gray-600"
                            }`}
                          >
                            <motion.div
                              animate={{ x: actualTheme === "dark" ? 32 : 2 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                              className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ${
                                actualTheme === "dark"
                                  ? "bg-white shadow-lg"
                                  : "bg-white"
                              } flex items-center justify-center`}
                            >
                              {actualTheme === "dark" ? (
                                <Moon className="w-3 h-3 text-purple-primary" />
                              ) : (
                                <Sun className="w-3 h-3 text-orange-500" />
                              )}
                            </motion.div>
                          </motion.button>
                        ) : item.toggle ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleSetting(item.key)}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              item.value ? "bg-gradient-to-r from-purple-primary to-purple-secondary shadow-lg shadow-purple-primary/30" : "bg-gray-600"
                            }`}
                          >
                            <motion.div
                              animate={{ x: item.value ? 24 : 2 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full"
                            />
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.action}
                            className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Danger Zone */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-red-400 mb-4">
              <p>
                <br />
              </p>
            </h3>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLogoutModal(true)}
              className="w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-medium flex items-center justify-center space-x-2 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </motion.button>


          </motion.section>
        </main>



        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-purple-dark to-purple-darker border border-purple-primary/30 rounded-2xl p-6 w-full max-w-md"
              >
                <div className="text-center">
                  <LogOut className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Log Out</h3>
                  <p className="text-gray-400 mb-6">
                    Are you sure you want to log out of your account?
                  </p>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="flex-1 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-medium"
                    >
                      Log Out
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Account Modal */}
        <AnimatePresence>
          {showEditAccountModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-purple-dark to-purple-darker border border-purple-primary/30 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Edit Account</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditAccountModal(false)}
                    className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={editAccountForm.email}
                        onChange={(e) => setEditAccountForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60 transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={editAccountForm.currentPassword}
                        onChange={(e) => setEditAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60 transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={editAccountForm.newPassword}
                        onChange={(e) => setEditAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60 transition-colors"
                        placeholder="Enter new password (optional)"
                      />
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  {editAccountForm.newPassword && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={editAccountForm.confirmPassword}
                          onChange={(e) => setEditAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60 transition-colors"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEditAccountModal(false)}
                    className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveAccountChanges}
                    className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-purple-dark to-purple-darker border border-red-500/50 rounded-2xl p-6 w-full max-w-md"
              >
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Delete Account
                  </h3>
                  <p className="text-gray-400 mb-6">
                    This action cannot be undone. This will permanently delete
                    your account and all your data.
                  </p>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteAccount}
                      className="flex-1 p-3 bg-red-600/20 border border-red-600/50 rounded-xl text-red-500 font-medium"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
    </div>
  );
}
