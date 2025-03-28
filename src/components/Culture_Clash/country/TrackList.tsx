import React from 'react';
import { Music } from 'lucide-react';
import type { SpotifyApi } from '@spotify/web-api-ts-sdk';

interface TrackListProps {
  tracks: SpotifyApi.TrackObjectFull[];
}

export function TrackList({ tracks }: TrackListProps) {
  return (
    <div className="bg-black/80 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Music className="text-[#00CCCC]" />
        Popular Tracks
      </h2>
      <div className="space-y-4">
        {tracks.map(track => (
          <div key={track.id} className="flex items-center gap-4">
            <img 
              src={track.album.images[0]?.url} 
              alt={track.name}
              className="w-16 h-16"
            />
            <div>
              <h3 className="text-white font-semibold">{track.name}</h3>
              <p className="text-[#00CCCC] text-sm">
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}