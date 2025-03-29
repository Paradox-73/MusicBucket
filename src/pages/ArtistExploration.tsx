import React, { useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { ArtistSearch } from '../components/Artist_Exploration/ArtistSearch';
import { ExplorationScore } from '../components/Artist_Exploration/ExplorationScore';
import { ArtistRankings } from '../components/Artist_Exploration/ArtistRankings';
import { SpotifyLogin } from '../components/Artist_Exploration/SpotifyLogin';
import { getAccessToken } from '../lib/Artist_Exploration/spotify';
import { SpotifyArtist } from '../types/Artist_Exploration/spotify';

const ArtistExploration = () => {
  const [token, setToken] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          setToken(accessToken);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 h-12 w-12"></div>
          <p className="text-gray-600">Checking Spotify authentication...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Music className="w-12 h-12 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Artist Explorer
              </h1>
              <p className="mt-2 text-gray-600">
                Discover how deep you've explored your favorite artists
              </p>
            </div>
            <SpotifyLogin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Music className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Artist Explorer
            </h1>
            <p className="mt-2 text-gray-600">
              Discover how deep you've explored your favorite artists
            </p>
          </div>

          <ArtistSearch token={token} onArtistSelect={setSelectedArtist} />

          {selectedArtist && <ExplorationScore artist={selectedArtist} token={token} />}
          
          <ArtistRankings />
        </div>
      </div>
    </div>
  );
}

export default ArtistExploration;