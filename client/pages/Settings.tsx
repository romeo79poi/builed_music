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
  TrendingUp,
  Calendar,
  Target,
  Award,
  Star,
  Share2,
  Clock,
  MapPin,
  Headphones,
  Play,
  BarChart3,
  PieChart,
  Activity,
  Zap,
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
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

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

  // Detailed Analytics Data
  const [analyticsData] = useState({
    overview: {
      totalStreams: 45672,
      uniqueListeners: 3421,
      averagePlayTime: "3:24",
      engagement: "12.4%",
      revenue: "$342.50",
    },
    demographics: {
      topCountries: [
        { country: "United States", percentage: 35, listeners: 1197 },
        { country: "United Kingdom", percentage: 22, listeners: 753 },
        { country: "Canada", percentage: 18, listeners: 616 },
        { country: "Australia", percentage: 15, listeners: 513 },
        { country: "Germany", percentage: 10, listeners: 342 },
      ],
      ageGroups: [
        { age: "18-24", percentage: 28 },
        { age: "25-34", percentage: 45 },
        { age: "35-44", percentage: 18 },
        { age: "45+", percentage: 9 },
      ],
      genderSplit: { male: 58, female: 42 },
    },
    performance: {
      weeklyStats: [
        { week: "Week 1", streams: 1234, likes: 89 },
        { week: "Week 2", streams: 1456, likes: 102 },
        { week: "Week 3", streams: 1123, likes: 76 },
        { week: "Week 4", streams: 1890, likes: 134 },
      ],
      topTracks: [
        { title: "Midnight Dreams", plays: 8934, likes: 456 },
        { title: "Electric Nights", plays: 7621, likes: 398 },
        { title: "Ocean Waves", plays: 6754, likes: 321 },
        { title: "City Lights", plays: 5432, likes: 287 },
        { title: "Summer Vibes", plays: 4567, likes: 234 },
      ],
    },
    growth: {
      followerGrowth: [
        { month: "Jan", count: 280 },
        { month: "Feb", count: 320 },
        { month: "Mar", count: 375 },
        { month: "Apr", count: 420 },
        { month: "May", count: 456 },
      ],
      streamGrowth: "+23.5%",
      engagementGrowth: "+15.2%",
      revenueGrowth: "+18.7%",
    },
  });

  // Profile Settings
  const profileSettings = [
    {
      icon: User,
      title: "Account overview",
      subtitle: "Professional analytics and account insights",
      action: () => setShowAnalyticsModal(true),
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

        {/* Professional Analytics Modal */}
        {showAnalyticsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black rounded-3xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <SettingsIcon className="w-6 h-6 mr-3 text-neon-green" />
                  Analytics Dashboard
                </h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 rounded-xl p-4 border border-neon-green/20">
                  <div className="flex items-center justify-between mb-2">
                    <Music className="w-6 h-6 text-neon-green" />
                    <span className="text-xs text-neon-green bg-neon-green/20 px-2 py-1 rounded-full">
                      +{analyticsData.growth.streamGrowth}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.overview.totalStreams.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Streams</p>
                </div>

                <div className="bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 rounded-xl p-4 border border-neon-blue/20">
                  <div className="flex items-center justify-between mb-2">
                    <User className="w-6 h-6 text-neon-blue" />
                    <span className="text-xs text-neon-blue bg-neon-blue/20 px-2 py-1 rounded-full">
                      +{analyticsData.growth.engagementGrowth}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.overview.uniqueListeners.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Unique Listeners</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-6 h-6 text-purple-400" />
                    <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                      AVG
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.overview.averagePlayTime}
                  </p>
                  <p className="text-sm text-gray-400">Avg Play Time</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-6 h-6 text-orange-400" />
                    <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
                      RATE
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.overview.engagement}
                  </p>
                  <p className="text-sm text-gray-400">Engagement</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-6 h-6 text-green-400" />
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      +{analyticsData.growth.revenueGrowth}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.overview.revenue}
                  </p>
                  <p className="text-sm text-gray-400">Revenue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Tracks */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-neon-green" />
                    Top Performing Tracks
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.performance.topTracks.map((track, index) => (
                      <div
                        key={track.title}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-white">
                              {track.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              {track.plays.toLocaleString()} plays
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-300">
                            {track.likes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demographics */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-neon-blue" />
                    Audience Demographics
                  </h3>

                  {/* Top Countries */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-300">
                      Top Countries
                    </h4>
                    <div className="space-y-2">
                      {analyticsData.demographics.topCountries.map(
                        (country) => (
                          <div
                            key={country.country}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-300">
                              {country.country}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-neon-blue h-2 rounded-full"
                                  style={{ width: `${country.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 w-8">
                                {country.percentage}%
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Age Groups */}
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-300">
                      Age Distribution
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {analyticsData.demographics.ageGroups.map((group) => (
                        <div
                          key={group.age}
                          className="bg-white/5 rounded-lg p-3 text-center"
                        >
                          <p className="text-lg font-bold text-neon-green">
                            {group.percentage}%
                          </p>
                          <p className="text-xs text-gray-400">{group.age}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Performance */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-2 text-purple-400" />
                    Weekly Performance
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.performance.weeklyStats.map(
                      (week, index) => (
                        <div
                          key={week.week}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <span className="text-gray-300">{week.week}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Volume2 className="w-4 h-4 text-neon-green" />
                              <span className="text-sm text-white">
                                {week.streams.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-white">
                                {week.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Follower Growth */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-orange-400" />
                    Follower Growth
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.growth.followerGrowth.map((month, index) => (
                      <div
                        key={month.month}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <span className="text-gray-300">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-400 h-2 rounded-full"
                              style={{ width: `${(month.count / 500) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">
                            {month.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-lg border border-neon-green/20">
                    <p className="text-center text-sm">
                      <span className="text-neon-green font-semibold">
                        +
                        {(
                          ((analyticsData.growth.followerGrowth[4].count -
                            analyticsData.growth.followerGrowth[0].count) /
                            analyticsData.growth.followerGrowth[0].count) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                      <span className="text-gray-300">
                        {" "}
                        growth since January
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    toast({
                      title: "Analytics Export",
                      description: "Analytics report exported successfully",
                    });
                  }}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Export Report
                </button>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold rounded-xl hover:scale-105 transition-transform"
                >
                  Close Dashboard
                </button>
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
