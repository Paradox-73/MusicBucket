import React from 'react';
import { Users } from 'lucide-react';
import type { SpotifyApi } from '@spotify/web-api-ts-sdk';

interface ArtistListProps {
  artists: SpotifyApi.ArtistObjectFull[];
}

export function ArtistList({ artists }: ArtistListProps) {
  return (
    <div className="bg-black/80 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="text-[#00CCCC]" />
        Top Artists
      </h2>
      <div className="space-y-4">
        {artists.map(artist => (
          <div key={artist.id} className="flex items-center gap-4">
            <img 
              src={artist.images[0]?.url} 
              alt={artist.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-white font-semibold">{artist.name}</h3>
              <p className="text-[#00CCCC] text-sm">
                {artist.genres.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}