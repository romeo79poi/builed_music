import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal,
  ChevronDown,
  Volume2,
  VolumeX,
  Share,
  Plus,
  Download,
  Music,
  Clock,
  Mic2,
  Headphones,
  Radio,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MobileFooter from "../components/MobileFooter";

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Sample song data (replace with actual data from props/context)
  const [currentSong] = useState({
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    duration: 200, // in seconds
    lyrics: [
      { time: 0, text: "Yeah" },
      { time: 8, text: "I've been tryna call" },
      { time: 12, text: "I've been on my own for long enough" },
      { time: 16, text: "Maybe you can show me how to love, maybe" },
      { time: 24, text: "I feel like I'm just missing something when you're gone" },
      { time: 32, text: "Something in the way you move" },
      { time: 36, text: "Makes me feel like I can't live without you" },
      { time: 40, text: "It takes me all the way" },
      { time: 44, text: "I want you to stay" },
      { time: 48, text: "I feel like I'm lost" },
      { time: 52, text: "I'm feeling like I'm lost" },
      { time: 56, text: "I feel like I'm lost" },
      { time: 60, text: "I'm feeling like I'm lost" },
    ]
  });

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [showQueue, setShowQueue] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Sample queue data
  const [queue] = useState([
    { id: "1", title: "Blinding Lights", artist: "The Weeknd", coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop" },
    { id: "2", title: "Watermelon Sugar", artist: "Harry Styles", coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop" },
    { id: "3", title: "Levitating", artist: "Dua Lipa", coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
  ]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * currentSong.duration;
      setCurrentTime(newTime);
    }
  };

  // Simulate audio progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentSong.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong.duration]);

  // Get current lyric
  const getCurrentLyric = () => {
    const currentLyric = currentSong.lyrics
      .slice()
      .reverse()
      .find(lyric => currentTime >= lyric.time);
    return currentLyric?.text || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-purple-dark to-background text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/10 via-purple-secondary/5 to-purple-accent/8"></div>
      
      {/* Animated Background Patterns */}
      <div className="fixed inset-0 opacity-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-purple-primary/20 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-purple-secondary/20 rounded-full"
        />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-xl"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-purple-dark/50 backdrop-blur-sm flex items-center justify-center border border-purple-primary/30"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </motion.button>

          <div className="text-center">
            <h1 className="text-sm font-medium text-gray-300">PLAYING FROM PLAYLIST</h1>
            <p className="text-white font-semibold">My Favorites</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-purple-dark/50 backdrop-blur-sm flex items-center justify-center border border-purple-primary/30"
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 py-8 pb-32">
          {/* Album Art */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative mx-auto mb-8"
          >
            <div className="relative">
              <motion.img
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                src={currentSong.coverImageURL}
                alt={currentSong.title}
                className="w-80 h-80 sm:w-96 sm:h-96 rounded-2xl object-cover shadow-2xl shadow-purple-primary/20"
              />
              
              {/* Vinyl Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
              
              {/* Glow Effect */}
              <motion.div
                animate={{
                  boxShadow: isPlaying ? [
                    "0 0 20px rgba(158, 64, 252, 0.3)",
                    "0 0 40px rgba(158, 64, 252, 0.6)",
                    "0 0 20px rgba(158, 64, 252, 0.3)"
                  ] : "0 0 20px rgba(158, 64, 252, 0.3)"
                }}
                transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                className="absolute inset-0 rounded-2xl"
              />
            </div>
          </motion.div>

          {/* Song Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
              {currentSong.title}
            </h2>
            <p className="text-lg text-gray-300 mb-4">{currentSong.artist}</p>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-all ${
                  isLiked ? "bg-neon-green/20 text-neon-green" : "bg-purple-dark/50 text-gray-400"
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-purple-dark/50 text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-purple-dark/50 text-gray-400 hover:text-white transition-colors"
              >
                <Share className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-purple-dark/50 text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="relative h-2 bg-purple-dark/50 rounded-full cursor-pointer mb-2"
            >
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-green to-purple-secondary rounded-full"
                style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
              />
              <motion.div
                className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2"
                style={{ left: `${(currentTime / currentSong.duration) * 100}%` }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </motion.div>

          {/* Player Controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between mb-8"
          >
            {/* Shuffle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-3 rounded-full transition-all ${
                isShuffle ? "bg-neon-green/20 text-neon-green" : "text-gray-400"
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </motion.button>

            {/* Previous */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full text-white hover:bg-purple-primary/20 transition-all"
            >
              <SkipBack className="w-6 h-6" />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-green to-purple-secondary flex items-center justify-center shadow-xl shadow-neon-green/30"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full text-white hover:bg-purple-primary/20 transition-all"
            >
              <SkipForward className="w-6 h-6" />
            </motion.button>

            {/* Repeat */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRepeatMode((prev) => (prev + 1) % 3)}
              className={`p-3 rounded-full transition-all relative ${
                repeatMode > 0 ? "bg-neon-green/20 text-neon-green" : "text-gray-400"
              }`}
            >
              <Repeat className="w-5 h-5" />
              {repeatMode === 2 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full text-xs font-bold flex items-center justify-center text-white">
                  1
                </span>
              )}
            </motion.button>
          </motion.div>

          {/* Volume Control */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex items-center justify-center space-x-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>

            <div className="flex-1 max-w-xs">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-full h-2 bg-purple-dark/50 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
          </motion.div>

          {/* Lyrics/Queue Toggle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowLyrics(true);
                setShowQueue(false);
              }}
              className={`px-6 py-3 rounded-full transition-all ${
                showLyrics 
                  ? "bg-neon-green/20 text-neon-green border border-neon-green/50" 
                  : "bg-purple-dark/50 text-gray-400 border border-purple-primary/30"
              }`}
            >
              <Mic2 className="w-5 h-5 mr-2 inline" />
              Lyrics
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowQueue(true);
                setShowLyrics(false);
              }}
              className={`px-6 py-3 rounded-full transition-all ${
                showQueue 
                  ? "bg-purple-primary/20 text-purple-primary border border-purple-primary/50" 
                  : "bg-purple-dark/50 text-gray-400 border border-purple-primary/30"
              }`}
            >
              <Music className="w-5 h-5 mr-2 inline" />
              Queue
            </motion.button>
          </motion.div>
        </main>

        {/* Lyrics/Queue Overlay */}
        <AnimatePresence>
          {(showLyrics || showQueue) && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-purple-darker via-purple-dark to-purple-dark/95 backdrop-blur-xl border-t border-purple-primary/30 z-40 rounded-t-3xl"
            >
              <div className="flex flex-col h-full">
                {/* Handle */}
                <div className="flex justify-center py-4">
                  <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 overflow-y-auto">
                  {showLyrics && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-center mb-8">Lyrics</h3>
                      <div className="space-y-4">
                        {currentSong.lyrics.map((lyric, index) => (
                          <motion.p
                            key={index}
                            className={`text-lg transition-all duration-300 ${
                              currentTime >= lyric.time && 
                              (index === currentSong.lyrics.length - 1 || currentTime < currentSong.lyrics[index + 1]?.time)
                                ? "text-neon-green font-semibold scale-105"
                                : "text-gray-400"
                            }`}
                          >
                            {lyric.text}
                          </motion.p>
                        ))}
                      </div>
                    </div>
                  )}

                  {showQueue && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-center mb-8">Up Next</h3>
                      {queue.map((song, index) => (
                        <motion.div
                          key={song.id}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center space-x-4 p-3 rounded-xl bg-purple-dark/30 hover:bg-purple-primary/20 transition-all"
                        >
                          <img
                            src={song.coverImageURL}
                            alt={song.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{song.title}</h4>
                            <p className="text-sm text-gray-400">{song.artist}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-neon-green/20 text-neon-green"
                          >
                            <Play className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="p-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowLyrics(false);
                      setShowQueue(false);
                    }}
                    className="w-full py-4 bg-purple-primary/20 border border-purple-primary/50 rounded-full text-white font-medium"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(34, 197, 94, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  );
}
