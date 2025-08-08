import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, ChevronLeft, Music, Headphones, Radio, Disc3 } from "lucide-react";
import { useEnhancedMusic, type Song } from "../context/EnhancedMusicContext";
import { useToast } from "../hooks/use-toast";
import EnhancedMiniPlayer from "../components/EnhancedMiniPlayer";

const demoSongs: Song[] = [
  {
    id: "demo-1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    duration: 200,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "Synthwave",
    year: 2020,
    explicit: false,
  },
  {
    id: "demo-2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    coverImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    duration: 174,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    genre: "Pop",
    year: 2020,
    explicit: false,
  },
  {
    id: "demo-3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    coverImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    duration: 203,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    genre: "Pop",
    year: 2020,
    explicit: false,
  },
  {
    id: "demo-4",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "Sour",
    coverImageURL: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
    duration: 178,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    genre: "Pop Rock",
    year: 2021,
    explicit: false,
  },
  {
    id: "demo-5",
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    album: "F*ck Love 3",
    coverImageURL: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    duration: 141,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    genre: "Pop",
    year: 2021,
    explicit: true,
  },
];

export default function MusicDemo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const enhancedMusic = useEnhancedMusic();

  const demoPlaylist = {
    id: "demo-playlist",
    name: "CATCH Demo Playlist",
    description: "Experience the full Spotify-like music player",
    songs: demoSongs,
    isPublic: true,
    createdBy: "catch-demo",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handlePlaySong = (song: Song, index: number) => {
    enhancedMusic.playSong(song, demoPlaylist, index);
    toast({
      title: "Now Playing",
      description: `${song.title} by ${song.artist}`,
    });
  };

  const handlePlayAll = () => {
    enhancedMusic.playSong(demoSongs[0], demoPlaylist, 0);
    toast({
      title: "Playing Demo Playlist",
      description: "Enjoy the full Spotify-like experience!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <h1 className="text-xl font-bold">Music Player Demo</h1>

        <div className="w-9" /> {/* Spacer */}
      </motion.header>

      {/* Main Content */}
      <main className="p-6 pb-32">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Disc3 className="w-16 h-16 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Spotify-Like Player
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Full-featured music player with all the controls you love
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white font-semibold flex items-center space-x-3 mx-auto hover:shadow-lg transition-all"
          >
            <Play className="w-5 h-5" />
            <span>Play Demo Playlist</span>
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Music className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Full Audio Controls</h3>
            <p className="text-gray-400">Play, pause, skip, shuffle, repeat with real audio playback</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Headphones className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Device Switching</h3>
            <p className="text-gray-400">Connect and switch between different playback devices</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Radio className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Queue Management</h3>
            <p className="text-gray-400">View queue, lyrics, and related songs</p>
          </div>
        </motion.div>

        {/* Demo Playlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-bold mb-6">Demo Playlist</h2>
          
          <div className="space-y-4">
            {demoSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                onClick={() => handlePlaySong(song, index)}
                className="flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all group"
              >
                <div className="relative">
                  <img
                    src={song.coverImageURL}
                    alt={song.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{song.genre}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{song.year}</span>
                    {song.explicit && (
                      <>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="bg-gray-500 text-white text-xs px-1 py-0.5 rounded">E</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm text-gray-400">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
        >
          <h3 className="text-xl font-semibold mb-4">How to Use</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Click any song to start playing with the mini player</li>
            <li>• Use the player controls at the bottom for play/pause, skip, and volume</li>
            <li>• Click the maximize button to open the full-screen player</li>
            <li>• Try shuffle, repeat, and device switching features</li>
            <li>• Access lyrics, queue, and related songs in the full player</li>
          </ul>
        </motion.div>
      </main>

      {/* Enhanced Mini Player */}
      <EnhancedMiniPlayer />
    </div>
  );
}
