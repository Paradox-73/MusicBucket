import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useSpotifyStore } from '../../store/Bucket_List/spotify';
import { SpotifyItem } from '../../types/Bucket_List/spotify';
import { getTrack } from '../../lib/spotify';

export function SearchResults() {
  const searchResults = useSpotifyStore((state) => state.searchResults);
  const addItem = useSpotifyStore((state) => state.addItem);
  const items = useSpotifyStore((state) => state.items);
  const searchQuery = useSpotifyStore((state) => state.searchQuery);

  const handleAdd = async (item: SpotifyItem) => {
    if (items.some((existing) => existing.spotify_id === item.id)) {
      return; // Prevent adding duplicates
    }
    
    // Immediately add the item that was clicked
    addItem(item);

    // If the item is a track, ask to add the album
    if (item.type === 'track') {
      const trackDetails = await getTrack(item.id);
      if (trackDetails && trackDetails.album) {
        const album = trackDetails.album;
        toast(`'${item.name}' added to your bucket.`, {
          action: {
            label: `Add '${album.name}' album too?`,
            onClick: () => {
              const albumItem: SpotifyItem = {
                id: album.id,
                type: 'album',
                name: album.name,
                imageUrl: album.images[0]?.url || '',
                artists: album.artists.map(a => a.name),
              };
              addItem(albumItem);
              toast(`'${album.name}' was added to your bucket.`);
            },
          },
        });
      }
    }
  };

  if (searchResults.length === 0) {
    return null;
  }

  // Client-side sorting based on search query relevance
  const sortedSearchResults = [...searchResults].sort((a, b) => {
    const query = searchQuery.toLowerCase();
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    // Exact match
    if (nameA === query && nameB !== query) return -1;
    if (nameA !== query && nameB === query) return 1;

    // Starts with
    if (nameA.startsWith(query) && !nameB.startsWith(query)) return -1;
    if (!nameA.startsWith(query) && nameB.startsWith(query)) return 1;

    // Includes
    if (nameA.includes(query) && !nameB.includes(query)) return -1;
    if (!nameA.includes(query) && nameB.includes(query)) return 1;

    // Fallback to alphabetical if no specific match
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="space-y-2">
      {sortedSearchResults.map((item) => {
        const isInBucketlist = items.some((existing) => existing.spotify_id === item.id);
        
        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', JSON.stringify(item));
            }}
            className="group relative flex items-center space-x-4 rounded-xl bg-white/5 p-3 shadow-sm transition-all hover:bg-white/10 cursor-grab"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className={`h-12 w-12 flex-shrink-0 rounded-md object-cover ${item.type === 'artist' ? 'rounded-full' : ''}`}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-white">{item.name}</h3>
              {item.artists && (
                <p className="text-sm text-gray-400 truncate">
                  {item.artists.join(', ')}
                </p>
              )}
            </div>
            <button
              onClick={() => handleAdd(item)}
              disabled={isInBucketlist}
              className={`rounded-full p-2 transition-colors ${isInBucketlist
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-purple-500/20 hover:text-purple-400'
                }`}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
