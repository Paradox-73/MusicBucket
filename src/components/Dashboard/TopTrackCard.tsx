import React from 'react';
import { motion } from 'framer-motion';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images?: { url: string }[] };
  external_urls: { spotify: string };
}

interface TopTrackCardProps {
  track: Track;
  rank: number;
}

export const TopTrackCard: React.FC<TopTrackCardProps> = ({ track, rank }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.a
      href={track.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{rank}</div>
      <img 
        src={track.album.images?.[0]?.url || 'https://via.placeholder.com/64'}
        alt={track.name}
        className="w-16 h-16 rounded-md object-cover"
      />
      <div className="overflow-hidden">
        <div className="font-bold truncate">{track.name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{track.artists.map(a => a.name).join(', ')}</div>
      </div>
    </motion.a>
  );
};
