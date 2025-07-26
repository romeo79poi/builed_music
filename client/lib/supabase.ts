import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const { data, error } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .single()
    
    return { liked: !!data, error }
  }
}

export default supabase
