import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotifyAuth } from '../../lib/spotify/auth';

export function AuthCallback() {
  const navigate = useNavigate(); //hello

  useEffect(() => {
    const auth = SpotifyAuth.getInstance();
    const token = new URLSearchParams(window.location.hash).get('access_token');
    if (token) {
      auth.setToken(token, 3600); // Assuming the token expires in 3600 seconds
      navigate('/'); // Redirect to home or another page after successful login
    }
  }, [navigate]);


  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 h-12 w-12"></div>
        <p className="text-gray-600 dark:text-gray-300">Connecting to Spotify...</p>
      </div>
    </div>
  );
}
