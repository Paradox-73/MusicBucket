import React from 'react';
import { SpotifyAuth } from '../../lib/spotify/auth';

export const LoginButton: React.FC = () => {
  const handleLogin = async () => {
    const auth = SpotifyAuth.getInstance();
    await auth.authenticate();
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    >
      Connect Spotify
    </button>
  );
};
