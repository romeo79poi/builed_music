import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  MoreHorizontal,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Volume1,
  Plus,
  Download,
  List,
  Mic2,
  Settings,
  Cast,
  Radio,
  Clock,
  Zap,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Sliders,
  Timer,
  Headphones,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMusicContext } from "../context/MusicContext";
import { useProfileContext } from "../context/ProfileContext";
import { useToast } from "../hooks/use-toast";
import { BackButton } from "../components/ui/back-button";

export default function Player() {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    togglePlay,
    setCurrentSong,
    queue,
    setQueue,
  } = useMusicContext();
  const { profile, toggleLikedSong } = useProfileContext();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [currentTime, setCurrentTime] = useState(45);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(75);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [crossfade, setCrossfade] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [audioQuality, setAudioQuality] = useState("High");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Equalizer bands
  const [eqBands, setEqBands] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const eqLabels = [
    "60Hz",
    "170Hz",
    "310Hz",
    "600Hz",
    "1kHz",
    "3kHz",
    "6kHz",
    "12kHz",
  ];

  // Lyrics data
  const lyrics = [
    {
      time: 0,
      text: "Yeah, I feel like I'm just missing something when you're gone",
    },
    { time: 10, text: "What we had was so strong, now I'm missing you" },
    { time: 20, text: "I've been trying to find my way back home" },
    { time: 30, text: "But these city lights ain't nothing like your glow" },
    { time: 45, text: "I've been running all night long" },
    { time: 55, text: "Trying to get back to where I belong" },
    { time: 65, text: "I can't sleep until I feel your touch" },
    { time: 75, text: "I said, ooh, I'm blinded by the lights" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatSleepTimer = (minutes: number) => {
    if (minutes === 0) return "Off";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleSkipBack = () => {
    if (currentTime > 10) {
      setCurrentTime(Math.max(0, currentTime - 10));
    } else {
      handlePrevious();
    }
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  const handlePrevious = () => {
    const currentIndex = queue.findIndex((song) => song.id === currentSong?.id);
    if (currentIndex > 0) {
      setCurrentSong(queue[currentIndex - 1]);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    const currentIndex = queue.findIndex((song) => song.id === currentSong?.id);
    if (currentIndex < queue.length - 1) {
      setCurrentSong(queue[currentIndex + 1]);
      setCurrentTime(0);
    } else if (recommendations.length > 0) {
      setCurrentSong(recommendations[0]);
      setCurrentTime(0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(Math.floor(newTime));
  };

  const handleRepeatToggle = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 1) return <Repeat className="w-6 h-6" />;
    if (repeatMode === 2)
      return (
        <div className="relative">
          <Repeat className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 text-xs">1</span>
        </div>
      );
    return <Repeat className="w-6 h-6" />;
  };

  const getCurrentLyric = () => {
    const currentLyric = lyrics
      .filter((lyric) => lyric.time <= currentTime)
      .pop();
    return currentLyric?.text || "";
  };

  const updateEQBand = (index: number, value: number) => {
    const newBands = [...eqBands];
    newBands[index] = value;
    setEqBands(newBands);
  };

  const eqPresets = {
    Flat: [0, 0, 0, 0, 0, 0, 0, 0],
    Rock: [4, 3, -1, -2, 1, 2, 3, 4],
    Pop: [2, 1, 0, 1, 2, 2, 1, 0],
    Jazz: [3, 2, 1, 2, -1, -1, 1, 2],
    Classical: [3, 2, -1, -2, -1, 1, 2, 3],
    "Bass Boost": [6, 4, 2, 0, -1, -1, 0, 1],
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 pt-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-400">PLAYING FROM PLAYLIST</p>
            <p className="text-sm font-medium">Trending Hits 2024</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors">
              <Cast className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Side - Player */}
          <div
            className={`${showQueue ? "w-2/3" : "w-full"} flex flex-col transition-all duration-300`}
          >
            {/* Album Art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 flex items-center justify-center px-8 py-8"
            >
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-neon-green to-neon-blue rounded-3xl p-1">
                  <div className="w-full h-full bg-gray-800 rounded-3xl overflow-hidden">
                    <img
                      src={
                        currentSong?.image ||
                        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
                      }
                      alt="Album Art"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Vinyl Record Effect */}
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{
                    duration: 3,
                    repeat: isPlaying ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-black/20 rounded-3xl"
                />
                {/* Download Status */}
                {isOffline && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Song Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-2">
                {currentSong?.title || "No Song Selected"}
              </h2>
              <p className="text-gray-400 text-lg">
                {currentSong?.artist || "Unknown Artist"}
              </p>
              <p className="text-gray-500 text-sm">
                {currentSong?.album || "Unknown Album"}
              </p>
            </motion.div>

            {/* Lyrics Display */}
            <AnimatePresence>
              {showLyrics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-8 py-4 text-center"
                >
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-lg font-medium text-neon-green">
                      {getCurrentLyric()}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-8 py-6"
            >
              <div className="relative">
                <div
                  className="h-1 bg-white/20 rounded-full cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </motion.div>

            {/* Main Control Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="px-8 py-4"
            >
              <div className="flex items-center justify-center space-x-8">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-3 ${isShuffle ? "text-neon-green" : "text-gray-400"} hover:text-white transition-colors`}
                >
                  <Shuffle className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="p-4 text-white hover:text-neon-green transition-colors"
                  disabled={
                    queue.findIndex((song) => song.id === currentSong?.id) === 0
                  }
                >
                  <SkipBack className="w-8 h-8" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-black" />
                  ) : (
                    <Play className="w-10 h-10 text-black ml-1" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-4 text-white hover:text-neon-green transition-colors"
                  disabled={false}
                >
                  <SkipForward className="w-8 h-8" />
                </button>

                <button
                  onClick={handleRepeatToggle}
                  className={`p-3 ${repeatMode > 0 ? "text-neon-green" : "text-gray-400"} hover:text-white transition-colors`}
                >
                  {getRepeatIcon()}
                </button>
              </div>
            </motion.div>

            {/* Secondary Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="px-8 pb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 ${isLiked ? "text-red-500" : "text-gray-400"} hover:text-red-400 transition-colors`}
                  >
                    <Heart
                      className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                    />
                  </button>

                  <button className="p-3 text-gray-400 hover:text-white transition-colors">
                    <Plus className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsOffline(!isOffline)}
                    className={`p-3 ${isOffline ? "text-neon-green" : "text-gray-400"} hover:text-white transition-colors`}
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`p-3 ${showLyrics ? "text-neon-green" : "text-gray-400"} hover:text-white transition-colors`}
                  >
                    <Mic2 className="w-6 h-6" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setVolume(volume === 0 ? 75 : 0)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : volume < 50 ? (
                        <Volume1 className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <div className="w-24 h-1 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-white rounded-full cursor-pointer"
                        style={{ width: `${volume}%` }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const newVolume = (clickX / rect.width) * 100;
                          setVolume(Math.floor(newVolume));
                        }}
                      />
                    </div>
                  </div>

                  <button className="p-3 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Advanced Controls Row */}
              <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowEqualizer(!showEqualizer)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${showEqualizer ? "bg-neon-green/20 text-neon-green" : "text-gray-400 hover:text-white"} transition-colors`}
                >
                  <Sliders className="w-4 h-4" />
                  <span className="text-sm">EQ</span>
                </button>

                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-transparent text-sm text-gray-400 border-none outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-gray-400" />
                  <select
                    value={sleepTimer}
                    onChange={(e) => setSleepTimer(Number(e.target.value))}
                    className="bg-transparent text-sm text-gray-400 border-none outline-none"
                  >
                    <option value={0}>Off</option>
                    <option value={15}>15m</option>
                    <option value={30}>30m</option>
                    <option value={45}>45m</option>
                    <option value={60}>1h</option>
                    <option value={120}>2h</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={crossfade}
                    onChange={(e) => setCrossfade(Number(e.target.value))}
                    className="w-16 h-1 bg-white/20 rounded-full appearance-none"
                  />
                  <span className="text-xs text-gray-400">{crossfade}s</span>
                </div>

                <div className="flex items-center space-x-2">
                  {navigator.onLine ? (
                    <Wifi className="w-4 h-4 text-neon-green" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs text-gray-400">{audioQuality}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Queue */}
          <AnimatePresence>
            {showQueue && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="w-1/3 bg-white/5 backdrop-blur-sm border-l border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Queue</h3>
                  <button
                    onClick={() => setShowQueue(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {queue.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => setCurrentSong(track)}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        track.id === currentSong?.id
                          ? "bg-neon-green/20 border border-neon-green/30"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <img
                        src={track.image}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {track.title}
                        </h4>
                        <p className="text-gray-400 text-xs truncate">
                          {track.artist}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {profile.likedSongs?.includes(track.id.toString()) && (
                          <Heart className="w-3 h-3 text-red-500 fill-current" />
                        )}
                        <span className="text-xs text-gray-400">
                          {track.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Equalizer Panel */}
        <AnimatePresence>
          {showEqualizer && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Equalizer</h3>
                <div className="flex items-center space-x-4">
                  <select
                    onChange={(e) => {
                      const preset =
                        eqPresets[e.target.value as keyof typeof eqPresets];
                      if (preset) setEqBands(preset);
                    }}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="">Select Preset</option>
                    {Object.keys(eqPresets).map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowEqualizer(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-center space-x-4">
                {eqBands.map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className="text-xs text-gray-400">
                      {value > 0 ? "+" : ""}
                      {value}
                    </div>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={value}
                      onChange={(e) =>
                        updateEQBand(index, Number(e.target.value))
                      }
                      className="w-8 h-32 bg-white/20 rounded-full appearance-none writing-mode-vertical-lr transform rotate-180"
                    />
                    <div className="text-xs text-gray-400">
                      {eqLabels[index]}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
