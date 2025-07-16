import React, { createContext, useContext, useState, ReactNode } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  image: string;
  duration: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setQueue: (songs: Song[]) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  nextSong: () => void;
  previousSong: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>({
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    duration: "3:20",
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(45);
  const [duration, setDuration] = useState(200);
  const [volume, setVolume] = useState(75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const nextSong = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(
        (song) => song.id === currentSong?.id,
      );
      const nextIndex = (currentIndex + 1) % queue.length;
      setCurrentSong(queue[nextIndex]);
      setCurrentTime(0);
    }
  };

  const previousSong = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(
        (song) => song.id === currentSong?.id,
      );
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
      setCurrentSong(queue[prevIndex]);
      setCurrentTime(0);
    }
  };

  const value: MusicContextType = {
    currentSong,
    isPlaying,
    queue,
    currentTime,
    duration,
    volume,
    isShuffle,
    isRepeat,
    setCurrentSong,
    setIsPlaying,
    togglePlay,
    setQueue,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    nextSong,
    previousSong,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};
