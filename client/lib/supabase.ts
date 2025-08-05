import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.includes('.supabase.co') && !url.includes('[') && !url.includes(']')
  } catch {
    return false
  }
}

// Create a mock client if credentials are not properly configured
export const supabase = (() => {
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes('[')) {
    console.warn('⚠️ Supabase not configured. Using mock client. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')

    // Return a mock client that prevents errors
    return {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
        rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) })
      })
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
})()

// Database types for TypeScript
export interface User {
  id: string
  email: string
  username: string
  name: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  verified: boolean
  premium: boolean
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  url: string
  cover_url?: string
  genre?: string
  release_date?: string
  play_count: number
  likes_count: number
  created_at: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  cover_url?: string
  is_public: boolean
  created_by: string
  song_count: number
  total_duration: number
  created_at: string
  updated_at: string
  user?: User
}

export interface Album {
  id: string
  title: string
  artist: string
  cover_url?: string
  release_date?: string
  genre?: string
  song_count: number
  total_duration: number
  created_at: string
}

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('[')
}

// Supabase API functions
export const supabaseAPI = {
  // Authentication
  async signUp(email: string, password: string, userData: any) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured. Please set environment variables.' } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured. Please set environment variables.' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    })
    return { data, error }
  },

  async signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    })
    return { data, error }
  },

  // User Profile
  async getUserProfile(userId: string): Promise<{ data: User | null, error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async searchUsers(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(limit)
    return { data, error }
  },

  // Songs
  async getTrendingSongs(limit = 20) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('play_count', { ascending: false })
      .limit(limit)
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

  async getSongById(id: string) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async likeSong(userId: string, songId: string) {
    const { data, error } = await supabase
      .from('user_liked_songs')
      .insert({ user_id: userId, song_id: songId })
    return { data, error }
  },

  async unlikeSong(userId: string, songId: string) {
    const { data, error } = await supabase
      .from('user_liked_songs')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId)
    return { data, error }
  },

  async getUserLikedSongs(userId: string) {
    const { data, error } = await supabase
      .from('user_liked_songs')
      .select(`
        songs (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Playlists
  async getUserPlaylists(userId: string) {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_songs (count)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getPublicPlaylists(limit = 20) {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        users!created_by (username, name, avatar_url),
        playlist_songs (count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async createPlaylist(userId: string, name: string, description = '', isPublic = false) {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        name,
        description,
        is_public: isPublic,
        created_by: userId
      })
      .select()
      .single()
    return { data, error }
  },

  async addSongToPlaylist(playlistId: string, songId: string) {
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId
      })
    return { data, error }
  },

  async getPlaylistSongs(playlistId: string) {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        songs (*),
        added_at
      `)
      .eq('playlist_id', playlistId)
      .order('added_at', { ascending: false })
    return { data, error }
  },

  // Albums
  async getTrendingAlbums(limit = 20) {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async getAlbumById(id: string) {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async getAlbumSongs(albumId: string) {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('album_id', albumId)
      .order('track_number', { ascending: true })
    return { data, error }
  },

  // Real-time subscriptions
  subscribeToUserActivity(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-activity')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_activity',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToPlaylistChanges(playlistId: string, callback: (payload: any) => void) {
    return supabase
      .channel('playlist-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'playlist_songs',
        filter: `playlist_id=eq.${playlistId}`
      }, callback)
      .subscribe()
  },

  // Availability Checks
  async checkEmailAvailability(email: string) {
    if (!isSupabaseConfigured()) {
      return { available: true, error: null }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    return {
      available: !data && error?.code === 'PGRST116', // No rows returned
      error: data ? null : (error?.code === 'PGRST116' ? null : error)
    }
  },

  async checkUsernameAvailability(username: string) {
    if (!isSupabaseConfigured()) {
      return { available: true, error: null }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    return {
      available: !data && error?.code === 'PGRST116', // No rows returned
      error: data ? null : (error?.code === 'PGRST116' ? null : error)
    }
  },

  // Analytics
  async recordSongPlay(userId: string, songId: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('user_listening_history')
      .insert({
        user_id: userId,
        song_id: songId,
        played_at: new Date().toISOString()
      })

    // Also increment play count
    await supabase
      .from('songs')
      .rpc('increment_play_count', { song_id: songId })
      .eq('id', songId)

    return { data, error }
  },

  async getUserListeningHistory(userId: string, limit = 50) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }

    const { data, error } = await supabase
      .from('user_listening_history')
      .select(`
        *,
        songs (*)
      `)
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit)
    return { data, error }
  }
}

export default supabase
