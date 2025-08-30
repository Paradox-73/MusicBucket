import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyAddition {
  month: string;
  count: number;
}

interface LibraryGrowthChartProps {
  data: MonthlyAddition[];
}

export const LibraryGrowthChart: React.FC<LibraryGrowthChartProps> = ({ data }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">Your Library Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              borderColor: '#00cccc'
            }} 
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#800080" 
            strokeWidth={2} 
            name="Tracks Added" 
            activeDot={{ r: 8, stroke: '#00cccc', strokeWidth: 2, fill: '#800080' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};