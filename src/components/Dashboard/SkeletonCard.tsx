import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-4 animate-pulse">
      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};
