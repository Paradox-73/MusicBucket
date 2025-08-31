import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyAddition {
  month: string;
  count: number;
}

interface LibraryGrowthChartProps {
  data: MonthlyAddition[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-md shadow-lg">
        <p className="font-bold">{label}</p>
        <p>{`${payload[0].value} tracks added`}</p>
        
      </div>
    );
  }

  return null;
};

export const LibraryGrowthChart: React.FC<LibraryGrowthChartProps> = ({ data }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">Your Library Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#800080" 
            strokeWidth={2} 
            name="Tracks Added" 
            activeDot={{ r: 8, stroke: '#00FFFF', strokeWidth: 2, fill: '#fff' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};