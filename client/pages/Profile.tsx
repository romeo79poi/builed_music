import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  User,
  Music,
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit3,
  Camera,
  Users,
  UserPlus,
  UserCheck,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Link2,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Verified,
  Crown,
  Award,
  Headphones,
  Download,
  Eye,
  BarChart3,
  DollarSign,
  Plus,
  Grid3X3,
  ListMusic,
  Clock,
  Flame,
  Sparkles,
  Upload as UploadIcon,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MobileFooter from "../components/MobileFooter";

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  isVerified: boolean;
  isArtist: boolean;
  joinedDate: Date;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  stats: {
    followers: number;
    following: number;
    totalPlays: number;
    totalTracks: number;
    totalPlaylists: number;
    monthlyListeners: number;
  };
  badges: string[];
}

interface Track {
  id: string;
  title: string;
  coverUrl: string;
  duration: number;
  plays: number;
  likes: number;
  comments: number;
  uploadDate: Date;
  isPublic: boolean;
  genre?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  isPublic: boolean;
  createdDate: Date;
  plays: number;
}

const sampleProfile: UserProfile = {
  id: "user1",
  username: "alexmusic",
  displayName: "Alex Johnson",
  bio: "Music producer & artist 🎵 | Creating beats that move souls | Collabs welcome 💫 | Stream my latest tracks below ⬇️",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop",
  location: "Los Angeles, CA",
  website: "alexmusic.com",
  isVerified: true,
  isArtist: true,
  joinedDate: new Date("2022-03-15"),
  socialLinks: {
    instagram: "@alexmusic",
    twitter: "@alexbeats",
    youtube: "AlexMusicOfficial",
  },
  stats: {
    followers: 234500,
    following: 892,
    totalPlays: 12400000,
    totalTracks: 47,
    totalPlaylists: 12,
    monthlyListeners: 1890000,
  },
  badges: ["verified", "top_artist", "trending", "collaboration_king"],
};

const sampleTracks: Track[] = [
  {
    id: "1",
    title: "Midnight Dreams",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    duration: 234,
    plays: 2340000,
    likes: 45600,
    comments: 1230,
    uploadDate: new Date("2024-01-15"),
    isPublic: true,
    genre: "Electronic",
  },
  {
    id: "2",
    title: "Summer Vibes",
    coverUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    duration: 198,
    plays: 1890000,
    likes: 38200,
    comments: 892,
    uploadDate: new Date("2024-01-10"),
    isPublic: true,
    genre: "Pop",
  },
  {
    id: "3",
    title: "Neon Nights",
    coverUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    duration: 267,
    plays: 1560000,
    likes: 32100,
    comments: 654,
    uploadDate: new Date("2024-01-05"),
    isPublic: true,
    genre: "Synthwave",
  },
  {
    id: "4",
    title: "Acoustic Soul",
    coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    duration: 287,
    plays: 890000,
    likes: 18700,
    comments: 423,
    uploadDate: new Date("2023-12-28"),
    isPublic: true,
    genre: "Acoustic",
  },
];

const samplePlaylists: Playlist[] = [
  {
    id: "1",
    name: "Best of Alex",
    description: "My top tracks handpicked for you",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    trackCount: 25,
    isPublic: true,
    createdDate: new Date("2024-01-01"),
    plays: 567000,
  },
  {
    id: "2",
    name: "Chill Sessions",
    description: "Perfect for relaxing and studying",
    coverUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    trackCount: 18,
    isPublic: true,
    createdDate: new Date("2023-12-15"),
    plays: 342000,
  },
  {
    id: "3",
    name: "Work in Progress",
    description: "Upcoming releases and demos",
    coverUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    trackCount: 8,
    isPublic: false,
    createdDate: new Date("2024-01-20"),
    plays: 0,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile] = useState<UserProfile>(sampleProfile);
  const [tracks] = useState<Track[]>(sampleTracks);
  const [playlists] = useState<Playlist[]>(samplePlaylists);
  const [selectedTab, setSelectedTab] = useState("tracks");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePlay = (trackId: string) => {
    if (currentPlayingTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlayingTrack(trackId);
      setIsPlaying(true);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You unfollowed ${profile.displayName}`
        : `You're now following ${profile.displayName}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName} on Catch Music`,
        text: profile.bio,
        url: `https://catchmusic.app/profile/${profile.username}`,
      });
    } else {
      navigator.clipboard.writeText(`https://catchmusic.app/profile/${profile.username}`);
      toast({
        title: "Profile link copied!",
        description: "Share this link with your friends",
      });
    }
  };

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case "verified":
        return { icon: Verified, color: "text-blue-400", label: "Verified Artist" };
      case "top_artist":
        return { icon: Crown, color: "text-yellow-400", label: "Top Artist" };
      case "trending":
        return { icon: TrendingUp, color: "text-purple-400", label: "Trending" };
      case "collaboration_king":
        return { icon: Users, color: "text-green-400", label: "Collaboration Pro" };
      default:
        return { icon: Award, color: "text-gray-400", label: badge };
    }
  };

  const tabs = [
    { id: "tracks", label: "Tracks", count: tracks.length },
    { id: "playlists", label: "Playlists", count: playlists.length },
    { id: "about", label: "About" },
  ];

  if (profile.isArtist) {
    tabs.splice(2, 0, { id: "analytics", label: "Analytics" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden theme-transition">
      {/* Clean YouTube/Google style background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background to-secondary/30 theme-transition"></div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header - YouTube/Google Style */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border google-shadow dark:google-dark-shadow theme-transition"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>

          <h1 className="text-lg font-bold text-foreground">Profile</h1>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Cover Image */}
          <div className="relative h-48 sm:h-64">
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Edit Cover Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Profile Info */}
          <div className="px-4 -mt-16 relative z-10">
            {/* Avatar */}
            <div className="flex items-end justify-between mb-4">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-xl"
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
                    <Verified className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isFollowing
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2 inline" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2 inline" />
                      Follow
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg border border-border transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Name and Bio */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{profile.displayName}</h1>
                {profile.isArtist && (
                  <div className="px-2 py-1 bg-primary/10 rounded-full">
                    <span className="text-xs text-primary font-medium">Artist</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-1">@{profile.username}</p>
              <p className="text-foreground leading-relaxed mb-3">{profile.bio}</p>
              
              {/* Location and Website */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <Link2 className="w-4 h-4" />
                    <span>{profile.website}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.joinedDate)}</span>
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(profile.socialLinks).length > 0 && (
                <div className="flex items-center space-x-3 mb-4">
                  {profile.socialLinks.instagram && (
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                      className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
                    >
                      <Instagram className="w-4 h-4 text-white" />
                    </motion.a>
                  )}
                  {profile.socialLinks.twitter && (
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href={`https://twitter.com/${profile.socialLinks.twitter}`}
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Twitter className="w-4 h-4 text-white" />
                    </motion.a>
                  )}
                  {profile.socialLinks.youtube && (
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href={`https://youtube.com/${profile.socialLinks.youtube}`}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <Youtube className="w-4 h-4 text-white" />
                    </motion.a>
                  )}
                </div>
              )}

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.badges.map((badge, index) => {
                    const badgeInfo = getBadgeInfo(badge);
                    const BadgeIcon = badgeInfo.icon;
                    return (
                      <motion.div
                        key={badge}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-1 px-2 py-1 bg-muted/50 rounded-full border border-border`}
                        title={badgeInfo.label}
                      >
                        <BadgeIcon className={`w-3 h-3 ${badgeInfo.color}`} />
                        <span className="text-xs text-foreground font-medium">{badgeInfo.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowStats(true)}
                className="text-center p-3 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors youtube-shadow hover:youtube-shadow-hover dark:google-dark-shadow dark:hover:google-dark-shadow-hover"
              >
                <p className="text-xl font-bold text-foreground">{formatNumber(profile.stats.followers)}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowStats(true)}
                className="text-center p-3 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors youtube-shadow hover:youtube-shadow-hover dark:google-dark-shadow dark:hover:google-dark-shadow-hover"
              >
                <p className="text-xl font-bold text-foreground">{formatNumber(profile.stats.following)}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowStats(true)}
                className="text-center p-3 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors youtube-shadow hover:youtube-shadow-hover dark:google-dark-shadow dark:hover:google-dark-shadow-hover"
              >
                <p className="text-xl font-bold text-foreground">{formatNumber(profile.stats.totalPlays)}</p>
                <p className="text-sm text-muted-foreground">Total Plays</p>
              </motion.button>
            </div>

            {/* Upload Button for Artists */}
            {profile.isArtist && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/upload")}
                className="w-full p-4 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground font-medium mb-6 flex items-center justify-center space-x-2 transition-colors"
              >
                <UploadIcon className="w-5 h-5" />
                <span>Upload New Track</span>
              </motion.button>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-muted/30 rounded-lg p-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    selectedTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 opacity-60">({tab.count})</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* View Mode Toggle for Tracks/Playlists */}
            {(selectedTab === "tracks" || selectedTab === "playlists") && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {selectedTab === "tracks" ? "My Tracks" : "My Playlists"}
                </h2>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list" ? "bg-purple-primary text-white" : "text-gray-400"
                    }`}
                  >
                    <ListMusic className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Content Based on Selected Tab */}
            <AnimatePresence mode="wait">
              {selectedTab === "tracks" && (
                <motion.div
                  key="tracks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 gap-4">
                      {tracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-purple-dark/30 rounded-xl p-3 border border-purple-primary/20"
                        >
                          <div className="relative mb-3">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handlePlay(track.id)}
                              className="absolute bottom-2 right-2 w-8 h-8 bg-purple-primary rounded-full flex items-center justify-center shadow-lg"
                            >
                              {currentPlayingTrack === track.id && isPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              )}
                            </motion.button>
                            {track.genre && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-md">
                                <span className="text-xs text-white font-medium">{track.genre}</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-white mb-1 truncate">{track.title}</h3>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{formatNumber(track.plays)} plays</span>
                            <span>{formatDuration(track.duration)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center space-x-3 p-3 bg-purple-dark/30 rounded-xl border border-purple-primary/20 hover:bg-purple-primary/10 transition-colors cursor-pointer"
                          onClick={() => handlePlay(track.id)}
                        >
                          <div className="relative">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              {currentPlayingTrack === track.id && isPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-white mb-1">{track.title}</h3>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{formatNumber(track.plays)} plays</span>
                              <span>{formatNumber(track.likes)} likes</span>
                              <span>{formatDate(track.uploadDate)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">{formatDuration(track.duration)}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === "playlists" && (
                <motion.div
                  key="playlists"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 gap-4">
                      {playlists.map((playlist, index) => (
                        <motion.div
                          key={playlist.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-purple-dark/30 rounded-xl p-3 border border-purple-primary/20"
                        >
                          <div className="relative mb-3">
                            <img
                              src={playlist.coverUrl}
                              alt={playlist.name}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            {!playlist.isPublic && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-md">
                                <span className="text-xs text-white font-medium">Private</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-white mb-1 truncate">{playlist.name}</h3>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{playlist.trackCount} tracks</span>
                            <span>{formatNumber(playlist.plays)} plays</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {playlists.map((playlist, index) => (
                        <motion.div
                          key={playlist.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center space-x-3 p-3 bg-purple-dark/30 rounded-xl border border-purple-primary/20 hover:bg-purple-primary/10 transition-colors cursor-pointer"
                        >
                          <img
                            src={playlist.coverUrl}
                            alt={playlist.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-white mb-1">{playlist.name}</h3>
                            <p className="text-sm text-gray-400 mb-1 line-clamp-1">{playlist.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{playlist.trackCount} tracks</span>
                              <span>{formatNumber(playlist.plays)} plays</span>
                              <span>{playlist.isPublic ? "Public" : "Private"}</span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === "analytics" && profile.isArtist && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Monthly Listeners</h3>
                        <Headphones className="w-4 h-4 text-purple-primary" />
                      </div>
                      <p className="text-2xl font-bold text-white">{formatNumber(profile.stats.monthlyListeners)}</p>
                      <p className="text-xs text-green-400">+12.5% from last month</p>
                    </div>

                    <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Streams</h3>
                        <Play className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">{formatNumber(profile.stats.totalPlays)}</p>
                      <p className="text-xs text-green-400">+8.3% this month</p>
                    </div>
                  </div>

                  {/* Top Tracks Performance */}
                  <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-primary" />
                      Top Performing Tracks
                    </h3>
                    <div className="space-y-3">
                      {tracks.slice(0, 3).map((track, index) => (
                        <div key={track.id} className="flex items-center space-x-3 p-2 rounded-lg bg-purple-primary/5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            'bg-amber-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{track.title}</h4>
                            <p className="text-xs text-gray-400">{formatNumber(track.plays)} plays</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">{formatNumber(track.likes)} likes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/rewards")}
                      className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30 text-left"
                    >
                      <DollarSign className="w-6 h-6 text-green-400 mb-2" />
                      <h3 className="font-medium text-white">View Earnings</h3>
                      <p className="text-xs text-gray-400">Check your revenue</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/notifications")}
                      className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 text-left"
                    >
                      <Star className="w-6 h-6 text-purple-400 mb-2" />
                      <h3 className="font-medium text-white">Fan Activity</h3>
                      <p className="text-xs text-gray-400">See fan interactions</p>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {selectedTab === "about" && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Detailed Stats */}
                  <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                    <h3 className="text-lg font-bold text-white mb-4">Profile Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-accent">{formatNumber(profile.stats.totalTracks)}</p>
                        <p className="text-sm text-gray-400">Tracks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-accent">{formatNumber(profile.stats.totalPlaylists)}</p>
                        <p className="text-sm text-gray-400">Playlists</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                    <h3 className="text-lg font-bold text-white mb-4">About</h3>
                    <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                    <h3 className="text-lg font-bold text-white mb-4">Contact & Links</h3>
                    <div className="space-y-3">
                      {profile.website && (
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <a href={`https://${profile.website}`} className="text-purple-accent hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-white">{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Modal */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowStats(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-purple-dark rounded-2xl p-6 w-full max-w-md border border-purple-primary/30"
              >
                <h2 className="text-xl font-bold text-white mb-6 text-center">Profile Statistics</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                    <span className="text-white">Followers</span>
                    <span className="font-bold text-purple-accent">{formatNumber(profile.stats.followers)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                    <span className="text-white">Following</span>
                    <span className="font-bold text-purple-accent">{formatNumber(profile.stats.following)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                    <span className="text-white">Total Plays</span>
                    <span className="font-bold text-purple-accent">{formatNumber(profile.stats.totalPlays)}</span>
                  </div>
                  {profile.isArtist && (
                    <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                      <span className="text-white">Monthly Listeners</span>
                      <span className="font-bold text-purple-accent">{formatNumber(profile.stats.monthlyListeners)}</span>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStats(false)}
                  className="w-full py-3 mt-6 bg-purple-primary rounded-xl text-white font-medium"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
    </div>
  );
}
