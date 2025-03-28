import React from 'react';
import { Filter } from 'lucide-react';
import { ItemTypeEnum } from '../../db/Bucket_List/schema';

interface SearchFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function SearchFilters({ selectedType, onTypeChange }: SearchFiltersProps) {
  return (
    <div className="relative inline-block">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          {Object.values(ItemTypeEnum.enum).map((type) => (
            <option key={type} value={type} className="capitalize">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}