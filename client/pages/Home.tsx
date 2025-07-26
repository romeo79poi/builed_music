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

// Sample data for the layout
const sampleAlbums = [
  {
    id: "1",
    name: "After Hours",
    artist: "The Weeknd",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Fine Line",
    artist: "Harry Styles",
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Future Nostalgia",
    artist: "Dua Lipa",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Positions",
    artist: "Ariana Grande",
    coverImageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
  },
  {
    id: "5",
    name: "Folklore",
    artist: "Taylor Swift",
    coverImageURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
  },
];

const sampleSongs = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop",
    duration: "3:20",
  },
  {
    id: "2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    duration: "2:54",
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    duration: "3:23",
  },
  {
    id: "4",
    title: "positions",
    artist: "Ariana Grande",
    coverImageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    duration: "2:52",
  },
  {
    id: "5",
    title: "cardigan",
    artist: "Taylor Swift",
    coverImageURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop",
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
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const glowVariants = {
  initial: { 
    boxShadow: "0 0 0px rgba(158, 64, 252, 0)" 
  },
  animate: { 
    boxShadow: [
      "0 0 5px rgba(158, 64, 252, 0.3)",
      "0 0 20px rgba(158, 64, 252, 0.6)",
      "0 0 5px rgba(158, 64, 252, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);

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
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/8 via-purple-secondary/4 to-purple-accent/6"></div>
      
      {/* Animated floating elements */}
      <div className="fixed inset-0 opacity-20">
        <motion.div 
          animate={floatAnimation}
          className="absolute top-5 left-5 w-16 h-16 border border-purple-primary/20 rotate-45 rounded-lg"
        />
        <motion.div 
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 0.5 } }}
          className="absolute top-10 right-10 w-12 h-12 border border-purple-secondary/20 rotate-12 rounded-lg"
        />
        <motion.div 
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }}
          className="absolute bottom-10 left-10 w-10 h-10 border border-purple-accent/20 -rotate-12 rounded-lg"
        />
        <motion.div 
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1.5 } }}
          className="absolute bottom-5 right-5 w-14 h-14 border border-purple-primary/20 rotate-45 rounded-lg"
        />
        
        {/* Additional floating particles */}
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-primary/30 rounded-full"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            transition: { duration: 15, repeat: Infinity, ease: "linear" }
          }}
          className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-secondary/30 rounded-full"
        />
      </div>

      {/* Main Container */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {/* Enhanced Header */}
        <motion.header
          variants={itemVariants}
          className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-xl border-b border-purple-primary/30"
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
                transition: { duration: 3, repeat: Infinity, ease: "linear" }
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
                transition: { duration: 2, repeat: Infinity }
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
                transition: { duration: 1.5, repeat: Infinity }
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-neon-green/50"
            >
              3
            </motion.span>
            <motion.div
              animate={{
                rotate: -360,
                transition: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-6">
          {/* Enhanced Welcome Section */}
          <motion.div
            variants={itemVariants}
            className="pt-6"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white via-purple-primary to-purple-secondary bg-clip-text text-transparent"
            >
              Good Evening
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-base flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-purple-primary" />
              <span>Ready to discover amazing music?</span>
            </motion.p>
          </motion.div>

          {/* Enhanced Albums Section */}
          <motion.section variants={itemVariants}>
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
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  onHoverStart={() => setHoveredAlbum(album.id)}
                  onHoverEnd={() => setHoveredAlbum(null)}
                  className="flex-shrink-0 w-32 sm:w-36 bg-purple-dark/40 backdrop-blur-sm rounded-xl p-3 hover:bg-purple-dark/60 transition-all cursor-pointer group border border-purple-primary/20 hover:border-purple-primary/50 hover:shadow-xl hover:shadow-purple-primary/20"
                >
                  <div className="relative mb-3">
                    <motion.img
                      src={album.coverImageURL}
                      alt={album.name}
                      className="w-full aspect-square rounded-lg object-cover shadow-md"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <AnimatePresence>
                      {hoveredAlbum === album.id && (
                        <motion.button 
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-r from-neon-green to-purple-secondary rounded-full flex items-center justify-center shadow-xl shadow-neon-green/50"
                        >
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate leading-tight">
                    {album.name}
                  </h3>
                  <p className="text-gray-400 text-xs truncate leading-tight">{album.artist}</p>
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
                <Music className="w-5 h-5 text-purple-secondary" />
                <span>Popular Songs</span>
              </motion.h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center space-x-1"
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
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  onClick={() => handlePlaySong(song.id)}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-purple-primary/10 transition-all cursor-pointer group border border-transparent hover:border-purple-primary/30 hover:shadow-lg hover:shadow-purple-primary/10"
                >
                  <div className="relative">
                    <motion.img
                      src={song.coverImageURL}
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                    <h3 className="font-medium text-base truncate leading-tight">{song.title}</h3>
                    <p className="text-gray-400 text-sm truncate leading-tight">{song.artist}</p>
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

                    <span className="text-gray-400 text-sm min-w-[40px]">{song.duration}</span>

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

        {/* Enhanced Mobile Footer */}
        <motion.footer
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-purple-primary/30 px-2 sm:px-4 py-3 z-50"
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home Icon */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center py-1 transition-all duration-200 group"
            >
              <motion.div 
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(34, 197, 94, 0.3)",
                    "0 0 20px rgba(34, 197, 94, 0.6)",
                    "0 0 0px rgba(34, 197, 94, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-3 rounded-xl bg-neon-green/20 border border-neon-green/40 group-hover:bg-neon-green/30 transition-all"
              >
                <HomeIcon className="w-5 h-5 text-neon-green" />
              </motion.div>
              <span className="text-neon-green text-xs font-medium mt-1">Home</span>
            </motion.button>

            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/search")}
              className="flex flex-col items-center py-1 transition-all duration-200 group"
            >
              <motion.div 
                whileHover={{
                  boxShadow: "0 0 15px rgba(158, 64, 252, 0.5)"
                }}
                className="p-3 rounded-xl hover:bg-purple-primary/20 transition-all group-hover:border group-hover:border-purple-primary/40"
              >
                <Search className="w-5 h-5 text-gray-400 group-hover:text-purple-primary transition-colors" />
              </motion.div>
              <span className="text-gray-400 group-hover:text-purple-primary text-xs mt-1 transition-colors">Search</span>
            </motion.button>

            {/* Upload Icon */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center py-1 transition-all duration-200 group"
            >
              <motion.div 
                whileHover={{
                  boxShadow: "0 0 15px rgba(158, 64, 252, 0.5)"
                }}
                className="p-3 rounded-xl hover:bg-purple-primary/20 transition-all group-hover:border group-hover:border-purple-primary/40"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-primary transition-colors" />
              </motion.div>
              <span className="text-gray-400 group-hover:text-purple-primary text-xs mt-1 transition-colors">Upload</span>
            </motion.button>

            {/* Library Icon */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/library")}
              className="flex flex-col items-center py-1 transition-all duration-200 group"
            >
              <motion.div 
                whileHover={{
                  boxShadow: "0 0 15px rgba(158, 64, 252, 0.5)"
                }}
                className="p-3 rounded-xl hover:bg-purple-primary/20 transition-all group-hover:border group-hover:border-purple-primary/40"
              >
                <Library className="w-5 h-5 text-gray-400 group-hover:text-purple-primary transition-colors" />
              </motion.div>
              <span className="text-gray-400 group-hover:text-purple-primary text-xs mt-1 transition-colors">Library</span>
            </motion.button>

            {/* Analysis Icon */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center py-1 transition-all duration-200 group"
            >
              <motion.div 
                whileHover={{
                  boxShadow: "0 0 15px rgba(158, 64, 252, 0.5)"
                }}
                className="p-3 rounded-xl hover:bg-purple-primary/20 transition-all group-hover:border group-hover:border-purple-primary/40"
              >
                <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-purple-primary transition-colors" />
              </motion.div>
              <span className="text-gray-400 group-hover:text-purple-primary text-xs mt-1 transition-colors">Analysis</span>
            </motion.button>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
}
