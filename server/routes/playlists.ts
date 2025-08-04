import { RequestHandler } from "express";

// Mock database for playlists
const playlists = [
  {
    id: "550e8400-e29b-41d4-a716-446655440050",
    name: "Top Hits 2023",
    description: "The biggest hits of 2023",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    creator_name: "Demo User",
    cover_image_url: "https://example.com/playlists/top-hits-2023.jpg",
    is_public: true,
    is_collaborative: false,
    track_count: 25,
    total_duration_ms: 5400000, // 90 minutes
    follower_count: 150000,
    play_count: 2500000,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440051",
    name: "Chill Vibes",
    description: "Relaxing songs for any time of day",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    creator_name: "Demo User",
    cover_image_url: "https://example.com/playlists/chill-vibes.jpg",
    is_public: true,
    is_collaborative: false,
    track_count: 18,
    total_duration_ms: 3960000, // 66 minutes
    follower_count: 85000,
    play_count: 1200000,
    created_at: "2023-02-15T00:00:00Z",
    updated_at: "2024-01-10T15:20:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440052",
    name: "Workout Energy",
    description: "High-energy tracks to power your workout",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    creator_name: "Demo User",
    cover_image_url: "https://example.com/playlists/workout-energy.jpg",
    is_public: true,
    is_collaborative: false,
    track_count: 30,
    total_duration_ms: 7200000, // 120 minutes
    follower_count: 120000,
    play_count: 1800000,
    created_at: "2023-03-10T00:00:00Z",
    updated_at: "2024-01-12T09:45:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440053",
    name: "Indie Discoveries",
    description: "Hidden gems from independent artists",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    creator_name: "Demo User",
    cover_image_url: "https://example.com/playlists/indie-discoveries.jpg",
    is_public: true,
    is_collaborative: true,
    track_count: 22,
    total_duration_ms: 4840000, // 80.7 minutes
    follower_count: 45000,
    play_count: 650000,
    created_at: "2023-04-20T00:00:00Z",
    updated_at: "2024-01-14T12:15:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440054",
    name: "My Liked Songs",
    description: "All your favorite tracks in one place",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    creator_name: "Demo User",
    cover_image_url: "https://example.com/playlists/liked-songs.jpg",
    is_public: false,
    is_collaborative: false,
    track_count: 47,
    total_duration_ms: 10340000, // 172.3 minutes
    follower_count: 0,
    play_count: 890000,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2024-01-15T18:30:00Z"
  }
];

// Mock playlist tracks
const playlistTracks = new Map([
  ["550e8400-e29b-41d4-a716-446655440050", [
    {
      id: "pt1",
      playlist_id: "550e8400-e29b-41d4-a716-446655440050",
      track_id: "550e8400-e29b-41d4-a716-446655440040",
      track: {
        id: "550e8400-e29b-41d4-a716-446655440040",
        title: "Anti-Hero",
        artist_name: "Taylor Swift",
        album_name: "Midnights",
        duration_ms: 200000,
        cover_image_url: "https://example.com/covers/midnights.jpg"
      },
      position: 1,
      added_by: "550e8400-e29b-41d4-a716-446655440001",
      added_at: "2023-01-01T00:00:00Z"
    },
    {
      id: "pt2",
      playlist_id: "550e8400-e29b-41d4-a716-446655440050",
      track_id: "550e8400-e29b-41d4-a716-446655440041",
      track: {
        id: "550e8400-e29b-41d4-a716-446655440041",
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        album_name: "After Hours",
        duration_ms: 200831,
        cover_image_url: "https://example.com/covers/after-hours.jpg"
      },
      position: 2,
      added_by: "550e8400-e29b-41d4-a716-446655440001",
      added_at: "2023-01-01T00:00:00Z"
    }
  ]]
]);

// User followed playlists
const userFollowedPlaylists = new Map<string, Set<string>>();

// Get all playlists
export const getAllPlaylists: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id, search, sort_by = "play_count" } = req.query;
    
    let filteredPlaylists = [...playlists];
    
    // Filter by user
    if (user_id) {
      filteredPlaylists = filteredPlaylists.filter(playlist => 
        playlist.user_id === user_id
      );
    } else {
      // Only show public playlists if no specific user requested
      filteredPlaylists = filteredPlaylists.filter(playlist => playlist.is_public);
    }
    
    // Search functionality
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredPlaylists = filteredPlaylists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm) ||
        playlist.description.toLowerCase().includes(searchTerm) ||
        playlist.creator_name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort playlists
    filteredPlaylists.sort((a, b) => {
      switch (sort_by) {
        case "play_count":
          return b.play_count - a.play_count;
        case "follower_count":
          return b.follower_count - a.follower_count;
        case "track_count":
          return b.track_count - a.track_count;
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.play_count - a.play_count;
      }
    });
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPlaylists = filteredPlaylists.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedPlaylists,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredPlaylists.length,
        pages: Math.ceil(filteredPlaylists.length / limitNum)
      }
    });
  } catch (error) {
    console.error("Get playlists error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlists"
    });
  }
};

// Get playlist by ID
export const getPlaylistById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    console.error("Get playlist by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlist"
    });
  }
};

// Get playlist tracks
export const getPlaylistTracks: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    const tracks = playlistTracks.get(id) || [];
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTracks = tracks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        playlist: playlist,
        tracks: paginatedTracks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: tracks.length,
          pages: Math.ceil(tracks.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get playlist tracks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch playlist tracks"
    });
  }
};

// Create new playlist
export const createPlaylist: RequestHandler = async (req, res) => {
  try {
    const { name, description, is_public = false, is_collaborative = false } = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required"
      });
    }
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required"
      });
    }
    
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name: name.trim(),
      description: description || "",
      user_id: userId,
      creator_name: "User", // In real app, fetch from user table
      cover_image_url: "https://example.com/playlists/default.jpg",
      is_public: Boolean(is_public),
      is_collaborative: Boolean(is_collaborative),
      track_count: 0,
      total_duration_ms: 0,
      follower_count: 0,
      play_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    playlistTracks.set(newPlaylist.id, []);
    
    res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      data: newPlaylist
    });
  } catch (error) {
    console.error("Create playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create playlist"
    });
  }
};

// Update playlist
export const updatePlaylist: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_public, is_collaborative, cover_image_url } = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required"
      });
    }
    
    const playlistIndex = playlists.findIndex(p => p.id === id);
    
    if (playlistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    const playlist = playlists[playlistIndex];
    
    // Check if user owns the playlist
    if (playlist.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this playlist"
      });
    }
    
    // Update playlist fields
    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (is_public !== undefined) playlist.is_public = Boolean(is_public);
    if (is_collaborative !== undefined) playlist.is_collaborative = Boolean(is_collaborative);
    if (cover_image_url !== undefined) playlist.cover_image_url = cover_image_url;
    
    playlist.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: "Playlist updated successfully",
      data: playlist
    });
  } catch (error) {
    console.error("Update playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update playlist"
    });
  }
};

// Delete playlist
export const deletePlaylist: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required"
      });
    }
    
    const playlistIndex = playlists.findIndex(p => p.id === id);
    
    if (playlistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    const playlist = playlists[playlistIndex];
    
    // Check if user owns the playlist
    if (playlist.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this playlist"
      });
    }
    
    // Remove playlist and its tracks
    playlists.splice(playlistIndex, 1);
    playlistTracks.delete(id);
    
    res.json({
      success: true,
      message: "Playlist deleted successfully"
    });
  } catch (error) {
    console.error("Delete playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete playlist"
    });
  }
};

// Add track to playlist
export const addTrackToPlaylist: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { track_id } = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required"
      });
    }
    
    if (!track_id) {
      return res.status(400).json({
        success: false,
        message: "Track ID is required"
      });
    }
    
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Check if user can edit playlist
    if (playlist.user_id !== userId && !playlist.is_collaborative) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add tracks to this playlist"
      });
    }
    
    const tracks = playlistTracks.get(id) || [];
    
    // Check if track already exists in playlist
    if (tracks.some(t => t.track_id === track_id)) {
      return res.status(400).json({
        success: false,
        message: "Track already exists in playlist"
      });
    }
    
    // Mock track data (in real app, fetch from tracks table)
    const newPlaylistTrack = {
      id: `pt-${Date.now()}`,
      playlist_id: id,
      track_id: track_id,
      track: {
        id: track_id,
        title: "Sample Track",
        artist_name: "Sample Artist",
        album_name: "Sample Album",
        duration_ms: 180000,
        cover_image_url: "https://example.com/covers/sample.jpg"
      },
      position: tracks.length + 1,
      added_by: userId,
      added_at: new Date().toISOString()
    };
    
    tracks.push(newPlaylistTrack);
    playlistTracks.set(id, tracks);
    
    // Update playlist metadata
    playlist.track_count = tracks.length;
    playlist.total_duration_ms = tracks.reduce((total, track) => total + track.track.duration_ms, 0);
    playlist.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: "Track added to playlist successfully",
      data: newPlaylistTrack
    });
  } catch (error) {
    console.error("Add track to playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add track to playlist"
    });
  }
};

// Remove track from playlist
export const removeTrackFromPlaylist: RequestHandler = async (req, res) => {
  try {
    const { id, track_id } = req.params;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required"
      });
    }
    
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    // Check if user can edit playlist
    if (playlist.user_id !== userId && !playlist.is_collaborative) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to remove tracks from this playlist"
      });
    }
    
    const tracks = playlistTracks.get(id) || [];
    const trackIndex = tracks.findIndex(t => t.track_id === track_id);
    
    if (trackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Track not found in playlist"
      });
    }
    
    // Remove track and update positions
    tracks.splice(trackIndex, 1);
    tracks.forEach((track, index) => {
      track.position = index + 1;
    });
    
    playlistTracks.set(id, tracks);
    
    // Update playlist metadata
    playlist.track_count = tracks.length;
    playlist.total_duration_ms = tracks.reduce((total, track) => total + track.track.duration_ms, 0);
    playlist.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      message: "Track removed from playlist successfully"
    });
  } catch (error) {
    console.error("Remove track from playlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove track from playlist"
    });
  }
};

// Follow/unfollow playlist
export const togglePlaylistFollow: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required"
      });
    }
    
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found"
      });
    }
    
    if (!playlist.is_public && playlist.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot follow private playlist"
      });
    }
    
    // Get user's followed playlists
    if (!userFollowedPlaylists.has(userId)) {
      userFollowedPlaylists.set(userId, new Set());
    }
    
    const userFollows = userFollowedPlaylists.get(userId)!;
    const isCurrentlyFollowed = userFollows.has(id);
    
    if (isCurrentlyFollowed) {
      // Unfollow playlist
      userFollows.delete(id);
      playlist.follower_count = Math.max(0, playlist.follower_count - 1);
    } else {
      // Follow playlist
      userFollows.add(id);
      playlist.follower_count += 1;
    }
    
    playlist.updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        playlist_id: playlist.id,
        is_following: !isCurrentlyFollowed,
        follower_count: playlist.follower_count
      }
    });
  } catch (error) {
    console.error("Toggle playlist follow error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle follow"
    });
  }
};

// Search playlists
export const searchPlaylists: RequestHandler = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const searchTerm = (q as string).toLowerCase();
    const limitNum = parseInt(limit as string);
    
    const searchResults = playlists
      .filter(playlist => playlist.is_public) // Only search public playlists
      .filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm) ||
        playlist.description.toLowerCase().includes(searchTerm) ||
        playlist.creator_name.toLowerCase().includes(searchTerm)
      )
      .slice(0, limitNum);
    
    res.json({
      success: true,
      data: searchResults,
      total: searchResults.length
    });
  } catch (error) {
    console.error("Search playlists error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search playlists"
    });
  }
};

// Get user's playlists
export const getUserPlaylists: RequestHandler = async (req, res) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.headers['user-id'] as string;
    
    let userPlaylists = playlists.filter(p => p.user_id === user_id);
    
    // If not the owner, only show public playlists
    if (currentUserId !== user_id) {
      userPlaylists = userPlaylists.filter(p => p.is_public);
    }
    
    res.json({
      success: true,
      data: userPlaylists,
      total: userPlaylists.length
    });
  } catch (error) {
    console.error("Get user playlists error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user playlists"
    });
  }
};
