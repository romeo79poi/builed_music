import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  firebaseAuth, 
  firebaseDB, 
  firebaseStorage,
  UserProfile,
  Song,
  Playlist,
  UserActivity,
  isFirebaseConfigured
} from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface FirebaseContextType {
  // Configuration
  isConfigured: boolean;
  
  // Authentication
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Auth Methods
  signInWithGoogle: () => Promise<{ user: FirebaseUser | null; error: string | null }>;
  signInWithFacebook: () => Promise<{ user: FirebaseUser | null; error: string | null }>;
  signUpWithEmail: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ user: FirebaseUser | null; error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: FirebaseUser | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  
  // Real-time Data
  trendingSongs: Song[];
  userPlaylists: Playlist[];
  friendActivity: UserActivity[];
  
  // Data Methods
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<string | null>;
  addSong: (song: Omit<Song, 'id'>) => Promise<string | null>;
  recordActivity: (type: string, details: any) => Promise<void>;
  
  // Storage Methods
  uploadProfilePicture: (file: File) => Promise<{ url: string | null; error: string | null }>;
  uploadPlaylistCover: (file: File, playlistId: string) => Promise<{ url: string | null; error: string | null }>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [friendActivity, setFriendActivity] = useState<UserActivity[]>([]);

  const isConfigured = isFirebaseConfigured();
  const isAuthenticated = !!user && !!userProfile;

  // Auth state listener
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      console.log('🔥 Auth state changed:', firebaseUser?.uid || 'null');
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get user profile from Firestore
        const profile = await firebaseDB.getUserProfile(firebaseUser.uid);
        
        if (profile) {
          setUserProfile(profile);
        } else {
          // Create profile if it doesn't exist
          const newProfile = await firebaseAuth.createUserProfile(firebaseUser);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
        setUserPlaylists([]);
        setFriendActivity([]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isConfigured]);

  // User profile real-time listener
  useEffect(() => {
    if (!user || !isConfigured) return;

    const unsubscribe = firebaseDB.onUserProfileChange(user.uid, (profile) => {
      setUserProfile(profile);
    });

    return unsubscribe;
  }, [user, isConfigured]);

  // Trending songs listener
  useEffect(() => {
    if (!isConfigured) return;

    const unsubscribe = firebaseDB.onTrendingSongs((songs) => {
      setTrendingSongs(songs);
    }, 20);

    return unsubscribe;
  }, [isConfigured]);

  // User playlists listener
  useEffect(() => {
    if (!user || !isConfigured) return;

    const unsubscribe = firebaseDB.onUserPlaylists(user.uid, (playlists) => {
      setUserPlaylists(playlists);
    });

    return unsubscribe;
  }, [user, isConfigured]);

  // Friend activity listener (mock friends for now)
  useEffect(() => {
    if (!user || !isConfigured) return;

    // In a real app, you'd get friend IDs from the user's profile
    const friendIds: string[] = []; // userProfile?.friendIds || [];
    
    if (friendIds.length === 0) return;

    const unsubscribe = firebaseDB.onFriendActivity(friendIds, (activities) => {
      setFriendActivity(activities);
    });

    return unsubscribe;
  }, [user, userProfile, isConfigured]);

  // Auth methods
  const signInWithGoogle = async () => {
    if (!isConfigured) {
      return { user: null, error: 'Firebase not configured' };
    }
    
    setLoading(true);
    const result = await firebaseAuth.signInWithGoogle();
    setLoading(false);
    return result;
  };

  const signInWithFacebook = async () => {
    if (!isConfigured) {
      return { user: null, error: 'Firebase not configured' };
    }
    
    setLoading(true);
    const result = await firebaseAuth.signInWithFacebook();
    setLoading(false);
    return result;
  };

  const signUpWithEmail = async (email: string, password: string, userData: Partial<UserProfile>) => {
    if (!isConfigured) {
      return { user: null, error: 'Firebase not configured' };
    }
    
    setLoading(true);
    const result = await firebaseAuth.signUpWithEmail(email, password, userData);
    setLoading(false);
    return result;
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      return { user: null, error: 'Firebase not configured' };
    }
    
    setLoading(true);
    const result = await firebaseAuth.signInWithEmail(email, password);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await firebaseAuth.signOut();
    setLoading(false);
    return result;
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { error: 'Firebase not configured' };
    }
    
    return await firebaseAuth.resetPassword(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !isConfigured) return false;
    
    return await firebaseDB.updateUserProfile(user.uid, updates);
  };

  // Data methods
  const createPlaylist = async (name: string, description = '', isPublic = false) => {
    if (!user || !isConfigured) return null;

    const playlist: Omit<Playlist, 'id'> = {
      name,
      description,
      isPublic,
      createdBy: user.uid,
      songIds: [],
      songCount: 0,
      totalDuration: 0,
      followersCount: 0,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    return await firebaseDB.createPlaylist(playlist);
  };

  const addSong = async (song: Omit<Song, 'id'>) => {
    if (!isConfigured) return null;
    
    return await firebaseDB.addSong(song);
  };

  const recordActivity = async (type: string, details: any) => {
    if (!user || !isConfigured) return;

    await firebaseDB.recordActivity({
      userId: user.uid,
      type: type as any,
      details,
      timestamp: new Date() as any,
    });
  };

  // Storage methods
  const uploadProfilePicture = async (file: File) => {
    if (!user || !isConfigured) {
      return { url: null, error: 'Not authenticated or Firebase not configured' };
    }
    
    const result = await firebaseStorage.uploadProfilePicture(file, user.uid);
    
    if (result?.url) {
      // Update user profile with new photo URL
      await updateProfile({ photoURL: result.url });
    }
    
    return result || { url: null, error: 'Upload failed' };
  };

  const uploadPlaylistCover = async (file: File, playlistId: string) => {
    if (!isConfigured) {
      return { url: null, error: 'Firebase not configured' };
    }
    
    return await firebaseStorage.uploadPlaylistCover(file, playlistId) || 
           { url: null, error: 'Upload failed' };
  };

  const value: FirebaseContextType = {
    isConfigured,
    user,
    userProfile,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signInWithFacebook,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    resetPassword,
    updateProfile,
    trendingSongs,
    userPlaylists,
    friendActivity,
    createPlaylist,
    addSong,
    recordActivity,
    uploadProfilePicture,
    uploadPlaylistCover,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// Specialized hooks
export function useFirebaseAuth() {
  const { 
    user, 
    userProfile, 
    loading, 
    isAuthenticated, 
    isConfigured,
    signInWithGoogle,
    signInWithFacebook,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    resetPassword,
    updateProfile
  } = useFirebase();

  return {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isConfigured,
    signInWithGoogle,
    signInWithFacebook,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    resetPassword,
    updateProfile,
  };
}

export function useFirebaseData() {
  const {
    trendingSongs,
    userPlaylists,
    friendActivity,
    createPlaylist,
    addSong,
    recordActivity,
  } = useFirebase();

  return {
    trendingSongs,
    userPlaylists,
    friendActivity,
    createPlaylist,
    addSong,
    recordActivity,
  };
}

export function useFirebaseStorage() {
  const {
    uploadProfilePicture,
    uploadPlaylistCover,
  } = useFirebase();

  return {
    uploadProfilePicture,
    uploadPlaylistCover,
  };
}
