import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Exploration_Score/spotify';
import { useSpotifyAuthBridge } from '../../lib/spotifyAuth';
import { SpotifyAuth } from '../../lib/spotify/auth';

export const UserProfile: React.FC = () => {
  const spotifyAuth = SpotifyAuth.getInstance();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getCurrentUser();
      return response.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load user profile" />;
  if (!userData) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center gap-4">
        {userData.images?.[0] && (
          <img
            src={userData.images[0].url}
            alt={userData.display_name}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{userData.display_name}</h2>
          <p className="text-gray-600">{userData.email}</p>
        </div>
      </div>
    </div>
  );
};