import React from 'react';
import { Music } from 'lucide-react';
import { SpotifyAuth } from '../lib/spotify/auth';

export function SpotifyLoginButton() {
  const handleLogin = async () => {
    try {
      const auth = SpotifyAuth.getInstance();
      await auth.authenticate();
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
