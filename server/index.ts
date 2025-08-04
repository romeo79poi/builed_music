import express from "express";
import cors from "cors";

import { connectDB } from "./lib/mongodb";

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
import {
  registerUser,
  checkAvailability,
  sendEmailVerification,
  verifyEmailCode,
  completeRegistration,
  loginUser,
} from "./routes/auth";

// MongoDB + JWT Auth routes
import {
  registerUserMongoDB,
  loginUserMongoDB,
  checkAvailabilityMongoDB,
  getUserProfile as getMongoUserProfile,
  updateUserProfile as updateMongoUserProfile,
  refreshToken,
  completeRegistrationMongoDB,
  sendEmailVerification as sendEmailVerificationMongoDB,
  verifyEmailCode as verifyEmailCodeMongoDB,
} from "./routes/auth-mongodb";

// MongoDB Profile routes
import {
  getUserProfile,
  updateUserProfile,
  getUserStats as getMongoUserStats,
  searchUsers as searchMongoUsers,
  toggleFollow as toggleMongoFollow,
} from "./routes/profile-mongodb";

import { authenticateJWT } from "./lib/jwt";

// Complete Auth System
import authMainRouter from "./routes/auth-main";

// Enhanced JWT Email Auth System
import authV4Router from "./routes/auth-v4";

// Social Authentication
import {
  googleAuth,
  facebookAuth,
  socialLogin,
  checkSocialUser,
} from "./routes/auth-social";

// Phone routes
import phoneRoutes from "./routes/phone";

// Music routes
import {
  getTrendingSongs,
  searchMusic,
  getSongById,
  getArtistById,
  getFeaturedPlaylists,
  getPlaylistById,
  getGenres,
  getSongsByGenre,
  getRecommendations,
  getRecentlyPlayed as getMusicRecentlyPlayed,
  playSong,
} from "./routes/music";

// Analytics routes
import {
  getUserAnalytics,
  getListeningHistory,
  getEngagementMetrics,
  getRecommendationAnalytics,
  exportAnalytics,
  getSocialAnalytics,
} from "./routes/analytics";

// Message routes
import {
  getChats,
  getChatMessages,
  sendMessage,
  markAsRead,
  addReaction,
  setTyping,
  getTypingUsers,
  createChat,
  deleteMessage,
} from "./routes/messages";

// New Backend API routes - Tracks
import {
  getAllTracks,
  getTrackById,
  recordTrackPlay,
  searchTracks,
  getTrendingTracks,
  toggleTrackLike,
  getUserLikedTracks,
  getTracksByArtist,
  getTracksByAlbum,
} from "./routes/tracks";

// Artists API routes
import {
  getAllArtists,
  getArtistById as getBackendArtistById,
  searchArtists,
  getTrendingArtists,
  toggleArtistFollow,
  getUserFollowedArtists,
  getArtistsByGenre,
  getArtistTopTracks,
  getSimilarArtists,
} from "./routes/artists";

// Playlists API routes
import {
  getAllPlaylists,
  getPlaylistById as getBackendPlaylistById,
  getPlaylistTracks,
  createPlaylist as createBackendPlaylist,
  updatePlaylist as updateBackendPlaylist,
  deletePlaylist as deleteBackendPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  togglePlaylistFollow,
  searchPlaylists,
  getUserPlaylists as getBackendUserPlaylists,
} from "./routes/playlists";

// Albums API routes
import {
  getAllAlbums,
  getAlbumById,
  searchAlbums,
  getNewReleases,
  getTrendingAlbums,
  toggleAlbumLike,
  getUserLikedAlbums,
  getAlbumsByArtist,
  getAlbumsByGenre,
  getAlbumStats,
} from "./routes/albums";

// User management API routes
import {
  getUserById,
  getCurrentUser,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserStatistics,
} from "./routes/users";

export function createServer() {
  const app = express();

  // Initialize MongoDB connection
  connectDB().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication API routes
  app.post("/api/auth/register", registerUser);
  app.get("/api/auth/check-availability", checkAvailability);

  // Email verification routes
  app.post("/api/auth/send-email-verification", sendEmailVerification);
  app.post("/api/auth/verify-email", verifyEmailCode);
  app.post("/api/auth/complete-registration", completeRegistration);

  // Login route
  app.post("/api/auth/login", loginUser);

  // ===============================================
  // MONGODB + JWT AUTHENTICATION ROUTES
  // ===============================================

  // MongoDB Auth routes (v2)
  app.post("/api/v2/auth/register", registerUserMongoDB);
  app.post("/api/v2/auth/login", loginUserMongoDB);
  app.get("/api/v2/auth/check-availability", checkAvailabilityMongoDB);
  app.post("/api/v2/auth/complete-registration", completeRegistrationMongoDB);
  app.post(
    "/api/v2/auth/send-email-verification",
    sendEmailVerificationMongoDB,
  );
  app.post("/api/v2/auth/verify-email", verifyEmailCodeMongoDB);
  app.post("/api/v2/auth/refresh-token", refreshToken);

  // Protected profile routes
  app.get("/api/v2/profile", authenticateJWT, getMongoUserProfile);
  app.put("/api/v2/profile", authenticateJWT, updateMongoUserProfile);

  // Additional MongoDB profile routes
  app.get("/api/v2/profile/:userId", getUserProfile);
  app.put("/api/v2/profile/:userId", updateUserProfile);
  app.get("/api/v2/profile/:userId/stats", getMongoUserStats);
  app.get("/api/v2/users/search", searchMongoUsers);
  app.post(
    "/api/v2/profile/:targetUserId/follow",
    authenticateJWT,
    toggleMongoFollow,
  );

  // ===============================================
  // COMPLETE AUTH SYSTEM (v3) - PRODUCTION READY
  // ===============================================

  // Mount complete auth router with all features
  app.use("/api/v3/auth", authMainRouter);

  // ===============================================
  // JWT EMAIL VERIFICATION SYSTEM (v4) - NODEMAILER + JWT
  // ===============================================

  // Mount enhanced JWT email auth router
  app.use("/api/v4/auth", authV4Router);

  // Social Authentication routes
  app.post("/api/auth/google", googleAuth);
  app.post("/api/auth/facebook", facebookAuth);
  app.post("/api/auth/social", socialLogin);
  app.get("/api/auth/social/check", checkSocialUser);

  // Phone verification API routes
  app.use("/api/phone", phoneRoutes);

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

  // Music API routes
  app.get("/api/music/trending", getTrendingSongs);
  app.get("/api/music/search", searchMusic);
  app.get("/api/music/song/:songId", getSongById);
  app.get("/api/music/artist/:artistId", getArtistById);
  app.get("/api/music/playlists/featured", getFeaturedPlaylists);
  app.get("/api/music/playlist/:playlistId", getPlaylistById);
  app.get("/api/music/genres", getGenres);
  app.get("/api/music/genre/:genre", getSongsByGenre);
  app.get("/api/music/recommendations", getRecommendations);
  app.get("/api/music/recently-played", getMusicRecentlyPlayed);
  app.post("/api/music/play/:songId", playSong);

  // Analytics API routes
  app.get("/api/analytics/:userId", getUserAnalytics);
  app.get("/api/analytics/:userId/history", getListeningHistory);
  app.get("/api/analytics/:userId/engagement", getEngagementMetrics);
  app.get("/api/analytics/:userId/recommendations", getRecommendationAnalytics);
  app.get("/api/analytics/:userId/export", exportAnalytics);
  app.get("/api/analytics/:userId/social", getSocialAnalytics);

  // Messages API routes
  app.get("/api/messages/chats/:userId?", getChats);
  app.get("/api/messages/:chatId", getChatMessages);
  app.post("/api/messages/:chatId", sendMessage);
  app.put("/api/messages/:chatId/read", markAsRead);
  app.post("/api/messages/reaction/:messageId", addReaction);
  app.post("/api/messages/:chatId/typing", setTyping);
  app.get("/api/messages/:chatId/typing", getTypingUsers);
  app.post("/api/messages/chats", createChat);
  app.delete("/api/messages/message/:messageId", deleteMessage);

  // ===============================================
  // NEW BACKEND API ROUTES (C++/Java/Go/Python Style)
  // ===============================================

  // Tracks API routes
  app.get("/api/v1/tracks", getAllTracks);
  app.get("/api/v1/tracks/:id", getTrackById);
  app.post("/api/v1/tracks/:id/play", recordTrackPlay);
  app.get("/api/v1/tracks/search", searchTracks);
  app.get("/api/v1/tracks/trending", getTrendingTracks);
  app.post("/api/v1/tracks/:id/like", toggleTrackLike);
  app.delete("/api/v1/tracks/:id/like", toggleTrackLike);
  app.get("/api/v1/users/liked-tracks", getUserLikedTracks);
  app.get("/api/v1/artists/:artist_id/tracks", getTracksByArtist);
  app.get("/api/v1/albums/:album_id/tracks", getTracksByAlbum);

  // Artists API routes
  app.get("/api/v1/artists", getAllArtists);
  app.get("/api/v1/artists/:id", getBackendArtistById);
  app.get("/api/v1/artists/search", searchArtists);
  app.get("/api/v1/artists/trending", getTrendingArtists);
  app.post("/api/v1/artists/:id/follow", toggleArtistFollow);
  app.delete("/api/v1/artists/:id/follow", toggleArtistFollow);
  app.get("/api/v1/users/followed-artists", getUserFollowedArtists);
  app.get("/api/v1/genres/:genre/artists", getArtistsByGenre);
  app.get("/api/v1/artists/:id/top-tracks", getArtistTopTracks);
  app.get("/api/v1/artists/:id/similar", getSimilarArtists);

  // Playlists API routes
  app.get("/api/v1/playlists", getAllPlaylists);
  app.get("/api/v1/playlists/:id", getBackendPlaylistById);
  app.get("/api/v1/playlists/:id/tracks", getPlaylistTracks);
  app.post("/api/v1/playlists", createBackendPlaylist);
  app.put("/api/v1/playlists/:id", updateBackendPlaylist);
  app.delete("/api/v1/playlists/:id", deleteBackendPlaylist);
  app.post("/api/v1/playlists/:id/tracks", addTrackToPlaylist);
  app.delete("/api/v1/playlists/:id/tracks/:track_id", removeTrackFromPlaylist);
  app.post("/api/v1/playlists/:id/follow", togglePlaylistFollow);
  app.delete("/api/v1/playlists/:id/follow", togglePlaylistFollow);
  app.get("/api/v1/playlists/search", searchPlaylists);
  app.get("/api/v1/users/:user_id/playlists", getBackendUserPlaylists);

  // Albums API routes
  app.get("/api/v1/albums", getAllAlbums);
  app.get("/api/v1/albums/:id", getAlbumById);
  app.get("/api/v1/albums/search", searchAlbums);
  app.get("/api/v1/albums/new-releases", getNewReleases);
  app.get("/api/v1/albums/trending", getTrendingAlbums);
  app.post("/api/v1/albums/:id/like", toggleAlbumLike);
  app.delete("/api/v1/albums/:id/like", toggleAlbumLike);
  app.get("/api/v1/users/liked-albums", getUserLikedAlbums);
  app.get("/api/v1/artists/:artist_id/albums", getAlbumsByArtist);
  app.get("/api/v1/genres/:genre/albums", getAlbumsByGenre);
  app.get("/api/v1/albums/:id/stats", getAlbumStats);

  // User management API routes
  app.get("/api/v1/users/me", getCurrentUser);
  app.get("/api/v1/users/:id", getUserById);
  app.put("/api/v1/users/:id", updateUserProfile);
  app.get("/api/v1/users/search", searchUsers);
  app.post("/api/v1/users/:id/follow", followUser);
  app.delete("/api/v1/users/:id/follow", unfollowUser);
  app.get("/api/v1/users/:id/followers", getUserFollowers);
  app.get("/api/v1/users/:id/following", getUserFollowing);
  app.get("/api/v1/users/:id/stats", getUserStatistics);

  return app;
}
