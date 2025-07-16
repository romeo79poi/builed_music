import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Crown,
  Music,
  Download,
  Headphones,
  Star,
  Check,
  User,
  Heart,
  History,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Limited skips",
        "Ads between songs",
        "Standard audio quality",
        "Shuffle play only",
      ],
      color: "from-gray-600 to-gray-800",
      icon: Music,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited skips",
        "Ad-free listening",
        "High-quality audio",
        "Offline downloads",
        "Any song, any time",
      ],
      color: "from-neon-green to-neon-blue",
      icon: Crown,
      popular: true,
    },
    {
      id: "family",
      name: "Family",
      price: "$14.99",
      period: "per month",
      features: [
        "6 Premium accounts",
        "Family mix playlist",
        "Safe listening for kids",
        "All Premium features",
      ],
      color: "from-purple-500 to-pink-500",
      icon: Star,
    },
  ];

  const menuItems = [
    { icon: User, label: "Edit Profile", action: () => {} },
    { icon: Heart, label: "Liked Songs", action: () => {} },
    { icon: History, label: "Recently Played", action: () => {} },
    { icon: Download, label: "Downloaded Music", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: Settings, label: "Settings", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
    { icon: LogOut, label: "Log Out", action: () => navigate("/login") },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 pt-12"
        >
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
          <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Settings className="w-5 h-5" />
          </button>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 py-8 text-center"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-neon-green to-neon-blue rounded-full p-1">
              <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            {currentPlan === "premium" && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">Bio Spectra</h2>
          <p className="text-gray-400 capitalize">
            {currentPlan} Member
            {currentPlan === "premium" && " 👑"}
          </p>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-6 mb-6"
        >
          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <p className="text-gray-400 capitalize">{currentPlan}</p>
              </div>
              {currentPlan === "free" && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="px-6 py-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-full font-semibold text-black"
                >
                  Upgrade
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4" />
                <span>432 songs played</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>89 liked</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans Modal */}
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      currentPlan === plan.id
                        ? "border-neon-green bg-neon-green/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-neon-green to-neon-blue text-black px-3 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <plan.icon className="w-5 h-5" />
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-bold">
                            {plan.price}
                          </span>
                          <span className="text-sm text-gray-400">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                      {currentPlan === plan.id && (
                        <Check className="w-6 h-6 text-neon-green" />
                      )}
                    </div>

                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-neon-green" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {currentPlan !== plan.id && (
                      <button
                        onClick={() => {
                          setCurrentPlan(plan.id);
                          setShowUpgrade(false);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-neon-green to-neon-blue rounded-xl font-semibold text-black"
                      >
                        Choose {plan.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-6 space-y-2"
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 flex items-center space-x-4 hover:bg-white/10 transition-all"
            >
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-left">{item.label}</span>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="px-6 py-8 text-center text-gray-500 text-sm"
        >
          <p>Music Catch v2.1.0</p>
          <p>Made with ❤️ for music lovers</p>
        </motion.div>
      </div>
    </div>
  );
}
