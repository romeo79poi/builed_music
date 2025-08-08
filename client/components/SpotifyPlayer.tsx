import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  Mic2,
  ListMusic,
  Maximize2,
  Minimize2,
  ChevronDown,
  MoreHorizontal,
  Share,
  Download,
  Plus,
  Minus,
  PictureInPicture,
  Settings,
  Radio,
  Cast,
  Bluetooth,
  Headphones,
  Monitor,
  Smartphone,
  Laptop,
  Speaker,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverImageURL: string;
  duration: number;
  url: string;
  genre?: string;
  year?: number;
  explicit?: boolean;
}

interface SpotifyPlayerProps {
  currentSong?: Song;
  playlist?: Song[];
  onClose?: () => void;
  className?: string;
}

export default function SpotifyPlayer({
  currentSong: propCurrentSong,
  playlist = [],
  onClose,
  className = "",
}: SpotifyPlayerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Default song if none provided
  const defaultSong: Song = {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverImageURL:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    duration: 200,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "Synthwave",
    year: 2020,
    explicit: false,
  };

  // Player state
  const [currentSong, setCurrentSong] = useState<Song>(
    propCurrentSong || defaultSong,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Playback modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  // UI states
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  // Queue management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queueHistory, setQueueHistory] = useState<Song[]>([]);
  const [upNext, setUpNext] = useState<Song[]>(playlist.slice(1, 6));

  // Available devices
  const [devices] = useState([
    {
      id: "computer",
      name: "This Computer",
      type: "computer",
      active: true,
      volume: 70,
    },
    {
      id: "phone",
      name: "John's iPhone",
      type: "smartphone",
      active: false,
      volume: 0,
    },
    {
      id: "speaker",
      name: "Living Room Speaker",
      type: "speaker",
      active: false,
      volume: 0,
    },
    {
      id: "headphones",
      name: "AirPods Pro",
      type: "headphones",
      active: false,
      volume: 0,
    },
  ]);

  // Sample lyrics
  const [lyrics] = useState([
    { time: 0, text: "Yeah" },
    { time: 8, text: "I've been tryna call" },
    { time: 12, text: "I've been on my own for long enough" },
    { time: 16, text: "Maybe you can show me how to love, maybe" },
    {
      time: 24,
      text: "I feel like I'm just missing something when you're gone",
    },
    { time: 32, text: "Something in the way you move" },
    { time: 36, text: "Makes me feel like I can't live without you" },
    { time: 40, text: "It takes me all the way" },
    { time: 44, text: "I want you to stay" },
  ]);

  // Audio setup and event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleEnded = () => handleNext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load song
  useEffect(() => {
    if (audioRef.current && currentSong.url) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
    }
  }, [currentSong.url]);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Player controls
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentTime > 5) {
      // If more than 5 seconds in, restart current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      // Go to previous song
      const prevIndex = isShuffle
        ? Math.floor(Math.random() * playlist.length)
        : Math.max(0, currentIndex - 1);

      if (playlist[prevIndex]) {
        setCurrentSong(playlist[prevIndex]);
        setCurrentIndex(prevIndex);
        if (queueHistory.length > 0) {
          setQueueHistory((prev) => prev.slice(0, -1));
        }
      }
    }
  };

  const handleNext = () => {
    if (repeatMode === "one") {
      // Repeat current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    if (playlist[nextIndex]) {
      setQueueHistory((prev) => [...prev, currentSong]);
      setCurrentSong(playlist[nextIndex]);
      setCurrentIndex(nextIndex);
      setUpNext(playlist.slice(nextIndex + 1, nextIndex + 6));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleRepeat = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);

    toast({
      title: `Repeat ${nextMode === "off" ? "disabled" : nextMode === "all" ? "playlist" : "track"}`,
      description:
        nextMode === "off"
          ? "Repeat turned off"
          : nextMode === "all"
            ? "Repeating playlist"
            : "Repeating current track",
    });
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    toast({
      title: isShuffle ? "Shuffle disabled" : "Shuffle enabled",
      description: isShuffle ? "Playing in order" : "Playing randomly",
    });
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.3) return Volume1;
    return Volume2;
  };

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
      case "laptop":
        return Laptop;
      default:
        return Speaker;
    }
  };

  const VolumeIcon = getVolumeIcon();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white ${className}`}
    >
      {/* Audio element */}
      <audio ref={audioRef} />

      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-green-900/20" />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-4 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </motion.button>

        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Playing from playlist
          </p>
          <h1 className="text-sm font-semibold">My Playlist #1</h1>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPictureInPicture(!isPictureInPicture)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <PictureInPicture className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose || (() => navigate(-1))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 pb-32">
        {/* Album Art */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative mb-8"
        >
          <div className="relative">
            <motion.img
              animate={{
                rotate: isPlaying ? 360 : 0,
                scale: isPlaying ? 1.02 : 1,
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "linear",
                },
                scale: { duration: 0.3 },
              }}
              src={currentSong.coverImageURL}
              alt={currentSong.title}
              className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl object-cover shadow-2xl"
            />

            {/* Vinyl effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/20" />

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                />
              </div>
            )}

            {/* Glow effect */}
            <motion.div
              animate={{
                boxShadow: isPlaying
                  ? [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 40px rgba(59, 130, 246, 0.6)",
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                    ]
                  : "0 0 20px rgba(59, 130, 246, 0.3)",
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
          className="text-center mb-8 max-w-md"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            {currentSong.explicit && (
              <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded">
                E
              </span>
            )}
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {currentSong.genre} • {currentSong.year}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
            {currentSong.title}
          </h2>
          <p className="text-lg text-gray-300 mb-4">{currentSong.artist}</p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full transition-all ${
                isLiked
                  ? "bg-green-500/20 text-green-500"
                  : "bg-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Share className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors"
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
          className="w-full max-w-2xl mb-8"
        >
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="relative h-2 bg-white/20 rounded-full cursor-pointer group mb-2"
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <motion.div
              className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
              whileHover={{ scale: 1.2 }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </motion.div>

        {/* Player Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center space-x-6 mb-8"
        >
          {/* Shuffle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleShuffle}
            className={`p-3 rounded-full transition-all ${
              isShuffle
                ? "bg-green-500/20 text-green-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </motion.button>

          {/* Previous */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            className="p-3 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <SkipBack className="w-6 h-6" />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </motion.button>

          {/* Next */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="p-3 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <SkipForward className="w-6 h-6" />
          </motion.button>

          {/* Repeat */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRepeat}
            className={`p-3 rounded-full transition-all relative ${
              repeatMode !== "off"
                ? "bg-green-500/20 text-green-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === "one" && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-xs font-bold flex items-center justify-center text-white">
                1
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Bottom Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex items-center justify-between w-full max-w-2xl"
        >
          {/* Left controls */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-2 rounded-full transition-all ${
                showLyrics
                  ? "bg-green-500/20 text-green-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Mic2 className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-full transition-all ${
                showQueue
                  ? "bg-blue-500/20 text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ListMusic className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDevices(!showDevices)}
              className={`p-2 rounded-full transition-all ${
                showDevices
                  ? "bg-purple-500/20 text-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Cast className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Volume control */}
          <div
            className="flex items-center space-x-3"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <VolumeIcon className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 120 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {/* Lyrics Overlay */}
        {showLyrics && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Lyrics</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowLyrics(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {lyrics.map((lyric, index) => (
                  <motion.p
                    key={index}
                    className={`text-lg transition-all duration-300 ${
                      currentTime >= lyric.time &&
                      (index === lyrics.length - 1 ||
                        currentTime < lyrics[index + 1]?.time)
                        ? "text-green-400 font-semibold scale-105"
                        : "text-gray-400"
                    }`}
                  >
                    {lyric.text}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Queue Overlay */}
        {showQueue && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Queue</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowQueue(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Now Playing */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">
                  NOW PLAYING
                </h4>
                <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <img
                    src={currentSong.coverImageURL}
                    alt={currentSong.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {currentSong.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {currentSong.artist}
                    </p>
                  </div>
                </div>
              </div>

              {/* Up Next */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">
                  UP NEXT
                </h4>
                <div className="space-y-2">
                  {upNext.map((song, index) => (
                    <motion.div
                      key={song.id}
                      whileHover={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      }}
                      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        setCurrentSong(song);
                        setCurrentIndex(currentIndex + index + 1);
                      }}
                    >
                      <img
                        src={song.coverImageURL}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {song.artist}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatTime(song.duration)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Devices Overlay */}
        {showDevices && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 h-96 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50 rounded-t-3xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Connect to a device</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDevices(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-3">
                {devices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  return (
                    <motion.div
                      key={device.id}
                      whileHover={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      }}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                        device.active
                          ? "bg-green-500/20 border border-green-500/50"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <DeviceIcon
                          className={`w-6 h-6 ${device.active ? "text-green-500" : "text-gray-400"}`}
                        />
                        <div>
                          <p className="font-medium text-white">
                            {device.name}
                          </p>
                          <p className="text-sm text-gray-400 capitalize">
                            {device.type}
                          </p>
                        </div>
                      </div>
                      {device.active && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-500">
                            Connected
                          </span>
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
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
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
    </div>
  );
}
