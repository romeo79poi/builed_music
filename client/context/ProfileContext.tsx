import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { api } from "../lib/api";
import { useToast } from "../hooks/use-toast";

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  email: string;
  joinDate: string;
  isVerified: boolean;
  followers: number;
  following: number;
  likedSongs: string[];
  recentlyPlayed: string[];
  playlists: Playlist[];
  musicPreferences: MusicPreferences;
  socialLinks: SocialLinks;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  songs: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface MusicPreferences {
  favoriteGenres: string[];
  favoriteArtists: string[];
  mood: string;
  language: string[];
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  spotify?: string;
  appleMusic?: string;
}

interface ProfileContextType {
  profile: UserProfile;
  isEditing: boolean;
  editedProfile: Partial<UserProfile>;
  setProfile: (profile: UserProfile) => void;
  setIsEditing: (editing: boolean) => void;
  updateEditedProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: () => Promise<void>;
  cancelEditing: () => void;
  uploadProfilePicture: (file: File) => Promise<string>;
  addLikedSong: (songId: string) => void;
  removeLikedSong: (songId: string) => void;
  toggleLikedSong: (songId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    id: "user1",
    username: "biospectra",
    displayName: "Bio Spectra",
    bio: "Music lover 🎵 | Producer | Always discovering new sounds ✨",
    profilePicture: "",
    email: "bio.spectra@musiccatch.com",
    joinDate: "2023-01-15",
    isVerified: true,
    followers: 1248,
    following: 567,
    likedSongs: ["song1", "song2", "song3"],
    recentlyPlayed: ["song1", "song2", "song3"],
    playlists: [],
    musicPreferences: {
      favoriteGenres: ["Electronic", "Indie", "Alternative", "Lo-fi"],
      favoriteArtists: ["The Weeknd", "Daft Punk", "Tame Impala", "ODESZA"],
      mood: "Chill",
      language: ["English", "French"],
      autoPlay: true,
      crossfade: false,
      soundQuality: "high",
    },
    socialLinks: {
      instagram: "@biospectra",
      twitter: "@biospectramusic",
      spotify: "biospectra",
    },
    subscription: {
      plan: "premium",
      status: "active",
      startDate: "2023-01-15",
      features: [
        "Unlimited skips",
        "Ad-free listening",
        "High-quality audio",
        "Offline downloads",
      ],
      autoRenew: true,
    },
    settings: {
      theme: "dark",
      language: "en",
      notifications: {
        email: true,
        push: true,
        newFollowers: true,
        newMusic: true,
        recommendations: true,
        socialActivity: false,
      },
      privacy: {
        profileVisibility: "public",
        showRecentlyPlayed: true,
        showLikedSongs: true,
        showPlaylists: true,
        allowFollowers: true,
      },
      playback: {
        volume: 80,
        shuffle: false,
        repeat: "off",
        gaplessPlayback: true,
        normalization: true,
      },
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.profile.getProfile();
      if (response.success && response.profile) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEditedProfile = (updates: Partial<UserProfile>) => {
    setEditedProfile((prev) => ({ ...prev, ...updates }));
  };

  const saveProfile = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedProfile = { ...profile, ...editedProfile };
      setProfile(updatedProfile);
      setEditedProfile({});
      setIsEditing(false);

      // You would typically make an API call here
      console.log("Profile saved:", updatedProfile);
    } catch (error) {
      console.error("Failed to save profile:", error);
      throw error;
    }
  };

  const cancelEditing = () => {
    setEditedProfile({});
    setIsEditing(false);
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a URL for the uploaded file (in real app, this would be from your CDN)
      const imageUrl = URL.createObjectURL(file);

      updateEditedProfile({ profilePicture: imageUrl });

      return imageUrl;
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      throw error;
    }
  };

  const addLikedSong = (songId: string) => {
    if (!profile.likedSongs.includes(songId)) {
      const updatedLikedSongs = [...profile.likedSongs, songId];
      setProfile((prev) => ({ ...prev, likedSongs: updatedLikedSongs }));
    }
  };

  const removeLikedSong = (songId: string) => {
    const updatedLikedSongs = profile.likedSongs.filter((id) => id !== songId);
    setProfile((prev) => ({ ...prev, likedSongs: updatedLikedSongs }));
  };

  const toggleLikedSong = (songId: string) => {
    if (profile.likedSongs.includes(songId)) {
      removeLikedSong(songId);
    } else {
      addLikedSong(songId);
    }
  };

  const value: ProfileContextType = {
    profile,
    isEditing,
    editedProfile,
    setProfile,
    setIsEditing,
    updateEditedProfile,
    saveProfile,
    cancelEditing,
    uploadProfilePicture,
    addLikedSong,
    removeLikedSong,
    toggleLikedSong,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
