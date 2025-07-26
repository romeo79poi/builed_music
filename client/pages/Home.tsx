import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Play,
  Pause,
  Home as HomeIcon,
  Upload,
  Library,
  BarChart3,
  MessageCircle,
  Heart,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";

// Sample data for the layout
const sampleAlbums = [
  {
    id: "1",
    name: "After Hours",
    artist: "The Weeknd",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Fine Line",
    artist: "Harry Styles",
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Future Nostalgia",
    artist: "Dua Lipa",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Positions",
    artist: "Ariana Grande",
    coverImageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
  },
  {
    id: "5",
    name: "Folklore",
    artist: "Taylor Swift",
    coverImageURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
  },
];

const sampleSongs = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    duration: "3:20",
  },
  {
    id: "2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    duration: "2:54",
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    duration: "3:23",
  },
  {
    id: "4",
    title: "positions",
    artist: "Ariana Grande",
    coverImageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    duration: "2:52",
  },
  {
    id: "5",
    title: "cardigan",
    artist: "Taylor Swift",
    coverImageURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
    duration: "3:59",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());

  const handlePlaySong = (songId: string) => {
    if (currentSong === songId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(songId);
      setIsPlaying(true);
    }
  };

  const handleLikeSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedSongs = new Set(likedSongs);
    if (likedSongs.has(songId)) {
      newLikedSongs.delete(songId);
    } else {
      newLikedSongs.add(songId);
    }
    setLikedSongs(newLikedSongs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-purple-dark to-background text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/8 via-purple-secondary/4 to-purple-accent/6"></div>
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 border border-purple-primary/20 rotate-45 rounded-lg"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border border-purple-secondary/20 rotate-12 rounded-lg"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 border border-purple-accent/20 -rotate-12 rounded-lg"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 border border-purple-primary/20 rotate-45 rounded-lg"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-xl border-b border-purple-primary/20"
        >
          {/* Profile Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className="w-12 h-12 bg-gradient-to-r from-neon-green to-purple-secondary rounded-full flex items-center justify-center shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 transition-all duration-300"
          >
            <User className="w-6 h-6 text-white" />
          </motion.button>

          {/* Catch Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex items-center space-x-3"
          >
            <MusicCatchLogo className="w-10 h-10" animated />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-primary via-purple-secondary to-purple-accent bg-clip-text text-transparent tracking-wide">
              Catch
            </span>
          </motion.div>

          {/* Message Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-full flex items-center justify-center shadow-lg shadow-purple-primary/30 hover:shadow-purple-primary/50 transition-all duration-300 relative"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-green rounded-full flex items-center justify-center text-xs font-bold text-white">
              3
            </span>
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-6 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-primary bg-clip-text text-transparent">
              Good Evening
            </h1>
            <p className="text-gray-400 text-lg">Ready to discover amazing music?</p>
          </motion.div>

          {/* Albums Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Albums</h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-purple-primary/20 hover:bg-purple-primary/30 rounded-full transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 bg-purple-primary/20 hover:bg-purple-primary/30 rounded-full transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
              {sampleAlbums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 w-48 bg-purple-dark/40 backdrop-blur-sm rounded-2xl p-4 hover:bg-purple-dark/60 transition-all cursor-pointer group border border-purple-primary/20 hover:border-purple-primary/40"
                >
                  <div className="relative mb-4">
                    <img
                      src={album.coverImageURL}
                      alt={album.name}
                      className="w-full aspect-square rounded-xl object-cover shadow-lg"
                    />
                    <button className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-r from-neon-green to-purple-secondary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl shadow-neon-green/50">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </button>
                  </div>
                  <h3 className="font-semibold mb-1 truncate">{album.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{album.artist}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Songs Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Songs</h2>
              <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Show all
              </button>
            </div>

            <div className="space-y-3">
              {sampleSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  onClick={() => handlePlaySong(song.id)}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-purple-primary/10 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={song.coverImageURL}
                      alt={song.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <button className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentSong === song.id && isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  </div>

                  <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleLikeSong(song.id, e)}
                      className={`p-2 rounded-full transition-all hover:scale-110 ${
                        likedSongs.has(song.id)
                          ? "text-neon-green hover:text-green-400"
                          : "text-gray-400 hover:text-neon-green"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          likedSongs.has(song.id) ? "fill-current" : ""
                        }`}
                      />
                    </button>

                    <span className="text-gray-400 text-sm min-w-[40px]">{song.duration}</span>

                    <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>

        {/* Footer Navigation */}
        <motion.footer
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-purple-primary/20 px-6 py-4 z-50"
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center py-2 transition-all duration-200"
            >
              <div className="p-3 rounded-2xl bg-neon-green/20 border-2 border-neon-green/40">
                <HomeIcon className="w-6 h-6 text-neon-green" />
              </div>
              <span className="text-neon-green text-xs font-medium mt-2">Home</span>
            </motion.button>

            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/search")}
              className="flex flex-col items-center py-2 transition-all duration-200"
            >
              <div className="p-3 rounded-2xl hover:bg-purple-primary/20 transition-all">
                <Search className="w-6 h-6 text-gray-400 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-2">Search</span>
            </motion.button>

            {/* Upload Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center py-2 transition-all duration-200"
            >
              <div className="p-3 rounded-2xl hover:bg-purple-primary/20 transition-all">
                <Upload className="w-6 h-6 text-gray-400 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-2">Upload</span>
            </motion.button>

            {/* Library Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/library")}
              className="flex flex-col items-center py-2 transition-all duration-200"
            >
              <div className="p-3 rounded-2xl hover:bg-purple-primary/20 transition-all">
                <Library className="w-6 h-6 text-gray-400 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-2">Library</span>
            </motion.button>

            {/* Analysis Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center py-2 transition-all duration-200"
            >
              <div className="p-3 rounded-2xl hover:bg-purple-primary/20 transition-all">
                <BarChart3 className="w-6 h-6 text-gray-400 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-2">Analysis</span>
            </motion.button>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
