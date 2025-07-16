import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Play,
  Clock,
  Calendar,
  TrendingUp,
  Music,
  Heart,
  User,
  Home,
  Library,
} from "lucide-react";

export default function History() {
  const [activeTab, setActiveTab] = useState("Recent");
  const [timeFilter, setTimeFilter] = useState("Today");

  const tabs = ["Recent", "This Week", "This Month", "All Time"];
  const timeFilters = ["Today", "Yesterday", "This Week", "This Month"];

  const listeningHistory = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      playedAt: "2 minutes ago",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
      isLiked: true,
      playCount: 12,
    },
    {
      id: 2,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: "2:54",
      playedAt: "15 minutes ago",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      isLiked: false,
      playCount: 8,
    },
    {
      id: 3,
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23",
      playedAt: "32 minutes ago",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      isLiked: true,
      playCount: 15,
    },
    {
      id: 4,
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: "2:58",
      playedAt: "1 hour ago",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
      isLiked: false,
      playCount: 6,
    },
    {
      id: 5,
      title: "Stay",
      artist: "The Kid LAROI, Justin Bieber",
      album: "F*CK LOVE 3+",
      duration: "2:21",
      playedAt: "2 hours ago",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
      isLiked: true,
      playCount: 9,
    },
  ];

  const stats = [
    {
      label: "Total Listening Time",
      value: "47h 23m",
      change: "+12%",
      icon: Clock,
      color: "text-neon-green",
    },
    {
      label: "Songs Played",
      value: "432",
      change: "+8%",
      icon: Music,
      color: "text-neon-blue",
    },
    {
      label: "Artists Discovered",
      value: "18",
      change: "+25%",
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      label: "Favorite Genre",
      value: "Pop",
      change: "45%",
      icon: Heart,
      color: "text-pink-400",
    },
  ];

  const topArtists = [
    {
      name: "The Weeknd",
      plays: 45,
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    },
    {
      name: "Dua Lipa",
      plays: 38,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      name: "Harry Styles",
      plays: 32,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

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
          <Link to="/home">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold">Listening History</h1>
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-gray-400" />
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 md:px-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4">This Week's Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-neon-green">{stat.change}</span>
                </div>
                <div className="text-xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Top Artists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 md:px-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4">Top Artists This Week</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {topArtists.map((artist, index) => (
              <div key={artist.name} className="flex-shrink-0">
                <div className="bg-white/5 rounded-xl p-4 text-center min-w-[120px]">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                  />
                  <h3 className="font-medium text-sm mb-1">{artist.name}</h3>
                  <p className="text-xs text-gray-400">{artist.plays} plays</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Time Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 md:px-6 mb-4"
        >
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`text-sm font-medium whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                  timeFilter === filter
                    ? "bg-neon-green text-black"
                    : "bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 md:px-6 mb-4"
        >
          <div className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-white border-neon-green"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex-1 px-4 md:px-6 pb-24"
        >
          <div className="space-y-2">
            {listeningHistory.map((song, index) => (
              <Link to="/player" key={song.id}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer">
                  <div className="text-gray-400 text-sm w-8">#{index + 1}</div>
                  <div className="relative flex-shrink-0">
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <button className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {song.title}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">
                      {song.artist}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">
                      {song.playedAt}
                    </p>
                    <p className="text-xs text-gray-500">
                      Played {song.playCount}x
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {song.isLiked && (
                      <Heart className="w-4 h-4 text-neon-green fill-current" />
                    )}
                    <span className="text-gray-400 text-xs">
                      {song.duration}
                    </span>
                    <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-8"
          >
            <button className="px-6 py-3 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
              Load More History
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-20">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Link to="/home" className="flex flex-col items-center py-2">
              <Home className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Home</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center py-2">
              <Search className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Search</span>
            </Link>

            <Link to="/library" className="flex flex-col items-center py-2">
              <Library className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Library</span>
            </Link>

            <Link to="/history" className="flex flex-col items-center py-2">
              <Clock className="w-6 h-6 text-neon-green mb-1" />
              <span className="text-neon-green text-xs font-medium">
                History
              </span>
            </Link>

            <Link to="/profile" className="flex flex-col items-center py-2">
              <User className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
