import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createSpotifyApi } from '../../lib/Dashboard/spotify';
import { SpotifyAuth } from '../../lib/spotify/auth';
import { UserProfile } from './UserProfile';
import { MusicTasteAnalyzer, calculateMusicTasteMetrics } from './MusicTasteAnalyzer';
import { ErrorMessage } from './ErrorMessage';
import { TopArtistCard } from './TopArtistCard';
import { TopTrackCard } from './TopTrackCard';
import { SkeletonCard } from './SkeletonCard';
import { PopularityHighlights } from './PopularityHighlights';
import { LoadingSpinner } from './LoadingSpinner';
import { DecadeChart } from './DecadeChart';
import { PlaylistMetrics } from './PlaylistMetrics';
import { LibraryGrowthChart } from './LibraryGrowthChart';
import { ArtistNetworkGraph } from './ArtistNetworkGraph';
import { useColor } from 'color-thief-react';
import { Achievements } from './Achievements';
import { checkAndAwardAchievements } from '../../services/AchievementService';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type PlaylistOwnershipFilter = 'all' | 'mine' | 'others';

const fetchAllTracks = async (spotifyAuth: SpotifyAuth, playlistOwnershipFilter: PlaylistOwnershipFilter, userId: string | undefined, setIsRateLimited: (isRateLimited: boolean) => void) => {
  
  const token = await spotifyAuth.getAccessToken();
  if (!token) throw new Error('No access token available');
  const spotifyApi = createSpotifyApi(token, setIsRateLimited);
  
  const allTracks: any[] = [];

  // 1. Fetch all user's playlists
  const playlists: any[] = [];
  let offset = 0;
  while (true) {
    const response = await spotifyApi.getPlaylists(offset, 50);
    const { items, total } = response.data;
    if (!items.length) break;
    playlists.push(...items);
    if (playlists.length >= total) break;
    offset += 50;
    await sleep(200); // Add delay
  }

  // Filter playlists based on ownership
  let filteredPlaylists = playlists;
  if (playlistOwnershipFilter === 'mine' && userId) {
    filteredPlaylists = playlists.filter(playlist => playlist.owner.id === userId);
  } else if (playlistOwnershipFilter === 'others' && userId) {
    filteredPlaylists = playlists.filter(playlist => playlist.owner.id !== userId);
  }

  // 2. Fetch tracks for each (filtered) playlist
  for (const playlist of filteredPlaylists) {
    if (!playlist.id) continue;
    let tracksOffset = 0;
    while (true) {
      try {
        const response = await spotifyApi.getPlaylistTracks(playlist.id, tracksOffset, 100);
        const { items } = response.data;
        if (!items.length) break;
        items.forEach(item => {
          if (item.track && item.track.id) {
            allTracks.push({ ...item, track: { ...item.track, album: item.track.album || {} } });
          }
        });
        if (items.length < 100) break;
        tracksOffset += 100;
        await sleep(200); // Add delay
      } catch (error) {
        console.error(`Failed to fetch tracks for playlist ${playlist.id}`, error);
        break; 
      }
    }
  }

  // 3. Fetch user's saved tracks only when filter is 'all'
  if (playlistOwnershipFilter === 'all') {
    offset = 0;
    while (true) {
      try {
        const response = await spotifyApi.getSavedTracks(offset, 50);
        const { items } = response.data;
        if (!items.length) break;
        items.forEach(item => {
          if (item.track && item.track.id) {
            allTracks.push({ ...item, track: { ...item.track, album: item.track.album || {} } });
          }
        });
        if (items.length < 50) break;
        offset += 50;
        await sleep(200); // Add delay
      } catch (error) {
        console.error('Failed to fetch saved tracks', error);
        break;
      }
    }
  }

  return allTracks;
};

export const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('medium_term');
  const [playlistOwnershipFilter, setPlaylistOwnershipFilter] = useState<PlaylistOwnershipFilter>('all');
  const spotifyAuth = SpotifyAuth.getInstance();
  const queryClient = useQueryClient();

  const [isRateLimited, setIsRateLimited] = useState(false);

  const { data: currentUser, isLoading: isLoadingUser, error: errorUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token, setIsRateLimited);
      const response = await spotifyApi.getCurrentUser();
      return response.data;
    },
    staleTime: Infinity, // User data doesn't change often
  });

  const { data: allTracks, isLoading: isLoadingAllTracks, error: errorAllTracks } = useQuery({
    queryKey: ['all-tracks-analysis', playlistOwnershipFilter, currentUser?.id],
    queryFn: () => fetchAllTracks(spotifyAuth, playlistOwnershipFilter, currentUser?.id, setIsRateLimited),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!currentUser, // Only run this query if currentUser is available
  });

  useEffect(() => {
    if (currentUser?.id) {
      const filters: PlaylistOwnershipFilter[] = ['all', 'mine', 'others'];
      filters.forEach(filter => {
        if (filter !== playlistOwnershipFilter) {
          queryClient.prefetchQuery({
            queryKey: ['all-tracks-analysis', filter, currentUser.id],
            queryFn: () => fetchAllTracks(spotifyAuth, filter, currentUser.id, setIsRateLimited),
            staleTime: 1000 * 60 * 5, // 5 minutes
          });
        }
      });
    }
  }, [currentUser?.id, playlistOwnershipFilter, queryClient, spotifyAuth]);

  useEffect(() => {
    if (currentUser && allTracks && !isLoadingAllTracks) {
      checkAndAwardAchievements(currentUser.id, allTracks);
    }
  }, [currentUser, allTracks, isLoadingAllTracks]);

  const { data: topArtists, isLoading: isLoadingArtists, error: errorArtists } = useQuery({
    queryKey: ['topArtists', selectedTimeRange],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token, setIsRateLimited);
      const response = await spotifyApi.getTopArtists(selectedTimeRange, 50);
      return response.data.items;
    },
  });

  const topArtistImage = topArtists?.[0]?.images?.[0]?.url || '/path/to/default-artist-image.png'; // Add a default image path
  const { data: color } = useColor(topArtistImage, 'hex', { crossOrigin: 'anonymous' });

  const { data: topTracks, isLoading: isLoadingTracks, error: errorTracks } = useQuery({
    queryKey: ['topTracks', selectedTimeRange],
    queryFn: async () => {
      const token = await spotifyAuth.getAccessToken();
      if (!token) throw new Error('No access token available');
      const spotifyApi = createSpotifyApi(token, setIsRateLimited);
      const response = await spotifyApi.getTopTracks(selectedTimeRange, 50);
      return response.data.items;
    },
  });

  const musicTasteMetrics = allTracks ? calculateMusicTasteMetrics(allTracks) : null;

  const error = errorArtists || errorTracks || errorAllTracks || errorUser;

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
  if (isLoadingUser) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8" style={{ '--theme-color': color, transition: 'background-color 0.5s ease' } as React.CSSProperties}>
      {isRateLimited && (
        <div className="bg-yellow-500 text-white text-center p-2 rounded-lg mb-4">
          Spotify API rate limit reached. Retrying...
        </div>
      )}
      <UserProfile />
      <Achievements userId={currentUser?.id} />
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible">

        <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6">
            <h2 className="text-3xl font-bold">Your Top Charts</h2>
            <select
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

        <motion.div variants={cardVariant} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
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

        

        <div className="flex flex-col sm:flex-row justify-between items-baseline my-8">
          <h2 className="text-3xl font-bold">Your Library</h2>
          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={playlistOwnershipFilter}
            onChange={(e) => setPlaylistOwnershipFilter(e.target.value as PlaylistOwnershipFilter)}
          >
            <option value="all">All Playlists</option>
            <option value="mine">My Playlists</option>
            <option value="others">Other Playlists</option>
          </select>
        </div>

        <div className="mb-8">
          {isLoadingAllTracks ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> : <MusicTasteAnalyzer savedTracks={allTracks || []} />}
        </div>

        <motion.div variants={cardVariant} className="mb-8">
          {musicTasteMetrics && <LibraryGrowthChart data={musicTasteMetrics.monthlyAdditionsData} />}
        </motion.div>

        <motion.div variants={cardVariant} className="mb-8">
          {isLoadingAllTracks ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> : <DecadeChart tracks={allTracks || []} />}
        </motion.div>

        <motion.div variants={cardVariant}>
          <PlaylistMetrics playlistOwnershipFilter={playlistOwnershipFilter} />
        </motion.div>

        <div className="mb-8">
          { (isLoadingAllTracks || isLoadingArtists) 
            ? <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><LoadingSpinner/></div> 
            : <PopularityHighlights savedTracks={allTracks || []} topArtists={topArtists || []} />
          }
        </div>

      </motion.div>
    </div>
  );
};
