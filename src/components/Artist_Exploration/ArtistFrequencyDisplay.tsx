import React from 'react';

interface ArtistFrequency {
  name: string;
  count: number;
}

interface ArtistFrequencyDisplayProps {
  topArtists: ArtistFrequency[];
  bottomArtists: ArtistFrequency[];
  averageFrequency: number;
  totalUniqueArtists: number;
}

export const ArtistFrequencyDisplay: React.FC<ArtistFrequencyDisplayProps> = ({
  topArtists,
  bottomArtists,
  averageFrequency,
  totalUniqueArtists,
}) => {
  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Artist Listening Habits</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Top 5 Most Listened Artists</h3>
          {topArtists.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {topArtists.map((artist, index) => (
                <li key={index}>{artist.name} ({artist.count} tracks)</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No data available.</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Bottom 5 Least Listened Artists</h3>
          {bottomArtists.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {bottomArtists.map((artist, index) => (
                <li key={index}>{artist.name} ({artist.count} tracks)</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No data available.</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Overall Statistics</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Total Unique Artists: <span className="font-medium">{totalUniqueArtists}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Average Tracks per Artist: <span className="font-medium">{averageFrequency.toFixed(2)}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            (Based on your liked songs)
          </p>
        </div>
      </div>
    </div>
  );
};