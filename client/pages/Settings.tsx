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
import { settingsApi } from "../lib/api";
import { useFirebase } from "../context/FirebaseContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, actualTheme, setTheme } = useTheme();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();

  // User data state - will be loaded from backend
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    email: "Loading...",
    profileImage: "",
    joinDate: "Loading...",
    premium: false,
  });
  const [loading, setLoading] = useState(true);

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

  // Load user profile and settings when Firebase user is available
  useEffect(() => {
    if (!firebaseLoading && firebaseUser) {
      loadUserData();
      loadUserSettings();
    } else if (!firebaseLoading && !firebaseUser) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [firebaseUser, firebaseLoading]);

  const loadUserData = async () => {
    try {
      if (!firebaseUser) {
        console.log("❌ No Firebase user found");
        setLoading(false);
        return;
      }

      console.log("🔥 Loading user data for Firebase user:", firebaseUser.email);
      console.log("🔥 Firebase user UID:", firebaseUser.uid);
      console.log("🔥 Firebase user metadata:", firebaseUser.metadata);

      // Enhanced Firebase user data
      const firebaseProfile = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
        email: firebaseUser.email || "No email",
        profileImage: firebaseUser.photoURL || `https://ui-avatars.io/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User')}&background=6366f1&color=fff&size=64`,
        joinDate: firebaseUser.metadata.creationTime
          ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : "Unknown",
        premium: false,
        firebaseUid: firebaseUser.uid,
        emailVerified: firebaseUser.emailVerified,
        lastSignIn: firebaseUser.metadata.lastSignInTime
          ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleDateString()
          : "Unknown",
      };

      // Set Firebase profile immediately for better UX
      setUserProfile(firebaseProfile);
      console.log("✅ Firebase profile data loaded:", firebaseProfile);

      // Try to sync with backend or create user profile
      try {
        // First, try to get existing profile
        const getResponse = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
          headers: {
            "user-id": firebaseUser.uid,
            "Content-Type": "application/json",
          },
        });

        if (getResponse.ok) {
          const result = await getResponse.json();
          if (result.success && result.data) {
            const backendData = result.data;
            const enhancedProfile = {
              ...firebaseProfile,
              name: backendData.display_name || backendData.name || firebaseProfile.name,
              profileImage: backendData.profile_image_url || firebaseProfile.profileImage,
              premium: backendData.premium || false,
              joinDate: backendData.created_at
                ? new Date(backendData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : firebaseProfile.joinDate,
            };
            setUserProfile(enhancedProfile);
            console.log("✅ Enhanced profile from backend:", enhancedProfile);
            return;
          }
        }

        // If backend fetch fails or user doesn't exist, try to create/sync user
        console.log("🔥 Creating/syncing user profile with backend...");
        const syncResponse = await fetch('/api/v1/users/sync', {
          method: 'POST',
          headers: {
            "user-id": firebaseUser.uid,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            profile_image_url: firebaseUser.photoURL,
            email_verified: firebaseUser.emailVerified,
          }),
        });

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          console.log("✅ User synced with backend:", syncResult);
        }
      } catch (error) {
        console.error("⚠️ Backend sync failed (using Firebase data only):", error);
        // Continue with Firebase-only data
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      toast({
        title: "Error Loading Profile",
        description: "Failed to load user profile. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      if (!firebaseUser) return;

      console.log("🔥 Loading settings for Firebase user:", firebaseUser.uid);

      // Try to load from localStorage first (Firebase user-specific)
      const localStorageKey = `firebase_settings_${firebaseUser.uid}`;
      const cachedSettings = localStorage.getItem(localStorageKey);

      if (cachedSettings) {
        try {
          const parsed = JSON.parse(cachedSettings);
          setSettings(parsed);
          console.log("✅ Loaded cached settings for Firebase user:", parsed);
        } catch (error) {
          console.error("Failed to parse cached settings:", error);
        }
      }

      // Try to load from backend API
      try {
        const userSettings = await settingsApi.getUserSettings();
        if (userSettings) {
          const backendSettings = {
            darkTheme: userSettings.theme === "dark",
            notifications: userSettings.notifications?.email !== false,
            autoDownload: userSettings.playback?.autoDownload !== false,
            highQuality: userSettings.playback?.highQuality !== false,
            offlineMode: userSettings.playback?.offlineMode !== false,
            publicProfile: userSettings.privacy?.publicProfile !== false,
            showActivity: userSettings.privacy?.showActivity !== false,
            autoPlay: userSettings.playback?.autoPlay !== false,
            crossfade: userSettings.playback?.crossfade !== false,
            normalization: userSettings.playback?.normalization !== false,
            language: userSettings.language || "English",
            region: userSettings.region || "United States",
          };

          setSettings(backendSettings);
          // Cache to localStorage
          localStorage.setItem(localStorageKey, JSON.stringify(backendSettings));
          console.log("✅ Loaded and cached user settings from backend:", backendSettings);
        }
      } catch (error) {
        console.error("⚠️ Backend settings fetch failed:", error);
        // If backend fails but we have cached settings, that's fine
        if (!cachedSettings) {
          // Only set defaults if we have no cached data
          const defaultSettings = {
            darkTheme: true,
            notifications: true,
            autoDownload: false,
            highQuality: true,
            offlineMode: false,
            publicProfile: true,
            showActivity: true,
            autoPlay: true,
            crossfade: false,
            normalization: true,
            language: "English",
            region: "United States",
          };
          setSettings(defaultSettings);
          localStorage.setItem(localStorageKey, JSON.stringify(defaultSettings));
          console.log("✅ Using default settings for Firebase user:", defaultSettings);
        }
      }
    } catch (error) {
      console.error("❌ Error loading settings:", error);
    }
  };

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      items: [
        {
          key: "editAccount",
          label: "Edit Account",
          icon: Edit3,
          action: () => navigate("/edit-account"),
          description: "Edit detailed account information",
        },
        // Only show subscription section if user has premium
        ...(userProfile.premium
          ? [
              {
                key: "subscription",
                label: "Premium Subscription",
                icon: Star,
                action: () => navigate("/premium-dashboard"),
                description: "Manage your premium membership",
                badge: "PREMIUM",
                isPremium: true,
              },
            ]
          : []),
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

  const handleToggleSetting = async (key: string) => {
    const newValue = !settings[key as keyof typeof settings];

    // Update local state immediately for responsiveness
    setSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      if (firebaseUser) {
        // Save to localStorage immediately (Firebase user-specific)
        const localStorageKey = `firebase_settings_${firebaseUser.uid}`;
        const updatedSettings = { ...settings, [key]: newValue };
        localStorage.setItem(localStorageKey, JSON.stringify(updatedSettings));
        console.log("🔥 Cached setting for Firebase user:", key, newValue);

        // Try to update backend
        try {
          let updateData: any = {};

          // Map settings to backend format
          if (key === "notifications") {
            updateData = { notifications: { email: newValue } };
          } else if (
            [
              "autoDownload",
              "highQuality",
              "offlineMode",
              "autoPlay",
              "crossfade",
              "normalization",
            ].includes(key)
          ) {
            updateData = { playback: { [key]: newValue } };
          } else if (["publicProfile", "showActivity"].includes(key)) {
            updateData = { privacy: { [key]: newValue } };
          } else if (key === "darkTheme") {
            updateData = { theme: newValue ? "dark" : "light" };
          } else {
            updateData = { [key]: newValue };
          }

          await settingsApi.updateUserSettings(updateData);
          console.log("✅ Updated setting on backend:", key, newValue);
        } catch (backendError) {
          console.warn("⚠️ Backend update failed, but setting cached locally:", backendError);
          // Don't revert since we have local cache
        }
      }

      toast({
        title: "Setting Updated",
        description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${newValue ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("❌ Error updating setting:", error);
      // Revert local state on error
      setSettings((prev) => ({
        ...prev,
        [key]: !newValue,
      }));

      toast({
        title: "Update Failed",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear any remaining local storage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userAvatar");

      console.log("✅ User logged out successfully from Firebase");

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      console.error("❌ Firebase logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
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
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">
                      {loading ? "Loading..." : userProfile.name}
                    </h2>
                    {firebaseUser && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-500 font-medium">
                          Connected
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400">{userProfile.email}</p>
                  <div className="flex items-center space-x-3 text-sm">
                    <p className="text-purple-primary">
                      Member since {userProfile.joinDate}
                    </p>
                    {firebaseUser?.emailVerified && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                  {firebaseUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {firebaseUser.uid.substring(0, 8)}...
                    </p>
                  )}
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
                        backgroundColor: item.isPremium
                          ? "rgba(251, 191, 36, 0.1)"
                          : "rgba(158, 64, 252, 0.1)",
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
                                    boxShadow: [
                                      "0 0 0 0 rgba(251, 191, 36, 0.4)",
                                      "0 0 0 6px rgba(251, 191, 36, 0)",
                                      "0 0 0 0 rgba(251, 191, 36, 0.4)",
                                    ],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
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
                              const newTheme =
                                actualTheme === "dark" ? "light" : "dark";
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
                              item.value
                                ? "bg-gradient-to-r from-purple-primary to-purple-secondary shadow-lg shadow-purple-primary/30"
                                : "bg-gray-600"
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
