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
import { fetchUserData, updateUserProfile } from "../lib/auth";
import { api } from "../lib/api";
import { useFirebase } from "../context/FirebaseContext";
import { useMusic } from "../context/MusicContextSupabase";

// Use Firebase user with backend profile extension
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
  // Additional signup data fields
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
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
];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(sampleTracks);
  const [playlists, setPlaylists] = useState<Playlist[]>(samplePlaylists);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>(
    sampleRecentlyPlayed,
  );
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

  // Fetch profile data using Firebase user
  const fetchProfile = async () => {
    try {
      setLoading(true);

      if (!firebaseUser) {
        console.log("❌ No Firebase user found");
        toast({
          title: "Authentication required",
          description: "Please sign in to view your profile",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      console.log("🔥 Fetching profile for Firebase user:", firebaseUser.email);

      // First, try to load complete data from localStorage (signup data)
      const localUserData = localStorage.getItem('currentUser');
      if (localUserData) {
        try {
          const userData = JSON.parse(localUserData);
          console.log("💾 Found localStorage user data:", userData);

          if (userData.uid === firebaseUser.uid) {
            // Use complete signup data from localStorage
            const completeProfile: UserProfile = {
              id: firebaseUser.uid,
              displayName: userData.name || firebaseUser.displayName || "User",
              username: userData.username || firebaseUser.email?.split("@")[0] || "user",
              email: userData.email || firebaseUser.email || "",
              bio: userData.bio || "Music lover 🎵",
              avatar: userData.profileImageURL || firebaseUser.photoURL || "",
              coverImage: "",
              location: "",
              website: "",
              isVerified: firebaseUser.emailVerified || false,
              isArtist: false,
              joinedDate: firebaseUser.metadata.creationTime
                ? new Date(firebaseUser.metadata.creationTime)
                : new Date(),
              socialLinks: {
                instagram: "",
                twitter: "",
                youtube: "",
              },
              stats: {
                followers: 0,
                following: 0,
                totalPlays: 0,
                totalTracks: 0,
                totalPlaylists: 0,
                monthlyListeners: 0,
              },
              badges: [],
              // Additional signup data
              dateOfBirth: userData.dateOfBirth,
              gender: userData.gender,
              phone: userData.phone,
            };

            setProfile(completeProfile);
            console.log("✅ Profile loaded from localStorage signup data:", completeProfile);

            // Update edit form with complete data
            setEditForm({
              displayName: completeProfile.displayName,
              username: completeProfile.username,
              bio: completeProfile.bio,
              location: completeProfile.location,
              socialLinks: completeProfile.socialLinks,
            });

            setLoading(false);
            return;
          }
        } catch (parseError) {
          console.warn("⚠️ Failed to parse localStorage user data:", parseError);
        }
      }

      // Try to fetch from backend as fallback
      try {
        const backendResponse = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
          headers: {
            "user-id": firebaseUser.uid,
            "Content-Type": "application/json",
          },
        });

        if (backendResponse.ok) {
          const result = await backendResponse.json();
          if (result.success && result.data) {
            const backendData = result.data;
            
            // Transform backend data to profile interface
            const transformedProfile: UserProfile = {
              id: firebaseUser.uid,
              displayName: backendData.display_name || backendData.name || firebaseUser.displayName || "User",
              username: backendData.username || firebaseUser.email?.split("@")[0] || "user",
              email: firebaseUser.email || "",
              bio: backendData.bio || "",
              avatar: backendData.profile_image_url || firebaseUser.photoURL || "",
              coverImage: backendData.cover_image_url || "",
              location: backendData.location || "",
              website: backendData.website || "",
              isVerified: backendData.is_verified || false,
              isArtist: backendData.is_artist || false,
              joinedDate: backendData.created_at
                ? new Date(backendData.created_at)
                : new Date(),
              socialLinks: {
                instagram: backendData.social_links?.instagram || "",
                twitter: backendData.social_links?.twitter || "",
                youtube: backendData.social_links?.youtube || "",
              },
              stats: {
                followers: backendData.follower_count || 0,
                following: backendData.following_count || 0,
                totalPlays: backendData.total_plays || 0,
                totalTracks: backendData.total_tracks || 0,
                totalPlaylists: backendData.total_playlists || 0,
                monthlyListeners: backendData.monthly_listeners || 0,
              },
              badges: backendData.badges || [],
            };

            setProfile(transformedProfile);
            console.log("✅ Profile loaded from backend:", transformedProfile);
            return;
          }
        }
      } catch (backendError) {
        console.warn("⚠️ Backend profile fetch failed:", backendError);
      }

      // Try to fetch from Firestore as secondary fallback
      try {
        const firestoreResult = await fetchUserData(firebaseUser.uid);
        if (firestoreResult.success && firestoreResult.userData) {
          const firestoreData = firestoreResult.userData;
          console.log("✅ Firestore data found:", firestoreData);

          const firestoreProfile: UserProfile = {
            id: firebaseUser.uid,
            displayName: firestoreData.name || firebaseUser.displayName || "User",
            username: firestoreData.username || firebaseUser.email?.split("@")[0] || "user",
            email: firestoreData.email || firebaseUser.email || "",
            bio: firestoreData.bio || "Music lover 🎵",
            avatar: firestoreData.profileImageURL || firebaseUser.photoURL || "",
            coverImage: "",
            location: "",
            website: "",
            isVerified: firestoreData.verified || firebaseUser.emailVerified || false,
            isArtist: false,
            joinedDate: firestoreData.createdAt
              ? new Date(firestoreData.createdAt.seconds * 1000)
              : new Date(),
            socialLinks: {
              instagram: "",
              twitter: "",
              youtube: "",
            },
            stats: {
              followers: 0,
              following: 0,
              totalPlays: 0,
              totalTracks: 0,
              totalPlaylists: 0,
              monthlyListeners: 0,
            },
            badges: [],
            // Additional signup data from Firestore
            dateOfBirth: firestoreData.dob,
            gender: firestoreData.gender,
            phone: firestoreData.phone,
          };

          setProfile(firestoreProfile);
          console.log("✅ Profile loaded from Firestore:", firestoreProfile);

          // Update edit form
          setEditForm({
            displayName: firestoreProfile.displayName,
            username: firestoreProfile.username,
            bio: firestoreProfile.bio,
            location: firestoreProfile.location,
            socialLinks: firestoreProfile.socialLinks,
          });

          setLoading(false);
          return;
        }
      } catch (firestoreError) {
        console.warn("⚠️ Firestore fetch failed:", firestoreError);
      }

      // If all data sources fail, create basic profile from Firebase user data
      const firebaseProfile: UserProfile = {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || "User",
        username: firebaseUser.email?.split("@")[0] || "user",
        email: firebaseUser.email || "",
        bio: "Music lover using Firebase authentication 🎵",
        avatar: firebaseUser.photoURL || "",
        coverImage: "",
        location: "",
        website: "",
        isVerified: firebaseUser.emailVerified || false,
        isArtist: false,
        joinedDate: new Date(),
        socialLinks: {
          instagram: "",
          twitter: "",
          youtube: "",
        },
        stats: {
          followers: 0,
          following: 0,
          totalPlays: 0,
          totalTracks: 0,
          totalPlaylists: 0,
          monthlyListeners: 0,
        },
        badges: [],
      };

      setProfile(firebaseProfile);
      console.log("✅ Profile created from Firebase user:", firebaseProfile);

      // Update edit form with Firebase data
      setEditForm({
        displayName: firebaseProfile.displayName,
        username: firebaseProfile.username,
        bio: firebaseProfile.bio,
        location: firebaseProfile.location,
        socialLinks: firebaseProfile.socialLinks,
      });

    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      toast({
        title: "Failed to load profile",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data when Firebase user is available
  useEffect(() => {
    if (!firebaseLoading) {
      fetchProfile();
    }
  }, [firebaseUser, firebaseLoading]);

  const formatNumber = (num: number | undefined | null) => {
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
    if (!profile || !firebaseUser) return;

    try {
      setUploading(true);

      // Use Firebase updateUserProfile function
      const result = await updateUserProfile(firebaseUser.uid, {
        name: editForm.displayName,
        username: editForm.username,
        bio: editForm.bio,
        location: editForm.location,
      });

      if (result.success) {
        // Update local state with saved data
        const updatedProfile = {
          ...profile,
          displayName: editForm.displayName,
          username: editForm.username,
          bio: editForm.bio,
          location: editForm.location,
          socialLinks: {
            instagram: editForm.socialLinks.instagram || "",
            twitter: editForm.socialLinks.twitter || "",
            youtube: editForm.socialLinks.youtube || "",
          },
        };

        setProfile(updatedProfile);

        // Update localStorage with new profile data
        const localUserData = localStorage.getItem('currentUser');
        if (localUserData) {
          try {
            const userData = JSON.parse(localUserData);
            const updatedUserData = {
              ...userData,
              name: editForm.displayName,
              username: editForm.username,
              bio: editForm.bio,
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
            console.log('💾 Updated localStorage with new profile data');
          } catch (error) {
            console.warn('⚠️ Failed to update localStorage:', error);
          }
        }

        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        });

        console.log("✅ Profile updated successfully");
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
        setProfile((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
        setUploading(false);
        toast({
          title: "Profile Image Updated",
          description: "Your profile image has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
  if (firebaseLoading || loading || !profile) {
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
              {firebaseUser && (
                <p className="text-xs text-muted-foreground mt-2">
                  🔥 Signed in as {firebaseUser.email}
                </p>
              )}
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
              onClick={() => {
                setLoading(true);
                fetchProfile();
                toast({
                  title: "Profile refreshed",
                  description: "Loading latest profile data",
                });
              }}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-foreground animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
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
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Profile Info */}
          <div className="px-3 relative z-10 mt-4">
            {/* Avatar */}
            <div className="flex items-end justify-between mb-2">
              <div className="relative">
                <img
                  src={profile.avatar || `https://via.placeholder.com/64?text=${profile.displayName.charAt(0)}`}
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
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all border border-border min-w-[90px] ${
                      isFollowing
                        ? "bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isFollowing ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      <span>{isFollowing ? "Following" : "Follow"}</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/messages', { state: { from: 'profile' } })}
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
                  <p className="text-xs text-foreground leading-relaxed mb-2">
                    {profile.bio}
                  </p>

                  {/* Additional Profile Info from Signup */}
                  {(profile.gender || profile.dateOfBirth) && (
                    <div className="bg-card/50 rounded-lg p-2 mb-2 border border-border/50">
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">
                        Profile Details
                      </p>
                      <div className="space-y-1">
                        {profile.gender && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Gender:</span>
                            <span className="text-[10px] text-foreground">{profile.gender}</span>
                          </div>
                        )}
                        {profile.dateOfBirth && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Age:</span>
                            <span className="text-[10px] text-foreground">
                              {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()}
                            </span>
                          </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Phone:</span>
                            <span className="text-[10px] text-foreground">
                              {profile.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location and Website */}
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(profile.joinedDate)}</span>
                    </div>
                  </div>
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
                  <p className="text-[10px] text-muted-foreground">
                    Total Plays
                  </p>
                </motion.button>
              </div>
            )}

            {/* Recent Activity */}
            {!isEditing && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
                  <Music className="w-4 h-4 mr-2 text-purple-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  {recentlyPlayed.slice(0, 3).map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">
                          {track.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {track.playedAt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
    </div>
  );
}
