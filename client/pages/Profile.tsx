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
  Save,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MobileFooter from "../components/MobileFooter";
import { UserProfile as BackendUserProfile, Song } from "@shared/api";
import { fetchUserData, updateUserProfile, testFirebaseConnection } from "../lib/auth";

// Use backend types
type UserProfile = BackendUserProfile & {
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  isArtist: boolean;
  joinedDate: Date;
  stats: {
    followers: number;
    following: number;
    totalPlays: number;
    totalTracks: number;
    totalPlaylists: number;
    monthlyListeners: number;
  };
  badges: string[];
};

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
  email: "alex@alexmusic.com",
  bio: "Music producer & artist 🎵 | Creating beats that move souls | Collabs welcome 💫 | Stream my latest tracks below ⬇️",
  avatar:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  coverImage:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop",
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
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
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
    coverUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
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
    coverUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
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
    coverUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
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
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    trackCount: 25,
    isPublic: true,
    createdDate: new Date("2024-01-01"),
    plays: 567000,
  },
  {
    id: "2",
    name: "Chill Sessions",
    description: "Perfect for relaxing and studying",
    coverUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    trackCount: 18,
    isPublic: true,
    createdDate: new Date("2023-12-15"),
    plays: 342000,
  },
  {
    id: "3",
    name: "Work in Progress",
    description: "Upcoming releases and demos",
    coverUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    trackCount: 8,
    isPublic: false,
    createdDate: new Date("2024-01-20"),
    plays: 0,
  },
];

interface RecentlyPlayedTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  playedAt: string;
  duration: number;
  isCurrentlyPlaying?: boolean;
}

const sampleRecentlyPlayed: RecentlyPlayedTrack[] = [
  {
    id: "recent1",
    title: "Midnight Dreams",
    artist: "Alex Johnson",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    playedAt: "2 minutes ago",
    duration: 234,
    isCurrentlyPlaying: true,
  },
  {
    id: "recent2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    coverUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    playedAt: "15 minutes ago",
    duration: 200,
  },
  {
    id: "recent3",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    coverUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    playedAt: "32 minutes ago",
    duration: 174,
  },
  {
    id: "recent4",
    title: "Levitating",
    artist: "Dua Lipa",
    coverUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    playedAt: "1 hour ago",
    duration: 203,
  },
  {
    id: "recent5",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    playedAt: "2 hours ago",
    duration: 178,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([]);
  const [selectedTab, setSelectedTab] = useState("tracks");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    location: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      youtube: "",
    },
  });

  // Fetch profile data using the auth library function
  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Get current user ID from localStorage or context
      const userId = localStorage.getItem('currentUserId') || 'user1';

      // Use the fetchUserData function from auth library
      const result = await fetchUserData(userId);

      if (result.success && result.userData) {
        // Transform fetched data to match our profile interface
        const userData = result.userData;
        const transformedProfile: UserProfile = {
          id: userId,
          displayName: userData.name || sampleProfile.displayName,
          username: userData.username || sampleProfile.username,
          email: userData.email || sampleProfile.email,
          bio: userData.bio || sampleProfile.bio,
          avatar: userData.profile_image || sampleProfile.avatar,
          coverImage: sampleProfile.coverImage, // Use sample for now
          location: sampleProfile.location, // Use sample for now
          website: sampleProfile.website, // Use sample for now
          isVerified: userData.verified || false,
          isArtist: sampleProfile.isArtist, // Use sample for now
          joinedDate: userData.created_at ? new Date(userData.created_at) : new Date(),
          socialLinks: {
            instagram: userData.socialLinks?.instagram || sampleProfile.socialLinks?.instagram,
            twitter: userData.socialLinks?.twitter || sampleProfile.socialLinks?.twitter,
            youtube: userData.socialLinks?.youtube || sampleProfile.socialLinks?.youtube,
          },
          stats: {
            followers: userData.followers || 0,
            following: userData.following || 0,
            totalPlays: sampleProfile.stats.totalPlays || 0, // Use sample for now
            totalTracks: userData.totalTracks || 0,
            totalPlaylists: userData.totalPlaylists || 0,
            monthlyListeners: sampleProfile.stats.monthlyListeners || 0, // Use sample for now
          },
          badges: sampleProfile.badges, // Use sample for now
        };

        setProfile(transformedProfile);

        // Update edit form with fetched data
        setEditForm({
          displayName: transformedProfile.displayName,
          username: transformedProfile.username,
          bio: transformedProfile.bio,
          location: transformedProfile.location || "",
          socialLinks: {
            instagram: transformedProfile.socialLinks?.instagram || "",
            twitter: transformedProfile.socialLinks?.twitter || "",
            youtube: transformedProfile.socialLinks?.youtube || "",
          },
        });

        console.log("✅ Profile data loaded using fetchUserData:", transformedProfile);
      } else {
        // Fallback to saved user data or sample data
        const savedUserData = localStorage.getItem("currentUser");
        if (savedUserData) {
          try {
            const userData = JSON.parse(savedUserData);
            const fallbackProfile: UserProfile = {
              ...sampleProfile,
              displayName: userData.name || sampleProfile.displayName,
              username: userData.username || sampleProfile.username,
              email: userData.email || sampleProfile.email,
              bio: userData.bio || sampleProfile.bio,
              avatar: userData.profile_image || userData.profileImageURL || sampleProfile.avatar,
            };
            setProfile(fallbackProfile);
          } catch (error) {
            console.error("Error parsing saved user data:", error);
            setProfile(sampleProfile);
          }
        } else {
          setProfile(sampleProfile);
        }
        setEditForm({
          displayName: sampleProfile.displayName,
          username: sampleProfile.username,
          bio: sampleProfile.bio,
          location: sampleProfile.location,
          socialLinks: {
            instagram: sampleProfile.socialLinks?.instagram || "",
            twitter: sampleProfile.socialLinks?.twitter || "",
            youtube: sampleProfile.socialLinks?.youtube || "",
          },
        });
        console.warn("⚠️ Using fallback profile data");
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      // Fallback to sample data
      setProfile(sampleProfile);
      setEditForm({
        displayName: sampleProfile.displayName,
        username: sampleProfile.username,
        bio: sampleProfile.bio,
        location: sampleProfile.location,
        socialLinks: {
          instagram: sampleProfile.socialLinks?.instagram || "",
          twitter: sampleProfile.socialLinks?.twitter || "",
          youtube: sampleProfile.socialLinks?.youtube || "",
        },
      });

      toast({
        title: "Error loading profile",
        description: "Using demo data. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch liked songs
  const fetchLikedSongs = async () => {
    try {
      const userId = localStorage.getItem('currentUserId') || 'user1';
      const response = await fetch(`/api/profile/${userId}/liked-songs`);
      const data = await response.json();

      if (data.success) {
        // Ensure all songs have required properties with defaults
        const safeSongs = (data.songs || []).map((song: any) => ({
          ...song,
          plays: song.plays || 0,
          likes: song.likes || 0,
          comments: song.comments || 0,
          duration: song.duration || 0,
        }));
        setTracks(safeSongs.length > 0 ? safeSongs : sampleTracks);
      } else {
        setTracks(sampleTracks);
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      setTracks(sampleTracks);
    }
  };

  // Fetch recently played
  const fetchRecentlyPlayed = async () => {
    try {
      const userId = localStorage.getItem('currentUserId') || 'user1';
      const response = await fetch(`/api/profile/${userId}/recently-played`);
      const data = await response.json();

      if (data.success) {
        // Transform backend recently played to match our interface
        const transformedRecentlyPlayed = (data.songs || []).map((song: any, index: number) => ({
          id: song.id || `recent-${index}`,
          title: song.title || "Unknown Song",
          artist: song.artist || "Unknown Artist",
          coverUrl: song.coverImage || "",
          playedAt: song.playedAt || `${index * 15 + 5} minutes ago`,
          duration: song.duration || 0,
          isCurrentlyPlaying: index === 0, // Mark first as currently playing
        }));
        setRecentlyPlayed(transformedRecentlyPlayed);
      } else {
        setRecentlyPlayed(sampleRecentlyPlayed);
      }
    } catch (error) {
      console.error("Error fetching recently played:", error);
      setRecentlyPlayed(sampleRecentlyPlayed);
    }
  };

  // Load data on component mount
  useEffect(() => {
    // Test Firebase connection first
    testFirebaseConnection().then(result => {
      if (!result.success) {
        console.warn("🔥 Firebase connection test failed:", result.error, result.details);
      } else {
        console.log("✅ Firebase connection test passed:", result.details);
      }
    });

    fetchProfile();
    fetchLikedSongs();
    fetchRecentlyPlayed();
  }, []);

  const formatNumber = (num: number | undefined | null) => {
    // Handle undefined, null, or NaN values
    if (num == null || isNaN(num)) {
      return "0";
    }

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
    if (!profile) return;

    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing
        ? `You unfollowed ${profile.displayName}`
        : `You're now following ${profile.displayName}`,
    });
  };

  const handleShare = () => {
    if (!profile) return;

    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName} on Catch Music`,
        text: profile.bio,
        url: `https://catchmusic.app/profile/${profile.username}`,
      });
    } else {
      navigator.clipboard.writeText(
        `https://catchmusic.app/profile/${profile.username}`,
      );
      toast({
        title: "Profile link copied!",
        description: "Share this link with your friends",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setUploading(true);
      const userId = localStorage.getItem('currentUserId') || profile.id;

      // Use the updateUserProfile function from auth library
      const result = await updateUserProfile(userId, editForm.bio, profile.avatar);

      if (result.success) {
        // Update local state with saved data
        setProfile({
          ...profile,
          displayName: editForm.displayName,
          username: editForm.username,
          bio: editForm.bio,
          location: editForm.location,
          socialLinks: {
            instagram: editForm.socialLinks.instagram || undefined,
            twitter: editForm.socialLinks.twitter || undefined,
            youtube: editForm.socialLinks.youtube || undefined,
          },
        });

        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated using auth library",
        });

        console.log("✅ Profile updated using updateUserProfile function");
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;

    setEditForm({
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      location: profile.location || "",
      socialLinks: {
        instagram: profile.socialLinks.instagram || "",
        twitter: profile.socialLinks.twitter || "",
        youtube: profile.socialLinks.youtube || "",
      },
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && profile) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatar = e.target?.result as string;
        setProfile((prev) => prev ? { ...prev, avatar: newAvatar } : null);
        // Store in localStorage for persistence
        localStorage.setItem("userAvatar", newAvatar);
        setUploading(false);
        toast({
          title: "Profile Image Updated",
          description: "Your profile image has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && profile) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newCover = e.target?.result as string;
        setProfile((prev) => prev ? { ...prev, coverImage: newCover } : null);
        // Store in localStorage for persistence
        localStorage.setItem("userCoverImage", newCover);
        setUploading(false);
        toast({
          title: "Cover Image Updated",
          description: "Your cover image has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Load saved images on component mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar");
    const savedCover = localStorage.getItem("userCoverImage");
    if (savedAvatar || savedCover) {
      setProfile((prev) => ({
        ...prev,
        ...(savedAvatar && { avatar: savedAvatar }),
        ...(savedCover && { coverImage: savedCover }),
      }));
    }
  }, []);

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case "verified":
        return {
          icon: Verified,
          color: "text-blue-400",
          label: "Verified Artist",
        };
      case "top_artist":
        return { icon: Crown, color: "text-yellow-400", label: "Top Artist" };
      case "trending":
        return {
          icon: TrendingUp,
          color: "text-purple-400",
          label: "Trending",
        };
      case "collaboration_king":
        return {
          icon: Users,
          color: "text-green-400",
          label: "Collaboration Pro",
        };
      default:
        return { icon: Award, color: "text-gray-400", label: badge };
    }
  };

  // Show loading state
  if (loading || !profile) {
    return (
      <div className="h-screen bg-background text-foreground relative overflow-hidden theme-transition max-w-sm mx-auto">
        <div className="fixed inset-0 bg-gradient-to-b from-background to-secondary/30 theme-transition"></div>
        <div className="relative z-10 flex flex-col h-screen">
          {/* Header */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border theme-transition"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/home")}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </motion.button>
            <h1 className="text-base font-bold text-foreground">Profile</h1>
            <div className="w-8 h-8"></div>
          </motion.header>

          {/* Loading Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build tabs array with null checking
  const tabs = [
    { id: "tracks", label: "Tracks", count: tracks.length },
    { id: "playlists", label: "Playlists", count: playlists.length },
    { id: "history", label: "History", count: recentlyPlayed.length },
    { id: "about", label: "About" },
  ];

  if (profile?.isArtist) {
    tabs.splice(3, 0, { id: "analytics", label: "Analytics" });
  }

  return (
    <div className="h-screen bg-background text-foreground relative overflow-hidden theme-transition max-w-sm mx-auto">
      {/* App background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background to-secondary/30 theme-transition"></div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Compact App Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border theme-transition"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </motion.button>

          <h1 className="text-base font-bold text-foreground">Profile</h1>

          <div className="flex items-center space-x-1">
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
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Info */}
          <div className="px-3 relative z-10 mt-4">
            {/* Avatar */}
            <div className="flex items-end justify-between mb-2">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md cursor-pointer"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
                    <Verified className="w-3 h-3 text-white" />
                  </div>
                )}

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg font-medium transition-all bg-muted hover:bg-muted/80 text-foreground border border-border"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-all bg-primary hover:bg-primary/90 text-primary-foreground`}
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
                    onClick={() =>
                      navigate("/messages", { state: { from: "profile" } })
                    }
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-all border border-border text-foreground"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Name and Bio */}
            <div className="mb-2">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                      placeholder="Your display name"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      className="w-full p-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                      placeholder="@username"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      className="w-full p-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="w-full p-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                      placeholder="Your location"
                    />
                  </div>

                  {/* Profile Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={profile.avatar}
                          alt="Profile Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-border"
                        />
                      </div>
                      <div className="flex-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-all text-foreground flex items-center space-x-2 border border-border"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Change Photo</span>
                        </motion.button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Social Links
                    </label>
                    <div className="space-y-2">
                      {/* Instagram */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Instagram className="w-4 h-4 text-pink-500" />
                        </div>
                        <input
                          type="text"
                          value={editForm.socialLinks.instagram}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              socialLinks: {
                                ...editForm.socialLinks,
                                instagram: e.target.value,
                              },
                            })
                          }
                          className="w-full p-3 pl-10 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                          placeholder="Instagram username"
                        />
                      </div>

                      {/* Twitter */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Twitter className="w-4 h-4 text-blue-400" />
                        </div>
                        <input
                          type="text"
                          value={editForm.socialLinks.twitter}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              socialLinks: {
                                ...editForm.socialLinks,
                                twitter: e.target.value,
                              },
                            })
                          }
                          className="w-full p-3 pl-10 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                          placeholder="Twitter username"
                        />
                      </div>

                      {/* YouTube */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Youtube className="w-4 h-4 text-red-500" />
                        </div>
                        <input
                          type="text"
                          value={editForm.socialLinks.youtube}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              socialLinks: {
                                ...editForm.socialLinks,
                                youtube: e.target.value,
                              },
                            })
                          }
                          className="w-full p-3 pl-10 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-primary/50"
                          placeholder="YouTube channel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Edit Mode Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg font-medium transition-all bg-muted hover:bg-muted/80 text-foreground border border-border"
                    >
                      <X className="w-4 h-4 mr-2 inline" />
                      Cancel
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={uploading}
                      className="px-4 py-2 rounded-lg font-medium transition-all bg-purple-primary text-white disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2 inline" />
                      )}
                      {uploading ? "Saving..." : "Save"}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-lg font-bold text-foreground">
                      {profile.displayName}
                    </h1>
                    {profile.isArtist && (
                      <div className="px-1 py-0.5 bg-primary/10 rounded-full">
                        <span className="text-[10px] text-primary font-medium">
                          Artist
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    @{profile.username}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    {profile.email}
                  </p>
                  <p className="text-xs text-foreground leading-relaxed mb-2">
                    {profile.bio}
                  </p>

                  {/* Location and Website */}
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center space-x-1">
                        <Link2 className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(profile.joinedDate)}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  {Object.keys(profile.socialLinks).length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      {profile.socialLinks.instagram && (
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          href={`https://instagram.com/${profile.socialLinks.instagram}`}
                          className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
                        >
                          <Instagram className="w-3 h-3 text-white" />
                        </motion.a>
                      )}
                      {profile.socialLinks.twitter && (
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          href={`https://twitter.com/${profile.socialLinks.twitter}`}
                          className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <Twitter className="w-3 h-3 text-white" />
                        </motion.a>
                      )}
                      {profile.socialLinks.youtube && (
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          href={`https://youtube.com/${profile.socialLinks.youtube}`}
                          className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <Youtube className="w-3 h-3 text-white" />
                        </motion.a>
                      )}
                    </div>
                  )}

                  {/* Badges */}
                  {profile.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.badges.map((badge, index) => {
                        const badgeInfo = getBadgeInfo(badge);
                        const BadgeIcon = badgeInfo.icon;
                        return (
                          <motion.div
                            key={badge}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center space-x-1 px-1.5 py-0.5 bg-muted/50 rounded-full border border-border`}
                            title={badgeInfo.label}
                          >
                            <BadgeIcon
                              className={`w-2.5 h-2.5 ${badgeInfo.color}`}
                            />
                            <span className="text-[10px] text-foreground font-medium">
                              {badgeInfo.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            {!isEditing && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowStats(true)}
                  className="text-center p-2 bg-card hover:bg-card/80 rounded-lg transition-colors border border-border"
                >
                  <p className="text-sm font-bold text-foreground">
                    {formatNumber(profile.stats.followers)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Followers</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowStats(true)}
                  className="text-center p-2 bg-card hover:bg-card/80 rounded-lg transition-colors border border-border"
                >
                  <p className="text-sm font-bold text-foreground">
                    {formatNumber(profile.stats.following)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Following</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowStats(true)}
                  className="text-center p-2 bg-card hover:bg-card/80 rounded-lg transition-colors border border-border"
                >
                  <p className="text-sm font-bold text-foreground">
                    {formatNumber(profile.stats.totalPlays)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Total Plays</p>
                </motion.button>
              </div>
            )}

            {/* Tabs */}
            {!isEditing && (
              <>
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
                      <div className="grid grid-cols-2 gap-4">
                      </div>
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
                              className="bg-card rounded-xl p-3 border border-border"
                            >
                              <div className="relative mb-3">
                                <img
                                  src={playlist.coverUrl}
                                  alt={playlist.name}
                                  className="w-full aspect-square rounded-lg object-cover"
                                />
                                {!playlist.isPublic && (
                                  <div className="absolute top-2 left-2 px-2 py-1 bg-card/60 rounded-md">
                                    <span className="text-xs text-foreground font-medium">
                                      Private
                                    </span>
                                  </div>
                                )}
                              </div>
                              <h3 className="font-medium text-foreground mb-1 truncate">
                                {playlist.name}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{playlist.trackCount} tracks</span>
                                <span>
                                  {formatNumber(playlist.plays)} plays
                                </span>
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
                              className="flex items-center space-x-3 p-3 bg-card rounded-xl hover:bg-card/80 transition-colors cursor-pointer border border-border"
                            >
                              <img
                                src={playlist.coverUrl}
                                alt={playlist.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground mb-1">
                                  {playlist.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                                  {playlist.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>{playlist.trackCount} tracks</span>
                                  <span>
                                    {formatNumber(playlist.plays)} plays
                                  </span>
                                  <span>
                                    {playlist.isPublic ? "Public" : "Private"}
                                  </span>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
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
                            <h3 className="text-sm font-medium text-gray-400">
                              Monthly Listeners
                            </h3>
                            <Headphones className="w-4 h-4 text-purple-primary" />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {formatNumber(profile.stats.monthlyListeners)}
                          </p>
                          <p className="text-xs text-green-400">
                            +12.5% from last month
                          </p>
                        </div>

                        <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-400">
                              Total Streams
                            </h3>
                            <Play className="w-4 h-4 text-green-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {formatNumber(profile.stats.totalPlays)}
                          </p>
                          <p className="text-xs text-green-400">
                            +8.3% this month
                          </p>
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
                            <div
                              key={track.id}
                              className="flex items-center space-x-3 p-2 rounded-lg bg-purple-primary/5"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? "bg-yellow-500 text-black"
                                    : index === 1
                                      ? "bg-gray-400 text-black"
                                      : "bg-amber-600 text-white"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-white text-sm">
                                  {track.title}
                                </h4>
                                <p className="text-xs text-gray-400">
                                  {formatNumber(track.plays)} plays
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">
                                  {formatNumber(track.likes)} likes
                                </p>
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
                          <h3 className="font-medium text-white">
                            View Earnings
                          </h3>
                          <p className="text-xs text-gray-400">
                            Check your revenue
                          </p>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/notifications")}
                          className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 text-left"
                        >
                          <Star className="w-6 h-6 text-purple-400 mb-2" />
                          <h3 className="font-medium text-white">
                            Fan Activity
                          </h3>
                          <p className="text-xs text-gray-400">
                            See fan interactions
                          </p>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {selectedTab === "history" && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Now Playing */}
                      {recentlyPlayed.find(
                        (track) => track.isCurrentlyPlaying,
                      ) && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                            <Music className="w-4 h-4 mr-2 text-neon-green" />
                            Now Playing
                          </h3>
                          {(() => {
                            const nowPlaying = recentlyPlayed.find(
                              (track) => track.isCurrentlyPlaying,
                            );
                            return nowPlaying ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative h-32 rounded-xl overflow-hidden group cursor-pointer"
                                style={{
                                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${nowPlaying.coverUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                                onClick={() => handlePlay(nowPlaying.id)}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3">
                                  <h4 className="text-white font-semibold text-sm mb-1">
                                    {nowPlaying.title}
                                  </h4>
                                  <p className="text-white/80 text-xs">
                                    {nowPlaying.artist}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-neon-green text-xs font-medium">
                                      ● PLAYING
                                    </span>
                                    <span className="text-white/60 text-xs">
                                      {formatDuration(nowPlaying.duration)}
                                    </span>
                                  </div>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm"
                                >
                                  {isPlaying ? (
                                    <Pause className="w-4 h-4 text-white" />
                                  ) : (
                                    <Play className="w-4 h-4 text-white ml-0.5" />
                                  )}
                                </motion.div>
                              </motion.div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {/* Recently Played */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-purple-primary" />
                          Recently Played
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {recentlyPlayed
                            .filter((track) => !track.isCurrentlyPlaying)
                            .map((track, index) => (
                              <motion.div
                                key={track.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative h-24 rounded-lg overflow-hidden group cursor-pointer"
                                style={{
                                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${track.coverUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                                onClick={() => handlePlay(track.id)}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                  <h4 className="text-white font-medium text-xs mb-0.5 truncate">
                                    {track.title}
                                  </h4>
                                  <p className="text-white/70 text-[10px] truncate">
                                    {track.artist}
                                  </p>
                                  <p className="text-white/50 text-[9px] mt-0.5">
                                    {track.playedAt}
                                  </p>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                  <Play className="w-3 h-3 text-white ml-0.5" />
                                </motion.div>
                              </motion.div>
                            ))}
                        </div>
                      </div>

                      {/* View All History Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/history")}
                        className="w-full py-3 mt-4 bg-card rounded-xl text-foreground font-medium flex items-center justify-center space-x-2 border border-border"
                      >
                        <Clock className="w-4 h-4" />
                        <span>View Full History</span>
                      </motion.button>
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
                        <h3 className="text-lg font-bold text-white mb-4">
                          Profile Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-accent">
                              {formatNumber(profile.stats.totalTracks)}
                            </p>
                            <p className="text-sm text-gray-400">Tracks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-accent">
                              {formatNumber(profile.stats.totalPlaylists)}
                            </p>
                            <p className="text-sm text-gray-400">Playlists</p>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                        <h3 className="text-lg font-bold text-white mb-4">
                          About
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-purple-dark/30 rounded-xl p-4 border border-purple-primary/20">
                        <h3 className="text-lg font-bold text-white mb-4">
                          Contact & Links
                        </h3>
                        <div className="space-y-3">
                          {profile.website && (
                            <div className="flex items-center space-x-3">
                              <Globe className="w-5 h-5 text-gray-400" />
                              <a
                                href={`https://${profile.website}`}
                                className="text-purple-accent hover:underline"
                              >
                                {profile.website}
                              </a>
                            </div>
                          )}
                          {profile.location && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <span className="text-white">
                                {profile.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
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
                <h2 className="text-xl font-bold text-white mb-6 text-center">
                  Profile Statistics
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                    <span className="text-white">Followers</span>
                    <span className="font-bold text-purple-accent">
                      {formatNumber(profile.stats.followers)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                    <span className="text-white">Following</span>
                    <span className="font-bold text-purple-accent">
                      {formatNumber(profile.stats.following)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                    <span className="text-white">Total Plays</span>
                    <span className="font-bold text-purple-accent">
                      {formatNumber(profile.stats.totalPlays)}
                    </span>
                  </div>
                  {profile.isArtist && (
                    <div className="flex justify-between items-center p-3 bg-purple-primary/10 rounded-xl">
                      <span className="text-white">Monthly Listeners</span>
                      <span className="font-bold text-purple-accent">
                        {formatNumber(profile.stats.monthlyListeners)}
                      </span>
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
