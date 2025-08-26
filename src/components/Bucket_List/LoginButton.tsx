import React from 'react';
import { Music } from 'lucide-react';
import { SpotifyAuth } from '../../lib/spotify/auth';

export function LoginButton() {
    const handleLogin = async () => {

    const auth = SpotifyAuth.getInstance();
    await auth.authenticate();
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center space-x-2 rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
    >
      <Music className="h-5 w-5" />
      <span>Connect with Spotify</span>
    </button>
  );
}
