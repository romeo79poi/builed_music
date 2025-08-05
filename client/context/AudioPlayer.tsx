import { useEffect, useRef } from "react";
import { useMusic } from "./MusicContextSupabase";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, nextSong } = useMusic();

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			nextSong();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [nextSong]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.url;
		if (isSongChange) {
			audio.src = currentSong?.url || '';
			// reset the playback position
			audio.currentTime = 0;

			prevSongRef.current = currentSong?.url || null;

			if (isPlaying) audio.play();
		}

		// toggle playback based on the isPlaying state
		if (isPlaying && audio.paused) {
			audio.play();
		} else if (!isPlaying && !audio.paused) {
			audio.pause();
		}
	}, [currentSong, isPlaying]);

	return <audio ref={audioRef} style={{ display: "none" }} />;
};

export default AudioPlayer;
