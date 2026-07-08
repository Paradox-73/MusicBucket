import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Small hook to play Spotify 30-second preview clips one at a time.
 * Playing a new track stops the previous one; toggling the current track stops
 * playback. Cleans up the audio element on unmount.
 */
export function usePreviewPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const toggle = useCallback(
    (id: string, previewUrl?: string) => {
      if (!previewUrl) return;
      if (playingId === id) {
        stop();
        return;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(previewUrl);
      audio.volume = 0.5;
      audio.onended = () => setPlayingId(null);
      audio.play().catch((err) => {
        console.error('Error playing preview:', err);
        setPlayingId(null);
      });
      audioRef.current = audio;
      setPlayingId(id);
    },
    [playingId, stop],
  );

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  return { playingId, toggle, stop };
}
