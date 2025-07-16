import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Pause, SkipForward, Heart, ChevronUp } from "lucide-react";

interface MiniPlayerProps {
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export function MiniPlayer({
  isPlaying = true,
  onTogglePlay,
}: MiniPlayerProps) {
  const [isLiked, setIsLiked] = useState(false);

  const currentSong = {
    title: "Blinding Lights",
    artist: "The Weeknd",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-16 left-0 right-0 z-30 mx-4 mb-2"
    >
      <Link to="/player">
        <div className="bg-gradient-to-r from-dark-surface to-darker-surface border border-white/10 rounded-xl p-3 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-3">
            {/* Album Art */}
            <div className="relative flex-shrink-0">
              <img
                src={currentSong.image}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate">
                {currentSong.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentSong.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? "text-red-500 fill-current" : "text-gray-400"
                  }`}
                />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePlay?.();
                }}
                className="w-10 h-10 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center"
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

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2"
              >
                <ChevronUp className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1 bg-white/10 rounded-full">
              <div className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full w-1/3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
