import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Play,
  Plus,
  Heart,
  Download,
  Clock,
  Music,
  ListMusic,
  User,
  Home,
  Library as LibraryIcon,
  Loader2,
  Trash2,
  Edit,
  Pause,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  supabaseAuth,
  supabaseOperations,
  Song,
  Playlist,
} from "../lib/supabase";
import MobileFooter from "../components/MobileFooter";

export default function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("Recently Added");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const tabs = [
    "Recently Added",
    "Recently Played",
    "Playlists",
    "Liked Songs",
  ];

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      setIsLoading(true);

      // Check authentication
      const { data: session } = await supabaseAuth.getCurrentSession();

      if (session?.user) {
        setCurrentUser(session.user);
        await loadLibraryData(session.user.id);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLibraryData = async (userId: string) => {
    try {
      // Load user's library data
      const [playlistsRes, likedRes, historyRes, songsRes] = await Promise.all([
        supabaseOperations.getUserPlaylists(userId),
        supabaseOperations.getUserLikes(userId),
        supabaseOperations.getUserHistory(userId, 20),
        supabaseOperations.getSongs(20),
      ]);

      // Set playlists
      if (playlistsRes.data) {
        setUserPlaylists(playlistsRes.data);
      }

      // Set liked songs
      if (likedRes.data) {
        const likedSongsData = likedRes.data
          .map((like) => like.songs)
          .filter(Boolean) as Song[];
        setLikedSongs(likedSongsData);
      }

      // Set recently played (from history)
      if (historyRes.data) {
        const recentSongsData = historyRes.data
          .map((history) => history.songs)
          .filter(Boolean) as Song[];
        setRecentlyPlayed(recentSongsData);
      }

      // Set recently added songs
      if (songsRes.data) {
        setRecentlyAdded(songsRes.data);
      }
    } catch (error) {
      console.error("Failed to load library data:", error);
      toast({
        title: "Error",
        description: "Failed to load library data",
        variant: "destructive",
      });
    }
  };

  const handlePlaySong = async (song: Song) => {
    try {
      if (currentSong?.id === song.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentSong(song);
        setIsPlaying(true);

        // Add to listening history
        if (currentUser) {
          await supabaseOperations.addToHistory(currentUser.id, song.id);
        }
      }
    } catch (error) {
      console.error("Failed to play song:", error);
      // Still allow playback even if history fails
      if (currentSong?.id === song.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentSong(song);
        setIsPlaying(true);
      }
    }
  };

  const createNewPlaylist = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to create playlists",
        variant: "destructive",
      });
      return;
    }

    try {
      const playlistName = `My Playlist #${userPlaylists.length + 1}`;
      const { data, error } = await supabaseOperations.createPlaylist({
        name: playlistName,
        created_by: currentUser.id,
        is_public: false,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create playlist",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setUserPlaylists([...userPlaylists, data]);
        toast({
          title: "Playlist Created",
          description: `${playlistName} has been created`,
        });
      }
    } catch (error) {
      console.error("Failed to create playlist:", error);
      toast({
        title: "Error",
        description: "Failed to create playlist",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (songId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please log in to like songs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { liked, error } = await supabaseOperations.toggleLike(
        currentUser.id,
        songId,
      );

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update like status",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      if (liked) {
        const song = recentlyAdded.find((s) => s.id === songId);
        if (song) {
          setLikedSongs((prev) => [...prev, song]);
        }
      } else {
        setLikedSongs((prev) => prev.filter((song) => song.id !== songId));
      }

      toast({
        title: liked ? "Added to liked songs" : "Removed from liked songs",
        description: liked
          ? "Song added to your favorites"
          : "Song removed from your favorites",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-primary animate-spin" />
          <span className="ml-2 text-gray-400">Loading your library...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "Recently Added":
        return (
          <div className="space-y-2">
            {recentlyAdded.map((song) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.cover_image_url}
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
                  <h3 className="font-medium text-sm truncate text-white">
                    {song.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {song.artist} {song.genre && `• ${song.genre}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    onClick={(e) => handleToggleLike(song.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedSongs.some((liked) => liked.id === song.id) ? "text-red-500 fill-current" : "text-gray-400"}`}
                    />
                  </button>
                  <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        );

      case "Recently Played":
        return (
          <div className="space-y-2">
            {recentlyPlayed.map((song) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.cover_image_url}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
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
                  <h3 className="font-medium text-sm truncate text-white">
                    {song.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {song.artist}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">
                    {formatDuration(song.duration)}
                  </span>
                  <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        );

      case "Playlists":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="group bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={
                        playlist.cover_image_url ||
                        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
                      }
                      alt={playlist.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <button className="absolute bottom-1 right-1 w-8 h-8 bg-purple-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {playlist.is_public ? "Public" : "Private"} •{" "}
                      {playlist.total_tracks || 0} songs
                    </p>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        );

      case "Liked Songs":
        return (
          <div className="space-y-2">
            {likedSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.cover_image_url}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
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
                  <h3 className="font-medium text-sm truncate text-white">
                    {song.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {song.artist} {song.genre && `• ${song.genre}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                  <span className="text-gray-400 text-xs">
                    {formatDuration(song.duration)}
                  </span>
                  <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark text-white">
      {/* Background Glow Effects */}
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-sm sticky top-0 z-20"
        >
          <button onClick={() => navigate("/home")}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold">Your Library</h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate("/search")}>
              <Search className="w-6 h-6 text-gray-400" />
            </button>
            <button
              onClick={createNewPlaylist}
              className="w-6 h-6 text-gray-400 hover:text-purple-primary transition-colors"
              title="Create New Playlist"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 md:px-6 mb-6"
        >
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("Liked Songs")}
              className="flex items-center space-x-2 bg-purple-primary/20 border border-purple-primary/30 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Heart className="w-4 h-4 text-purple-primary" />
              <span className="text-sm">Liked Songs</span>
            </button>
            <button
              onClick={() => setActiveTab("Recently Played")}
              className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Recently Played</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Actions Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 md:px-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab("Liked Songs")}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white">Liked Songs</h3>
                  <p className="text-gray-400 text-sm">
                    {likedSongs.length} songs
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("Recently Played")}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white">Recently Played</h3>
                  <p className="text-gray-400 text-sm">
                    {recentlyPlayed.length} tracks
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={createNewPlaylist}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white">Create Playlist</h3>
                  <p className="text-gray-400 text-sm">Make a new playlist</p>
                </div>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 md:px-6 mb-4"
        >
          <div className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-white border-purple-primary"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 px-4 md:px-6 pb-24"
        >
          {renderTabContent()}
        </motion.div>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
    </div>
  );
}
