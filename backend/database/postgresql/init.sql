-- CATCH Music Streaming Database Schema
-- PostgreSQL database schema inspired by Spotify's architecture

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    profile_image_url TEXT,
    cover_image_url TEXT,
    bio TEXT,
    country VARCHAR(2), -- ISO country code
    birth_date DATE,
    subscription_type VARCHAR(20) DEFAULT 'FREE' CHECK (subscription_type IN ('FREE', 'PREMIUM', 'FAMILY', 'STUDENT')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_artist BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    follower_count BIGINT DEFAULT 0,
    following_count BIGINT DEFAULT 0,
    total_play_time_ms BIGINT DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ARTIST', 'ADMIN', 'MODERATOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role)
);

-- Artists table (extended information for artist users)
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stage_name VARCHAR(100),
    genre VARCHAR(50),
    record_label VARCHAR(100),
    monthly_listeners BIGINT DEFAULT 0,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums table
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    cover_image_url TEXT,
    release_date DATE,
    album_type VARCHAR(20) DEFAULT 'ALBUM' CHECK (album_type IN ('ALBUM', 'SINGLE', 'EP', 'COMPILATION')),
    genre VARCHAR(50),
    total_duration_ms BIGINT DEFAULT 0,
    track_count INTEGER DEFAULT 0,
    is_explicit BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    play_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    artist_name VARCHAR(100) NOT NULL, -- Denormalized for performance
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    album_name VARCHAR(200), -- Denormalized for performance
    track_number INTEGER,
    duration_ms BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    cover_image_url TEXT,
    genre VARCHAR(50),
    release_date DATE,
    play_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    skip_count BIGINT DEFAULT 0,
    is_explicit BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    audio_quality VARCHAR(20) DEFAULT '320kbps',
    lyrics TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track tags for better categorization
CREATE TABLE track_tags (
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (track_id, tag)
);

-- Playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    follower_count BIGINT DEFAULT 0,
    play_count BIGINT DEFAULT 0,
    track_count INTEGER DEFAULT 0,
    total_duration_ms BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks (many-to-many relationship)
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, track_id, position)
);

-- User follows (social feature)
CREATE TABLE user_follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id != followee_id)
);

-- User liked tracks
CREATE TABLE user_liked_tracks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, track_id)
);

-- User liked albums
CREATE TABLE user_liked_albums (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, album_id)
);

-- User playlist follows
CREATE TABLE user_playlist_follows (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, playlist_id)
);

-- User play history (for analytics and recommendations)
CREATE TABLE user_play_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    play_duration_ms BIGINT, -- How long the track was actually played
    skip_reason VARCHAR(50), -- 'manual_skip', 'next_track', 'completed', etc.
    device_type VARCHAR(50),
    ip_address INET,
    country VARCHAR(2)
);

-- User sessions for tracking active users
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Search history for improving search algorithms
CREATE TABLE user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    result_type VARCHAR(20), -- 'track', 'album', 'artist', 'playlist'
    result_id UUID,
    clicked BOOLEAN DEFAULT FALSE,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'new_follower', 'track_liked', 'playlist_shared', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation table
CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_type VARCHAR(20) NOT NULL, -- 'track', 'album', 'playlist', 'user'
    content_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics tables (time-series data)
CREATE TABLE daily_track_stats (
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    play_count BIGINT DEFAULT 0,
    unique_listeners BIGINT DEFAULT 0,
    skip_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    PRIMARY KEY (track_id, date)
);

CREATE TABLE daily_user_stats (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tracks_played INTEGER DEFAULT 0,
    listening_time_ms BIGINT DEFAULT 0,
    unique_artists INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_is_active ON tracks(is_active);
CREATE INDEX idx_tracks_play_count ON tracks(play_count DESC);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX idx_tracks_title_gin ON tracks USING gin(title gin_trgm_ops);
CREATE INDEX idx_tracks_artist_name_gin ON tracks USING gin(artist_name gin_trgm_ops);

CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_albums_release_date ON albums(release_date DESC);
CREATE INDEX idx_albums_is_active ON albums(is_active);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_public ON playlists(is_public);
CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX idx_playlist_tracks_position ON playlist_tracks(position);

CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_followee_id ON user_follows(followee_id);
CREATE INDEX idx_user_follows_created_at ON user_follows(created_at DESC);

CREATE INDEX idx_user_play_history_user_id ON user_play_history(user_id);
CREATE INDEX idx_user_play_history_track_id ON user_play_history(track_id);
CREATE INDEX idx_user_play_history_played_at ON user_play_history(played_at DESC);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_daily_track_stats_date ON daily_track_stats(date DESC);
CREATE INDEX idx_daily_user_stats_date ON daily_user_stats(date DESC);

-- Full-text search indexes
CREATE INDEX idx_tracks_fulltext ON tracks USING gin(
    to_tsvector('english', title || ' ' || artist_name || ' ' || COALESCE(album_name, ''))
);

-- Triggers for updating counters and timestamps

-- Update track count in albums when tracks are added/removed
CREATE OR REPLACE FUNCTION update_album_track_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE albums 
        SET track_count = track_count + 1,
            updated_at = NOW()
        WHERE id = NEW.album_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE albums 
        SET track_count = track_count - 1,
            updated_at = NOW()
        WHERE id = OLD.album_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_album_track_count
    AFTER INSERT OR DELETE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_album_track_count();

-- Update playlist track count when tracks are added/removed
CREATE OR REPLACE FUNCTION update_playlist_track_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE playlists 
        SET track_count = track_count + 1,
            updated_at = NOW()
        WHERE id = NEW.playlist_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE playlists 
        SET track_count = track_count - 1,
            updated_at = NOW()
        WHERE id = OLD.playlist_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_playlist_track_count
    AFTER INSERT OR DELETE ON playlist_tracks
    FOR EACH ROW EXECUTE FUNCTION update_playlist_track_count();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER trigger_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER trigger_albums_updated_at BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER trigger_tracks_updated_at BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER trigger_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for commonly used queries

-- Popular tracks view
CREATE VIEW popular_tracks AS
SELECT 
    t.*,
    a.stage_name as artist_stage_name,
    al.title as album_title,
    (t.play_count * 0.7 + t.like_count * 0.3) as popularity_score
FROM tracks t
LEFT JOIN artists a ON t.artist_id = a.id
LEFT JOIN albums al ON t.album_id = al.id
WHERE t.is_active = true
ORDER BY popularity_score DESC;

-- User dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.profile_image_url,
    u.follower_count,
    u.following_count,
    COUNT(DISTINCT uph.track_id) as unique_tracks_played,
    SUM(uph.play_duration_ms) as total_listening_time,
    COUNT(DISTINCT ult.track_id) as liked_tracks_count,
    COUNT(DISTINCT p.id) as playlists_count
FROM users u
LEFT JOIN user_play_history uph ON u.id = uph.user_id AND uph.played_at >= NOW() - INTERVAL '30 days'
LEFT JOIN user_liked_tracks ult ON u.id = ult.user_id
LEFT JOIN playlists p ON u.id = p.user_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.display_name, u.profile_image_url, u.follower_count, u.following_count;

-- Trending tracks view (based on recent activity)
CREATE VIEW trending_tracks AS
SELECT 
    t.*,
    COUNT(uph.id) as recent_plays,
    COUNT(DISTINCT uph.user_id) as unique_recent_listeners
FROM tracks t
JOIN user_play_history uph ON t.id = uph.track_id
WHERE uph.played_at >= NOW() - INTERVAL '7 days'
    AND t.is_active = true
GROUP BY t.id
HAVING COUNT(uph.id) >= 10 -- Minimum threshold for trending
ORDER BY recent_plays DESC, unique_recent_listeners DESC;

-- Insert sample data for testing
-- Sample users
INSERT INTO users (id, email, username, display_name, password_hash, is_artist, subscription_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'johndoe', 'John Doe', '$2a$10$example_hash', false, 'PREMIUM'),
('550e8400-e29b-41d4-a716-446655440002', 'artist@example.com', 'musicartist', 'The Music Artist', '$2a$10$example_hash', true, 'FREE'),
('550e8400-e29b-41d4-a716-446655440003', 'jane@example.com', 'janesmith', 'Jane Smith', '$2a$10$example_hash', false, 'FREE');

-- Sample artist
INSERT INTO artists (id, user_id, stage_name, genre) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'The Music Artist', 'Pop');

-- Sample album
INSERT INTO albums (id, title, artist_id, release_date, album_type, genre) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Greatest Hits', '550e8400-e29b-41d4-a716-446655440010', '2024-01-15', 'ALBUM', 'Pop');

-- Sample tracks
INSERT INTO tracks (id, title, artist_id, artist_name, album_id, album_name, duration_ms, file_url, genre) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Amazing Song', '550e8400-e29b-41d4-a716-446655440010', 'The Music Artist', '550e8400-e29b-41d4-a716-446655440020', 'Greatest Hits', 180000, 'https://example.com/track1.mp3', 'Pop'),
('550e8400-e29b-41d4-a716-446655440031', 'Another Hit', '550e8400-e29b-41d4-a716-446655440010', 'The Music Artist', '550e8400-e29b-41d4-a716-446655440020', 'Greatest Hits', 210000, 'https://example.com/track2.mp3', 'Pop');

-- Sample playlist
INSERT INTO playlists (id, user_id, name, description, is_public) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', 'My Favorites', 'My favorite songs collection', true);

-- Add tracks to playlist
INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', 1),
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440031', 2);

COMMIT;
