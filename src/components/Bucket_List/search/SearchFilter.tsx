import React from 'react';
import { Filter } from 'lucide-react';

const FILTER_OPTIONS = ['all', 'artist', 'album', 'track', 'playlist'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

interface SearchFilterProps {
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export function SearchFilter({ selectedFilter, onFilterChange }: SearchFilterProps) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-white hover:bg-white/10">
        <Filter className="h-4 w-4" />
        <span className="capitalize">{selectedFilter}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-white/10 bg-black/90 p-2 backdrop-blur-lg group-hover:block">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`w-full rounded-lg px-4 py-2 text-left capitalize transition-all ${
              selectedFilter === filter
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}