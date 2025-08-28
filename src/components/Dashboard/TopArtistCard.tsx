import React from 'react';
import { motion } from 'framer-motion';

interface Artist {
  id: string;
  name: string;
  images?: { url: string }[];
  external_urls: { spotify: string };
}

interface TopArtistCardProps {
  artist: Artist;
  rank: number;
}

export const TopArtistCard: React.FC<TopArtistCardProps> = ({ artist, rank }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.a
      href={artist.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{rank}</div>
      <img 
        src={artist.images?.[0]?.url || 'https://via.placeholder.com/64'}
        alt={artist.name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div className="overflow-hidden">
        <div className="font-bold truncate">{artist.name}</div>
      </div>
    </motion.a>
  );
};
