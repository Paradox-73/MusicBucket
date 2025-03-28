import React from 'react';
import { Music } from 'lucide-react';
import type { GeoFeature } from '../../../types/Culture_Clash/geo';

interface CountrySelectionProps {
  country: GeoFeature;
}

export function CountrySelection({ country }: CountrySelectionProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-lg text-white text-center min-w-[300px]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Music className="text-[#00CCCC]" />
        <h3 className="text-xl font-bold">{country.properties.ADMIN}</h3>
      </div>
      <p className="text-[#00CCCC]">Loading musical journey...</p>
    </div>
  );
}