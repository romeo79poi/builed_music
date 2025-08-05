/**
 * Enhanced API Client with consistent error handling and JWT support
 * Combines the best of Fetch API with robust error handling
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status?: number;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data: T | null = null;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as unknown as T;
      }

      if (!response.ok) {
        const errorMessage = 
          (data as any)?.message || 
          (data as any)?.error || 
          `HTTP ${response.status}: ${response.statusText}`;
        
        return {
          data: null,
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        data,
        error: null,
        status: response.status,
      };

    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // Upload file
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers, // Don't set Content-Type for FormData
    });
  }
}

// Create API client instances for different services
export const api = new ApiClient('/api');
export const authAPI = new ApiClient('/api/v2/auth');
export const musicAPI = new ApiClient('/api/v1');

// Unified API service that automatically chooses the best endpoint
export const catchAPI = {
  // Authentication (MongoDB + JWT)
  auth: {
    register: (data: any) => authAPI.post('/register', data),
    login: (data: any) => authAPI.post('/login', data),
    refresh: () => authAPI.post('/refresh-token'),
    checkAvailability: (field: string, value: string) => 
      authAPI.get(`/check-availability?${field}=${value}`),
    sendVerification: (email: string) => authAPI.post('/send-email-verification', { email }),
    verifyEmail: (data: any) => authAPI.post('/verify-email', data),
    completeRegistration: (data: any) => authAPI.post('/complete-registration', data),
  },

  // Music & Content
  music: {
    trending: () => musicAPI.get('/tracks/trending'),
    search: (query: string) => musicAPI.get(`/tracks/search?q=${encodeURIComponent(query)}`),
    getTrack: (id: string) => musicAPI.get(`/tracks/${id}`),
    recordPlay: (id: string) => musicAPI.post(`/tracks/${id}/play`),
    like: (id: string) => musicAPI.post(`/tracks/${id}/like`),
    unlike: (id: string) => musicAPI.delete(`/tracks/${id}/like`),
  },

  // Artists
  artists: {
    trending: () => musicAPI.get('/artists/trending'),
    search: (query: string) => musicAPI.get(`/artists/search?q=${encodeURIComponent(query)}`),
    getArtist: (id: string) => musicAPI.get(`/artists/${id}`),
    follow: (id: string) => musicAPI.post(`/artists/${id}/follow`),
    unfollow: (id: string) => musicAPI.delete(`/artists/${id}/follow`),
    getTopTracks: (id: string) => musicAPI.get(`/artists/${id}/top-tracks`),
  },

  // Playlists
  playlists: {
    getUserPlaylists: (userId: string) => musicAPI.get(`/users/${userId}/playlists`),
    getPlaylist: (id: string) => musicAPI.get(`/playlists/${id}`),
    create: (data: any) => musicAPI.post('/playlists', data),
    update: (id: string, data: any) => musicAPI.put(`/playlists/${id}`, data),
    delete: (id: string) => musicAPI.delete(`/playlists/${id}`),
    addTrack: (playlistId: string, trackId: string) => 
      musicAPI.post(`/playlists/${playlistId}/tracks`, { track_id: trackId }),
    removeTrack: (playlistId: string, trackId: string) => 
      musicAPI.delete(`/playlists/${playlistId}/tracks/${trackId}`),
  },

  // User Profile
  user: {
    getProfile: (id?: string) => api.get(`/profile${id ? `/${id}` : ''}`),
    updateProfile: (data: any, id?: string) => api.put(`/profile${id ? `/${id}` : ''}`, data),
    getStats: (id: string) => api.get(`/profile/${id}/stats`),
    getLikedSongs: (id: string) => api.get(`/profile/${id}/liked-songs`),
    getRecentlyPlayed: (id: string) => api.get(`/profile/${id}/recently-played`),
    follow: (targetId: string) => api.post(`/profile/follow/${targetId}`),
    unfollow: (targetId: string) => api.delete(`/profile/follow/${targetId}`),
  },

  // Settings
  settings: {
    get: () => api.get('/settings'),
    update: (data: any) => api.put('/settings', data),
    updateNotifications: (data: any) => api.put('/settings/notifications', data),
    updatePrivacy: (data: any) => api.put('/settings/privacy', data),
    updatePlayback: (data: any) => api.put('/settings/playback', data),
    reset: () => api.post('/settings/reset'),
  },

  // Upload
  upload: {
    profilePicture: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload('/upload/profile-picture', formData);
    },
    playlistCover: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload('/upload/playlist-cover', formData);
    },
  },
};

export default catchAPI;
