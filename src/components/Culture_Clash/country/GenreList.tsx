import React from 'react';
import { Disc } from 'lucide-react';

interface GenreListProps {
  genres: string[];
}

export function GenreList({ genres }: GenreListProps) {
  return (
    <div className="md:col-span-2 bg-black/80 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Disc className="text-[#00CCCC]" />
        Popular Genres
      </h2>
      <div className="flex flex-wrap gap-2">
        {genres.map(genre => (
          <span 
            key={genre}
            className="px-3 py-1 bg-[#800080] text-white rounded-full text-sm"
          >
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}