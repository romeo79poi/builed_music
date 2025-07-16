import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Play,
  Plus,
  Heart,
  Download,
  Clock,
  Music,
  ListMusic,
  User,
  Home,
  Library as LibraryIcon,
} from "lucide-react";

export default function Library() {
  const [activeTab, setActiveTab] = useState("Recently Added");
  const [viewMode, setViewMode] = useState("list");

  const tabs = ["Recently Added", "Recently Played", "Artists", "Albums"];

  const playlists = [
    {
      id: 1,
      name: "My Favorites",
      songCount: 48,
      duration: "3h 12m",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      color: "from-purple-500 to-purple-700",
      isLiked: true,
    },
    {
      id: 2,
      name: "Workout Mix",
      songCount: 32,
      duration: "2h 18m",
      image:
        "https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop",
      color: "from-orange-500 to-red-600",
      isLiked: false,
    },
    {
      id: 3,
      name: "Chill Vibes",
      songCount: 25,
      duration: "1h 45m",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      color: "from-blue-500 to-cyan-600",
      isLiked: false,
    },
    {
      id: 4,
      name: "Downloaded",
      songCount: 67,
      duration: "4h 23m",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      color: "from-green-500 to-teal-600",
      isLiked: false,
      isDownloaded: true,
    },
  ];

  const recentlyAdded = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
      isLiked: true,
    },
    {
      id: 2,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: "2:54",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      isLiked: false,
    },
    {
      id: 3,
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      isLiked: true,
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
          <h1 className="text-xl font-bold">Your Library</h1>
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-gray-400" />
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 md:px-6 mb-6"
        >
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <Link
              to="/library?filter=liked"
              className="flex items-center space-x-2 bg-neon-green/20 border border-neon-green/30 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Heart className="w-4 h-4 text-neon-green" />
              <span className="text-sm">Liked Songs</span>
            </Link>
            <Link
              to="/library?filter=downloaded"
              className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Downloaded</span>
            </Link>
            <Link
              to="/library?filter=recent"
              className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Recently Played</span>
            </Link>
          </div>
        </motion.div>

        {/* Created by You Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 md:px-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Created by You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playlists.map((playlist) => (
              <Link to="/player" key={playlist.id}>
                <div className="group bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <button className="absolute bottom-1 right-1 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all">
                        <Play className="w-4 h-4 text-black ml-0.5" />
                      </button>
                      {playlist.isDownloaded && (
                        <Download className="absolute top-1 right-1 w-4 h-4 text-neon-green" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {playlist.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {playlist.songCount} songs • {playlist.duration}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {playlist.isLiked && (
                        <Heart className="w-4 h-4 text-neon-green fill-current" />
                      )}
                      <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 px-4 md:px-6 pb-24"
        >
          {activeTab === "Recently Added" && (
            <div className="space-y-2">
              {recentlyAdded.map((song, index) => (
                <Link to="/player" key={song.id}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer">
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
                        {song.artist} • {song.album}
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
          )}
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
              <LibraryIcon className="w-6 h-6 text-neon-green mb-1" />
              <span className="text-neon-green text-xs font-medium">
                Library
              </span>
            </Link>

            <Link to="/history" className="flex flex-col items-center py-2">
              <Clock className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">History</span>
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
