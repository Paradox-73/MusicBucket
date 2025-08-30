import React from 'react';

interface ScopeSelectorProps {
  selectedScope: string;
  onScopeChange: (scope: string) => void;
}

const ScopeSelector: React.FC<ScopeSelectorProps> = ({ selectedScope, onScopeChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor="scope-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Scope:</label>
      <select
        id="scope-select"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={selectedScope}
        onChange={(e) => onScopeChange(e.target.value)}
      >
        <option value="artist">Artists</option>
        <option value="album">Albums</option>
        <option value="track">Tracks from Album</option>
      </select>
    </div>
  );
};

export default ScopeSelector;
// Added a comment to force recompile