import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="w-20 h-20 flex-none flex flex-col items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse">
      {/* Placeholder for image */}
      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
      {/* Placeholder for text */}
      <div className="w-12 h-3 bg-gray-300 dark:bg-gray-600 rounded mt-1"></div>
    </div>
  );
};

export default SkeletonCard;