import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Play,
  Pause,
  MessageCircle,
  Heart,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Music,
  Star,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { useToast } from "../hooks/use-toast";
import MobileFooter from "../components/MobileFooter";

// Featured Artist/Album of the Day
const featuredContent = {
  id: "featured-1",
  type: "album",
  title: "Midnight Memories",
  artist: "One Direction",
  description:
    "The perfect soundtrack for late-night vibes and nostalgic moments.",
  coverImageURL:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
  genre: "Pop",
  releaseYear: "2013",
  totalTracks: 18,
  isNew: true,
};

// Sample data for the layout
const sampleAlbums = [
  {
    id: "1",
    name: "After Hours",
    artist: "The Weeknd",
    coverImageURL:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    isNew: true,
  },
  {
    id: "2",
    name: "Fine Line",
    artist: "Harry Styles",
    coverImageURL:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    isNew: false,
  },
  {
    id: "3",
    name: "Future Nostalgia",
    artist: "Dua Lipa",
    coverImageURL:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    isNew: true,
  },
  {
    id: "4",
    name: "Positions",
    artist: "Ariana Grande",
    coverImageURL:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    isNew: false,
  },
  {
    id: "5",
    name: "Folklore",
    artist: "Taylor Swift",
    coverImageURL:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
    isNew: true,
  },
];

// New Releases
const newReleases = [
  {
    id: "nr1",
    title: "As It Was",
    artist: "Harry Styles",
    coverImageURL:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    releaseDate: "2024-01-15",
  },
  {
    id: "nr2",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    coverImageURL:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
    releaseDate: "2024-01-12",
  },
  {
    id: "nr3",
    title: "Unholy",
    artist: "Sam Smith",
    coverImageURL:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    releaseDate: "2024-01-10",
  },
];

// Mood-based playlists
const moodPlaylists = [
  {
    id: "mood1",
    name: "Chill Vibes",
    description: "Relax and unwind",
    coverImageURL:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    mood: "chill",
    color: "from-blue-400 to-purple-400",
  },
  {
    id: "mood2",
    name: "Workout Beats",
    description: "Get pumped up",
    coverImageURL:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    mood: "energetic",
    color: "from-red-400 to-orange-400",
  },
  {
    id: "mood3",
    name: "Party Mix",
    description: "Dance the night away",
    coverImageURL:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    mood: "party",
    color: "from-pink-400 to-purple-400",
  },
  {
    id: "mood4",
    name: "Focus Flow",
    description: "Stay concentrated",
    coverImageURL:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    mood: "focus",
    color: "from-green-400 to-teal-400",
  },
];

const sampleSongs = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    coverImageURL:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop",
    duration: "3:20",
  },
  {
    id: "2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    coverImageURL:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    duration: "2:54",
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    coverImageURL:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    duration: "3:23",
  },
  {
    id: "4",
    title: "positions",
    artist: "Ariana Grande",
    coverImageURL:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    duration: "2:52",
  },
  {
    id: "5",
    title: "cardigan",
    artist: "Taylor Swift",
    coverImageURL:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop",
    duration: "3:59",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const glowVariants = {
  initial: {
    boxShadow: "0 0 0px rgba(158, 64, 252, 0)",
  },
  animate: {
    boxShadow: [
      "0 0 5px rgba(158, 64, 252, 0.3)",
      "0 0 20px rgba(158, 64, 252, 0.6)",
      "0 0 5px rgba(158, 64, 252, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Update time for greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get appropriate greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 0 && hour < 6) return "Good Midnight";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden theme-transition">
      {/* Main Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {/* Clean Header - Claude/AI Style */}
        <motion.header
          variants={itemVariants}
          className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm claude-shadow dark:claude-dark-shadow theme-transition"
        >
          {/* Profile Icon with enhanced glow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={glowVariants}
            initial="initial"
            animate="animate"
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            style={{
              boxShadow: `
                0 0 0 1px rgba(236, 72, 153, 0.6),
                inset 0 0 0 1px rgba(236, 72, 153, 0.3)
              `,
            }}
          >
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
              <User className="w-4 h-4 text-white" />
            </div>
            <motion.div
              animate={{
                rotate: 360,
                transition: { duration: 3, repeat: Infinity, ease: "linear" },
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.button>

          {/* Enhanced Logo */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div>
              <MusicCatchLogo className="w-12 h-12" animated={false} />
            </div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="font-bold text-lg purple-gradient-text dark:purple-gradient-text light:text-foreground hidden sm:block"
            >
              MusicCatch
            </motion.span>
          </motion.div>

          {/* Static Message Icon */}
          <button
            onClick={() => navigate("/messages")}
            className="group relative flex items-center justify-center"
          >
            {/* Modern circular container */}
            <div
              className="relative w-11 h-11 rounded-full bg-black shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(236, 72, 153, 0.6),
                  inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                `,
              }}
            >
              {/* Message Circle icon with black background */}
              <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center px-1.5 shadow-lg border-2 border-white dark:border-gray-800">
              <span className="text-xs font-bold text-white leading-none">
                3
              </span>
            </div>
          </button>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-6">
          {/* Enhanced Welcome Section */}
          <motion.div
            variants={itemVariants}
            className="mb-12 mt-8 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1,
                duration: 3,
                type: "spring",
                damping: 30,
                stiffness: 50,
              }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 purple-gradient-text dark:purple-gradient-text light:text-foreground"
            >
              {getGreeting()}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", damping: 15 }}
              className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg flex items-center justify-center space-x-3 max-w-md mx-auto"
            >
              <Sparkles className="w-5 h-5 text-purple-primary animate-pulse" />
              <span className="font-medium">
                Ready to discover amazing music?
              </span>
              <Sparkles className="w-5 h-5 text-purple-primary animate-pulse" />
            </motion.p>
          </motion.div>

          {/* Hero Section - Featured Content */}
          <motion.section variants={itemVariants} className="mb-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative bg-black rounded-lg p-4 overflow-hidden cursor-pointer"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(236, 72, 153, 0.6),
                  inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                `,

              }}
              onClick={() => {
                toast({
                  title: "Playing Featured Album",
                  description: `Now playing: ${featuredContent.title} by ${featuredContent.artist}`,
                });
              }}
            >
              <div className="relative z-10 flex flex-row items-center gap-4">
                <div className="relative">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={featuredContent.coverImageURL}
                    alt={featuredContent.title}
                    className="w-24 h-24 rounded-xl object-cover shadow-lg shadow-purple-primary/30"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-1 right-1 w-6 h-6 bg-white text-purple-primary rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <Play className="w-3 h-3 ml-0.5" />
                  </motion.button>
                </div>

                <div className="flex-1 min-w-0">
                  {featuredContent.isNew && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 bg-gradient-to-r from-purple-primary to-purple-secondary text-white shadow-sm"
                    >
                      NEW
                    </motion.span>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-tight truncate">
                    {featuredContent.title}
                  </h3>
                  <p className="text-purple-accent text-sm font-medium mb-2 truncate">
                    {featuredContent.artist}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-300">
                    <span>{featuredContent.genre}</span>
                    <span>•</span>
                    <span>{featuredContent.releaseYear}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* New Releases Section */}
          <motion.section variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5 text-foreground" />
                <span>New Releases</span>
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-black text-sm font-medium transition-colors"
              >
                See all
              </motion.button>
            </div>

            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
              {newReleases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex-shrink-0 w-40 bg-black rounded-lg p-4 hover:bg-gray-900 transition-all cursor-pointer relative overflow-hidden"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
    
                  }}
                >
                  <div className="relative mb-3">
                    <img
                      src={release.coverImageURL}
                      alt={release.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-neon-green text-black px-2 py-1 rounded-md text-xs font-bold">
                      NEW
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate">
                    {release.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {release.artist}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Mood-Based Playlists */}
          <motion.section variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold flex items-center space-x-2"
              >
                <Heart className="w-5 h-5 text-purple-secondary" />
                <span>Playlists for You</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {moodPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative bg-black rounded-lg p-4 h-24 cursor-pointer overflow-hidden"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
    
                  }}
                >
                  <div className="relative z-10">
                    <h3 className="font-bold text-white text-sm mb-1">
                      {playlist.name}
                    </h3>
                    <p className="text-white/80 text-xs">
                      {playlist.description}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Enhanced Albums Section */}
          <motion.section variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold flex items-center space-x-2"
              >
                <TrendingUp className="w-5 h-5 text-neon-green" />
                <span>Featured Albums</span>
              </motion.h2>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-black rounded-full transition-all duration-300 hover:shadow-lg relative"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
                  }}
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <ChevronLeft className="w-3 h-3 text-white" />
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-black rounded-full transition-all duration-300 hover:shadow-lg relative"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
                  }}
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
              {sampleAlbums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  onHoverStart={() => setHoveredAlbum(album.id)}
                  onHoverEnd={() => setHoveredAlbum(null)}
                  className="flex-shrink-0 w-32 sm:w-36 bg-black rounded-lg p-3 hover:bg-gray-900 transition-all cursor-pointer group relative overflow-hidden"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
    
                  }}
                >
                  <div className="relative mb-3">
                    <motion.img
                      src={album.coverImageURL}
                      alt={album.name}
                      className="w-24 h-24 rounded-lg object-cover shadow-md"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    />
                    {album.isNew && (
                      <div className="absolute top-1 left-1 bg-neon-green text-black px-1.5 py-0.5 rounded text-xs font-bold">
                        NEW
                      </div>
                    )}
                    <AnimatePresence>
                      {hoveredAlbum === album.id && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 10 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          className="absolute bottom-2 right-2 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate leading-tight">
                    {album.name}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs truncate leading-tight">
                    {album.artist}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Album Tracks Section */}
          <motion.section variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold flex items-center space-x-2"
              >
                <Music className="w-5 h-5 text-foreground" />
                <span>Album Tracks</span>
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-black text-sm font-medium transition-colors"
              >
                View All
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                {
                  id: "album1",
                  title: "After Hours",
                  artist: "The Weeknd",
                  tracks: ["Blinding Lights", "Heartless", "In Your Eyes", "Save Your Tears"],
                  coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
                },
                {
                  id: "album2",
                  title: "Fine Line",
                  artist: "Harry Styles",
                  tracks: ["Watermelon Sugar", "Adore You", "Golden", "Falling"],
                  coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop"
                }
              ].map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.2 }}
                  className="bg-black rounded-lg p-4 overflow-hidden"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
    
                  }}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={album.coverImageURL}
                      alt={album.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">{album.title}</h3>
                      <p className="text-purple-accent text-sm">{album.artist}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {album.tracks.map((track, trackIndex) => (
                      <motion.div
                        key={track}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.2 + trackIndex * 0.1 }}
                        whileHover={{ backgroundColor: "rgba(158, 64, 252, 0.15)" }}
                        className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-purple-primary/10 transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400 text-sm w-6">{trackIndex + 1}</span>
                          <span className="text-white group-hover:text-purple-accent transition-colors">{track}</span>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-black rounded-full flex items-center justify-center transition-all relative"
                            style={{
                              boxShadow: `
                                0 0 0 1px rgba(236, 72, 153, 0.6),
                                inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                              `,
                            }}
                          >
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                              <Play className="w-2 h-2 text-white ml-0.5" />
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Enhanced Songs Section */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold flex items-center space-x-2"
              >
                <Music className="w-5 h-5 text-foreground" />
                <span>Popular Songs</span>
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-black text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <span>Show all</span>
                <Star className="w-3 h-3" />
              </motion.button>
            </div>

            <div className="space-y-2">
              {sampleSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(158, 64, 252, 0.15)",
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  onClick={() => handlePlaySong(song.id)}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-900 transition-all cursor-pointer group bg-black"
                  style={{
                    boxShadow: `
                      0 0 0 1px rgba(236, 72, 153, 0.6),
                      inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                    `,
    
                  }}
                >
                  <div className="relative">
                    <motion.img
                      src={song.coverImageURL}
                      alt={song.title}
                      className="w-24 h-24 rounded-lg object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    />
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center transition-opacity"
                    >
                      {currentSong === song.id && isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </motion.button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate leading-tight">
                      {song.title}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm truncate leading-tight">
                      {song.artist}
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3"
                  >
                    <motion.button
                      onClick={(e) => handleLikeSong(song.id, e)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-black rounded-full transition-all relative"
                      style={{
                        boxShadow: `
                          0 0 0 1px rgba(236, 72, 153, 0.6),
                          inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                        `,
                      }}
                    >
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <Heart
                          className={`w-3 h-3 transition-all ${
                            likedSongs.has(song.id) ? "fill-current text-neon-green" : "text-white"
                          }`}
                        />
                      </div>
                    </motion.button>

                    <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm min-w-[40px]">
                      {song.duration}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-black rounded-full transition-all relative"
                      style={{
                        boxShadow: `
                          0 0 0 1px rgba(236, 72, 153, 0.6),
                          inset 0 0 0 1px rgba(236, 72, 153, 0.3)
                        `,
                      }}
                    >
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <MoreHorizontal className="w-3 h-3 text-white" />
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>

        {/* Mobile Footer */}
        <MobileFooter />
      </motion.div>
    </div>
  );
}
