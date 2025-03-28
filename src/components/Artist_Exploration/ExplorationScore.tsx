import React, { useEffect, useState } from 'react';
import { SpotifyArtist } from '../../types/Artist_Exploration/artist';
import { getArtistAllTracks, getLikedTracks } from '../../lib/Artist_Exploration/spotify';
import { calculateMetrics } from '../../utils/Artist_Exploration/metrics';
import { Loader2, Info, AlertCircle } from 'lucide-react';
import { SongWeightDetails } from '../../utils/Artist_Exploration/weights/songWeight';

interface Props {
  artist: SpotifyArtist;
  token: string;
}

export function ExplorationScore({ artist, token }: Props) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [artistTracks, likedTracks] = await Promise.all([
          getArtistAllTracks(artist.id, token),
          getLikedTracks(token),
        ]);

        if (!artistTracks || !likedTracks) {
          throw new Error('Failed to fetch required data');
        }

        const calculatedMetrics = calculateMetrics(artistTracks, likedTracks, artist.id);
        setMetrics(calculatedMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError(error instanceof Error ? error.message : 'Failed to calculate metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artist.id, token]);

  if (loading) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Calculating your exploration score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-yellow-600" />
        <p className="mt-2 text-gray-600">No data available for this artist</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-4">
        {artist.images?.[0] && (
          <img
            src={artist.images[0].url}
            alt={artist.name}
            className="w-24 h-24 rounded-full"
          />
        )}
      </div>
      <h2 className="mb-4 text-2xl font-bold text-center text-gray-900">
        {artist.name}
      </h2>
      
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-green-600">
            {metrics.score?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500">Exploration Score</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Listened Songs</div>
            <div className="text-lg font-semibold">
              {metrics.likedTracks?.length || 0} / {metrics.totalTracks || 0} tracks
              <span className="text-sm text-gray-500 ml-2">
                ({metrics.details?.listenedPercentage || 0}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Average Song Popularity</div>
            <div className="text-lg font-semibold">
              {metrics.details?.avgPopularity || 0}/100
              <span className="text-sm text-gray-500 ml-2">
                (lower means more deep cuts)
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Started Listening</div>
            <div className="text-lg font-semibold">
              {metrics.details?.formattedEarliestListen || 'N/A'}
              <span className="text-sm text-gray-500 ml-2">
                (first saved track)
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <Info className="w-4 h-4" />
            {showDetails ? 'Hide' : 'Show'} Detailed Weights
          </button>

          {showDetails && metrics.songWeights && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-700">Song Weights:</div>
              <div className="max-h-60 overflow-y-auto">
                {metrics.songWeights.map((weight: SongWeightDetails) => (
                  <div key={weight.songId} className="text-sm p-2 hover:bg-gray-50">
                    <div className="font-medium">{weight.name}</div>
                    <div className="text-gray-500 text-xs">
                      Base: {weight.baseWeight.toFixed(4)} × 
                      Pop: {weight.popularityWeight.toFixed(2)} × 
                      Time: {weight.recencyWeight.toFixed(2)} = 
                      <span className="font-medium text-green-600">
                        {' '}{weight.totalWeight.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}