import { useState, useCallback } from 'react';
import { Location } from '../../types/Road_Trip_Mixtape';
import { searchLocation } from '../../services/Road_Trip_Mixtape/geocoding';
import { useAppStore } from '../../store/Road_Trip_Mixtape';

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const { setStartLocation, setEndLocation } = useAppStore();

  const searchLocations = useCallback(async (query: string): Promise<Location[]> => {
    if (!query.trim()) {
      setSuggestions([]);
      return [];
    }

    try {
      const locations = await searchLocation(query);
      setSuggestions(locations);
      return locations;
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
      return [];
    }
  }, []);

  return {
    suggestions,
    searchLocations,
    setStartLocation,
    setEndLocation
  };
}