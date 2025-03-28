import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotifyAuth } from '../lib/spotify/auth';

export const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const spotifyAuth = SpotifyAuth.getInstance();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (accessToken && expiresIn) {
          // Store the token with expiration
          spotifyAuth.setToken(accessToken, parseInt(expiresIn));
          
          // Redirect back to home page
          navigate('/');
        } else {
          console.error('No access token or expiration received');
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling Spotify callback:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connecting to Spotify...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}; 