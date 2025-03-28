import React from 'react';
import { Music } from 'lucide-react';
import { useSpotifyAuthBridge } from '../lib/spotifyAuth';

export function SpotifyLoginButton() {
  const spotifyAuth = useSpotifyAuthBridge();

  const handleLogin = async () => {
    try {
      await spotifyAuth.authenticate();
    } catch (error) {
      console.error('Failed to authenticate with Spotify:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center space-x-2 rounded-lg bg-[#1DB954] px-6 py-3 text-white transition-colors hover:bg-[#1ed760]"
    >
      <Music className="h-5 w-5" />
      <span>Connect with Spotify</span>
    </button>
  );
} 