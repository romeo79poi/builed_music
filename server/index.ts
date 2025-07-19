import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Profile routes
import {
  getProfile,
  updateProfile,
  getLikedSongs,
  toggleLikedSong,
  getRecentlyPlayed,
  toggleFollow,
  addToRecentlyPlayed,
  getUserStats,
} from "./routes/profile";

// Playlist routes
import {
  getUserPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "./routes/playlist";

// Upload routes
import {
  uploadProfilePicture,
  deleteProfilePicture,
  uploadPlaylistCover,
  getUploadConfig,
} from "./routes/upload";

// Settings routes
import {
  getUserSettings,
  updateUserSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updatePlaybackSettings,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  resetSettings,
} from "./routes/settings";

// Auth routes
import { registerUser, checkAvailability, getUsers } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Profile API routes
  app.get("/api/profile/:userId?", getProfile);
  app.put("/api/profile/:userId?", updateProfile);
  app.get("/api/profile/:userId/stats", getUserStats);

  // Liked songs routes
  app.get("/api/profile/:userId/liked-songs", getLikedSongs);
  app.post("/api/profile/:userId/liked-songs/:songId", toggleLikedSong);
  app.delete("/api/profile/:userId/liked-songs/:songId", toggleLikedSong);

  // Recently played routes
  app.get("/api/profile/:userId/recently-played", getRecentlyPlayed);
  app.post("/api/profile/:userId/recently-played", addToRecentlyPlayed);

  // Follow routes
  app.post("/api/profile/:userId/follow/:targetUserId", toggleFollow);
  app.delete("/api/profile/:userId/follow/:targetUserId", toggleFollow);

  // Playlist API routes
  app.get("/api/playlists/:userId", getUserPlaylists);
  app.post("/api/playlists/:userId", createPlaylist);
  app.get("/api/playlist/:playlistId/:userId?", getPlaylist);
  app.put("/api/playlist/:playlistId/:userId?", updatePlaylist);
  app.delete("/api/playlist/:playlistId/:userId?", deletePlaylist);

  // Playlist songs routes
  app.post("/api/playlist/:playlistId/songs/:userId?", addSongToPlaylist);
  app.delete(
    "/api/playlist/:playlistId/songs/:songId/:userId?",
    removeSongFromPlaylist,
  );

  // Upload API routes
  app.post("/api/upload/profile-picture", uploadProfilePicture);
  app.delete("/api/upload/profile-picture/:fileName", deleteProfilePicture);
  app.post("/api/upload/playlist-cover", uploadPlaylistCover);
  app.get("/api/upload/config", getUploadConfig);

  // Settings API routes
  app.get("/api/settings/:userId?", getUserSettings);
  app.put("/api/settings/:userId?", updateUserSettings);
  app.put("/api/settings/:userId/notifications", updateNotificationSettings);
  app.put("/api/settings/:userId/privacy", updatePrivacySettings);
  app.put("/api/settings/:userId/playback", updatePlaybackSettings);
  app.post("/api/settings/:userId/reset", resetSettings);

  // Subscription API routes
  app.get("/api/subscription/:userId?", getSubscription);
  app.put("/api/subscription/:userId?", updateSubscription);
  app.delete("/api/subscription/:userId?", cancelSubscription);

  return app;
}
