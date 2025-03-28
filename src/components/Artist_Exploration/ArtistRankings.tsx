import React from 'react';
import { ArtistList } from './ArtistList';
import { useArtistRankings } from '../../hooks/Artist_Exploration/useArtistRankings';
import { Loader2 } from 'lucide-react';

export function ArtistRankings() {
  const { topArtists, bottomArtists, averageScore, loading } = useArtistRankings();

  if (loading) {
    return (
      <div className="mt-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Calculating artist exploration scores...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {averageScore}
        </div>
        <div className="text-sm text-gray-500">
          Average Exploration Score
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <ArtistList title="Most Explored Artists" artists={topArtists} type="top" />
        <ArtistList title="Least Explored Artists" artists={bottomArtists} type="bottom" />
      </div>
    </div>
  );
}