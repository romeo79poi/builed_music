import {
  UserProfile,
  ProfileResponse,
  ProfileUpdateRequest,
  LikedSongsResponse,
  RecentlyPlayedResponse,
  FollowResponse,
  Playlist,
  PlaylistResponse,
  PlaylistCreateRequest,
  PlaylistUpdateRequest,
  UploadResponse,
  SubscriptionResponse,
  SubscriptionUpdateRequest,
  UserSettings,
  ApiError,
} from "@shared/api";

const API_BASE_URL = "/api";

class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `API request failed with status ${response.status}`,
      errorData.code,
      response.status,
    );
  }

  return response.json();
}

// Profile API
export const profileApi = {
  // Get user profile
  getProfile: (userId = "user1"): Promise<ProfileResponse> =>
    apiRequest(`/profile/${userId}`),

  // Update user profile
  updateProfile: (
    updates: ProfileUpdateRequest,
    userId = "user1",
  ): Promise<ProfileResponse> =>
    apiRequest(`/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Get user stats
  getUserStats: (userId = "user1") => apiRequest(`/profile/${userId}/stats`),

  // Liked songs
  getLikedSongs: (
    userId = "user1",
    page = 1,
    limit = 20,
  ): Promise<LikedSongsResponse> =>
    apiRequest(`/profile/${userId}/liked-songs?page=${page}&limit=${limit}`),

  toggleLikedSong: (songId: string, userId = "user1") =>
    apiRequest(`/profile/${userId}/liked-songs/${songId}`, {
      method: "POST",
    }),

  // Recently played
  getRecentlyPlayed: (
    userId = "user1",
    limit = 10,
  ): Promise<RecentlyPlayedResponse> =>
    apiRequest(`/profile/${userId}/recently-played?limit=${limit}`),

  addToRecentlyPlayed: (songId: string, userId = "user1") =>
    apiRequest(`/profile/${userId}/recently-played`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    }),

  // Follow functionality
  toggleFollow: (
    targetUserId: string,
    userId = "user1",
  ): Promise<FollowResponse> =>
    apiRequest(`/profile/${userId}/follow/${targetUserId}`, {
      method: "POST",
    }),
};

// Playlist API
export const playlistApi = {
  // Get user playlists
  getUserPlaylists: (userId = "user1", includePrivate = true) =>
    apiRequest(`/playlists/${userId}?includePrivate=${includePrivate}`),

  // Get specific playlist
  getPlaylist: (
    playlistId: string,
    userId = "user1",
  ): Promise<PlaylistResponse> =>
    apiRequest(`/playlist/${playlistId}/${userId}`),

  // Create playlist
  createPlaylist: (
    playlist: PlaylistCreateRequest,
    userId = "user1",
  ): Promise<PlaylistResponse> =>
    apiRequest(`/playlists/${userId}`, {
      method: "POST",
      body: JSON.stringify(playlist),
    }),

  // Update playlist
  updatePlaylist: (
    playlistId: string,
    updates: PlaylistUpdateRequest,
    userId = "user1",
  ): Promise<PlaylistResponse> =>
    apiRequest(`/playlist/${playlistId}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Delete playlist
  deletePlaylist: (playlistId: string, userId = "user1") =>
    apiRequest(`/playlist/${playlistId}/${userId}`, {
      method: "DELETE",
    }),

  // Add song to playlist
  addSongToPlaylist: (playlistId: string, songId: string, userId = "user1") =>
    apiRequest(`/playlist/${playlistId}/songs/${userId}`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    }),

  // Remove song from playlist
  removeSongFromPlaylist: (
    playlistId: string,
    songId: string,
    userId = "user1",
  ) =>
    apiRequest(`/playlist/${playlistId}/songs/${songId}/${userId}`, {
      method: "DELETE",
    }),
};

// Upload API
export const uploadApi = {
  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<UploadResponse> => {
    // Create a data URL from the uploaded file for demo purposes
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const fileData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            dataUrl: dataUrl, // Include the actual image data
          };

          const response = await apiRequest(`/upload/profile-picture`, {
            method: "POST",
            body: JSON.stringify(fileData),
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  // Delete profile picture
  deleteProfilePicture: (fileName: string) =>
    apiRequest(`/upload/profile-picture/${fileName}`, {
      method: "DELETE",
    }),

  // Upload playlist cover
  uploadPlaylistCover: async (file: File): Promise<UploadResponse> => {
    const fileData = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };

    return apiRequest(`/upload/playlist-cover`, {
      method: "POST",
      body: JSON.stringify(fileData),
    });
  },

  // Get upload configuration
  getUploadConfig: () => apiRequest(`/upload/config`),
};

// Settings API
export const settingsApi = {
  // Get user settings
  getUserSettings: (userId = "user1") => apiRequest(`/settings/${userId}`),

  // Update user settings
  updateUserSettings: (settings: Partial<UserSettings>, userId = "user1") =>
    apiRequest(`/settings/${userId}`, {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // Update notification settings
  updateNotificationSettings: (
    notifications: Partial<UserSettings["notifications"]>,
    userId = "user1",
  ) =>
    apiRequest(`/settings/${userId}/notifications`, {
      method: "PUT",
      body: JSON.stringify(notifications),
    }),

  // Update privacy settings
  updatePrivacySettings: (
    privacy: Partial<UserSettings["privacy"]>,
    userId = "user1",
  ) =>
    apiRequest(`/settings/${userId}/privacy`, {
      method: "PUT",
      body: JSON.stringify(privacy),
    }),

  // Update playback settings
  updatePlaybackSettings: (
    playback: Partial<UserSettings["playback"]>,
    userId = "user1",
  ) =>
    apiRequest(`/settings/${userId}/playback`, {
      method: "PUT",
      body: JSON.stringify(playback),
    }),

  // Reset settings to default
  resetSettings: (userId = "user1") =>
    apiRequest(`/settings/${userId}/reset`, {
      method: "POST",
    }),
};

// Subscription API
export const subscriptionApi = {
  // Get subscription
  getSubscription: (userId = "user1"): Promise<SubscriptionResponse> =>
    apiRequest(`/subscription/${userId}`),

  // Update subscription
  updateSubscription: (
    updates: SubscriptionUpdateRequest,
    userId = "user1",
  ): Promise<SubscriptionResponse> =>
    apiRequest(`/subscription/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Cancel subscription
  cancelSubscription: (userId = "user1"): Promise<SubscriptionResponse> =>
    apiRequest(`/subscription/${userId}`, {
      method: "DELETE",
    }),
};

// Export all APIs
export const api = {
  profile: profileApi,
  playlist: playlistApi,
  upload: uploadApi,
  settings: settingsApi,
  subscription: subscriptionApi,
};

export default api;
