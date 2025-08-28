import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SavedTrack {
  track: Track;
}

interface Track {
  album: {
    release_date: string;
  };
}

interface DecadeData {
  name: string;
  count: number;
}

const getDecade = (year: number) => {
  return `${Math.floor(year / 10) * 10}s`;
};

const calculateDecadeData = (tracks: SavedTrack[]): DecadeData[] => {
  if (!tracks) return [];

  const decadeCounts: { [key: string]: number } = {};

  tracks.forEach(item => {
    if (item.track && item.track.album && item.track.album.release_date) {
      const year = new Date(item.track.album.release_date).getFullYear();
      if (!isNaN(year)) {
        const decade = getDecade(year);
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }
    }
  });

  return Object.entries(decadeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

interface DecadeChartProps {
  tracks: SavedTrack[];
}

export const DecadeChart: React.FC<DecadeChartProps> = ({ tracks }) => {
  const decadeData = calculateDecadeData(tracks);

  if (decadeData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Music by Decade</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={decadeData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderColor: '#00cccc'
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Number of Songs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
