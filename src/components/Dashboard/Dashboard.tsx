import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { UserProfile } from './UserProfile';
import { MusicTasteAnalyzer } from './MusicTasteAnalyzer';
import { ErrorMessage } from './ErrorMessage';
import { TopArtistCard } from './TopArtistCard';
import { TopTrackCard } from './TopTrackCard';
import { SkeletonCard } from './SkeletonCard';
import { PopularityHighlights } from './PopularityHighlights';
import { LoadingSpinner } from './LoadingSpinner';
import { DecadeChart } from './DecadeChart';
import { PlaylistMetrics } from './PlaylistMetrics';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('medium_term');
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

  const { data: allTracks, isLoading: isLoadingAllTracks, error: errorAllTracks } = useQuery({
    queryKey: ['all-tracks-analysis'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token);
      
      const allTracks = new Map<string, any>();

      // 1. Fetch all user's playlists
      let playlists: any[] = [];
      let offset = 0;
      while (true) {
        const response = await spotifyApi.getPlaylists(offset, 50);
        const { items, total } = response.data;
        if (!items.length) break;
        playlists.push(...items);
        if (playlists.length >= total) break;
        offset += 50;
      }

      // 2. Fetch tracks for each playlist
      for (const playlist of playlists) {
        if (!playlist.id) continue;
        let tracksOffset = 0;
        while (true) {
          try {
            const response = await spotifyApi.getPlaylistTracks(playlist.id, tracksOffset, 100);
            const { items } = response.data;
            if (!items.length) break;
            items.forEach(item => {
              if (item.track && item.track.id) {
                allTracks.set(item.track.id, { ...item, track: { ...item.track, album: item.track.album || {} } });
              }
            });
            if (items.length < 100) break;
            tracksOffset += 100;
          } catch (error) {
            console.error(`Failed to fetch tracks for playlist ${playlist.id}`, error);
            break; 
          }
        }
      }

      // 3. Fetch user's saved tracks
      offset = 0;
      while (true) {
        try {
          const response = await spotifyApi.getSavedTracks(offset, 50);
          const { items } = response.data;
          if (!items.length) break;
          items.forEach(item => {
            if (item.track && item.track.id) {
              allTracks.set(item.track.id, { ...item, track: { ...item.track, album: item.track.album || {} } });
            }
          });
          if (items.length < 50) break;
          offset += 50;
        } catch (error) {
          console.error('Failed to fetch saved tracks', error);
          break;
        }
      }

      return Array.from(allTracks.values());
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const error = errorArtists || errorTracks || errorAllTracks;

  const getTopGenres = (artists: any[]) => {
    if (!artists) return [];
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

  const topGenres = getTopGenres(topArtists);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <UserProfile />
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <div className="mb-8">
          {isLoadingAllTracks ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> : <MusicTasteAnalyzer savedTracks={allTracks || []} />}
        </div>

        <motion.div variants={cardVariant} className="mb-8">
          {isLoadingAllTracks ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> : <DecadeChart tracks={allTracks || []} />}
        </motion.div>

        <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6">
            <h2 className="text-3xl font-bold">Your Top Charts</h2>
            <select
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-4 sm:mt-0"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
            >
              <option value="short_term">Last 4 Weeks</option>
              <option value="medium_term">Last 6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Top Artists</h3>
              <div className="space-y-3">
                {isLoadingArtists 
                  ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />) 
                  : topArtists?.slice(0, 5).map((artist: any, index: number) => (
                      <TopArtistCard key={artist.id} artist={artist} rank={index + 1} />
                    ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Top Tracks</h3>
              <div className="space-y-3">
                {isLoadingTracks
                  ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                  : topTracks?.slice(0, 5).map((track: any, index: number) => (
                      <TopTrackCard key={track.id} track={track} rank={index + 1} />
                    ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8">
          { (isLoadingAllTracks || isLoadingArtists) 
            ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> 
            : <PopularityHighlights savedTracks={allTracks || []} topArtists={topArtists || []} />
          }
        </div>

        <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Top Genres</h2>
          <div className="flex flex-wrap gap-2">
            {isLoadingArtists
              ? <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              : topGenres.map(genre => (
                  <span key={genre} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
                    {genre}
                  </span>
                ))}
          </div>
        </motion.div>

        <motion.div variants={cardVariant} className="mt-8">
          <PlaylistMetrics />
        </motion.div>

      </motion.div>
    </div>
  );
};
