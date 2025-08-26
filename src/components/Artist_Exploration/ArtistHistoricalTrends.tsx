import React, { useEffect, useState } from 'react';
import { SpotifyArtist } from '../../types/Artist_Exploration/artist';
import { User } from '@supabase/supabase-js';
import { getArtistExplorationScoreFromSupabase } from '../../lib/supabaseArtistData';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  artist: SpotifyArtist;
  token: string; // Not directly used here, but kept for consistency if needed later
  user: User;
}

interface HistoricalScoreData {
  score: number;
  timestamp: string;
}

export function ArtistHistoricalTrends({ artist, user }: Props) {
  const [historicalData, setHistoricalData] = useState<HistoricalScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          throw new Error('User not authenticated.');
        }

        const artistScoreWithHistory = await getArtistExplorationScoreFromSupabase(user.id, artist.id);

        if (artistScoreWithHistory && artistScoreWithHistory.history) {
          // Format data for Recharts
          const formattedData = artistScoreWithHistory.history.map(entry => ({
            score: entry.score,
            timestamp: new Date(entry.timestamp).toLocaleDateString(), // Format date for display
          }));
          setHistoricalData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load historical data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [artist.id, user]);

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Loading historical trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <p className="text-gray-600">No historical data available for this artist.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg mt-4 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{artist.name} Exploration History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={historicalData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
          <XAxis dataKey="timestamp" stroke="#888888" className="dark:stroke-gray-400" />
          <YAxis stroke="#888888" className="dark:stroke-gray-400" />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="score" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}