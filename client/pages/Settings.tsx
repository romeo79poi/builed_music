import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import {
  ArrowLeft,
  Volume2,
  Download,
  Wifi,
  Globe,
  Bell,
  Lock,
  Eye,
  Smartphone,
  Moon,
  Music,
  HelpCircle,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  User,
  Key,
  UserX,
  Edit3,
  Heart,
  History,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    highQuality: true,
    autoDownload: false,
    wifiOnly: true,
    showExplicit: true,
    crossfade: true,
    normalize: false,
    twoFactorAuth: false,
    privateSession: false,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Profile Analytics State
  const [profileStats] = useState({
    profileViews: 2847,
    followers: 456,
    following: 123,
    isProfessional: true,
    monthlyListeners: 1234,
    totalPlays: 15672,
  });

  // Profile Settings
  const profileSettings = [
    {
      icon: User,
      title: "Account overview",
      subtitle: "View and manage your account details",
      action: () => navigate("/profile"),
    },
    {
      icon: Edit3,
      title: "Edit profile",
      subtitle: "Update your profile information",
      action: () => navigate("/edit-profile"),
    },
    {
      icon: Heart,
      title: "Liked Songs",
      subtitle: "View your liked songs",
      action: () => navigate("/liked-songs"),
    },
    {
      icon: History,
      title: "Recently played",
      subtitle: "View your listening history",
      action: () => navigate("/history"),
    },
  ];

  // Security & Privacy Settings
  const securitySettings = [
    {
      icon: Key,
      title: "Change password",
      subtitle: "Update your account password",
      action: () => setShowPasswordModal(true),
    },
    {
      icon: Shield,
      title: "Security & privacy",
      subtitle: "Manage your security settings",
      action: () => setShowSecurityModal(true),
    },
    {
      icon: Smartphone,
      title: "Two-factor authentication",
      subtitle: settings.twoFactorAuth ? "Enabled" : "Not enabled",
      toggle: true,
      key: "twoFactorAuth" as const,
    },
    {
      icon: Lock,
      title: "Private session",
      subtitle: "Hide your activity from friends",
      toggle: true,
      key: "privateSession" as const,
    },
  ];

  // General Settings
  const generalSettings = [
    {
      icon: Moon,
      title: "Dark Mode",
      subtitle: "Use dark theme",
      toggle: true,
      key: "darkMode" as const,
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Get updates about new music and features",
      toggle: true,
      key: "notifications" as const,
    },
    {
      icon: Globe,
      title: "Language",
      subtitle: "English",
      action: () => {
        toast({
          title: "Language Settings",
          description: "Language preferences coming soon",
        });
      },
    },
    {
      icon: Smartphone,
      title: "Devices",
      subtitle: "Manage connected devices",
      action: () => {
        toast({
          title: "Connected Devices",
          description: "Device management coming soon",
        });
      },
    },
  ];

  // Audio Settings
  const audioSettings = [
    {
      icon: Volume2,
      title: "Audio Quality",
      subtitle: settings.highQuality ? "Very High" : "Normal",
      toggle: true,
      key: "highQuality" as const,
    },
    {
      icon: Music,
      title: "Crossfade",
      subtitle: "Smooth transition between songs",
      toggle: true,
      key: "crossfade" as const,
    },
    {
      icon: Volume2,
      title: "Normalize Volume",
      subtitle: "Set the same volume level for all tracks",
      toggle: true,
      key: "normalize" as const,
    },
  ];

  // Download Settings
  const downloadSettings = [
    {
      icon: Download,
      title: "Auto Download",
      subtitle: "Download liked songs automatically",
      toggle: true,
      key: "autoDownload" as const,
    },
    {
      icon: Wifi,
      title: "Download using WiFi only",
      subtitle: "Save mobile data",
      toggle: true,
      key: "wifiOnly" as const,
    },
    {
      icon: Download,
      title: "Download Quality",
      subtitle: "High",
      action: () => {
        toast({
          title: "Download Quality",
          description: "Quality settings coming soon",
        });
      },
    },
  ];

  // Privacy Settings
  const privacySettings = [
    {
      icon: Eye,
      title: "Show Explicit Content",
      subtitle: "Allow explicit content in search and recommendations",
      toggle: true,
      key: "showExplicit" as const,
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      subtitle: "Learn how we protect your data",
      action: () => {
        toast({
          title: "Privacy Policy",
          description: "View our privacy policy",
        });
      },
    },
    {
      icon: UserX,
      title: "Data & Privacy",
      subtitle: "Control how your data is used",
      action: () => {
        toast({
          title: "Data & Privacy",
          description: "Data management coming soon",
        });
      },
    },
  ];

  // Payment Settings
  const paymentSettings = [
    {
      icon: CreditCard,
      title: "Payment information",
      subtitle: "Manage your payment methods",
      action: () => {
        toast({
          title: "Payment Information",
          description: "Payment management coming soon",
        });
      },
    },
    {
      icon: CreditCard,
      title: "Subscription",
      subtitle: "Manage your Music Catch plan",
      action: () => navigate("/profile"),
    },
  ];

  // Support Settings
  const supportSettings = [
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help with Music Catch",
      action: () => {
        toast({
          title: "Help & Support",
          description: "Contact support at help@musiccatch.com",
        });
      },
    },
    {
      icon: LogOut,
      title: "Log Out",
      subtitle: "Sign out of your account",
      action: () => {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out",
        });
        navigate("/login");
      },
      danger: true,
    },
  ];

  const SettingItem = ({
    item,
  }: {
    item: {
      icon: any;
      title: string;
      subtitle: string;
      toggle?: boolean;
      key?: keyof typeof settings;
      action?: () => void;
      danger?: boolean;
    };
  }) => (
    <div
      className={`flex items-center justify-between p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 ${
        item.action ? "cursor-pointer hover:bg-white/10" : ""
      } transition-all`}
      onClick={item.action}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            item.danger
              ? "bg-red-500/20 text-red-400"
              : "bg-neon-green/20 text-neon-green"
          }`}
        >
          <item.icon className="w-5 h-5" />
        </div>
        <div>
          <h3
            className={`font-medium ${
              item.danger ? "text-red-400" : "text-white"
            }`}
          >
            {item.title}
          </h3>
          <p className="text-gray-400 text-sm">{item.subtitle}</p>
        </div>
      </div>
      {item.toggle && item.key ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSetting(item.key!);
          }}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings[item.key] ? "bg-neon-green" : "bg-gray-600"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings[item.key] ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );

  const SettingSection = ({
    title,
    items,
  }: {
    title: string;
    items: any[];
  }) => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="text-lg font-bold mb-4 px-1">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <SettingItem key={item.title} item={item} />
        ))}
      </div>
    </motion.section>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 pt-12"
        >
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="w-10 h-10"></div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-6 pb-8">
          <SettingSection title="Profile" items={profileSettings} />

          {/* Professional Account Analytics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-lg font-bold mb-4 px-1">
              Professional Analytics
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Profile Views</p>
                    <p className="text-2xl font-bold text-neon-green">
                      {profileStats.profileViews.toLocaleString()}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-neon-green/60" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+12% this month</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Followers</p>
                    <p className="text-2xl font-bold text-neon-blue">
                      {profileStats.followers.toLocaleString()}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-neon-blue/60" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+8 this week</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Monthly Listeners</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {profileStats.monthlyListeners.toLocaleString()}
                    </p>
                  </div>
                  <Music className="w-8 h-8 text-purple-400/60" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+15% growth</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Plays</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {profileStats.totalPlays.toLocaleString()}
                    </p>
                  </div>
                  <Volume2 className="w-8 h-8 text-orange-400/60" />
                </div>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
            </div>

            {/* Professional Account Management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-neon-green to-neon-blue">
                    <Shield className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      Professional Account
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {profileStats.isProfessional
                        ? "Active - Enhanced analytics enabled"
                        : "Upgrade for advanced features"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {profileStats.isProfessional && (
                    <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full">
                      PRO
                    </span>
                  )}
                  <button
                    onClick={() => {
                      toast({
                        title: "Professional Account",
                        description: profileStats.isProfessional
                          ? "Professional features are active"
                          : "Upgrade to unlock advanced analytics and features",
                      });
                    }}
                    className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg text-sm hover:bg-neon-green/30 transition-colors"
                  >
                    {profileStats.isProfessional ? "Manage" : "Upgrade"}
                  </button>
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => {
                  toast({
                    title: "Follower Analytics",
                    description: "Detailed follower insights and growth trends",
                  });
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-neon-blue/20 text-neon-blue">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      Follower Management
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Manage followers and following ({profileStats.following}{" "}
                      following)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => {
                  toast({
                    title: "Analytics Dashboard",
                    description:
                      "View detailed insights about your music and audience",
                  });
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-400">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      Advanced Analytics
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Detailed insights and performance metrics
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </motion.section>

          <SettingSection title="Security & Privacy" items={securitySettings} />
          <SettingSection title="General" items={generalSettings} />
          <SettingSection title="Audio" items={audioSettings} />
          <SettingSection title="Downloads" items={downloadSettings} />
          <SettingSection title="Privacy" items={privacySettings} />
          <SettingSection title="Payment" items={paymentSettings} />
          <SettingSection title="Support" items={supportSettings} />

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-gray-500 text-sm"
          >
            <p>Music Catch v2.1.0</p>
            <p>Build 2024.01.15</p>
            <p className="mt-2">Made with ❤️ for music lovers</p>
          </motion.div>
        </div>

        {/* Security Modal */}
        {showSecurityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black rounded-3xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-neon-green" />
                  Security & Privacy
                </h2>
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="font-semibold">Password</h3>
                        <p className="text-sm text-gray-400">
                          Last changed 3 months ago
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowSecurityModal(false);
                        setShowPasswordModal(true);
                      }}
                      className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg text-sm hover:bg-neon-green/30 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-green-400" />
                      <div>
                        <h3 className="font-semibold">
                          Two-factor authentication
                        </h3>
                        <p className="text-sm text-gray-400">
                          {settings.twoFactorAuth ? "Enabled" : "Not enabled"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting("twoFactorAuth")}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        settings.twoFactorAuth
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-neon-green/20 text-neon-green hover:bg-neon-green/30"
                      }`}
                    >
                      {settings.twoFactorAuth ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserX className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="font-semibold">Data & Privacy</h3>
                        <p className="text-sm text-gray-400">
                          Manage your data
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black rounded-3xl p-6 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Key className="w-6 h-6 mr-3 text-neon-blue" />
                  Change Password
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Password requirements:</strong>
                    <br />• At least 8 characters long
                    <br />• Contains uppercase and lowercase letters
                    <br />• Contains at least one number
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Password Changed",
                        description:
                          "Your password has been updated successfully",
                      });
                      setShowPasswordModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold rounded-xl hover:scale-105 transition-transform"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
