import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Music,
  Search as SearchIcon,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MoreHorizontal,
  Home,
  Library,
  Clock,
  User,
  Loader2,
  Heart,
  Users,
  Disc,
} from "lucide-react";
import { useMusicContext } from "../context/MusicContext";
import { useToast } from "../hooks/use-toast";
import { BackButton } from "../components/ui/back-button";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } =
    useMusicContext();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [genres, setGenres] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setHasSearched(true);

      const response = await fetch(
        `/api/music/search?q=${encodeURIComponent(searchQuery)}&type=${selectedTab}&limit=20`,
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      } else {
        throw new Error(data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = async (song: any) => {
    try {
      await fetch(`/api/music/play/${song.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user" }),
      });

      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    } catch (error) {
      console.error("Failed to play song:", error);
      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    }
  };

  const loadGenresAndPlaylists = async () => {
    try {
      const [genresRes, playlistsRes] = await Promise.all([
        fetch("/api/music/genres"),
        fetch("/api/music/playlists/featured?limit=6"),
      ]);

      const [genresData, playlistsData] = await Promise.all([
        genresRes.json(),
        playlistsRes.json(),
      ]);

      if (genresData.success) setGenres(genresData.genres);
      if (playlistsData.success) setFeaturedPlaylists(playlistsData.playlists);
    } catch (error) {
      console.error("Failed to load genres and playlists:", error);
    }
  };

  useEffect(() => {
    loadGenresAndPlaylists();

    // Check if there's a genre parameter in URL
    const genreParam = searchParams.get("genre");
    if (genreParam) {
      setSearchQuery(genreParam);
      setSelectedTab("songs");
      setTimeout(() => handleSearch(), 100);
    }
  }, []);

  useEffect(() => {
    // Debounced search
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchQuery.length === 0) {
      setSearchResults(null);
      setHasSearched(false);
    }
  }, [searchQuery, selectedTab]);

  const tabs = [
    { id: "all", label: "All", icon: SearchIcon },
    { id: "songs", label: "Songs", icon: Music },
    { id: "artists", label: "Artists", icon: Users },
    { id: "playlists", label: "Playlists", icon: Disc },
  ];

  const quickSearchButtons = [
    "Pop",
    "Hip-Hop",
    "Rock",
    "Electronic",
    "Jazz",
    "Classical",
    "R&B",
    "Country",
  ];

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <span className="ml-2 text-gray-400">Searching...</span>
        </div>
      );
    }

    if (!searchResults && hasSearched) {
      return (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No results found
          </h3>
          <p className="text-gray-500">Try searching with different keywords</p>
        </div>
      );
    }

    if (!searchResults) return null;

    return (
      <div className="space-y-6">
        {/* Songs Results */}
        {searchResults.songs && searchResults.songs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2 text-neon-green" />
              Songs
            </h3>
            <div className="space-y-2">
              {searchResults.songs.map((song: any) => (
                <div
                  key={song.id}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group cursor-pointer"
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
                        e.stopPropagation();
                        handlePlaySong(song);
                      }}
                      className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {currentSong?.id === song.id && isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-white">
                      {song.title}
                    </h4>
                    <p className="text-gray-400 text-xs truncate">
                      {song.artist} • {song.album}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">
                      {song.duration}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artists Results */}
        {searchResults.artists && searchResults.artists.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-neon-blue" />
              Artists
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.artists.map((artist: any) => (
                <Link to={`/artist/${artist.id}`} key={artist.id}>
                  <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all cursor-pointer">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                    <h4 className="font-medium text-white mb-1">
                      {artist.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {artist.followers?.toLocaleString()} followers
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Results */}
        {searchResults.playlists && searchResults.playlists.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Disc className="w-5 h-5 mr-2 text-purple-400" />
              Playlists
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.playlists.map((playlist: any) => (
                <Link to={`/playlist/${playlist.id}`} key={playlist.id}>
                  <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <img
                      src={playlist.image}
                      alt={playlist.name}
                      className="w-full aspect-square rounded-lg object-cover mb-3"
                    />
                    <h4 className="font-medium text-white mb-1 truncate">
                      {playlist.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {playlist.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const moodResults = [
    {
      id: 1,
      title: "Leek Mius",
      artist: "Clator SI",
      category: "Moods",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      title: "Fleil Nong",
      artist: "Mutsis Oln",
      category: "Rooylos",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  const categories = [
    {
      title: "Bodes",
      subtitle: "Qocli lonc omaloi gycls & plo scpoin ils olmol gormat.",
      count: "6063",
      bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
    },
    {
      title: "Afctolns",
      subtitle: "Alcsttc icck rcnc nolc noudclng yclotı.",
      count: "dtos",
      bgColor: "bg-gradient-to-br from-pink-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 bg-black"></div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
                    <BackButton
            onClick={() => navigate("/home")}
            variant="glass"
            size="lg"
          />
          <Music className="w-6 h-6 text-pink-400" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-slate-400 rounded"></div>
            <div className="w-6 h-6 bg-slate-400 rounded"></div>
            <div className="w-6 h-6 bg-slate-400 rounded"></div>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 overflow-y-auto">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Search
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="flex items-center space-x-2 mb-6"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search Catch"
                className="w-full h-12 bg-white rounded-full pl-12 pr-4 text-black placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              <SearchIcon className="w-5 h-5 text-white" />
            </button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex space-x-6 mb-6 overflow-x-auto"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? "text-white border-neon-green"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Quick Search Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {quickSearchButtons.map((genre, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(genre);
                  setSelectedTab("songs");
                }}
                className="h-10 px-4 rounded-full flex items-center justify-center text-sm font-medium transition-colors bg-slate-800 text-white hover:bg-slate-700 hover:text-neon-green"
              >
                {genre}
              </button>
            ))}
          </motion.div>

          {/* Search Results or Browse Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6"
          >
            {searchQuery || hasSearched ? (
              renderSearchResults()
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Browse Music</h2>
                </div>

                {/* Browse Categories Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {genres.slice(0, 4).map((genre: any, index) => (
                    <motion.div
                      key={genre.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      onClick={() => {
                        setSearchQuery(genre.name);
                        setSelectedTab("songs");
                      }}
                      className={`aspect-square rounded-2xl bg-gradient-to-br ${genre.color} text-white flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <Music className="w-8 h-8 mb-2" />
                      <span className="font-medium">{genre.name}</span>
                      <span className="text-xs opacity-75">
                        {genre.songCount} songs
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Featured Playlists */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Featured Playlists
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {featuredPlaylists.slice(0, 6).map((playlist: any) => (
                      <Link to={`/playlist/${playlist.id}`} key={playlist.id}>
                        <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                          <img
                            src={playlist.image}
                            alt={playlist.name}
                            className="w-full aspect-square rounded-lg object-cover mb-3"
                          />
                          <h4 className="font-medium text-white mb-1 truncate">
                            {playlist.name}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {playlist.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-20">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Link to="/home" className="flex flex-col items-center py-2">
              <Home className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Home</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center py-2">
              <SearchIcon className="w-6 h-6 text-neon-green mb-1" />
              <span className="text-neon-green text-xs font-medium">
                Search
              </span>
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
