import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl.includes('.supabase.co') && supabaseAnonKey !== 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility to check if Supabase is available
export const isSupabaseAvailable = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured, using demo mode')
    return false
  }

  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    return !error
  } catch (error) {
    console.warn('⚠️ Supabase connection failed:', error)
    return false
  }
}

// Database types
export interface User {
  id: string
  email: string
  username: string
  name: string
  phone?: string
  profile_image_url?: string
  created_at: string
  updated_at?: string
  is_verified: boolean
  email_verified?: boolean
  phone_verified?: boolean
}

export interface Song {
  id: string
  title: string
  artist: string
  album_id?: string
  cover_image_url: string
  audio_url?: string
  duration?: number
  created_at: string
}

export interface Album {
  id: string
  name: string
  artist: string
  cover_image_url: string
  created_at: string
}

export interface Playlist {
  id: string
  name: string
  created_by: string
  cover_image_url?: string
  is_public: boolean
  created_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  added_at: string
  added_by: string
}

export interface UserLike {
  id: string
  user_id: string
  song_id: string
  created_at: string
}

// Authentication functions
export const supabaseAuth = {
  // Email/Password Authentication
  async signUp(email: string, password: string, metadata?: { username?: string, name?: string }) {
    if (!isSupabaseConfigured) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    })
    return { data, error }
  },

  async signInWithPassword(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { data: { user: { id: 'demo-user', email }, session: { access_token: 'demo-token' } }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // OAuth Authentication
  async signInWithOAuth(provider: 'google' | 'facebook' | 'twitter' | 'github') {
    if (!isSupabaseConfigured) {
      return { data: { url: null, provider }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    return { data, error }
  },

  // Phone Authentication
  async signInWithPhone(phone: string) {
    if (!isSupabaseConfigured) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true
      }
    })
    return { data, error }
  },

  async verifyPhoneOtp(phone: string, token: string) {
    if (!isSupabaseConfigured) {
      return { data: { user: { id: 'demo-user', phone }, session: { access_token: 'demo-token' } }, error: null }
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    return { data, error }
  },

  // Session Management
  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured) {
      return { data: { session: null }, error: null }
    }

    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured) {
      return { data: { user: null }, error: null }
    }

    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  // Password Management
  async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  async updatePassword(password: string) {
    if (!isSupabaseConfigured) {
      return { data: { user: { id: 'demo-user' } }, error: null }
    }

    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  },

  async updateProfile(updates: { email?: string, password?: string, data?: any }) {
    if (!isSupabaseConfigured) {
      return { data: { user: { id: 'demo-user', ...updates } }, error: null }
    }

    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  },

  // Email Verification
  async resendEmailConfirmation(email?: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email!
    })
    return { data, error }
  },

  async verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'email' | 'invite') {
    if (!isSupabaseConfigured) {
      return { data: { user: { id: 'demo-user', email }, session: { access_token: 'demo-token' } }, error: null }
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })
    return { data, error }
  }
}

// Helper functions for Supabase operations
export const supabaseOperations = {
  // User operations
  async createUser(userData: Omit<User, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    return { data, error }
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    return { data, error }
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Song operations
  async getSongs(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  async getSongById(id: string) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async searchSongs(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .limit(limit)
    
    return { data, error }
  },

  // Album operations
  async getAlbums(limit = 10) {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // Playlist operations
  async getUserPlaylists(userId: string) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getPlaylistSongs(playlistId: string) {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        *,
        songs (*)
      `)
      .eq('playlist_id', playlistId)
      .order('added_at', { ascending: false })
    
    return { data, error }
  },

  // Likes operations
  async getUserLikes(userId: string) {
    const { data, error } = await supabase
      .from('user_likes')
      .select(`
        *,
        songs (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async toggleLike(userId: string, songId: string) {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId)
      
      return { liked: false, error }
    } else {
      // Like
      const { error } = await supabase
        .from('user_likes')
        .insert([{
          user_id: userId,
          song_id: songId,
          created_at: new Date().toISOString()
        }])
      
      return { liked: true, error }
    }
  },

  // Check if user likes a song
  async isLiked(userId: string, songId: string) {
    if (!isSupabaseConfigured) {
      return { liked: false, error: null }
    }

    const { data, error } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()

    return { liked: !!data, error }
  },

  // Advanced Search Operations
  async searchAll(query: string, limit = 20) {
    if (!isSupabaseConfigured) {
      return { data: { songs: [], albums: [], playlists: [] }, error: null }
    }

    const [songsResult, albumsResult, playlistsResult] = await Promise.all([
      this.searchSongs(query, limit),
      this.searchAlbums(query, limit),
      this.searchPlaylists(query, limit)
    ])

    return {
      data: {
        songs: songsResult.data || [],
        albums: albumsResult.data || [],
        playlists: playlistsResult.data || []
      },
      error: songsResult.error || albumsResult.error || playlistsResult.error
    }
  },

  async searchAlbums(query: string, limit = 10) {
    if (!isSupabaseConfigured) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .or(`name.ilike.%${query}%,artist.ilike.%${query}%`)
      .limit(limit)

    return { data, error }
  },

  async searchPlaylists(query: string, limit = 10) {
    if (!isSupabaseConfigured) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('is_public', true)
      .ilike('name', `%${query}%`)
      .limit(limit)

    return { data, error }
  },

  // Playlist Management
  async createPlaylist(userId: string, name: string, isPublic = false, coverImageUrl?: string) {
    if (!isSupabaseConfigured) {
      return { data: { id: 'demo-playlist', name, created_by: userId }, error: null }
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert([{
        name,
        created_by: userId,
        is_public: isPublic,
        cover_image_url: coverImageUrl,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    return { data, error }
  },

  async addSongToPlaylist(playlistId: string, songId: string, userId: string) {
    if (!isSupabaseConfigured) {
      return { data: { id: 'demo-playlist-song' }, error: null }
    }

    const { data, error } = await supabase
      .from('playlist_songs')
      .insert([{
        playlist_id: playlistId,
        song_id: songId,
        added_by: userId,
        added_at: new Date().toISOString()
      }])
      .select()
      .single()

    return { data, error }
  },

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    if (!isSupabaseConfigured) {
      return { error: null }
    }

    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)

    return { error }
  },

  async deletePlaylist(playlistId: string, userId: string) {
    if (!isSupabaseConfigured) {
      return { error: null }
    }

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('created_by', userId)

    return { error }
  },

  // File Upload to Supabase Storage
  async uploadSong(file: File, userId: string) {
    if (!isSupabaseConfigured) {
      return { data: { path: 'demo-song.mp3' }, error: null }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('songs')
      .upload(fileName, file)

    return { data, error }
  },

  async uploadCoverImage(file: File, userId: string) {
    if (!isSupabaseConfigured) {
      return { data: { path: 'demo-cover.jpg' }, error: null }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `covers/${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file)

    return { data, error }
  },

  async getPublicUrl(bucket: string, path: string) {
    if (!isSupabaseConfigured) {
      return { data: { publicUrl: `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}` } }
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { data }
  },

  // Real-time subscriptions
  subscribeToPlaylistChanges(playlistId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} }
    }

    const subscription = supabase
      .channel(`playlist-${playlistId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'playlist_songs',
        filter: `playlist_id=eq.${playlistId}`
      }, callback)
      .subscribe()

    return {
      unsubscribe: () => subscription.unsubscribe()
    }
  },

  subscribeToUserLikes(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} }
    }

    const subscription = supabase
      .channel(`user-likes-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_likes',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()

    return {
      unsubscribe: () => subscription.unsubscribe()
    }
  }
}

export default supabase
