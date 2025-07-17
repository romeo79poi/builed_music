import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Play,
  Pause,
  MoreHorizontal,
  ChevronRight,
  Home,
  Library,
  Heart,
  Clock,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { MiniPlayer } from "../components/MiniPlayer";
import { useProfileContext } from "../context/ProfileContext";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { profile } = useProfileContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);

  const handleSearchClick = () => {
    console.log("Navigating to search page...");
    navigate("/search");
  };

  const handleProfileClick = () => {
    console.log("Navigating to profile page...");
    navigate("/profile");
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const recentlyPlayed = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      isPlaying: false,
    },
    {
      id: 2,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      isPlaying: true,
    },
    {
      id: 3,
      title: "Levitating",
      artist: "Dua Lipa",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      isPlaying: false,
    },
    {
      id: 4,
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      isPlaying: false,
    },
    {
      id: 5,
      title: "Stay",
      artist: "The Kid LAROI",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
      isPlaying: false,
    },
    {
      id: 6,
      title: "Heat Waves",
      artist: "Glass Animals",
      image:
        "https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop",
      isPlaying: false,
    },
  ];

  const topMixes = [
    {
      id: 1,
      title: "Daily Mix 1",
      description: "The Weeknd, Dua Lipa, Harry Styles and more",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Daily Mix 2",
      description: "Pop hits you can't stop playing",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Discover Weekly",
      description: "Your weekly mixtape of fresh music",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Release Radar",
      description: "Catch all the latest music from artists you follow",
      image:
        "https://images.unsplash.com/photo-1571974599782-87624638275c?w=300&h=300&fit=crop",
    },
  ];

  const recommendations = [
    {
      id: 1,
      title: "Anti-Hero",
      artist: "Taylor Swift",
      album: "Midnights",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      duration: "3:20",
    },
    {
      id: 2,
      title: "Flowers",
      artist: "Miley Cyrus",
      album: "Endless Summer Vacation",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      duration: "3:20",
    },
    {
      id: 3,
      title: "Unholy",
      artist: "Sam Smith",
      album: "Gloria",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      duration: "2:36",
    },
    {
      id: 4,
      title: "As It Was",
      artist: "Harry Styles",
      album: "Harry's House",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      duration: "2:47",
    },
  ];

  const genres = [
    { id: 1, name: "Pop", color: "from-pink-500 to-purple-600" },
    { id: 2, name: "Hip-Hop", color: "from-orange-500 to-red-600" },
    { id: 3, name: "Rock", color: "from-gray-600 to-gray-800" },
    { id: 4, name: "Electronic", color: "from-blue-500 to-cyan-600" },
    { id: 5, name: "Jazz", color: "from-yellow-500 to-orange-600" },
    { id: 6, name: "Classical", color: "from-indigo-500 to-purple-600" },
    { id: 7, name: "R&B", color: "from-green-500 to-teal-600" },
    { id: 8, name: "Country", color: "from-amber-500 to-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-sm sticky top-0 z-20"
        >
          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className="hover:scale-110 transition-transform relative group"
            title="Go to Profile"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center shadow-lg group-hover:shadow-neon-green/50 p-0.5">
              {profile.profilePicture ? (
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={profile.profilePicture}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Profile
            </div>
          </button>

          {/* Logo */}
          <div className="flex items-center absolute left-1/2 transform -translate-x-1/2">
            <MusicCatchLogo animated={false} className="w-8 h-8" />
            <span className="ml-3 text-xl font-bold hidden sm:block">
              Music Catch
            </span>
          </div>

          {/* Search Icon */}
          <button
            onClick={handleSearchClick}
            className="hover:scale-110 transition-transform relative group"
            title="Go to Search"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 relative overflow-hidden">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              {/* Inner glow ring */}
              <div className="absolute inset-0.5 bg-gradient-to-br from-purple-300 via-pink-300 to-red-300 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <Search className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-900/90 to-pink-900/90 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
              Search
            </div>
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="p-4 md:p-6 space-y-8">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {greeting}
              </h1>
              <p className="text-gray-400">Feel The Music_Catch Beats</p>
            </motion.div>

            {/* Recently Played */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  Recently Played
                </h2>
                <button className="text-gray-400 hover:text-white text-sm">
                  Show all
                </button>
              </div>
              <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                {recentlyPlayed.map((item) => (
                  <Link to="/player" key={item.id} className="flex-shrink-0">
                    <div className="group relative w-40 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="relative mb-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full aspect-square object-cover rounded-md"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsPlaying(!isPlaying);
                          }}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          {item.isPlaying ? (
                            <Pause className="w-5 h-5 text-black" />
                          ) : (
                            <Play className="w-5 h-5 text-black ml-0.5" />
                          )}
                        </button>
                      </div>
                      <h3 className="font-medium text-sm truncate">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {item.artist}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Your Top Mixes */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  Your Top Mixes
                </h2>
                <button className="text-gray-400 hover:text-white text-sm">
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topMixes.map((mix) => (
                  <Link to="/player" key={mix.id}>
                    <div className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="relative mb-3">
                        <img
                          src={mix.image}
                          alt={mix.title}
                          className="w-full aspect-square object-cover rounded-md"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsPlaying(true);
                          }}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          <Play className="w-5 h-5 text-black ml-0.5" />
                        </button>
                      </div>
                      <h3 className="font-medium text-sm mb-1">{mix.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {mix.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Recommended for You */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  Recommended for You
                </h2>
                <button className="text-gray-400 hover:text-white text-sm">
                  Show all
                </button>
              </div>
              <div className="space-y-2">
                {recommendations.map((song, index) => (
                  <Link to="/player" key={song.id}>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-all group cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <img
                          src={song.image}
                          alt={song.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsPlaying(true);
                          }}
                          className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {song.title}
                        </h3>
                        <p className="text-gray-400 text-xs truncate">
                          {song.artist}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className="w-4 h-4 text-gray-400 hover:text-neon-green" />
                        </button>
                        <span className="text-gray-400 text-xs">
                          {song.duration}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Genres */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Browse Genres</h2>
                <button className="text-gray-400 hover:text-white text-sm">
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {genres.map((genre) => (
                  <Link to="/search" key={genre.id}>
                    <div
                      className={`bg-gradient-to-br ${genre.color} rounded-lg p-4 h-24 flex items-end cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <h3 className="font-bold text-white text-lg">
                        {genre.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          </div>
        </div>

        {/* Mini Player */}
        <MiniPlayer
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-20">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Link to="/home" className="flex flex-col items-center py-2">
              <Home className="w-6 h-6 text-neon-green mb-1" />
              <span className="text-neon-green text-xs font-medium">Home</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center py-2">
              <Search className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Search</span>
            </Link>

            <Link to="/library" className="flex flex-col items-center py-2">
              <Library className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Library</span>
            </Link>

            <Link to="/history" className="flex flex-col items-center py-2">
              <Clock className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">History</span>
            </Link>

            <Link to="/profile" className="flex flex-col items-center py-2">
              <User className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
