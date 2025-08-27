import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { UserProfile } from './UserProfile';
import { MusicTasteAnalyzer } from './MusicTasteAnalyzer';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type FilterOption = 'listening_history' | 'liked_playlists';

export const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('medium_term');
  const [filterOption, setFilterOption] = useState<FilterOption>('listening_history');

  const spotifyAuth = SpotifyAuth.getInstance();

  const { data: topArtists, isLoading: isLoadingArtists, error: errorArtists } = useQuery({
    queryKey: ['topArtists', selectedTimeRange],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getTopArtists(selectedTimeRange, 50);
      return response.data.items;
    },
  });

  const { data: topTracks, isLoading: isLoadingTracks, error: errorTracks } = useQuery({
    queryKey: ['topTracks', selectedTimeRange],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getTopTracks(selectedTimeRange, 50);
      return response.data.items;
    },
  });

  // const { data: recentlyPlayed, isLoading: isLoadingRecentlyPlayed, error: errorRecentlyPlayed } = useQuery({
  //   queryKey: ['recentlyPlayed'],
  //   queryFn: async () => {
  //     const token = await spotifyAuth.getAccessToken();
  //     if (!token) throw new Error('No access token available');
  //     const spotifyApi = createSpotifyApi(token);
  //     const response = await spotifyApi.getRecentlyPlayedTracks(50);
  //     return response.data.items.map((item: any) => item.track);
  //   },
  //   enabled: filterOption === 'listening_history',
  // });

  const { data: likedTracks, isLoading: isLoadingLikedTracks, error: errorLikedTracks } = useQuery({
    queryKey: ['likedTracks'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      const tracks: any[] = [];
      let offset = 0;
      while (true) {
        const response = await spotifyApi.getSavedTracks(offset);
        const { items, total } = response.data;
        if (!items.length) break;
        tracks.push(...items.map((item: any) => item.track));
        if (tracks.length >= total) break;
        offset += 50;
      }
      return tracks;
    },
    enabled: filterOption === 'liked_playlists',
  });

  const isLoading = isLoadingArtists || isLoadingTracks || isLoadingLikedTracks;
  const error = errorArtists || errorTracks || errorLikedTracks;

  const getTopGenres = (artists: any[]) => {
    const genreCounts: { [key: string]: number } = {};
    artists.forEach(artist => {
      artist.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    return Object.entries(genreCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([genre]) => genre);
  };

  const displayedTracks = likedTracks;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <UserProfile />
      <MusicTasteAnalyzer />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
        <h2 className="text-3xl font-bold mb-6">Your Spotify Dashboard</h2>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
          >
            <option value="short_term">Last 4 Weeks</option>
            <option value="medium_term">Last 6 Months</option>
            <option value="long_term">All Time</option>
          </select>

          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value as FilterOption)}
          >
            <option value="listening_history">Listening History</option>
            <option value="liked_playlists">Liked Playlists</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Top Artists</h3>
            <ul className="space-y-2">
              {topArtists?.map((artist: any) => (
                <li key={artist.id} className="text-sm">
                  {artist.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Top Tracks</h3>
            <ul className="space-y-2">
              {topTracks?.map((track: any) => (
                <li key={track.id} className="text-sm">
                  {track.name} - {track.artists.map((artist: any) => artist.name).join(', ')}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Top Genres</h3>
            <ul className="space-y-2">
              {topArtists && getTopGenres(topArtists).map((genre: string) => (
                <li key={genre} className="text-sm">
                  {genre}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            {filterOption === 'listening_history' ? 'Recently Played Tracks' : 'Liked Tracks'}
          </h3>
          <ul className="space-y-2">
            {displayedTracks?.map((track: any) => (
              <li key={track.id} className="text-sm">
                {track.name} - {track.artists.map((artist: any) => artist.name).join(', ')}
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
};