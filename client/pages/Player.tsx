import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Player() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(45);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(75);

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(Math.floor(newTime));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-400">PLAYING FROM PLAYLIST</p>
            <p className="text-sm font-medium">Trending Hits 2024</p>
          </div>
          <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </motion.div>

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
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
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
          </div>
        </motion.div>

        {/* Song Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Blinding Lights</h2>
          <p className="text-gray-400 text-lg">The Weeknd</p>
        </motion.div>

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

        {/* Control Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-8 py-4"
        >
          <div className="flex items-center justify-center space-x-8">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-3 ${isShuffle ? "text-neon-green" : "text-gray-400"}`}
            >
              <Shuffle className="w-6 h-6" />
            </button>

            <button className="p-4 text-white">
              <SkipBack className="w-8 h-8" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-black" />
              ) : (
                <Play className="w-10 h-10 text-black ml-1" />
              )}
            </button>

            <button className="p-4 text-white">
              <SkipForward className="w-8 h-8" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-3 ${isRepeat ? "text-neon-green" : "text-gray-400"}`}
            >
              <Repeat className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="px-8 pb-8"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 ${isLiked ? "text-red-500" : "text-gray-400"}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <div className="flex items-center space-x-4">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="w-24 h-1 bg-white/20 rounded-full">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>

            <button className="p-3 text-gray-400">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
