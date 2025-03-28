import React from 'react';
import { getAuthUrl } from '../../lib/Exploration_Score/spotify';

export const LoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = getAuthUrl();
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