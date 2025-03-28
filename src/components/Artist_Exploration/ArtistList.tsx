import React from 'react';
import { Trophy, TrendingDown } from 'lucide-react';
import { RankedArtist } from '../../types/Artist_Exploration/artist';

interface Props {
  title: string;
  artists: RankedArtist[];
  type: 'top' | 'bottom';
}

export function ArtistList({ title, artists, type }: Props) {
  const Icon = type === 'top' ? Trophy : TrendingDown;
  const iconColor = type === 'top' ? 'text-yellow-500' : 'text-blue-500';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="space-y-4">
        {artists.map((artist, index) => (
          <div 
            key={artist.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-bold text-2xl text-gray-400 w-8">
              {index + 1}
            </div>
            
            {artist.imageUrl ? (
              <img 
                src={artist.imageUrl} 
                alt={artist.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl font-bold">
                  {artist.name[0]}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{artist.name}</h3>
              <div className="text-sm text-gray-500">
                {artist.tracksCount} tracks analyzed
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {artist.score}
              </div>
              <div className="text-sm text-gray-500">
                score
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}