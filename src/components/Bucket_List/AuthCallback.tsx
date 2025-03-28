import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotifyAuth } from '../../lib/Bucket_List/spotify/auth';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Authentication error:', error);
        navigate('/', { replace: true });
        return;
      }

      if (code) {
        try {
          const auth = SpotifyAuth.getInstance();
          await auth.handleCallback(code);
          // Force a reload to ensure all components pick up the new auth state
          window.location.href = '/';
        } catch (err) {
          console.error('Error handling callback:', err);
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 h-12 w-12"></div>
        <p className="text-gray-600">Connecting to Spotify...</p>
      </div>
    </div>
  );
}