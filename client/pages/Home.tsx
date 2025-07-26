import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Play,
  Pause,
  MoreHorizontal,
  Home,
  Library,
  Heart,
  Loader2,
  Plus,
  Shuffle,
  RefreshCw,
  AlertCircle,
  Music,
} from "lucide-react";
import { MusicCatchLogo } from "../components/MusicCatchLogo";
import { MiniPlayer } from "../components/MiniPlayer";
import QuickSongSearch from "../components/QuickSongSearch";
import { useToast } from "../hooks/use-toast";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

// Interfaces matching your Firestore schema
interface Song {
  id: string;
  title: string;
  artist: string;
  albumId?: string;
  coverImageURL: string;
  audioURL?: string;
  createdAt: any;
  isLiked?: boolean;
}

interface Album {
  id: string;
  name: string;
  artist: string;
  coverImageURL: string;
  createdAt: any;
  songIds: string[];
}

interface Playlist {
  id: string;
  name: string;
  createdBy: string;
  coverImageURL: string;
  songIds: string[];
}

interface UserData {
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImageURL: string;
  createdAt: any;
  verified: boolean;
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Listen to auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadFirestoreData();
        loadUserLikes(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch data from Firestore collections matching your schema
  const loadFirestoreData = async () => {
    try {
      setIsLoading(true);

      // Fetch songs from "songs" collection
      const songsQuery = query(
        collection(db, "songs"),
        orderBy("createdAt", "desc"),
        limit(20),
      );
      const songsSnapshot = await getDocs(songsQuery);
      const songsData: Song[] = [];

      songsSnapshot.forEach((doc) => {
        songsData.push({
          id: doc.id,
          ...doc.data(),
        } as Song);
      });

      // Fetch albums from "albums" collection
      const albumsQuery = query(
        collection(db, "albums"),
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const albumsSnapshot = await getDocs(albumsQuery);
      const albumsData: Album[] = [];

      albumsSnapshot.forEach((doc) => {
        albumsData.push({
          id: doc.id,
          ...doc.data(),
        } as Album);
      });

      // Fetch playlists from "playlists" collection
      const playlistsQuery = query(collection(db, "playlists"), limit(10));
      const playlistsSnapshot = await getDocs(playlistsQuery);
      const playlistsData: Playlist[] = [];

      playlistsSnapshot.forEach((doc) => {
        playlistsData.push({
          id: doc.id,
          ...doc.data(),
        } as Playlist);
      });

      setSongs(songsData);
      setAlbums(albumsData);
      setPlaylists(playlistsData);

      console.log("✅ Loaded from Firestore:", {
        songs: songsData.length,
        albums: albumsData.length,
        playlists: playlistsData.length,
      });

      if (songsData.length === 0 && albumsData.length === 0) {
        await createSampleData();
      }
    } catch (error) {
      console.error("❌ Error loading Firestore data:", error);
      await createSampleData();
      toast({
        title: "Loading Error",
        description: "Failed to load music data. Creating sample content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's liked songs from users/{uid}/likes subcollection
  const loadUserLikes = async (uid: string) => {
    try {
      const likesRef = collection(db, "users", uid, "likes");
      const likesSnapshot = await getDocs(likesRef);
      const userLikes = new Set<string>();

      likesSnapshot.forEach((doc) => {
        userLikes.add(doc.id); // doc.id is the songId
      });

      setLikedSongs(userLikes);
      console.log("✅ Loaded user likes:", userLikes.size);
    } catch (error) {
      console.error("❌ Error loading user likes:", error);
    }
  };

  // Toggle like/unlike a song using users/{uid}/likes/{songId} subcollection
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
      const isCurrentlyLiked = likedSongs.has(songId);
      const likeDocRef = doc(db, "users", currentUser.uid, "likes", songId);

      if (isCurrentlyLiked) {
        // Unlike the song
        await deleteDoc(likeDocRef);
        setLikedSongs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });

        toast({
          title: "Removed from liked songs",
          description: "Song removed from your favorites",
        });
      } else {
        // Like the song - store minimal data in likes subcollection
        await setDoc(likeDocRef, {
          likedAt: new Date(),
        });

        setLikedSongs((prev) => new Set([...prev, songId]));

        toast({
          title: "Added to liked songs",
          description: "Song added to your favorites",
        });
      }
    } catch (error) {
      console.error("❌ Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  // Play a song
  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  // Play an album (first song)
  const handlePlayAlbum = async (album: Album) => {
    if (album.songIds && album.songIds.length > 0) {
      // Get the first song from the album
      try {
        const firstSongDoc = await getDoc(doc(db, "songs", album.songIds[0]));
        if (firstSongDoc.exists()) {
          const firstSong = {
            id: firstSongDoc.id,
            ...firstSongDoc.data(),
          } as Song;
          handlePlaySong(firstSong);
        }
      } catch (error) {
        console.error("Error playing album:", error);
        toast({
          title: "Error",
          description: "Failed to play album",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Empty Album",
        description: "This album doesn't have any songs yet.",
      });
    }
  };

  // Play a playlist (first song)
  const handlePlayPlaylist = async (playlist: Playlist) => {
    if (playlist.songIds && playlist.songIds.length > 0) {
      try {
        const firstSongDoc = await getDoc(
          doc(db, "songs", playlist.songIds[0]),
        );
        if (firstSongDoc.exists()) {
          const firstSong = {
            id: firstSongDoc.id,
            ...firstSongDoc.data(),
          } as Song;
          handlePlaySong(firstSong);
        }
      } catch (error) {
        console.error("Error playing playlist:", error);
        toast({
          title: "Error",
          description: "Failed to play playlist",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Empty Playlist",
        description: "This playlist doesn't have any songs yet.",
      });
    }
  };

  // Shuffle play songs
  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      setCurrentSong(shuffledSongs[0]);
      setIsPlaying(true);
    }
  };

  // Refresh data
  const refreshData = async () => {
    if (currentUser) {
      await Promise.all([loadFirestoreData(), loadUserLikes(currentUser.uid)]);
      toast({
        title: "Refreshed",
        description: "Music data has been updated",
      });
    }
  };

  // Create sample data matching your schema
  const createSampleData = async () => {
    try {
      console.log("Creating sample data...");

      // Sample songs
      const sampleSongs = [
        {
          title: "Blinding Lights",
          artist: "The Weeknd",
          albumId: "album1",
          coverImageURL:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
          audioURL: "", // Firebase Storage URL would go here
          createdAt: new Date(),
        },
        {
          title: "Watermelon Sugar",
          artist: "Harry Styles",
          albumId: "album2",
          coverImageURL:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
          audioURL: "",
          createdAt: new Date(),
        },
        {
          title: "Levitating",
          artist: "Dua Lipa",
          albumId: "album3",
          coverImageURL:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
          audioURL: "",
          createdAt: new Date(),
        },
      ];

      // Create songs in Firestore
      const songIds: string[] = [];
      for (let i = 0; i < sampleSongs.length; i++) {
        const songRef = doc(collection(db, "songs"));
        await setDoc(songRef, sampleSongs[i]);
        songIds.push(songRef.id);
      }

      // Sample albums
      const sampleAlbums = [
        {
          name: "After Hours",
          artist: "The Weeknd",
          coverImageURL:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
          createdAt: new Date(),
          songIds: [songIds[0]], // Reference to song
        },
        {
          name: "Fine Line",
          artist: "Harry Styles",
          coverImageURL:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
          createdAt: new Date(),
          songIds: [songIds[1]],
        },
      ];

      // Create albums in Firestore
      for (const album of sampleAlbums) {
        const albumRef = doc(collection(db, "albums"));
        await setDoc(albumRef, album);
      }

      // Sample playlist (if user is logged in)
      if (currentUser) {
        const samplePlaylist = {
          name: "My Favorites",
          createdBy: currentUser.uid,
          coverImageURL:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
          songIds: songIds.slice(0, 2), // Reference to songs
        };

        const playlistRef = doc(collection(db, "playlists"));
        await setDoc(playlistRef, samplePlaylist);
      }

      // Reload data
      await loadFirestoreData();

      toast({
        title: "Sample data created",
        description: "Added sample songs, albums, and playlists",
      });
    } catch (error) {
      console.error("Error creating sample data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-primary mx-auto mb-4" />
          <p className="text-white">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark text-white relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/8 via-purple-secondary/4 to-purple-accent/6"></div>

      {/* Main Container */}
      <div className="relative z-10">
        {/* Top Navigation Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-purple-primary/20"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
            {/* Left: Logo */}
            <div className="flex items-center space-x-3">
              <MusicCatchLogo className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-primary to-purple-secondary bg-clip-text text-transparent">Catch</span>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-white font-medium">
                Home
              </Link>
              <Link
                to="/search"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Search
              </Link>
              <Link
                to="/library"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Your Library
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowQuickSearch(!showQuickSearch)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-full flex items-center justify-center shadow-lg shadow-purple-primary/30 hover:scale-110 transition-all duration-200"
              >
                <User className="w-5 h-5 text-white" />
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
              <p className="text-gray-400">
                Discover amazing music from our collection
              </p>
            </motion.div>

            {/* Schema Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-primary/10 border border-purple-primary/30 rounded-xl p-4 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-purple-primary" />
                <div>
                  <p className="text-purple-primary font-medium">
                    Music Library Active
                  </p>
                  <p className="text-gray-300 text-sm">
                    Collections: {songs.length} songs, {albums.length} albums,{" "}
                    {playlists.length} playlists
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Albums Section */}
            {albums.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Featured Albums</h2>
                  <Link
                    to="/library"
                    className="text-gray-400 hover:text-white text-sm font-medium"
                  >
                    Show all
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      whileHover={{ scale: 1.05 }}
                      className="bg-purple-dark/40 backdrop-blur-sm rounded-2xl p-4 hover:bg-purple-dark/60 transition-all cursor-pointer group border border-purple-primary/20 hover:border-purple-primary/40 hover:shadow-2xl hover:shadow-purple-primary/20"
                      onClick={() => handlePlayAlbum(album)}
                    >
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/20 to-purple-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        <img
                          src={album.coverImageURL}
                          alt={album.name}
                          className="relative w-full aspect-square rounded-2xl object-cover shadow-lg"
                        />
                        <button className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl shadow-purple-primary/50">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </button>
                      </div>
                      <h3 className="font-semibold mb-1 truncate">
                        {album.name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {album.artist}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {album.songIds.length} songs
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Playlists Section */}
            {playlists.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Playlists</h2>
                  <Link
                    to="/library"
                    className="text-gray-400 hover:text-white text-sm font-medium"
                  >
                    Show all
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {playlists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      whileHover={{ scale: 1.05 }}
                      className="bg-purple-dark/40 backdrop-blur-sm rounded-2xl p-4 hover:bg-purple-dark/60 transition-all cursor-pointer group border border-purple-secondary/20 hover:border-purple-secondary/40 hover:shadow-2xl hover:shadow-purple-secondary/20"
                      onClick={() => handlePlayPlaylist(playlist)}
                    >
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-secondary/20 to-purple-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        <img
                          src={playlist.coverImageURL}
                          alt={playlist.name}
                          className="relative w-full aspect-square rounded-2xl object-cover shadow-lg"
                        />
                        <button className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-r from-purple-secondary to-purple-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl shadow-purple-secondary/50">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </button>
                      </div>
                      <h3 className="font-semibold mb-1 truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">Playlist</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {playlist.songIds.length} songs
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Songs Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Popular Songs</h2>
                <button
                  onClick={handleShufflePlay}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-primary to-purple-secondary text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-primary/30 hover:shadow-purple-primary/50"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle play</span>
                </button>
              </div>

              <div className="space-y-2">
                {songs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
                    <div className="text-gray-400 w-6 text-center">
                      {index + 1}
                    </div>

                    <div className="relative">
                      <img
                        src={song.coverImageURL}
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
                      <p className="text-gray-400 text-sm truncate">
                        {song.artist}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      {/* Like Button */}
                      <button
                        onClick={(e) => handleToggleLike(song.id, e)}
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
                          likedSongs.has(song.id)
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        title={likedSongs.has(song.id) ? "Unlike" : "Like"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${
                            likedSongs.has(song.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      <button className="p-1 hover:bg-white/10 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {songs.length === 0 && (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No songs found</h3>
                  <p className="text-gray-400 mb-4">
                    Add some songs to your Firestore "songs" collection to see
                    them here.
                  </p>
                  <button
                    onClick={createSampleData}
                    className="bg-gradient-to-r from-purple-primary to-purple-secondary text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-primary/30"
                  >
                    Create Sample Data
                  </button>
                </div>
              )}
            </motion.section>
          </div>
        </div>

        {/* Mini Player */}
        <MiniPlayer />

        {/* Bottom Navigation (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-purple-primary/20 px-4 py-3 md:hidden z-40">
          <div className="flex items-center justify-around">
            <Link to="/home" className="flex flex-col items-center py-2 transition-all duration-200">
              <div className="p-2 rounded-xl bg-purple-primary/20">
                <Home className="w-5 h-5 text-purple-primary mb-1" />
              </div>
              <span className="text-purple-primary text-xs font-medium mt-1">Home</span>
            </Link>
            <Link to="/search" className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-110">
              <div className="p-2 rounded-xl hover:bg-purple-primary/10">
                <Search className="w-5 h-5 text-gray-400 mb-1 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-1">Search</span>
            </Link>
            <Link to="/library" className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-110">
              <div className="p-2 rounded-xl hover:bg-purple-primary/10">
                <Library className="w-5 h-5 text-gray-400 mb-1 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-1">Library</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center py-2 transition-all duration-200 hover:scale-110">
              <div className="p-2 rounded-xl hover:bg-purple-primary/10">
                <User className="w-5 h-5 text-gray-400 mb-1 hover:text-purple-primary transition-colors" />
              </div>
              <span className="text-gray-400 text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
