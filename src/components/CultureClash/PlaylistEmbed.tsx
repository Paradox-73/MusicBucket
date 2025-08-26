import React from 'react';
import { Playlist } from '../../types/cultureClash';

interface PlaylistEmbedProps {
  playlist: Playlist;
}

export const PlaylistEmbed: React.FC<PlaylistEmbedProps> = ({ playlist }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-3 shadow-md">
      <h4 className="text-lg font-semibold mb-2 text-blue-300">{playlist.name}</h4>
      <iframe
        src={playlist.spotifyEmbedUrl}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={playlist.name}
        className="rounded-md"
      ></iframe>
    </div>
  );
};
