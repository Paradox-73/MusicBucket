import { supabase } from './supabase';
import { SpotifyTrack } from '../types/Artist_Exploration/spotify';
import { SpotifyArtist } from '../types/Artist_Exploration/artist';

const CACHE_DURATION_MS = 3600 * 1000; // 1 hour for liked tracks and discographies

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Helper function to handle retries for Supabase fetches
async function supabaseFetchWithRetry<T>(query: PromiseLike<T>, retryCount = 0): Promise<T> {
  try {
    return await query;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES && error.message && error.message.includes('Failed to fetch')) {
      console.warn(`Supabase fetch failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return supabaseFetchWithRetry(query, retryCount + 1);
    }
    throw error;
  }
}

interface ArtistScoreData {
  score: number;
  artistName: string;
  artistImageUrl: string;
  timestamp: string;
  // Add other metrics you want to store historically
}

interface ArtistExplorationScoreWithHistory {
  current: ArtistScoreData;
  history: ArtistScoreData[];
}

interface UserSpotifyData {
  user_id: string;
  liked_tracks: SpotifyTrack[];
  last_updated_liked_tracks: string;
  artist_discographies: { [artistId: string]: SpotifyTrack[] };
  last_updated_artist_discographies: string;
  artist_exploration_scores: { [artistId: string]: ArtistExplorationScoreWithHistory };
  last_updated_artist_exploration_scores: string;
}

export async function getOrCreateUserSpotifyData(userId: string): Promise<UserSpotifyData | null> {
  try {
    const { data, error } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .select('*')
      .eq('user_id', userId)
      .single());

    if (error && error.code === 'PGRST116') { // No rows found
      const { data: newRow, error: insertError } = await supabaseFetchWithRetry(supabase
        .from('user_spotify_data')
        .insert([{ user_id: userId }])
        .select('*')
        .single());
      if (insertError) {
        console.error('Error creating user spotify data:', insertError);
        return null;
      }
      return newRow as UserSpotifyData;
    } else if (error) {
      console.error('Error fetching user spotify data:', error);
      return null;
    }
    return data as UserSpotifyData;
  } catch (error) {
    console.error('Unhandled error in getOrCreateUserSpotifyData:', error);
    return null;
  }
}

export async function getLikedTracksFromSupabase(userId: string): Promise<SpotifyTrack[] | null> {
  try {
    const { data, error } = await supabaseFetchWithRetry(supabase
      .from('user_liked_tracks')
      .select('track_data')
      .eq('user_id', userId));

    if (error) {
      console.error('Error fetching liked tracks from Supabase:', error);
      return null;
    }

    if (data) {
      return data.map((row: any) => row.track_data as SpotifyTrack);
    }
    return null;
  } catch (error) {
    console.error('Unhandled error in getLikedTracksFromSupabase:', error);
    return null;
  }
}

export async function saveLikedTracksToSupabase(userId: string, likedTracks: SpotifyTrack[]): Promise<void> {
  try {
    const tracksToUpsert = likedTracks.map(track => ({
      user_id: userId,
      track_id: track.id,
      track_data: track,
      added_at: track.added_at || new Date().toISOString(),
    }));

    // Filter out any tracks without a valid ID to prevent database errors
    const validTracksToUpsert = tracksToUpsert.filter(track => track.track_id);

    if (validTracksToUpsert.length === 0) {
      console.warn('No valid liked tracks to save to Supabase.');
      return;
    }

    // Use upsert to handle new and existing tracks
    const BATCH_SIZE = 500;
    for (let i = 0; i < validTracksToUpsert.length; i += BATCH_SIZE) {
      const batch = validTracksToUpsert.slice(i, i + BATCH_SIZE);
      const { error: upsertError } = await supabaseFetchWithRetry(supabase
        .from('user_liked_tracks')
        .upsert(batch, { onConflict: 'user_id,track_id' })); // Specify the unique constraint for conflict resolution

      if (upsertError) {
        console.error(`Error upserting batch of liked tracks to Supabase (batch ${i / BATCH_SIZE + 1}):`, upsertError);
        // Continue to next batch even if one fails
      } else {
        console.log(`Successfully upserted batch of liked tracks to Supabase (batch ${i / BATCH_SIZE + 1}).`);
      }
    }
    console.log(`Successfully saved ${validTracksToUpsert.length} liked tracks to Supabase.`);
  } catch (error) {
    console.error('Unhandled error in saveLikedTracksToSupabase:', error);
  }
}

export async function getArtistDiscographyFromSupabase(userId: string, artistId: string): Promise<SpotifyTrack[] | null> {
  try {
    const { data, error } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .select('artist_discographies, last_updated_artist_discographies')
      .eq('user_id', userId)
      .single());

    if (error) {
      console.error('Error fetching artist discography from Supabase:', error);
      return null;
    }

    if (data && data.artist_discographies && data.artist_discographies[artistId] && data.last_updated_artist_discographies) {
      const lastUpdated = new Date(data.last_updated_artist_discographies).getTime();
      if (Date.now() - lastUpdated < CACHE_DURATION_MS) {
        return data.artist_discographies[artistId] as SpotifyTrack[];
      }
    }
    return null;
  } catch (error) {
    console.error('Unhandled error in getArtistDiscographyFromSupabase:', error);
    return null;
  }
}

export async function saveArtistDiscographyToSupabase(userId: string, artistId: string, discography: SpotifyTrack[]): Promise<void> {
  try {
    const { data, error: fetchError } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .select('artist_discographies')
      .eq('user_id', userId)
      .single());

    if (fetchError) {
      console.error('Error fetching existing artist discographies:', fetchError);
      return;
    }

    const existingDiscographies = data?.artist_discographies || {};
    const updatedDiscographies = {
      ...existingDiscographies,
      [artistId]: discography,
    };

    const { error } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .update({ artist_discographies: updatedDiscographies, last_updated_artist_discographies: new Date().toISOString() })
      .eq('user_id', userId));

    if (error) {
      console.error('Error saving artist discography to Supabase:', error);
    }
  } catch (error) {
    console.error('Unhandled error in saveArtistDiscographyToSupabase:', error);
  }
}

export async function getArtistExplorationScoreFromSupabase(userId: string, artistId: string): Promise<ArtistExplorationScoreWithHistory | null> {
  try {
    const { data, error } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .select('artist_exploration_scores, last_updated_artist_exploration_scores')
      .eq('user_id', userId)
      .single());

    if (error) {
      console.error('Error fetching artist exploration score from Supabase:', error);
      return null;
    }

    if (data && data.artist_exploration_scores && data.artist_exploration_scores[artistId] && data.last_updated_artist_exploration_scores) {
      const lastUpdated = new Date(data.last_updated_artist_exploration_scores).getTime();
      // Scores might be less frequently updated, or we can make this configurable
      if (Date.now() - lastUpdated < CACHE_DURATION_MS * 24) { // Cache for 24 hours for scores
        return data.artist_exploration_scores[artistId] as ArtistExplorationScoreWithHistory;
      }
    }
    return null;
  } catch (error) {
    console.error('Unhandled error in getArtistExplorationScoreFromSupabase:', error);
    return null;
  }
}

const MAX_HISTORY_ENTRIES = 10; // Keep last 10 historical scores

export async function saveArtistExplorationScoreToSupabase(userId: string, artistId: string, scoreData: any): Promise<void> {
  try {
    const { data, error: fetchError } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .select('artist_exploration_scores')
      .eq('user_id', userId)
      .single());

    if (fetchError) {
      console.error('Error fetching existing artist exploration scores:', fetchError);
      return;
    }

    const existingScores = data?.artist_exploration_scores || {};
    const existingArtistScore: ArtistExplorationScoreWithHistory = existingScores[artistId] || { current: {}, history: [] };

    const newHistoryEntry: ArtistScoreData = {
      score: scoreData.score,
      artistName: scoreData.artistName,
      artistImageUrl: scoreData.artistImageUrl,
      timestamp: new Date().toISOString(),
      // Copy other relevant metrics from scoreData if needed for history
    };

    const updatedHistory = [...existingArtistScore.history, newHistoryEntry].slice(-MAX_HISTORY_ENTRIES);

    const updatedArtistScore: ArtistExplorationScoreWithHistory = {
      current: scoreData, // The latest score data
      history: updatedHistory,
    };

    const updatedScores = {
      ...existingScores,
      [artistId]: updatedArtistScore,
    };

    const { error } = await supabaseFetchWithRetry(supabase
      .from('user_spotify_data')
      .update({ artist_exploration_scores: updatedScores, last_updated_artist_exploration_scores: new Date().toISOString() })
      .eq('user_id', userId));

    if (error) {
      console.error('Error saving artist exploration score to Supabase:', error);
    }
  } catch (error) {
    console.error('Unhandled error in saveArtistExplorationScoreToSupabase:', error);
  }
}