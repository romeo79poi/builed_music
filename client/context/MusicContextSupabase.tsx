import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseAPI, type Song, type Playlist, type Album } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { realTimeMusicService, type MusicRoomActivity } from '@/lib/realtime-music';

interface CurrentSong extends Song {
  isPlaying: boolean;
  progress: number;
}

interface MusicContextType {
  // Current playback
  currentSong: CurrentSong | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  
  // Playback controls
  playSong: (song: Song, queue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  
  // Content
  trendingSongs: Song[];
  userPlaylists: Playlist[];
  likedSongs: Song[];
  recentlyPlayed: Song[];
  trendingAlbums: Album[];
  
  // Actions
  refreshTrendingSongs: () => Promise<void>;
  refreshUserPlaylists: () => Promise<void>;
  refreshLikedSongs: () => Promise<void>;
  refreshRecentlyPlayed: () => Promise<void>;
  refreshTrendingAlbums: () => Promise<void>;
  
  // Song actions
  likeSong: (songId: string) => Promise<void>;
  unlikeSong: (songId: string) => Promise<void>;
  addToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<Playlist | null>;
  
  // Search
  searchSongs: (query: string) => Promise<Song[]>;

  // Real-time features
  friendsActivity: MusicRoomActivity[];
  createListeningRoom: (songId: string, isPublic: boolean) => Promise<string | null>;
  joinListeningRoom: (roomId: string) => Promise<void>;
  leaveListeningRoom: (roomId: string) => Promise<void>;

  // Loading states
  loading: {
    trending: boolean;
    playlists: boolean;
    liked: boolean;
    recent: boolean;
    albums: boolean;
  };
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Playback state
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Content state
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<Album[]>([]);

  // Real-time state
  const [friendsActivity, setFriendsActivity] = useState<MusicRoomActivity[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    trending: false,
    playlists: false,
    liked: false,
    recent: false,
    albums: false
  });

  // Initialize data on user login
  useEffect(() => {
    if (user) {
      refreshTrendingSongs();
      refreshUserPlaylists();
      refreshLikedSongs();
      refreshRecentlyPlayed();
      refreshTrendingAlbums();

      // Subscribe to real-time features
      const friendsActivityChannel = realTimeMusicService.subscribeToFriendsActivity(
        user.id,
        setFriendsActivity
      );

      const trendingUpdatesChannel = realTimeMusicService.subscribeToTrendingUpdates(
        setTrendingSongs
      );

      // Cleanup on unmount
      return () => {
        friendsActivityChannel.unsubscribe();
        trendingUpdatesChannel.unsubscribe();
        realTimeMusicService.cleanup();
      };
    }
  }, [user]);

  // Playback controls
  const playSong = async (song: Song, newQueue?: Song[]) => {
    setCurrentSong({
      ...song,
      isPlaying: true,
      progress: 0
    });
    setIsPlaying(true);
    setProgress(0);

    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(newQueue.findIndex(s => s.id === song.id));
    }

    // Start real-time listening session
    if (user) {
      try {
        await realTimeMusicService.startListeningSession(user.id, song.id);
        // Also record in traditional way for fallback
        await supabaseAPI.recordSongPlay(user.id, song.id);
        // Refresh recently played
        refreshRecentlyPlayed();
      } catch (error) {
        console.error('Failed to record song play:', error);
      }
    }
  };

  const pauseSong = () => {
    setIsPlaying(false);
    if (currentSong) {
      setCurrentSong({ ...currentSong, isPlaying: false });
    }
  };

  const resumeSong = () => {
    setIsPlaying(true);
    if (currentSong) {
      setCurrentSong({ ...currentSong, isPlaying: true });
    }
  };

  const nextSong = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      playSong(queue[nextIndex], queue);
      setCurrentIndex(nextIndex);
    }
  };

  const previousSong = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      playSong(queue[prevIndex], queue);
      setCurrentIndex(prevIndex);
    }
  };

  const seekTo = (time: number) => {
    setProgress(time);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  // Content refresh functions
  const refreshTrendingSongs = async () => {
    setLoading(prev => ({ ...prev, trending: true }));
    try {
      const { data, error } = await supabaseAPI.getTrendingSongs(20);
      if (data && !error) {
        setTrendingSongs(data);
      }
    } catch (error) {
      console.error('Failed to fetch trending songs:', error);
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  };

  const refreshUserPlaylists = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, playlists: true }));
    try {
      const { data, error } = await supabaseAPI.getUserPlaylists(user.id);
      if (data && !error) {
        setUserPlaylists(data);
      }
    } catch (error) {
      console.error('Failed to fetch user playlists:', error);
    } finally {
      setLoading(prev => ({ ...prev, playlists: false }));
    }
  };

  const refreshLikedSongs = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, liked: true }));
    try {
      const { data, error } = await supabaseAPI.getUserLikedSongs(user.id);
      if (data && !error) {
        // Extract songs from the liked songs data structure
        const songs = data.map((item: any) => item.songs).filter(Boolean);
        setLikedSongs(songs);
      }
    } catch (error) {
      console.error('Failed to fetch liked songs:', error);
    } finally {
      setLoading(prev => ({ ...prev, liked: false }));
    }
  };

  const refreshRecentlyPlayed = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, recent: true }));
    try {
      const { data, error } = await supabaseAPI.getUserListeningHistory(user.id, 20);
      if (data && !error) {
        // Extract songs from listening history
        const songs = data.map((item: any) => item.songs).filter(Boolean);
        setRecentlyPlayed(songs);
      }
    } catch (error) {
      console.error('Failed to fetch recently played:', error);
    } finally {
      setLoading(prev => ({ ...prev, recent: false }));
    }
  };

  const refreshTrendingAlbums = async () => {
    setLoading(prev => ({ ...prev, albums: true }));
    try {
      const { data, error } = await supabaseAPI.getTrendingAlbums(20);
      if (data && !error) {
        setTrendingAlbums(data);
      }
    } catch (error) {
      console.error('Failed to fetch trending albums:', error);
    } finally {
      setLoading(prev => ({ ...prev, albums: false }));
    }
  };

  // Song actions
  const likeSong = async (songId: string) => {
    if (!user) return;
    
    try {
      await supabaseAPI.likeSong(user.id, songId);
      refreshLikedSongs();
    } catch (error) {
      console.error('Failed to like song:', error);
    }
  };

  const unlikeSong = async (songId: string) => {
    if (!user) return;
    
    try {
      await supabaseAPI.unlikeSong(user.id, songId);
      refreshLikedSongs();
    } catch (error) {
      console.error('Failed to unlike song:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, songId: string) => {
    try {
      await supabaseAPI.addSongToPlaylist(playlistId, songId);
      refreshUserPlaylists();
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
    }
  };

  const createPlaylist = async (name: string, description = '', isPublic = false): Promise<Playlist | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabaseAPI.createPlaylist(user.id, name, description, isPublic);
      if (data && !error) {
        refreshUserPlaylists();
        return data;
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
    return null;
  };

  const searchSongs = async (query: string): Promise<Song[]> => {
    try {
      const { data, error } = await supabaseAPI.searchSongs(query, 50);
      if (data && !error) {
        return data;
      }
    } catch (error) {
      console.error('Failed to search songs:', error);
    }
    return [];
  };

  // Real-time room functions
  const createListeningRoom = async (songId: string, isPublic: boolean): Promise<string | null> => {
    if (!user) return null;

    try {
      const roomId = await realTimeMusicService.createListeningRoom(user.id, songId, isPublic);
      return roomId;
    } catch (error) {
      console.error('Failed to create listening room:', error);
      return null;
    }
  };

  const joinListeningRoom = async (roomId: string): Promise<void> => {
    if (!user) return;

    try {
      await realTimeMusicService.joinListeningRoom(roomId, user.id);
    } catch (error) {
      console.error('Failed to join listening room:', error);
    }
  };

  const leaveListeningRoom = async (roomId: string): Promise<void> => {
    if (!user) return;

    try {
      await realTimeMusicService.leaveListeningRoom(roomId, user.id);
    } catch (error) {
      console.error('Failed to leave listening room:', error);
    }
  };

  return (
    <MusicContext.Provider value={{
      // Current playback
      currentSong,
      isPlaying,
      volume,
      progress,
      duration,
      queue,
      currentIndex,
      
      // Playback controls
      playSong,
      pauseSong,
      resumeSong,
      nextSong,
      previousSong,
      seekTo,
      setVolume,
      
      // Content
      trendingSongs,
      userPlaylists,
      likedSongs,
      recentlyPlayed,
      trendingAlbums,
      
      // Actions
      refreshTrendingSongs,
      refreshUserPlaylists,
      refreshLikedSongs,
      refreshRecentlyPlayed,
      refreshTrendingAlbums,
      
      // Song actions
      likeSong,
      unlikeSong,
      addToPlaylist,
      createPlaylist,
      
      // Search
      searchSongs,

      // Real-time features
      friendsActivity,
      createListeningRoom,
      joinListeningRoom,
      leaveListeningRoom,

      // Loading states
      loading
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
