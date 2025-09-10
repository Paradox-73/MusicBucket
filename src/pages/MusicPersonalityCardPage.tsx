import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTopArtists, getTopTracks, getAudioFeatures } from '../lib/spotify';
import { useSpotifyStore } from '../store/Bucket_List/spotify';

interface MusicPersonality {
  topGenres: { genre: string; count: number }[];
  topArtists: { name: string; popularity: number }[];
  audioFeatures: { danceability: number; energy: number; valence: number; acousticness: number; instrumentalness: number; loudness: number; tempo: number };
}

export function MusicPersonalityCardPage() {
  const { user } = useAuth();
  const { items } = useSpotifyStore();
  const [personality, setPersonality] = useState<MusicPersonality | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeMusicPersonality = async () => {
      if (user) {
        setLoading(true);
        try {
          const topArtists = await getTopArtists();
          const topTracks = await getTopTracks();

          // Analyze genres
          const genreCounts: { [key: string]: number } = {};
          topArtists.forEach(artist => {
            artist.genres.forEach(genre => {
              genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
          });
          const topGenres = Object.entries(genreCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([genre, count]) => ({ genre, count }));

          // Analyze audio features from top tracks
          const trackIds = topTracks.map(track => track.id);
          const audioFeatures = await getAudioFeatures(trackIds);

          const avgFeatures = {
            danceability: 0,
            energy: 0,
            valence: 0,
            acousticness: 0,
            instrumentalness: 0,
            loudness: 0,
            tempo: 0,
          };

          if (audioFeatures.length > 0) {
            audioFeatures.forEach(features => {
              if (features) {
                avgFeatures.danceability += features.danceability;
                avgFeatures.energy += features.energy;
                avgFeatures.valence += features.valence;
                avgFeatures.acousticness += features.acousticness;
                avgFeatures.instrumentalness += features.instrumentalness;
                avgFeatures.loudness += features.loudness;
                avgFeatures.tempo += features.tempo;
              }
            });

            for (const key in avgFeatures) {
              // @ts-ignore
              avgFeatures[key] /= audioFeatures.length;
            }
          }

          setPersonality({
            topGenres: topGenres.slice(0, 5), // Top 5 genres
            topArtists: topArtists.map(artist => ({ name: artist.name, popularity: artist.popularity })).slice(0, 5), // Top 5 artists
            audioFeatures: avgFeatures,
          });

        } catch (error) {
          console.error('Error analyzing music personality:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    analyzeMusicPersonality();
  }, [user, items]);

  if (loading) {
    return <div className="text-center p-10">Analyzing your music personality...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Please log in to view your music personality card.</div>;
  }

  if (!personality) {
    return <div className="text-center p-10">Could not generate music personality card.</div>;
  }

  return (
    <div className="p-8 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Your Music Personality</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Top Genres:</h2>
          <ul className="list-disc list-inside">
            {personality.topGenres.map((g, index) => (
              <li key={index}>{g.genre} ({g.count})</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Top Artists:</h2>
          <ul className="list-disc list-inside">
            {personality.topArtists.map((a, index) => (
              <li key={index}>{a.name} (Popularity: {a.popularity})</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Average Audio Features:</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(personality.audioFeatures).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="font-semibold">{value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          This card is generated based on your Spotify listening data and bucket list items.
        </p>
      </div>
    </div>
  );
}
