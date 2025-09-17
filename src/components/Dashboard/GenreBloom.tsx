import React from 'react';
import { motion } from 'framer-motion';
import { generatePalette } from '../../lib/utils/colorUtils';
import { useTheme } from '../../hooks/useTheme';

interface GenreBloomProps {
  genres: string[];
  onGenreClick: (genre: string) => void;
}

export const GenreBloom: React.FC<GenreBloomProps> = ({ genres, onGenreClick }) => {
  const { themeColor } = useTheme();
  const sonicPalette = generatePalette(themeColor || '#1DB954'); // Fallback to Spotify green

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.1,
      boxShadow: `0px 0px 12px 4px ${sonicPalette.accent1}80`,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 300,
      },
    },
    tap: { scale: 0.9 },
  };

  const getGenreSize = (index: number) => {
    if (index === 0) return 'w-32 h-32 text-xl';
    if (index === 1) return 'w-28 h-28 text-lg';
    if (index === 2) return 'w-24 h-24 text-md';
    return 'w-20 h-20 text-sm';
  };

  const getGenreColor = (index: number) => {
    const colors = [
      sonicPalette.primary,
      sonicPalette.complementary,
      sonicPalette.accent1,
      sonicPalette.accent2,
      sonicPalette.lighter,
      sonicPalette.darker,
    ];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      className="flex flex-wrap justify-center items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {genres.length > 0 ? (
        genres.map((genre, index) => (
          <motion.div
            key={genre}
            className={`flex items-center justify-center rounded-full cursor-pointer font-semibold text-white capitalize ${getGenreSize(index)}`}
            style={{ backgroundColor: getGenreColor(index) }}
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onGenreClick(genre)}
          >
            {genre}
          </motion.div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No genres to display.</p>
      )}
    </motion.div>
  );
};
