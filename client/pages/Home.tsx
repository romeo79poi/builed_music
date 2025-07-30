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
  description: "The perfect soundtrack for late-night vibes and nostalgic moments.",
  coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
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
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    releaseDate: "2024-01-15",
  },
  {
    id: "nr2",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    coverImageURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
    releaseDate: "2024-01-12",
  },
  {
    id: "nr3",
    title: "Unholy",
    artist: "Sam Smith",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    releaseDate: "2024-01-10",
  },
];

// Mood-based playlists
const moodPlaylists = [
  {
    id: "mood1",
    name: "Chill Vibes",
    description: "Relax and unwind",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    mood: "chill",
    color: "from-blue-400 to-purple-400",
  },
  {
    id: "mood2",
    name: "Workout Beats",
    description: "Get pumped up",
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    mood: "energetic",
    color: "from-red-400 to-orange-400",
  },
  {
    id: "mood3",
    name: "Party Mix",
    description: "Dance the night away",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    mood: "party",
    color: "from-pink-400 to-purple-400",
  },
  {
    id: "mood4",
    name: "Focus Flow",
    description: "Stay concentrated",
    coverImageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
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
      {/* Clean minimalist background like Google/YouTube */}
      <div className="fixed inset-0 bg-gradient-to-b from-background to-secondary/20 theme-transition"></div>



      {/* Main Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {/* Clean Header - Google/YouTube Style */}
        <motion.header
          variants={itemVariants}
          className="flex items-center justify-between px-4 py-3 bg-background/95 dark:bg-background/95 light:bg-background/95 backdrop-blur-sm border-b border-border google-shadow dark:google-dark-shadow theme-transition"
        >
          {/* Profile Icon with enhanced glow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={glowVariants}
            initial="initial"
            animate="animate"
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-gradient-to-r from-neon-green to-purple-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-neon-green/60 transition-all duration-300 relative overflow-hidden"
          >
            <User className="w-5 h-5 text-white relative z-10" />
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
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                transition: { duration: 2, repeat: Infinity },
              }}
            >
              <MusicCatchLogo className="w-8 h-8" animated />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="font-bold text-lg purple-gradient-text hidden sm:block"
            >
              MusicCatch
            </motion.span>
          </motion.div>

          {/* Message Icon with enhanced effects */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className="w-10 h-10 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-primary/60 transition-all duration-300 relative overflow-hidden"
          >
            <MessageCircle className="w-5 h-5 text-white relative z-10" />
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                transition: { duration: 1.5, repeat: Infinity },
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-neon-green/50"
            >
              3
            </motion.span>
            <motion.div
              animate={{
                rotate: -360,
                transition: { duration: 4, repeat: Infinity, ease: "linear" },
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-6">
          {/* Search Bar */}
          <motion.div variants={itemVariants} className="pt-6 mb-6">
            <div className="relative">
              <motion.div
                animate={{
                  scale: isSearchFocused ? 1.01 : 1,
                  boxShadow: isSearchFocused
                    ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                    : "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onClick={() => navigate("/search")}
                  placeholder="Search songs, artists, albums..."
                  className="w-full h-14 bg-white/10 dark:bg-white/10 light:bg-gray-100 backdrop-blur-sm rounded-2xl pl-12 pr-4 text-white dark:text-white light:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500 focus:outline-none focus:bg-white/15 dark:focus:bg-white/15 light:focus:bg-white border border-purple-primary/20 dark:border-purple-primary/20 light:border-gray-300 focus:border-gray-400 dark:focus:border-purple-primary/50 light:focus:border-gray-400 transition-all theme-transition"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Welcome Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold mb-2 text-foreground"
            >
              {getGreeting()}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-base flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span>Ready to discover amazing music?</span>
            </motion.p>
          </motion.div>

          {/* Hero Section - Featured Content */}
          <motion.section
            variants={itemVariants}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative bg-card rounded-2xl p-6 overflow-hidden cursor-pointer youtube-shadow hover:youtube-shadow-hover dark:google-dark-shadow dark:hover:google-dark-shadow-hover border border-border"
              onClick={() => {
                toast({
                  title: "Playing Featured Album",
                  description: `Now playing: ${featuredContent.title} by ${featuredContent.artist}`,
                });
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-primary/10 to-purple-secondary/10"></div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center">
                <div className="flex-1 mb-4 sm:mb-0 sm:mr-6">
                  {featuredContent.isNew && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block bg-neon-green text-black px-3 py-1 rounded-full text-xs font-bold mb-3"
                    >
                      NEW RELEASE
                    </motion.span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {featuredContent.title}
                  </h3>
                  <p className="text-purple-accent text-lg font-medium mb-3">
                    {featuredContent.artist}
                  </p>
                  <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm mb-4 leading-relaxed">
                    {featuredContent.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                    <span>{featuredContent.genre}</span>
                    <span>•</span>
                    <span>{featuredContent.releaseYear}</span>
                    <span>•</span>
                    <span>{featuredContent.totalTracks} tracks</span>
                  </div>
                </div>

                <div className="relative">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={featuredContent.coverImageURL}
                    alt={featuredContent.title}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-2xl shadow-purple-primary/30"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </motion.button>
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
                  className="flex-shrink-0 w-40 bg-card rounded-xl p-4 hover:bg-muted/50 transition-all cursor-pointer youtube-shadow hover:youtube-shadow-hover dark:google-dark-shadow dark:hover:google-dark-shadow-hover"
                >
                  <div className="relative mb-3">
                    <img
                      src={release.coverImageURL}
                      alt={release.title}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-neon-green text-black px-2 py-1 rounded-md text-xs font-bold">
                      NEW
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate">{release.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{release.artist}</p>
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
                  className={`relative bg-gradient-to-br ${playlist.color} rounded-2xl p-4 h-24 cursor-pointer overflow-hidden`}
                >
                  <div className="relative z-10">
                    <h3 className="font-bold text-white text-sm mb-1">{playlist.name}</h3>
                    <p className="text-white/80 text-xs">{playlist.description}</p>
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
                  className="p-2 bg-purple-primary/20 hover:bg-purple-primary/40 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-primary/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-purple-primary/20 hover:bg-purple-primary/40 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-primary/30"
                >
                  <ChevronRight className="w-4 h-4" />
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
                  className="flex-shrink-0 w-32 sm:w-36 bg-card rounded-xl p-3 hover:bg-muted/50 transition-all cursor-pointer group youtube-shadow hover:youtube-shadow-hover dark:google-dark-shadow dark:hover:google-dark-shadow-hover theme-transition"
                >
                  <div className="relative mb-3">
                    <motion.img
                      src={album.coverImageURL}
                      alt={album.name}
                      className="w-full aspect-square rounded-lg object-cover shadow-md"
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
                          className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
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
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <motion.img
                      src={song.coverImageURL}
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
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
                      className={`p-2 rounded-full transition-all ${
                        likedSongs.has(song.id)
                          ? "text-neon-green bg-neon-green/20"
                          : "text-gray-400 hover:text-neon-green hover:bg-neon-green/10"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          likedSongs.has(song.id) ? "fill-current" : ""
                        }`}
                      />
                    </motion.button>

                    <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm min-w-[40px]">
                      {song.duration}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
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
