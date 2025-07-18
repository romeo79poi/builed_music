import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  Sun,
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
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
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
      icon: UserX,
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
      action: () => {},
    },
    {
      icon: Smartphone,
      title: "Devices",
      subtitle: "Manage connected devices",
      action: () => {},
    },
  ];

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
      action: () => {},
    },
  ];

  const privacySettings = [
    {
      icon: Eye,
      title: "Show Explicit Content",
      subtitle: "Allow explicit content in search and recommendations",
      toggle: true,
      key: "showExplicit" as const,
    },
    {
      icon: Lock,
      title: "Private Session",
      subtitle: "Hide your activity from friends",
      action: () => {},
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      subtitle: "Learn how we protect your data",
      action: () => {},
    },
  ];

  const accountSettings = [
    {
      icon: User,
      title: "Account Information",
      subtitle: "Update your profile and preferences",
      action: () => navigate("/profile"),
    },
    {
      icon: CreditCard,
      title: "Subscription",
      subtitle: "Manage your Music Catch plan",
      action: () => navigate("/profile"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help with Music Catch",
      action: () => {},
    },
    {
      icon: LogOut,
      title: "Log Out",
      subtitle: "Sign out of your account",
      action: () => navigate("/login"),
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
          className="flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-sm sticky top-0 z-20"
        >
          <Link to="/profile">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="w-6 h-6"></div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-6 pb-8">
          <SettingSection title="General" items={generalSettings} />
          <SettingSection title="Audio" items={audioSettings} />
          <SettingSection title="Downloads" items={downloadSettings} />
          <SettingSection title="Privacy" items={privacySettings} />
          <SettingSection title="Account" items={accountSettings} />

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
      </div>
    </div>
  );
}
