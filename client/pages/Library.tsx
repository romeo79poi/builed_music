import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useProfileContext } from "../context/ProfileContext";
import { useMusicContext } from "../context/MusicContext";
import { useToast } from "../hooks/use-toast";

export default function Library() {
  const { profile } = useProfileContext();
  const { currentSong, isPlaying, setCurrentSong, togglePlay } =
    useMusicContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Recently Added");
  const [viewMode, setViewMode] = useState("list");
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    "Recently Added",
    "Recently Played",
    "Playlists",
    "Liked Songs",
  ];

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setIsLoading(true);

      // Load user's library data
      const [playlistsRes, likedRes, recentRes, addedRes] = await Promise.all([
        fetch(`/api/playlists/${profile.id}`),
        fetch(`/api/profile/${profile.id}/liked-songs`),
        fetch(`/api/music/recently-played?userId=${profile.id}&limit=20`),
        fetch(`/api/music/trending?limit=20`), // Use trending as recently added fallback
      ]);

      const [playlistsData, likedData, recentData, addedData] =
        await Promise.all([
          playlistsRes.json(),
          likedRes.json(),
          recentRes.json(),
          addedRes.json(),
        ]);

      if (playlistsData.success)
        setUserPlaylists(playlistsData.playlists || []);
      if (likedData.success) setLikedSongs(likedData.likedSongs || []);
      if (recentData.success)
        setRecentlyPlayed(recentData.recentlyPlayed || []);
      if (addedData.success) setRecentlyAdded(addedData.songs || []);
    } catch (error) {
      console.error("Failed to load library data:", error);
      toast({
        title: "Error",
        description: "Failed to load library data. Using cached data.",
        variant: "destructive",
      });

      // Use fallback data
      setUserPlaylists(profile.playlists || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = async (song: any) => {
    try {
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
      if (currentSong?.id === song.id) {
        togglePlay();
      } else {
        setCurrentSong(song);
      }
    }
  };

  const createNewPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${profile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `My Playlist #${userPlaylists.length + 1}`,
          description: "A new playlist",
          isPublic: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserPlaylists([...userPlaylists, data.playlist]);
        toast({
          title: "Playlist Created",
          description: `${data.playlist.name} has been created`,
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

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <span className="ml-2 text-gray-400">Loading your library...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "Recently Added":
        return (
          <div className="space-y-2">
            {(recentlyAdded.length > 0
              ? recentlyAdded
              : fallbackRecentlyAdded
            ).map((song: any) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
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
                      <Play className="w-4 h-4 text-white ml-0.5" />
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
                    {song.artist} • {song.album}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">{song.duration}</span>
                  <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        );

      case "Recently Played":
        return (
          <div className="space-y-2">
            {recentlyPlayed.map((song: any) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.image}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <button className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white ml-0.5" />
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
                    {song.playedAt
                      ? new Date(song.playedAt).toLocaleDateString()
                      : "Recently"}
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
            {userPlaylists.map((playlist: any) => (
              <Link to={`/playlist/${playlist.id}`} key={playlist.id}>
                <div className="group bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={
                          playlist.coverImage ||
                          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
                        }
                        alt={playlist.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <button className="absolute bottom-1 right-1 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all">
                        <Play className="w-4 h-4 text-black ml-0.5" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {playlist.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {playlist.songs?.length || 0} songs
                      </p>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        );

      case "Liked Songs":
        return (
          <div className="space-y-2">
            {likedSongs.map((song: any) => (
              <div
                key={song.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.image}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <button className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate text-white">
                    {song.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {song.artist} • {song.album}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-neon-green fill-current" />
                  <span className="text-gray-400 text-xs">{song.duration}</span>
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

  const fallbackRecentlyAdded = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:20",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
      isLiked: true,
    },
    {
      id: 2,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: "2:54",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      isLiked: false,
    },
    {
      id: 3,
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      isLiked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:p-6 bg-black/60 backdrop-blur-sm sticky top-0 z-20"
        >
          <Link to="/home">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold">Your Library</h1>
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-gray-400" />
            <button
              onClick={createNewPlaylist}
              className="w-6 h-6 text-gray-400 hover:text-neon-green transition-colors"
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
            <Link
              to="/library?filter=liked"
              className="flex items-center space-x-2 bg-neon-green/20 border border-neon-green/30 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Heart className="w-4 h-4 text-neon-green" />
              <span className="text-sm">Liked Songs</span>
            </Link>
            <Link
              to="/library?filter=downloaded"
              className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Downloaded</span>
            </Link>
            <Link
              to="/library?filter=recent"
              className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 whitespace-nowrap"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Recently Played</span>
            </Link>
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
            <Link
              to="/liked-songs"
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Liked Songs</h3>
                  <p className="text-gray-400 text-sm">
                    {profile.likedSongs?.length || 0} songs
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/history"
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Recently Played</h3>
                  <p className="text-gray-400 text-sm">
                    {recentlyPlayed.length} tracks
                  </p>
                </div>
              </div>
            </Link>

            <button
              onClick={createNewPlaylist}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-black" />
                </div>
                <div>
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
                    ? "text-white border-neon-green"
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-20">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Link to="/home" className="flex flex-col items-center py-2">
              <Home className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Home</span>
            </Link>

            <Link to="/search" className="flex flex-col items-center py-2">
              <Search className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-gray-400 text-xs">Search</span>
            </Link>

            <Link to="/library" className="flex flex-col items-center py-2">
              <LibraryIcon className="w-6 h-6 text-neon-green mb-1" />
              <span className="text-neon-green text-xs font-medium">
                Library
              </span>
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
