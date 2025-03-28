import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocationSearch } from '../../hooks/Road_Trip_Mixtape/useLocationSearch';
import { Location } from '../../types/Road_Trip_Mixtape';
//import { searchLocation } from '../services/geocoding';
import { searchLocation } from '../../services/Road_Trip_Mixtape/geocoding';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  userLocation?: Location;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  userLocation
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const locations = await searchLocation(value, userLocation);
        setSuggestions(locations);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [value, userLocation]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="max-h-60 overflow-auto">
            {suggestions.map((location) => (
              <li
                key={`${location.lat}-${location.lng}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelect(location);
                  onChange(location.name);
                  setShowSuggestions(false);
                }}
              >
                {location.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};