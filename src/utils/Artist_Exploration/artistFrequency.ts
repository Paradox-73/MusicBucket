import { SpotifyTrack } from '../../types/Artist_Exploration/spotify';

interface ArtistFrequency {
  name: string;
  count: number;
}

interface ArtistFrequencyAnalysis {
  topArtists: ArtistFrequency[];
  bottomArtists: ArtistFrequency[];
  averageFrequency: number;
  totalUniqueArtists: number;
}

export const analyzeArtistFrequency = (likedTracks: SpotifyTrack[]): ArtistFrequencyAnalysis => {
  const artistCounts: { [key: string]: number } = {};

  likedTracks.forEach(track => {
    track.artists.forEach(artist => {
      artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
    });
  });

  const sortedArtists: ArtistFrequency[] = Object.entries(artistCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort descending

  const totalFrequencies = sortedArtists.reduce((sum, artist) => sum + artist.count, 0);
  const totalUniqueArtists = sortedArtists.length;
  const averageFrequency = totalUniqueArtists > 0 ? totalFrequencies / totalUniqueArtists : 0;

  const topArtists = sortedArtists.slice(0, 5);
  const bottomArtists = sortedArtists.slice(Math.max(0, sortedArtists.length - 5));

  return {
    topArtists,
    bottomArtists,
    averageFrequency,
    totalUniqueArtists,
  };
};