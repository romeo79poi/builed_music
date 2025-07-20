import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Crown,
  Music,
  Download,
  Headphones,
  Star,
  Check,
  User,
  Heart,
  History,
  Bell,
  HelpCircle,
  LogOut,
  Edit3,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileContext } from "../context/ProfileContext";
import { api } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import { BackButton } from "../components/ui/back-button";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, setIsEditing, isLoading, loadProfile } = useProfileContext();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, [profile.id]);

  // Reset image error when profile picture changes
  useEffect(() => {
    setProfileImageError(false);
  }, [profile.profilePicture]);

  const loadUserStats = async () => {
    try {
      const statsResponse = await api.profile.getUserStats();
      if (statsResponse.success) {
        setUserStats(statsResponse.stats);
      }
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const handleSubscriptionChange = async (planId: string) => {
    if (planId === profile.subscription.plan) return;

    try {
      setIsUpdatingSubscription(true);
      const response = await api.subscription.updateSubscription({
        plan: planId as any,
      });

      if (response.success) {
        // Reload profile to get updated subscription info
        await loadProfile();
        setShowUpgrade(false);

        toast({
          title: "Subscription Updated",
          description:
            response.message || `Successfully updated to ${planId} plan`,
        });
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Limited skips",
        "Ads between songs",
        "Standard audio quality",
        "Shuffle play only",
      ],
      color: "from-gray-600 to-gray-800",
      icon: Music,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited skips",
        "Ad-free listening",
        "High-quality audio",
        "Offline downloads",
        "Any song, any time",
      ],
      color: "from-neon-green to-neon-blue",
      icon: Crown,
      popular: true,
    },
    {
      id: "family",
      name: "Family",
      price: "$14.99",
      period: "per month",
      features: [
        "6 Premium accounts",
        "Family mix playlist",
        "Safe listening for kids",
        "All Premium features",
      ],
      color: "from-purple-500 to-pink-500",
      icon: Star,
    },
  ];

  const handleEditProfile = () => {
    setIsEditing(true);
    navigate("/edit-profile");
  };

  const handleRefreshProfile = async () => {
    try {
      await loadProfile();
      await loadUserStats();
      toast({
        title: "Profile Refreshed",
        description: "Profile data has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh profile data",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 pt-12"
        >
          <BackButton
            onClick={() => navigate("/home")}
            variant="glass"
            className="hover:bg-white/20"
          />
          <h1 className="text-xl font-bold">Profile</h1>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 py-8 text-center"
        >
          <div className="relative inline-block">
            <button
              onClick={handleEditProfile}
              className="w-24 h-24 bg-gradient-to-br from-neon-green to-neon-blue rounded-full p-1 hover:scale-105 transition-transform cursor-pointer"
              title="Click to edit profile"
            >
              <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                {profile.profilePicture && !profileImageError ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.log(
                        "Profile image failed to load:",
                        profile.profilePicture,
                      );
                      setProfileImageError(true);
                    }}
                    onLoad={() => setProfileImageError(false)}
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </button>
            {profile.isVerified && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            {profile.subscription.plan === "premium" && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">{profile.displayName}</h2>
          <p className="text-gray-400">@{profile.username}</p>
          {profile.bio && (
            <div className="mt-2 max-w-xs mx-auto">
              <p className="text-gray-300 text-center leading-relaxed">
                {profile.bio}
              </p>

              {/* Social Media Icons in Bio */}
              {(profile.socialLinks.instagram ||
                profile.socialLinks.twitter ||
                profile.socialLinks.spotify ||
                profile.socialLinks.appleMusic) && (
                <div className="flex justify-center space-x-3 mt-3">
                  {profile.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialLinks.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                      title="Follow on Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${profile.socialLinks.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                      title="Follow on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.spotify && (
                    <a
                      href={`https://open.spotify.com/user/${profile.socialLinks.spotify}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                      title="Follow on Spotify"
                    >
                      <Music className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socialLinks.appleMusic && (
                    <a
                      href={`https://music.apple.com/profile/${profile.socialLinks.appleMusic}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                      title="Follow on Apple Music"
                    >
                      <Music className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {profile.followers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {profile.following.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Following</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {profile.likedSongs.length}
              </p>
              <p className="text-xs text-gray-400">Liked</p>
            </div>
          </div>
        </motion.div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-6 mb-6"
        >
          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 capitalize">
                    {profile.subscription.plan}
                  </p>
                  {profile.subscription.plan === "premium" && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  {profile.subscription.status === "active" && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
              {profile.subscription.plan === "free" && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="px-6 py-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-full font-semibold text-black hover:scale-105 transition-transform"
                  disabled={isUpdatingSubscription}
                >
                  {isUpdatingSubscription ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Upgrade"
                  )}
                </button>
              )}
            </div>

            {/* Features List */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {profile.subscription.features
                  .slice(0, 3)
                  .map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                {profile.subscription.features.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{profile.subscription.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4" />
                <span>
                  {userStats?.totalSongsPlayed ||
                    profile.recentlyPlayed.length + 429}{" "}
                  songs played
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>{profile.likedSongs.length} liked</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4" />
                <span>{profile.playlists.length} playlists</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recently Played */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-6 mb-6"
        >
          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recently Played</h3>
              <button
                onClick={() => navigate("/history")}
                className="text-neon-green text-sm hover:text-neon-blue transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {profile.recentlyPlayed.slice(0, 3).map((songId, index) => {
                // Mock recent songs data
                const recentSongs = [
                  {
                    id: "1",
                    title: "Blinding Lights",
                    artist: "The Weeknd",
                    image:
                      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
                    playedAt: "2 hours ago",
                  },
                  {
                    id: "2",
                    title: "Levitating",
                    artist: "Dua Lipa",
                    image:
                      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
                    playedAt: "5 hours ago",
                  },
                  {
                    id: "3",
                    title: "Good 4 U",
                    artist: "Olivia Rodrigo",
                    image:
                      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
                    playedAt: "1 day ago",
                  },
                ];
                const song = recentSongs[index];
                if (!song) return null;

                return (
                  <div key={song.id} className="flex items-center space-x-3">
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {song.title}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {song.playedAt}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* My Playlists Preview */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">My Playlists</h4>
                <button
                  onClick={() => navigate("/library")}
                  className="text-neon-green text-sm hover:text-neon-blue transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {profile.playlists.slice(0, 2).map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <img
                      src={playlist.coverImage}
                      alt={playlist.name}
                      className="w-full aspect-square rounded-md object-cover mb-2"
                    />
                    <h5 className="font-medium text-sm truncate">
                      {playlist.name}
                    </h5>
                    <p className="text-xs text-gray-400 truncate">
                      {playlist.songs.length} songs
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans Modal */}
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      profile.subscription.plan === plan.id
                        ? "border-neon-green bg-neon-green/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-neon-green to-neon-blue text-black px-3 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <plan.icon className="w-5 h-5" />
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-bold">
                            {plan.price}
                          </span>
                          <span className="text-sm text-gray-400">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                      {profile.subscription.plan === plan.id && (
                        <Check className="w-6 h-6 text-neon-green" />
                      )}
                    </div>

                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-neon-green" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {profile.subscription.plan !== plan.id && (
                      <button
                        onClick={() => handleSubscriptionChange(plan.id)}
                        disabled={isUpdatingSubscription}
                        className="w-full py-3 bg-gradient-to-r from-neon-green to-neon-blue rounded-xl font-semibold text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingSubscription ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : (
                          `Choose ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="px-6 py-8 text-center text-gray-500 text-sm"
        >
          <p>Music Catch v2.1.0</p>
          <p>Made with ❤️ for music lovers</p>
        </motion.div>
      </div>
    </div>
  );
}
