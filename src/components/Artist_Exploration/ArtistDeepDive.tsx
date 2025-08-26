import React, { useEffect, useState } from 'react';
import { SpotifyArtist } from '../../types/Artist_Exploration/artist';
import { User } from '@supabase/supabase-js';
import {
  getArtistTopTracks,
  getArtistAlbums,
  getRelatedArtists,
} from '../../lib/Artist_Exploration/spotify';
import { Loader2, AlertCircle } from 'lucide-react';
import { SpotifyTrack } from '../../types/Artist_Exploration/spotify';

interface Props {
  artist: SpotifyArtist;
  token: string;
  user: User;
}

export function ArtistDeepDive({ artist, token, user }: Props) {
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [albums, setAlbums] = useState<any[]>([]); // SpotifyAlbum type could be defined
  const [relatedArtists, setRelatedArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          throw new Error('User not authenticated.');
        }

        const [fetchedTopTracks, fetchedAlbums, fetchedRelatedArtists] = await Promise.all([
          getArtistTopTracks(artist.id, token),
          getArtistAlbums(artist.id, token),
          getRelatedArtists(artist.id, token),
        ]);

        setTopTracks(fetchedTopTracks);
        setAlbums(fetchedAlbums);
        setRelatedArtists(fetchedRelatedArtists);

      } catch (err) {
        console.error('Error fetching deep dive data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deep dive data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artist.id, token, user]);

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Loading deep dive data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg mt-4 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{artist.name} Deep Dive</h3>

      {topTracks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Top Tracks</h4>
          <ul className="space-y-2">
            {topTracks.map(track => (
              <li key={track.id} className="flex items-center space-x-3">
                {track.album?.images?.[0] && (
                  <img src={track.album.images[0].url} alt={track.name} className="w-10 h-10 rounded" />
                )}
                <span className="text-gray-700 dark:text-gray-300">{track.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {albums.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Albums</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map(album => (
              <div key={album.id} className="flex flex-col items-center text-center">
                {album.images?.[0] && (
                  <img src={album.images[0].url} alt={album.name} className="w-24 h-24 rounded shadow-md" />
                )}
                <p className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">{album.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{album.release_date.substring(0, 4)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {relatedArtists.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Related Artists</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedArtists.map(relatedArtist => (
              <div key={relatedArtist.id} className="flex flex-col items-center text-center">
                {relatedArtist.images?.[0] && (
                  <img src={relatedArtist.images[0].url} alt={relatedArtist.name} className="w-20 h-20 rounded-full shadow-md" />
                )}
                <p className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">{relatedArtist.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}