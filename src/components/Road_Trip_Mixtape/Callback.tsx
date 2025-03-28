import { useEffect } from 'react';
import { handleCallback } from '../../services/Road_Trip_Mixtape/auth';

export const Callback = () => {
  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Connecting to Spotify...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}; 