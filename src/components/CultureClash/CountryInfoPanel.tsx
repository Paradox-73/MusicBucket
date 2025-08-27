import React from 'react';
import { CountryCultureData } from '../../types/cultureClash';
import { PlaylistEmbed } from './PlaylistEmbed';

interface CountryInfoPanelProps {
  country: CountryCultureData;
}

export const CountryInfoPanel: React.FC<CountryInfoPanelProps> = ({ country }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-yellow-400">{country.name}</h2>
      {country.flagUrl && (
        <img src={country.flagUrl} alt={`${country.name} Flag`} className="w-24 h-auto mb-4 rounded-md shadow-md" />
      )}
      <h3 className="text-xl font-semibold mb-2">Historical Context</h3>
      <p className="text-gray-300 mb-4">{country.historicalContext}</p>

      <h3 className="text-xl font-semibold mb-2">Key Genres & Instruments</h3>
      <ul className="list-disc list-inside text-gray-300 mb-4">
        {country.keyGenres.map((genre, index) => (
          <li key={index}>{genre}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Influential Artists</h3>
      <ul className="list-disc list-inside text-gray-300 mb-4">
        {country.influentialArtists.map((artist, index) => (
          <li key={index}>{artist}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Curated Playlists</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {country.playlists.map((playlist, index) => (
          <PlaylistEmbed key={index} playlist={playlist} />
        ))}
      </div>

      {country.images && country.images.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Visuals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {country.images.map((image, index) => (
              <img key={index} src={image} alt={`Image ${index + 1}`} className="w-full h-auto rounded-md shadow-md" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
