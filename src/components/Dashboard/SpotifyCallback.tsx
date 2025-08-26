import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAccessToken } from '../../lib/Dashboard/spotify';
import { useAuthStore } from '../../store/Dashboard/authStore';

export const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        toast.error('Failed to connect to Spotify');
        navigate('/');
        return;
      }

      if (!code) {
        toast.error('No authorization code received');
        navigate('/');
        return;
      }

      try {
        const data = await getAccessToken(code);
        setTokens(data.access_token, data.refresh_token, data.expires_in);
        toast.success('Successfully connected to Spotify');
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setTokens]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Connecting to Spotify...</h2>
        {/* Add a loading spinner here */}
      </div>
    </div>
  );
};
