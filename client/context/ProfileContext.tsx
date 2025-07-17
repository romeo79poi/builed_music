import React, { createContext, useContext, useState, ReactNode } from "react";

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
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    username: "biospectra",
    displayName: "Bio Spectra",
    bio: "Music lover 🎵 | Producer | Always discovering new sounds ✨",
    profilePicture: "",
    email: "bio.spectra@musiccatch.com",
    joinDate: "2023-01-15",
    isVerified: true,
    followers: 1248,
    following: 567,
    likedSongs: ["1", "2", "3", "4", "5"],
    recentlyPlayed: ["1", "2", "3"],
    playlists: [
      {
        id: "1",
        name: "My Vibes",
        description: "Songs that match my mood",
        coverImage:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        songs: ["1", "2", "3"],
        isPublic: true,
        createdAt: "2023-12-01",
      },
      {
        id: "2",
        name: "Late Night Sessions",
        description: "Perfect for coding and creating",
        coverImage:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        songs: ["4", "5", "6"],
        isPublic: false,
        createdAt: "2023-11-15",
      },
    ],
    musicPreferences: {
      favoriteGenres: ["Electronic", "Indie", "Alternative", "Lo-fi"],
      favoriteArtists: ["The Weeknd", "Daft Punk", "Tame Impala", "ODESZA"],
      mood: "Chill",
      language: ["English", "French"],
    },
    socialLinks: {
      instagram: "@biospectra",
      twitter: "@biospectramusic",
      spotify: "biospectra",
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

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
