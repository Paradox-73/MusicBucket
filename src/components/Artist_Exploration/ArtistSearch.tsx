import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { searchArtists } from '../../lib/Artist_Exploration/spotify';
import { SpotifyArtist } from '../../lib/Artist_Exploration/spotify';

interface Props {
  token: string;
  onArtistSelect: (artist: SpotifyArtist) => void;
}

export function ArtistSearch({ token, onArtistSelect }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SpotifyArtist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const artists = await searchArtists(searchQuery, token);
      setSuggestions(artists);
    } catch (error) {
      console.error('Error searching artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for an artist..."
          className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {isLoading && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg">
          <div className="p-4 text-center text-gray-500">Loading...</div>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white rounded-lg shadow-lg">
          {suggestions.map((artist) => (
            <li
              key={artist.id}
              className="px-4 py-2 cursor-pointer hover:bg-green-50"
              onClick={() => {
                onArtistSelect(artist);
                setQuery('');
                setSuggestions([]);
              }}
            >
              <div className="flex items-center gap-3">
                {artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span>{artist.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}