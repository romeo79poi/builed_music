import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronUp,
  Volume2,
  VolumeX,
  Volume1,
  Cast,
  Shuffle,
  Repeat,
  Download,
  Wifi,
  WifiOff,
  List,
  MoreHorizontal,
} from "lucide-react";
import { useMusicContext } from "../context/MusicContext";
import LikeButton from "./LikeButton";

interface MiniPlayerProps {
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  showAdvanced?: boolean;
}

export function MiniPlayer({
  isPlaying = true,
  onTogglePlay,
  showAdvanced = false,
}: MiniPlayerProps) {
  const { currentSong } = useMusicContext();
  const [volume, setVolume] = useState(75);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const songData = currentSong || {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    duration: "3:20",
  };

  const progress = 33; // percentage
  const timeElapsed = "1:05";

  const handleRepeatToggle = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 1) return <Repeat className="w-4 h-4" />;
    if (repeatMode === 2)
      return (
        <div className="relative">
          <Repeat className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 text-xs">1</span>
        </div>
      );
    return <Repeat className="w-4 h-4" />;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 50) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed ${
        isExpanded ? "inset-4 bottom-20" : "bottom-16 left-0 right-0"
      } z-30 mx-4 mb-2 transition-all duration-300`}
    >
      <div className="bg-gradient-to-r from-dark-surface to-darker-surface border border-white/10 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Main Mini Player */}
        <div className="p-3">
          <div className="flex items-center space-x-3">
            {/* Album Art */}
            <Link to="/player" className="relative flex-shrink-0 group">
              <img
                src={currentSong.image}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ChevronUp className="w-5 h-5 text-white" />
              </div>
              {isDownloaded && (
                <Download className="absolute -top-1 -right-1 w-3 h-3 text-neon-green" />
              )}
            </Link>

            {/* Song Info */}
            <Link to="/player" className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate">
                {currentSong.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentSong.artist}
              </p>
            </Link>

            {/* Controls */}
            <div className="flex items-center space-x-1">
              {/* Advanced Controls (when expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center space-x-1"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsShuffle(!isShuffle);
                      }}
                      className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                        isShuffle ? "text-neon-green" : "text-gray-400"
                      }`}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRepeatToggle();
                      }}
                      className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                        repeatMode > 0 ? "text-neon-green" : "text-gray-400"
                      }`}
                    >
                      {getRepeatIcon()}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <LikeButton
                songId={songData.id}
                size="sm"
                className="hover:bg-white/10 rounded-full transition-colors"
              />

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipBack className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePlay?.();
                }}
                className="w-10 h-10 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipForward className="w-4 h-4 text-gray-400" />
              </button>

              {/* Volume Control */}
              <div
                className="relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setVolume(volume === 0 ? 75 : 0);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {getVolumeIcon()}
                </button>
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2"
                    >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-20 h-1 bg-white/20 rounded-full appearance-none transform rotate-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2"
              >
                <ChevronUp
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 pb-3">
          <div className="relative">
            <div className="h-1 bg-white/10 rounded-full cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full transition-all"
                style={{ width: `${currentSong.progress}%` }}
              />
            </div>
            {isExpanded && (
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>{currentSong.timeElapsed}</span>
                <span>{currentSong.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDownloaded(!isDownloaded);
                    }}
                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                      isDownloaded ? "text-neon-green" : "text-gray-400"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Cast className="w-4 h-4 text-gray-400" />
                  </button>

                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <List className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {navigator.onLine ? (
                      <Wifi className="w-3 h-3 text-neon-green" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-xs text-gray-400">HD</span>
                  </div>

                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex items-center justify-center space-x-4">
                <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Heart className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Like</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Download</span>
                </button>

                <Link
                  to="/player"
                  className="flex items-center space-x-2 px-3 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-neon-green" />
                  <span className="text-sm text-neon-green">Full Player</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
