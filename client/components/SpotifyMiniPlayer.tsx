import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal,
  ChevronDown,
  ListMusic,
  Cast,
  PictureInPicture2,
  Monitor,
  Smartphone,
  Speaker,
  Headphones,
  X,
} from "lucide-react";
import { useEnhancedMusic } from "../context/EnhancedMusicContext";

export default function SpotifyMiniPlayer() {
  const {
    audioState,
    playbackSettings,
    userPreferences,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLikeSong,
    seekTo,
  } = useEnhancedMusic();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const controls = useAnimation();
  const dragConstraintsRef = useRef(null);

  const { currentSong, isPlaying, currentTime, duration, volume, isMuted } =
    audioState;
  const { isShuffle, repeatMode } = playbackSettings;

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seekTo(newTime);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.3) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const devices = [
    { id: "computer", name: "This Computer", type: "computer", active: true },
    { id: "phone", name: "iPhone", type: "smartphone", active: false },
    { id: "speaker", name: "Living Room Speaker", type: "speaker", active: false },
    { id: "headphones", name: "AirPods Pro", type: "headphones", active: false },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "computer":
        return Monitor;
      case "smartphone":
        return Smartphone;
      case "speaker":
        return Speaker;
      case "headphones":
        return Headphones;
      default:
        return Speaker;
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.y < -threshold) {
      // Swiped up - expand player
      setIsExpanded(true);
    } else if (info.offset.y > threshold && isExpanded) {
      // Swiped down - collapse player
      setIsExpanded(false);
    }
    
    // Reset position
    controls.start({ y: 0 });
    setDragOffset(0);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragOffset(info.offset.y);
  };

  // Expanded player variants
  const expandedVariants = {
    collapsed: { 
      height: "auto", 
      borderRadius: "0px",
      scale: 1,
    },
    expanded: { 
      height: "100vh", 
      borderRadius: "0px",
      scale: 1,
    }
  };

  const backgroundVariants = {
    collapsed: {
      background: "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.95) 100%)",
    },
    expanded: {
      background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)`,
    }
  };

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Mini Player */}
      <motion.div
        animate={isExpanded ? "expanded" : "collapsed"}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        variants={expandedVariants}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed left-0 right-0 z-50 overflow-hidden ${
          isExpanded ? "top-0 bottom-0" : "bottom-0"
        }`}
      >
        <motion.div
          variants={backgroundVariants}
          animate={isExpanded ? "expanded" : "collapsed"}
          className="w-full h-full backdrop-blur-xl border-t border-white/10"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Collapsed View */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-3"
              >
                {/* Progress Bar */}
                <div
                  className="h-1 bg-white/20 cursor-pointer relative group mb-3 rounded-full"
                  onClick={handleProgressClick}
                >
                  <motion.div
                    className="h-full bg-white relative rounded-full"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Left: Song Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img
                      src={currentSong.coverImageURL}
                      alt={currentSong.title}
                      className="w-12 h-12 rounded-lg object-cover shadow-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium text-sm truncate">
                        {currentSong.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {currentSong.artist}
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLikeSong(currentSong.id)}
                      className={`p-2 ${
                        userPreferences.likedSongs.has(currentSong.id)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          userPreferences.likedSongs.has(currentSong.id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </motion.button>
                  </div>

                  {/* Center: Play Controls */}
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={previousSong}
                      className="text-white"
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isPlaying ? pauseSong : resumeSong}
                      className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextSong}
                      className="text-white"
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Right: Device Menu */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDevices(!showDevices)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Cast className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col h-full pt-8 pb-safe"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsExpanded(false)}
                    className="p-2 text-white"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </motion.button>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Playing from playlist
                    </p>
                    <p className="text-sm text-white font-medium">
                      Liked Songs
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-white"
                  >
                    <MoreHorizontal className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Album Art */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative mb-8"
                  >
                    <img
                      src={currentSong.coverImageURL}
                      alt={currentSong.title}
                      className="w-80 h-80 max-w-[80vw] max-h-[80vw] rounded-2xl object-cover shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                  </motion.div>

                  {/* Song Info */}
                  <div className="text-center mb-8 px-6">
                    <h1 className="text-2xl font-bold text-white mb-2 truncate">
                      {currentSong.title}
                    </h1>
                    <p className="text-lg text-gray-300 truncate">
                      {currentSong.artist}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="w-full px-6 mb-8">
                    <div
                      className="h-1 bg-white/20 cursor-pointer relative group rounded-full mb-2"
                      onClick={handleProgressClick}
                    >
                      <motion.div
                        className="h-full bg-white relative rounded-full"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between w-full px-6 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleShuffle}
                      className={`p-3 ${
                        isShuffle ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      <Shuffle className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={previousSong}
                      className="text-white"
                    >
                      <SkipBack className="w-8 h-8" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isPlaying ? pauseSong : resumeSong}
                      className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-lg"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextSong}
                      className="text-white"
                    >
                      <SkipForward className="w-8 h-8" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleRepeat}
                      className={`p-3 relative ${
                        repeatMode !== "off" ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      <Repeat className="w-6 h-6" />
                      {repeatMode === "one" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-xs font-bold flex items-center justify-center text-white">
                          1
                        </span>
                      )}
                    </motion.button>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between w-full px-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDevices(!showDevices)}
                      className="p-3 text-gray-400"
                    >
                      <Cast className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLikeSong(currentSong.id)}
                      className={`p-3 ${
                        userPreferences.likedSongs.has(currentSong.id)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          userPreferences.likedSongs.has(currentSong.id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </motion.button>

                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        className="p-3 text-gray-400"
                      >
                        <VolumeIcon className="w-6 h-6" />
                      </motion.button>
                      
                      <div className="w-24">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Devices Overlay */}
      <AnimatePresence>
        {showDevices && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-20 mx-4 md:bottom-24 md:right-4 md:left-auto md:w-80 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl z-60 shadow-2xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Connect to a device
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDevices(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-3">
                {devices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  return (
                    <motion.div
                      key={device.id}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        device.active
                          ? "bg-green-500/20 border border-green-500/50"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <DeviceIcon
                          className={`w-6 h-6 ${
                            device.active ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-white">{device.name}</p>
                          <p className="text-sm text-gray-400 capitalize">
                            {device.type}
                          </p>
                        </div>
                      </div>
                      {device.active && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-500">Playing</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
        }

        .slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}
