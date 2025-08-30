import React from 'react';
import { motion } from 'framer-motion';

interface SavedTrack {
  added_at: string;
  track: Track;
}

interface Track {
  id: string;
  name: string;
  artists: { id: string; name: string; }[];
  popularity: number;
  album: { release_date: string; };
  duration_ms: number;
}

interface Personality {
  title: string;
  description: string;
}

const getPersonality = (metrics: any): Personality => {
  if (metrics.avgPopularity < 30 && metrics.avgReleaseYear < 2000) return { title: 'The Underground Archivist', description: "You're a historian of the obscure, digging for gems that time forgot." };
  if (metrics.avgPopularity < 40) return { title: 'The Underground Vindicator', description: "You champion the unsung heroes of music. If it's not on the radio, it's on your playlist." };
  if (metrics.avgReleaseYear < 2005) return { title: 'The Archivist', description: "You're a musical historian with a love for the classics and timeless sounds." };
  if (metrics.artistDiversity > 70) return { title: 'The Explorer', description: "A sonic adventurer, you're constantly seeking new sounds and pushing boundaries." };
  if (metrics.artistDiversity < 20) return { title: 'The Specialist', description: "You're a connoisseur of your chosen sound, exploring its every nook and cranny." };
  return { title: 'The Trendsetter', description: "You've got your finger on the pulse, enjoying the most popular sounds of today." };
};

export const calculateMusicTasteMetrics = (tracks: SavedTrack[]) => {
  if (tracks.length === 0) return null;

  const totalTracks = tracks.length;
  const uniqueArtists = new Set(tracks.flatMap(item => item.track.artists.map(artist => artist.id)));
  const avgPopularity = tracks.reduce((sum, item) => sum + item.track.popularity, 0) / totalTracks;
  const avgReleaseYear = tracks.reduce((sum, item) => sum + new Date(item.track.album.release_date).getFullYear(), 0) / totalTracks;
  const artistDiversity = (uniqueArtists.size / totalTracks) * 100;
  
  const totalDurationMs = tracks.reduce((sum, item) => sum + (item.track.duration_ms || 0), 0);
  const avgDurationMs = totalDurationMs / totalTracks;

  const additionsByMonth: { [key: string]: number } = {};
  tracks.forEach(item => {
    const month = new Date(item.added_at).toISOString().slice(0, 7);
    additionsByMonth[month] = (additionsByMonth[month] || 0) + 1;
  });

  const monthlyAdditionsData = Object.entries(additionsByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalTracks,
    uniqueArtists: uniqueArtists.size,
    avgPopularity: Math.round(avgPopularity),
    avgReleaseYear: Math.round(avgReleaseYear),
    artistDiversity: Math.round(artistDiversity),
    monthlyAdditionsData,
    avgDurationMs,
    totalDurationMs,
  };
};

const formatDuration = (ms: number) => {
  if (isNaN(ms) || ms < 0) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${(parseInt(seconds) < 10 ? '0' : '')}${seconds}`;
};

const formatTotalDuration = (ms: number) => {
  if (isNaN(ms) || ms < 0) return '0 hours';
  const hours = (ms / (1000 * 60 * 60)).toFixed(1);
  return `${hours} hours`;
};

interface MusicTasteAnalyzerProps {
  savedTracks: SavedTrack[];
}

export const MusicTasteAnalyzer: React.FC<MusicTasteAnalyzerProps> = ({ savedTracks }) => {
  if (!savedTracks || savedTracks.length === 0) return <div className="text-center py-10">Not enough data to analyze your taste.</div>;

  const metrics = calculateMusicTasteMetrics(savedTracks);
  if (!metrics) return null;

  const personality = getPersonality(metrics);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{personality.title}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{personality.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center mb-10">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-3xl font-bold">{metrics.totalTracks}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Library Tracks</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-3xl font-bold">{metrics.uniqueArtists}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Artists</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-3xl font-bold">{metrics.avgPopularity}/100</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Popularity</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-3xl font-bold">{metrics.avgReleaseYear}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Release Year</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-3xl font-bold">{formatDuration(metrics.avgDurationMs)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Song Length</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-3xl font-bold">{formatTotalDuration(metrics.totalDurationMs)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Listening Time</div>
        </div>
      </div>
    </motion.div>
  );
};
