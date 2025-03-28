import React from 'react';
import { LogIn } from 'lucide-react';
import { loginWithSpotify } from '../../lib/Artist_Exploration/spotify';

export function SpotifyLogin() {
  const handleLogin = async () => {
    try {
      await loginWithSpotify();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <LogIn className="w-5 h-5" />
      Login with Spotify
    </button>
  );
}