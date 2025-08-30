import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PlaylistData {
  id: string;
  name: string;
  trackCount: number;
  avgPopularity: number;
  avgReleaseYear: number;
  avgDurationMin: string;
}

interface PlaylistPieChartProps {
  data: PlaylistData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2', '#00CED1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
        <p className="label text-lg font-bold mb-2">{`${data.name}`}</p>
        <p className="intro text-sm">Total Tracks: {data.trackCount}</p>
        <p className="intro text-sm">Avg. Popularity: {data.avgPopularity}</p>
        <p className="intro text-sm">Avg. Release Year: {data.avgReleaseYear}</p>
        <p className="intro text-sm">Avg. Song Length: {data.avgDurationMin}</p>
      </div>
    );
  }
  return null;
};

export const PlaylistPieChart: React.FC<PlaylistPieChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Library Composition by Playlist</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="trackCount"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
