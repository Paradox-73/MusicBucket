import React from 'react';
import { useParams } from 'react-router-dom';
import { useCountryMusic } from '../../hooks/Culture_Clash/useCountryMusic';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import { ArtistList } from './country/ArtistList';
import { TrackList } from './country/TrackList';
import { GenreList } from './country/GenreList';

export function CountryMusic() {
  const { countryCode } = useParams();
  const { data, loading, error } = useCountryMusic(countryCode);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load country music data" />;
  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ArtistList artists={data.artists} />
        <TrackList tracks={data.topTracks} />
        <GenreList genres={data.genres} />
      </div>
    </div>
  );
}