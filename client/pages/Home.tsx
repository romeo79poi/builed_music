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
  Loader2,
  Download,
  Share,
  Plus,
  Shuffle,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { MiniPlayer } from "../components/MiniPlayer";
import QuickSongSearch from "../components/QuickSongSearch";
import LikeButton from "../components/LikeButton";
import { useProfileContext } from "../context/ProfileContext";
import { useMusicContext } from "../context/MusicContext";
import { useToast } from "../hooks/use-toast";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { profile } = useProfileContext();
  const { currentSong, isPlaying, setCurrentSong, togglePlay, queue, setQueue } = useMusicContext();
  const { toast } = useToast();
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Load all home page data concurrently with authentication
      const [
        trendingRes,
        playlistsRes,
        recommendationsRes,
        genresRes,
        recentRes,
      ] = await Promise.all([
        fetch("/api/music/trending?limit=12", { headers }),
        fetch("/api/music/playlists/featured?limit=8", { headers }),
        fetch("/api/music/recommendations?limit=10", { headers }),
        fetch("/api/music/genres", { headers }),
        fetch("/api/music/recently-played?limit=8", { headers }),
      ]);

      const [trending, playlists, recs, genresData, recent] = await Promise.all([
        trendingRes.json(),
        playlistsRes.json(),
        recommendationsRes.json(),
        genresRes.json(),
        recentRes.json(),
      ]);

      if (trending.success) setTrendingSongs(trending.songs || trending.data || []);
      if (playlists.success) setFeaturedPlaylists(playlists.playlists || playlists.data || []);
      if (recs.success) setRecommendations(recs.recommendations || recs.data || []);
      if (genresData.success) setGenres(genresData.genres || genresData.data || []);
      if (recent.success) setRecentlyPlayed(recent.recentlyPlayed || recent.data || []);
    } catch (error) {
      console.error("Failed to load home data:", error);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    setTrendingSongs(fallbackTrendingSongs);
    setFeaturedPlaylists(fallbackPlaylists);
    setRecommendations(fallbackRecommendations);
    setGenres(fallbackGenres);
    setRecentlyPlayed(fallbackRecentlyPlayed);
  };

  const handlePlaySong = async (song: any) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`/api/music/play/${song.id}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId: profile.id }),
        });
      }

      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    } catch (error) {
      console.error("Failed to track play:", error);
      // Still allow playing even if tracking fails
      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    }
  };

  const handlePlayPlaylist = (playlist: any) => {
    if (playlist.songs && playlist.songs.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
    } else {
      toast({
        title: "Empty Playlist",
        description: "This playlist doesn't have any songs yet.",
      });
    }
  };

  const handleShufflePlay = (songs: any[]) => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentSong(shuffled[0]);
  };

  // Fallback data
  const fallbackTrendingSongs = [
    {
      id: "1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      duration: "3:20",
      plays: 45672,
    },
    {
      id: "2", 
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      duration: "2:54",
      plays: 38934,
    },
    {
      id: "3",
      title: "Levitating",
      artist: "Dua Lipa", 
      album: "Future Nostalgia",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      duration: "3:23",
      plays: 42156,
    },
    {
      id: "4",
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=300&h=300&fit=crop",
      duration: "2:58",
      plays: 39821,
    },
  ];

  const fallbackPlaylists = [
    {
      id: "1",
      name: "Today's Top Hits",
      description: "The most played songs right now",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      songs: fallbackTrendingSongs,
      totalSongs: 50,
    },
    {
      id: "2", 
      name: "Chill Hits",
      description: "Kick back and relax",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      songs: fallbackTrendingSongs,
      totalSongs: 30,
    },
  ];

  const fallbackRecommendations = fallbackTrendingSongs.slice(0, 6);
  const fallbackGenres = [
    { id: "1", name: "Pop", color: "from-pink-500 to-purple-600", image: "🎵" },
    { id: "2", name: "Hip-Hop", color: "from-orange-500 to-red-600", image: "🎤" },
    { id: "3", name: "Rock", color: "from-gray-600 to-gray-800", image: "🎸" },
    { id: "4", name: "Electronic", color: "from-blue-500 to-cyan-600", image: "🎧" },
  ];
  const fallbackRecentlyPlayed = fallbackTrendingSongs.slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5"></div>
      
      {/* Main Container */}
      <div className="relative z-10">
        {/* Top Navigation Bar */}
        <motion.div 
          className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
            {/* Left: Logo */}
            <div className="flex items-center space-x-3">
              <MusicCatchLogo className="w-8 h-8" />
              <span className="text-xl font-bold">Music Catch</span>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-white font-medium">Home</Link>
              <Link to="/search" className="text-gray-400 hover:text-white transition-colors">Search</Link>
              <Link to="/library" className="text-gray-400 hover:text-white transition-colors">Your Library</Link>
            </div>

            {/* Right: Search & Profile */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQuickSearch(!showQuickSearch)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center"
              >
                <User className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* Quick Search */}
          {showQuickSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 border-t border-white/10"
            >
              <QuickSongSearch 
                onSongSelect={() => setShowQuickSearch(false)}
                className="max-w-2xl mx-auto"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-4 space-y-8">
            {/* Greeting Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-6"
            >
              <h1 className="text-4xl font-bold mb-2">{greeting}</h1>
              <p className="text-gray-400">Welcome back to your music</p>
            </motion.div>

            {/* Quick Access Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {recentlyPlayed.slice(0, 6).map((item: any, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/5 rounded-lg p-3 flex items-center space-x-3 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => handlePlaySong(item)}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <button className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentSong?.id === item.id && isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{item.artist}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Made For You Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Made for you</h2>
                <Link to="/library" className="text-gray-400 hover:text-white text-sm font-medium">
                  Show all
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {featuredPlaylists.map((playlist: any) => (
                  <motion.div
                    key={playlist.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => handlePlayPlaylist(playlist)}
                  >
                    <div className="relative mb-4">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-full aspect-square rounded-lg object-cover"
                      />
                      <button className="absolute bottom-2 right-2 w-12 h-12 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                        <Play className="w-5 h-5 text-black ml-0.5" />
                      </button>
                    </div>
                    <h3 className="font-semibold mb-1 truncate">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{playlist.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Trending Now Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Trending now</h2>
                <button
                  onClick={() => handleShufflePlay(trendingSongs)}
                  className="flex items-center space-x-2 bg-neon-green text-black px-4 py-2 rounded-full font-medium hover:scale-105 transition-transform"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle play</span>
                </button>
              </div>
              
              <div className="space-y-2">
                {trendingSongs.slice(0, 8).map((song: any, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-4 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
                    <div className="text-gray-400 w-6 text-center">
                      {index + 1}
                    </div>
                    
                    <div className="relative">
                      <img
                        src={song.image}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <button className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentSong?.id === song.id && isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{song.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      <LikeButton songId={song.id} size="sm" />
                      <span className="text-gray-400 text-sm w-12 text-right">{song.duration}</span>
                      <button className="p-1 hover:bg-white/10 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Genres */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold mb-6">Browse all</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {genres.map((genre: any) => (
                  <motion.div
                    key={genre.id}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-br ${genre.color} rounded-lg p-6 cursor-pointer relative overflow-hidden h-32`}
                    onClick={() => navigate(`/search?genre=${genre.name}`)}
                  >
                    <h3 className="text-2xl font-bold">{genre.name}</h3>
                    <div className="absolute bottom-2 right-2 text-4xl opacity-80">
                      {genre.image}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>

        {/* Mini Player */}
        <MiniPlayer />

        {/* Bottom Navigation (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 md:hidden z-40">
          <div className="flex items-center justify-around">
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
