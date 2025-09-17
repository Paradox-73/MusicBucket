import React from 'react';
import { motion } from 'framer-motion';

interface DataOrbProps {
  title: string;
  summary: string;
  onClick: () => void;
  icon?: React.ReactNode; // Optional icon
}

export const DataOrb: React.FC<DataOrbProps> = ({ title, summary, onClick, icon }) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer aspect-square"
      style={{ minWidth: '150px', minHeight: '150px' }} // Ensure a minimum size for the orb
    >
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      <h3 className="text-xl font-semibold text-center mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{summary}</p>
    </motion.div>
  );
};
