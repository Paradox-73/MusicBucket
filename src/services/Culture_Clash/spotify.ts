import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import type { CountryMusic } from '../../types/Culture_Clash/spotify';

const spotifyApi = SpotifyApi.withClientCredentials(
  import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
);

export async function getCountryMusic(countryCode: string): Promise<CountryMusic> {
  const market = countryCode;
  
  const [topTracks, artists] = await Promise.all([
    spotifyApi.browse.getPlaylistsByCountry(market),
    spotifyApi.browse.getFeaturedPlaylists({ country: market, limit: 10 })
  ]);

  const genres = [...new Set(artists.items.flatMap(artist => artist.genres))];

  return {
    country: countryCode,
    topTracks: topTracks.items,
    genres,
    artists: artists.items
  };
}