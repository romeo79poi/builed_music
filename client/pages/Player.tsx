import React from "react";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "../components/SpotifyPlayer";
import { useEnhancedMusic } from "../context/EnhancedMusicContext";

export default function Player() {
  const navigate = useNavigate();
  const { audioState, playlists } = useEnhancedMusic();

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <SpotifyPlayer
      currentSong={audioState.currentSong || undefined}
      playlist={audioState.currentPlaylist?.songs || playlists[0]?.songs || []}
      onClose={handleClose}
      className="h-screen"
    />
  );
}
