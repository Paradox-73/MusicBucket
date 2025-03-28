import React from 'react';
import { Music } from 'lucide-react';
import { SpotifyAuth } from '../../lib/Bucket_List/spotify/auth';

export function LoginButton() {
  const handleLogin = () => {
    const auth = SpotifyAuth.getInstance();
    window.location.href = auth.getLoginUrl();
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center space-x-2 rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
    >
      <Music className="h-5 w-5" />
      <span>Connect with Spotify</span>
    </button>
  );
}