-- Supabase database schema for Catch music streaming app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE
);

-- Songs table
CREATE TABLE songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  cover_image_url TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER, -- duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums table
CREATE TABLE albums (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist songs junction table
CREATE TABLE playlist_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(playlist_id, song_id)
);

-- User likes table
CREATE TABLE user_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- User listening history
CREATE TABLE listening_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_listened INTEGER, -- seconds listened
  completed BOOLEAN DEFAULT FALSE
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_album_id ON songs(album_id);
CREATE INDEX idx_playlists_created_by ON playlists(created_by);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_song_id ON user_likes(song_id);
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_song_id ON listening_history(song_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Everyone can read songs and albums
CREATE POLICY "Anyone can view songs" ON songs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view albums" ON albums
  FOR SELECT USING (true);

-- Users can manage their own playlists
CREATE POLICY "Users can view own playlists" ON playlists
  FOR SELECT USING (auth.uid()::text = created_by::text OR is_public = true);

CREATE POLICY "Users can create playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update own playlists" ON playlists
  FOR UPDATE USING (auth.uid()::text = created_by::text);

CREATE POLICY "Users can delete own playlists" ON playlists
  FOR DELETE USING (auth.uid()::text = created_by::text);

-- Playlist songs policies
CREATE POLICY "Users can view playlist songs" ON playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND (playlists.created_by::text = auth.uid()::text OR playlists.is_public = true)
    )
  );

CREATE POLICY "Users can add songs to own playlists" ON playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.created_by::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can remove songs from own playlists" ON playlist_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.created_by::text = auth.uid()::text
    )
  );

-- User likes policies
CREATE POLICY "Users can view own likes" ON user_likes
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own likes" ON user_likes
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Listening history policies
CREATE POLICY "Users can view own history" ON listening_history
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can add to own history" ON listening_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
INSERT INTO albums (id, name, artist, cover_image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Purple Dreams', 'Violet Sounds', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Neon Nights', 'Electric Waves', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Cosmic Journey', 'Space Melody', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop');

INSERT INTO songs (id, title, artist, album_id, cover_image_url, duration) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Purple Rain', 'Violet Sounds', '550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 210),
  ('550e8400-e29b-41d4-a716-446655440012', 'Midnight Glow', 'Electric Waves', '550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', 185),
  ('550e8400-e29b-41d4-a716-446655440013', 'Starlight', 'Space Melody', '550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop', 195),
  ('550e8400-e29b-41d4-a716-446655440014', 'Dreamscape', 'Violet Sounds', '550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', 240),
  ('550e8400-e29b-41d4-a716-446655440015', 'Electric Feel', 'Electric Waves', '550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', 220);
