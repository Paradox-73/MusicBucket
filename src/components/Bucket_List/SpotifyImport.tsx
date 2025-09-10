import React, { useState, useEffect } from 'react';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { getUserPlaylists, getPlaylistTracks, getSavedTracks } from '../../lib/spotify';

const SpotifyImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const { addItem, currentListId } = useSpotifyStore();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await getUserPlaylists();
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    if (isModalOpen) {
      fetchPlaylists();
    }
  }, [isModalOpen]);

  const handleImportPlaylist = async (playlistId: string) => {
    try {
      const tracks = await getPlaylistTracks(playlistId);
      tracks.forEach(track => {
        const item = {
          id: track.track.id,
          name: track.track.name,
          imageUrl: track.track.album.images[0]?.url,
          artists: track.track.artists.map(artist => artist.name),
          type: 'track' as const,
        };
        addItem(item);
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error importing playlist tracks:', error);
    }
  };

  const handleImportLikedSongs = async () => {
    try {
      const tracks = await getSavedTracks();
      tracks.forEach(track => {
        const item = {
          id: track.track.id,
          name: track.track.name,
          imageUrl: track.track.album.images[0]?.url,
          artists: track.track.artists.map(artist => artist.name),
          type: 'track' as const,
        };
        addItem(item);
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error importing liked songs:', error);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700">
        Import from Spotify
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold">Import from Spotify</h2>
            <div className="space-y-2">
              <button onClick={handleImportLikedSongs} className="w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                Import Liked Songs
              </button>
              <hr className="my-2" />
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {playlists.map(playlist => (
                  <li key={playlist.id}>
                    <button onClick={() => handleImportPlaylist(playlist.id)} className="w-full rounded-md bg-gray-200 px-4 py-2 text-left text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                      {playlist.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 rounded-md bg-gray-400 px-3 py-1 text-sm text-white hover:bg-gray-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyImport;
