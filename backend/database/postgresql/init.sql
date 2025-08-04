-- CATCH Music Streaming Database Schema
-- PostgreSQL Database Schema for Music Catch Application

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    country VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_artist BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    genre VARCHAR(100),
    image_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    monthly_listeners INTEGER DEFAULT 0,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    artist_name VARCHAR(255) NOT NULL,
    release_date DATE,
    album_type VARCHAR(50) DEFAULT 'album', -- album, single, EP
    cover_image_url TEXT,
    total_tracks INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    genre VARCHAR(100),
    label VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    play_count BIGINT DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    artist_name VARCHAR(255) NOT NULL,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    album_name VARCHAR(255),
    track_number INTEGER,
    duration_ms INTEGER NOT NULL,
    explicit BOOLEAN DEFAULT FALSE,
    preview_url TEXT,
    spotify_url TEXT,
    youtube_url TEXT,
    apple_music_url TEXT,
    audio_file_url TEXT,
    lyrics TEXT,
    genre VARCHAR(100),
    mood VARCHAR(50),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    release_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    play_count BIGINT DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    audio_quality VARCHAR(20) DEFAULT 'standard', -- standard, high, lossless
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    track_count INTEGER DEFAULT 0,
    total_duration_ms BIGINT DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    play_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlist tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, track_id),
    UNIQUE(playlist_id, position)
);

-- User follows table
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, followee_id),
    CHECK(follower_id != followee_id)
);

-- User liked tracks
CREATE TABLE IF NOT EXISTS user_liked_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id)
);

-- User liked albums
CREATE TABLE IF NOT EXISTS user_liked_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, album_id)
);

-- User liked playlists
CREATE TABLE IF NOT EXISTS user_liked_playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, playlist_id)
);

-- User play history
CREATE TABLE IF NOT EXISTS user_play_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    play_duration_ms INTEGER, -- How long the user listened
    skip_reason VARCHAR(50), -- if skipped early
    device_type VARCHAR(50), -- mobile, desktop, web
    platform VARCHAR(50) -- spotify, youtube, apple_music, native
);

-- User search history
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(255) NOT NULL,
    search_type VARCHAR(50), -- track, artist, album, playlist
    result_count INTEGER DEFAULT 0,
    clicked_result_id UUID, -- ID of what they clicked on
    clicked_result_type VARCHAR(50), -- track, artist, album, playlist
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User listening sessions
CREATE TABLE IF NOT EXISTS user_listening_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP WITH TIME ZONE,
    total_tracks_played INTEGER DEFAULT 0,
    total_duration_ms BIGINT DEFAULT 0,
    device_type VARCHAR(50),
    platform VARCHAR(50)
);

-- Track analytics (for trending, recommendations)
CREATE TABLE IF NOT EXISTS track_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    play_count INTEGER DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,
    skip_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2), -- percentage of track completed on average
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    playlist_adds INTEGER DEFAULT 0,
    UNIQUE(track_id, date)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferred_genres TEXT[], -- array of genres
    preferred_moods TEXT[], -- array of moods
    preferred_decades TEXT[], -- array like '2020s', '2010s'
    audio_quality VARCHAR(20) DEFAULT 'standard',
    explicit_content BOOLEAN DEFAULT TRUE,
    autoplay BOOLEAN DEFAULT TRUE,
    crossfade_duration INTEGER DEFAULT 0, -- seconds
    volume INTEGER DEFAULT 80 CHECK (volume >= 0 AND volume <= 100),
    shuffle_mode BOOLEAN DEFAULT FALSE,
    repeat_mode VARCHAR(20) DEFAULT 'off', -- off, track, playlist
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- follow, like, playlist_add, new_release
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB, -- additional data like track_id, user_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User devices
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- mobile, desktop, tablet, smart_speaker
    device_id VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(50), -- ios, android, windows, macos, web
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_active ON tracks(is_active);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_release_date ON tracks(release_date);
CREATE INDEX IF NOT EXISTS idx_tracks_play_count ON tracks(play_count DESC);

CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_active ON albums(is_active);
CREATE INDEX IF NOT EXISTS idx_albums_release_date ON albums(release_date);

CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(is_public);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followee ON user_follows(followee_id);

CREATE INDEX IF NOT EXISTS idx_user_liked_tracks_user ON user_liked_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_liked_tracks_track ON user_liked_tracks(track_id);

CREATE INDEX IF NOT EXISTS idx_user_play_history_user ON user_play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_track ON user_play_history(track_id);
CREATE INDEX IF NOT EXISTS idx_user_play_history_played_at ON user_play_history(played_at DESC);

CREATE INDEX IF NOT EXISTS idx_track_analytics_track ON track_analytics(track_id);
CREATE INDEX IF NOT EXISTS idx_track_analytics_date ON track_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tracks_search ON tracks USING gin(to_tsvector('english', title || ' ' || artist_name || ' ' || COALESCE(album_name, '')));
CREATE INDEX IF NOT EXISTS idx_artists_search ON artists USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_albums_search ON albums USING gin(to_tsvector('english', title || ' ' || artist_name));
CREATE INDEX IF NOT EXISTS idx_playlists_search ON playlists USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO artists (id, name, bio, genre, verified) VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', 'Taylor Swift', 'American singer-songwriter', 'Pop', true),
    ('550e8400-e29b-41d4-a716-446655440021', 'The Weeknd', 'Canadian singer, songwriter, and record producer', 'R&B', true),
    ('550e8400-e29b-41d4-a716-446655440022', 'Ed Sheeran', 'English singer-songwriter', 'Pop', true),
    ('550e8400-e29b-41d4-a716-446655440023', 'Dua Lipa', 'English singer and songwriter', 'Pop', true),
    ('550e8400-e29b-41d4-a716-446655440024', 'Drake', 'Canadian rapper and singer', 'Hip-Hop', true);

INSERT INTO albums (id, title, artist_id, artist_name, release_date, cover_image_url, total_tracks) VALUES 
    ('550e8400-e29b-41d4-a716-446655440030', 'Midnights', '550e8400-e29b-41d4-a716-446655440020', 'Taylor Swift', '2022-10-21', 'https://example.com/midnights.jpg', 13),
    ('550e8400-e29b-41d4-a716-446655440031', 'After Hours', '550e8400-e29b-41d4-a716-446655440021', 'The Weeknd', '2020-03-20', 'https://example.com/afterhours.jpg', 14),
    ('550e8400-e29b-41d4-a716-446655440032', '÷ (Divide)', '550e8400-e29b-41d4-a716-446655440022', 'Ed Sheeran', '2017-03-03', 'https://example.com/divide.jpg', 16),
    ('550e8400-e29b-41d4-a716-446655440033', 'Future Nostalgia', '550e8400-e29b-41d4-a716-446655440023', 'Dua Lipa', '2020-03-27', 'https://example.com/futurenostalgia.jpg', 11),
    ('550e8400-e29b-41d4-a716-446655440034', 'Certified Lover Boy', '550e8400-e29b-41d4-a716-446655440024', 'Drake', '2021-09-03', 'https://example.com/clb.jpg', 21);

INSERT INTO tracks (id, title, artist_id, artist_name, album_id, album_name, track_number, duration_ms, play_count, like_count) VALUES 
    ('550e8400-e29b-41d4-a716-446655440040', 'Anti-Hero', '550e8400-e29b-41d4-a716-446655440020', 'Taylor Swift', '550e8400-e29b-41d4-a716-446655440030', 'Midnights', 1, 200000, 50000000, 1500000),
    ('550e8400-e29b-41d4-a716-446655440041', 'Blinding Lights', '550e8400-e29b-41d4-a716-446655440021', 'The Weeknd', '550e8400-e29b-41d4-a716-446655440031', 'After Hours', 1, 200000, 75000000, 2000000),
    ('550e8400-e29b-41d4-a716-446655440042', 'Shape of You', '550e8400-e29b-41d4-a716-446655440022', 'Ed Sheeran', '550e8400-e29b-41d4-a716-446655440032', '÷ (Divide)', 1, 233712, 60000000, 1800000),
    ('550e8400-e29b-41d4-a716-446655440043', 'Levitating', '550e8400-e29b-41d4-a716-446655440023', 'Dua Lipa', '550e8400-e29b-41d4-a716-446655440033', 'Future Nostalgia', 2, 203000, 45000000, 1200000),
    ('550e8400-e29b-41d4-a716-446655440044', 'God''s Plan', '550e8400-e29b-41d4-a716-446655440024', 'Drake', '550e8400-e29b-41d4-a716-446655440034', 'Certified Lover Boy', 3, 198973, 80000000, 2500000),
    ('550e8400-e29b-41d4-a716-446655440045', 'Lavender Haze', '550e8400-e29b-41d4-a716-446655440020', 'Taylor Swift', '550e8400-e29b-41d4-a716-446655440030', 'Midnights', 2, 202000, 35000000, 900000),
    ('550e8400-e29b-41d4-a716-446655440046', 'Save Your Tears', '550e8400-e29b-41d4-a716-446655440021', 'The Weeknd', '550e8400-e29b-41d4-a716-446655440031', 'After Hours', 3, 215000, 40000000, 1100000),
    ('550e8400-e29b-41d4-a716-446655440047', 'Perfect', '550e8400-e29b-41d4-a716-446655440022', 'Ed Sheeran', '550e8400-e29b-41d4-a716-446655440032', '÷ (Divide)', 2, 263000, 55000000, 1600000),
    ('550e8400-e29b-41d4-a716-446655440048', 'Don''t Start Now', '550e8400-e29b-41d4-a716-446655440023', 'Dua Lipa', '550e8400-e29b-41d4-a716-446655440033', 'Future Nostalgia', 1, 183000, 42000000, 1000000),
    ('550e8400-e29b-41d4-a716-446655440049', 'Hotline Bling', '550e8400-e29b-41d4-a716-446655440024', 'Drake', '550e8400-e29b-41d4-a716-446655440034', 'Certified Lover Boy', 5, 267000, 65000000, 1900000);

-- Insert a demo user for testing
INSERT INTO users (id, email, username, display_name, password_hash, is_verified, is_active) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'demo@musiccatch.com', 'demo_user', 'Demo User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqHBaQcmElG88se', true, true);

-- Insert a sample playlist
INSERT INTO playlists (id, name, description, user_id, is_public, track_count) VALUES 
    ('550e8400-e29b-41d4-a716-446655440050', 'Top Hits 2023', 'The biggest hits of 2023', '550e8400-e29b-41d4-a716-446655440001', true, 5);

-- Add tracks to the playlist
INSERT INTO playlist_tracks (playlist_id, track_id, added_by, position) VALUES 
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', 1),
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440001', 2),
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440001', 3),
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440001', 4),
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440001', 5);

COMMENT ON DATABASE catch_music IS 'CATCH Music Streaming Platform Database';
