import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Music,
  Search as SearchIcon,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MoreHorizontal,
} from "lucide-react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("MOODS");

  const tabs = ["MOODS", "MODEMS", "CATGOIRS", "MAUIO", "NIFAUDS"];

  const quickSearchButtons = [
    { icon: "🔍", label: "Search" },
    { icon: "⏹️", label: "Stop" },
    { icon: "💲", label: "Price" },
    { icon: "🎵", label: "Music" },
    { icon: "➕", label: "Add" },
    { icon: "📱", label: "Mobile" },
    { icon: "🌐", label: "Web" },
    { icon: "⚪", label: "Circle" },
    { icon: "▶️", label: "Play", highlight: true },
    { icon: "⏸️", label: "Pause" },
  ];

  const searchCategories = [
    {
      title: "Genres",
      icon: "🎵",
      bgColor: "bg-white",
      textColor: "text-black",
    },
    {
      title: "Moods",
      icon: "🎵",
      bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
      textColor: "text-white",
    },
    {
      title: "Artists",
      icon: "🎵",
      bgColor: "bg-white",
      textColor: "text-black",
    },
    {
      title: "Artists",
      icon: "🎨",
      bgColor: "bg-gradient-to-br from-pink-500 to-purple-600",
      textColor: "text-white",
    },
  ];

  const moodResults = [
    {
      id: 1,
      title: "Leek Mius",
      artist: "Clator SI",
      category: "Moods",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      title: "Fleil Nong",
      artist: "Mutsis Oln",
      category: "Rooylos",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  const categories = [
    {
      title: "Bodes",
      subtitle: "Qocli lonc omaloi gycls & plo scpoin ils olmol gormat.",
      count: "6063",
      bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      title: "Afctolns",
      subtitle: "Alcsttc icck rcnc nolc noudclng yclotı.",
      count: "dtos",
      bgColor: "bg-gradient-to-br from-pink-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <Link to="/home">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <Music className="w-6 h-6 text-pink-400" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-slate-400 rounded"></div>
            <div className="w-6 h-6 bg-slate-400 rounded"></div>
            <div className="w-6 h-6 bg-slate-400 rounded"></div>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 overflow-y-auto">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Search
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="flex items-center space-x-2 mb-6"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Catch"
                className="w-full h-12 bg-white rounded-full pl-12 pr-4 text-black placeholder-slate-500 focus:outline-none"
              />
              <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <SearchIcon className="w-5 h-5 text-white" />
            </button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex space-x-6 mb-6 overflow-x-auto"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  selectedTab === tab
                    ? "text-white border-white"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          {/* Quick Search Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {quickSearchButtons.map((button, index) => (
              <button
                key={index}
                className={`h-10 px-4 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  button.highlight
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {button.label}
              </button>
            ))}
          </motion.div>

          {/* Popular Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Popular Search</h2>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
                <span className="text-white text-sm">♪</span>
                <span className="text-white text-sm">#</span>
                <span className="text-white text-sm">♪</span>
              </div>
            </div>

            {/* Search Categories Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {searchCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  className={`aspect-square rounded-2xl ${category.bgColor} ${category.textColor} flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <span className="font-medium">{category.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-4 mb-6"
          >
            {moodResults.map((result, index) => (
              <div
                key={result.id}
                className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-purple-400 text-sm font-medium">
                    {result.category}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center">
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{result.title}</h3>
                    <p className="text-slate-400 text-sm">{result.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SkipBack className="w-4 h-4 text-slate-400" />
                    <SkipBack className="w-4 h-4 text-slate-400" />
                    <Music className="w-4 h-4 text-slate-400" />
                    <Music className="w-4 h-4 text-slate-400" />
                    <SkipForward className="w-4 h-4 text-slate-400" />
                    <Pause className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Categories</h2>
              <button className="px-4 py-1 bg-purple-600 rounded-full text-white text-sm">
                CPFUACR
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Genriess</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                  className={`${category.bgColor} rounded-2xl p-4 text-white cursor-pointer hover:scale-105 transition-transform`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{category.title}</h4>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center mr-2">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs">{category.count}</span>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {category.subtitle}
                  </p>
                  <div className="mt-3 text-xs">
                    <span>mil ol lop</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
