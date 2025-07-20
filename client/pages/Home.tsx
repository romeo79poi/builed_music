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
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { MiniPlayer } from "../components/MiniPlayer";
import { useProfileContext } from "../context/ProfileContext";
import { useMusicContext } from "../context/MusicContext";
import { useToast } from "../hooks/use-toast";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { profile } = useProfileContext();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } =
    useMusicContext();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profileImageError, setProfileImageError] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);

      // Load all home page data concurrently
      const [
        trendingRes,
        playlistsRes,
        recommendationsRes,
        genresRes,
        recentRes,
      ] = await Promise.all([
        fetch("/api/music/trending?limit=6"),
        fetch("/api/music/playlists/featured?limit=4"),
        fetch("/api/music/recommendations?limit=4"),
        fetch("/api/music/genres"),
        fetch("/api/music/recently-played?limit=6"),
      ]);

      const [trending, playlists, recs, genresData, recent] = await Promise.all(
        [
          trendingRes.json(),
          playlistsRes.json(),
          recommendationsRes.json(),
          genresRes.json(),
          recentRes.json(),
        ],
      );

      if (trending.success) setTrendingSongs(trending.songs);
      if (playlists.success) setFeaturedPlaylists(playlists.playlists);
      if (recs.success) setRecommendations(recs.recommendations);
      if (genresData.success) setGenres(genresData.genres);
      if (recent.success) setRecentlyPlayed(recent.recentlyPlayed);
    } catch (error) {
      console.error("Failed to load home data:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Using offline data.",
        variant: "destructive",
      });

      // Fallback to static data if API fails
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Fallback to existing static data structure
    setTrendingSongs(recentlyPlayedFallback);
    setFeaturedPlaylists(topMixesFallback);
    setRecommendations(recommendationsFallback);
    setGenres(genresFallback);
    setRecentlyPlayed(recentlyPlayedFallback);
  };

  const handlePlaySong = async (song: any) => {
    try {
      // Track the play in backend
      await fetch(`/api/music/play/${song.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id }),
      });

      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    } catch (error) {
      console.error("Failed to play song:", error);
      // Still allow playing even if tracking fails
      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    }
  };

  // Reset image error when profile picture changes
  useEffect(() => {
    setProfileImageError(false);
  }, [profile.profilePicture]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        // Scrolling up or near the top - show top bar
        setIsTopBarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold - hide top bar
        setIsTopBarVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Fallback data in case API fails
  const recentlyPlayedFallback = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      duration: "3:20",
      plays: 45672,
    },
    {
      id: 2,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      duration: "2:54",
      plays: 38934,
    },
    {
      id: 3,
      title: "Levitating",
      artist: "Dua Lipa",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      duration: "3:23",
      plays: 42156,
    },
  ];

  const topMixesFallback = [
    {
      id: 1,
      name: "Daily Mix 1",
      description: "The Weeknd, Dua Lipa, Harry Styles and more",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      songs: [],
    },
    {
      id: 2,
      name: "Daily Mix 2",
      description: "Pop hits you can't stop playing",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      songs: [],
    },
  ];

  const recommendationsFallback = [
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
  ];

  const genresFallback = [
    { id: 1, name: "Pop", color: "from-pink-500 to-purple-600" },
    { id: 2, name: "Hip-Hop", color: "from-orange-500 to-red-600" },
    { id: 3, name: "Rock", color: "from-gray-600 to-gray-800" },
    { id: 4, name: "Electronic", color: "from-blue-500 to-cyan-600" },
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
          animate={{
            opacity: 1,
            y: isTopBarVisible ? 0 : -100,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-sm sticky top-0 z-20"
        >
          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className="hover:scale-110 transition-transform relative group"
            title="Go to Profile"
          >
            <div className="relative">
              {/* Animated background rings */}
              <div
                className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-neon-green via-neon-blue to-purple-500 rounded-full animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
              <div
                className="absolute inset-0.5 w-11 h-11 bg-gradient-to-br from-purple-500 via-pink-500 to-neon-green rounded-full animate-spin"
                style={{
                  animationDuration: "2s",
                  animationDirection: "reverse",
                }}
              ></div>
              <div className="relative w-12 h-12 flex items-center justify-center p-0.5">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  {profile.profilePicture && !profileImageError ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.displayName}
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.log(
                          "Image failed to load:",
                          profile.profilePicture,
                        );
                        setProfileImageError(true);
                      }}
                      onLoad={() => setProfileImageError(false)}
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
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
            <div className="relative">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Search className="w-5 h-5 text-white z-10" />
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-900/90 to-pink-900/90 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm">
              Search
            </div>
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="p-4 md:p-6 space-y-8">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
                <span className="ml-2 text-gray-400">
                  Loading your music...
                </span>
              </div>
            )}
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
                  <div key={item.id} className="flex-shrink-0">
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
                            handlePlaySong(item);
                          }}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          {currentSong?.id === item.id && isPlaying ? (
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
                  </div>
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
                {featuredPlaylists.map((playlist) => (
                  <Link to={`/playlist/${playlist.id}`} key={playlist.id}>
                    <div className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="relative mb-3">
                        <img
                          src={playlist.image}
                          alt={playlist.name}
                          className="w-full aspect-square object-cover rounded-md"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (playlist.songs && playlist.songs.length > 0) {
                              handlePlaySong(playlist.songs[0]);
                            }
                          }}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          <Play className="w-5 h-5 text-black ml-0.5" />
                        </button>
                      </div>
                      <h3 className="font-medium text-sm mb-1">
                        {playlist.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {playlist.description}
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
                  <div
                    key={song.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
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
                          handlePlaySong(song);
                        }}
                        className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {currentSong?.id === song.id && isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
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
                  <Link
                    to={`/search?genre=${genre.name.toLowerCase()}`}
                    key={genre.id}
                  >
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
        <MiniPlayer isPlaying={isPlaying} onTogglePlay={togglePlay} />

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
