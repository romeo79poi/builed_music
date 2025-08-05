/**
 * Hybrid API Client - Combines Firebase real-time features with Express backend
 * 
 * Strategy:
 * - Authentication: Firebase Auth (Google, Facebook, Email, Phone)
 * - Real-time data: Firebase Firestore (songs, playlists, user activity)
 * - Business logic: Express backend (complex operations, analytics)
 * - File storage: Firebase Storage
 * - Real-time communication: Socket.IO (chat, music sync)
 */

import { catchAPI } from './api-client';
import { 
  firebaseAuth, 
  firebaseDB, 
  firebaseStorage,
  UserProfile,
  Song,
  Playlist
} from './firebase';

export interface HybridApiResponse<T> {
  data: T | null;
  error: string | null;
  source: 'firebase' | 'express' | 'hybrid';
}

class HybridApiClient {
  // Authentication - Use Firebase for OAuth, Express for custom flows
  auth = {
    // Firebase OAuth methods
    async signInWithGoogle() {
      const result = await firebaseAuth.signInWithGoogle();
      return {
        ...result,
        source: 'firebase' as const
      };
    },

    async signInWithFacebook() {
      const result = await firebaseAuth.signInWithFacebook();
      return {
        ...result,
        source: 'firebase' as const
      };
    },

    async signUpWithEmail(email: string, password: string, userData: Partial<UserProfile>) {
      const result = await firebaseAuth.signUpWithEmail(email, password, userData);
      return {
        ...result,
        source: 'firebase' as const
      };
    },

    async signInWithEmail(email: string, password: string) {
      const result = await firebaseAuth.signInWithEmail(email, password);
      return {
        ...result,
        source: 'firebase' as const
      };
    },

    // Express backend methods for custom auth flows
    async registerWithBackend(data: any) {
      const result = await catchAPI.auth.register(data);
      return {
        data: result.data,
        error: result.error,
        source: 'express' as const
      };
    },

    async loginWithBackend(data: any) {
      const result = await catchAPI.auth.login(data);
      return {
        data: result.data,
        error: result.error,
        source: 'express' as const
      };
    },

    async checkAvailability(field: string, value: string) {
      // Use Express backend for availability checks
      const result = await catchAPI.auth.checkAvailability(field, value);
      return {
        data: result.data,
        error: result.error,
        source: 'express' as const
      };
    },

    async signOut() {
      // Sign out from both Firebase and Express
      const firebaseResult = await firebaseAuth.signOut();
      // Clear Express session/token if needed
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      
      return {
        error: firebaseResult.error,
        source: 'hybrid' as const
      };
    }
  };

  // Music data - Use Firebase for real-time, Express for complex queries
  music = {
    // Real-time trending from Firebase
    getTrending: (): Promise<HybridApiResponse<Song[]>> => {
      return new Promise((resolve) => {
        const unsubscribe = firebaseDB.onTrendingSongs((songs) => {
          unsubscribe(); // Get once, not a listener
          resolve({
            data: songs,
            error: null,
            source: 'firebase'
          });
        });
      });
    },

    // Search using Express backend for better performance
    async search(query: string): Promise<HybridApiResponse<Song[]>> {
      const result = await catchAPI.music.search(query);
      return {
        data: result.data,
        error: result.error,
        source: 'express'
      };
    },

    // Get song by ID - try Firebase first, fallback to Express
    async getById(id: string): Promise<HybridApiResponse<Song>> {
      // Try Firebase first
      const firebaseSong = await firebaseDB.getSong(id);
      if (firebaseSong) {
        return {
          data: firebaseSong,
          error: null,
          source: 'firebase'
        };
      }

      // Fallback to Express
      const result = await catchAPI.music.getTrack(id);
      return {
        data: result.data,
        error: result.error,
        source: 'express'
      };
    },

    // Record play - use both for analytics
    async recordPlay(songId: string): Promise<HybridApiResponse<any>> {
      // Record in Express for analytics
      const expressResult = await catchAPI.music.recordPlay(songId);
      
      // Record in Firebase for real-time updates
      if (firebaseAuth.getCurrentUser()) {
        await firebaseDB.recordActivity({
          userId: firebaseAuth.getCurrentUser()!.uid,
          type: 'play',
          details: { songId },
          timestamp: new Date() as any
        });
      }

      return {
        data: expressResult.data,
        error: expressResult.error,
        source: 'hybrid'
      };
    },

    // Add song to Firebase
    async addSong(song: Omit<Song, 'id'>): Promise<HybridApiResponse<string>> {
      const songId = await firebaseDB.addSong(song);
      return {
        data: songId,
        error: songId ? null : 'Failed to add song',
        source: 'firebase'
      };
    }
  };

  // Playlists - Use Firebase for real-time collaboration
  playlists = {
    async create(name: string, description = '', isPublic = false): Promise<HybridApiResponse<string>> {
      if (!firebaseAuth.getCurrentUser()) {
        return { data: null, error: 'Not authenticated', source: 'firebase' };
      }

      const playlistId = await firebaseDB.createPlaylist({
        name,
        description,
        isPublic,
        createdBy: firebaseAuth.getCurrentUser()!.uid,
        songIds: [],
        songCount: 0,
        totalDuration: 0,
        followersCount: 0,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      });

      return {
        data: playlistId,
        error: playlistId ? null : 'Failed to create playlist',
        source: 'firebase'
      };
    },

    // Get user playlists - real-time from Firebase
    getUserPlaylists: (userId: string): Promise<HybridApiResponse<Playlist[]>> => {
      return new Promise((resolve) => {
        const unsubscribe = firebaseDB.onUserPlaylists(userId, (playlists) => {
          unsubscribe();
          resolve({
            data: playlists,
            error: null,
            source: 'firebase'
          });
        });
      });
    },

    // Public playlists from Express for better performance
    async getPublic(): Promise<HybridApiResponse<any[]>> {
      const result = await catchAPI.playlists.getUserPlaylists('public');
      return {
        data: result.data,
        error: result.error,
        source: 'express'
      };
    }
  };

  // User profile - Use Firebase for real-time updates
  user = {
    async getProfile(userId?: string): Promise<HybridApiResponse<UserProfile>> {
      const targetId = userId || firebaseAuth.getCurrentUser()?.uid;
      if (!targetId) {
        return { data: null, error: 'No user ID provided', source: 'firebase' };
      }

      const profile = await firebaseDB.getUserProfile(targetId);
      return {
        data: profile,
        error: profile ? null : 'Profile not found',
        source: 'firebase'
      };
    },

    async updateProfile(updates: Partial<UserProfile>): Promise<HybridApiResponse<boolean>> {
      const currentUser = firebaseAuth.getCurrentUser();
      if (!currentUser) {
        return { data: false, error: 'Not authenticated', source: 'firebase' };
      }

      const success = await firebaseDB.updateUserProfile(currentUser.uid, updates);
      return {
        data: success,
        error: success ? null : 'Failed to update profile',
        source: 'firebase'
      };
    },

    // Get user stats from Express for complex analytics
    async getStats(userId: string): Promise<HybridApiResponse<any>> {
      const result = await catchAPI.user.getStats(userId);
      return {
        data: result.data,
        error: result.error,
        source: 'express'
      };
    }
  };

  // File storage - Use Firebase Storage
  storage = {
    async uploadProfilePicture(file: File): Promise<HybridApiResponse<string>> {
      const currentUser = firebaseAuth.getCurrentUser();
      if (!currentUser) {
        return { data: null, error: 'Not authenticated', source: 'firebase' };
      }

      const result = await firebaseStorage.uploadProfilePicture(file, currentUser.uid);
      return {
        data: result?.url || null,
        error: result?.error || null,
        source: 'firebase'
      };
    },

    async uploadPlaylistCover(file: File, playlistId: string): Promise<HybridApiResponse<string>> {
      const result = await firebaseStorage.uploadPlaylistCover(file, playlistId);
      return {
        data: result?.url || null,
        error: result?.error || null,
        source: 'firebase'
      };
    },

    async uploadSong(file: File, songId: string): Promise<HybridApiResponse<string>> {
      const result = await firebaseStorage.uploadSong(file, songId);
      return {
        data: result?.url || null,
        error: result?.error || null,
        source: 'firebase'
      };
    }
  };

  // Analytics - Use Express backend for complex queries
  analytics = {
    async getUserAnalytics(userId: string): Promise<HybridApiResponse<any>> {
      const result = await catchAPI.user.getStats(userId);
      return {
        data: result.data,
        error: result.error,
        source: 'express'
      };
    },

    async getListeningHistory(userId: string): Promise<HybridApiResponse<any>> {
      // You can implement this in Express backend
      return {
        data: null,
        error: 'Not implemented',
        source: 'express'
      };
    }
  };

  // Real-time listeners
  listeners = {
    onTrendingSongs(callback: (songs: Song[]) => void) {
      return firebaseDB.onTrendingSongs(callback);
    },

    onUserPlaylists(userId: string, callback: (playlists: Playlist[]) => void) {
      return firebaseDB.onUserPlaylists(userId, callback);
    },

    onUserProfileChange(userId: string, callback: (profile: UserProfile | null) => void) {
      return firebaseDB.onUserProfileChange(userId, callback);
    },

    onFriendActivity(friendIds: string[], callback: (activities: any[]) => void) {
      return firebaseDB.onFriendActivity(friendIds, callback);
    }
  };
}

// Create and export the hybrid API instance
export const hybridAPI = new HybridApiClient();

// Export individual modules for convenience
export const {
  auth: hybridAuth,
  music: hybridMusic,
  playlists: hybridPlaylists,
  user: hybridUser,
  storage: hybridStorage,
  analytics: hybridAnalytics,
  listeners: hybridListeners
} = hybridAPI;

export default hybridAPI;
