import { supabase } from './supabase';
import { Track } from '../types/Road_Trip_Mixtape';

export interface Suggestion {
  id: number;
  playlist_id: string;
  track_data: Track;
  suggester_id: string;
  votes: number;
}

// Create a new collaborative playlist session
export async function createCollaborationSession(ownerId: string, initialTracks: Track[]): Promise<string | null> {
  const { data, error } = await supabase
    .from('shared_playlists')
    .insert([{ owner_id: ownerId, tracks: initialTracks }])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating collaboration session:', error);
    return null;
  }
  return data.id;
}

// Add a new track suggestion to a session
export async function addSuggestion(playlistId: string, track: Track, userId: string): Promise<Suggestion | null> {
  const { data, error } = await supabase
    .from('playlist_suggestions')
    .insert([{ playlist_id: playlistId, track_data: track, suggester_id: userId }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding suggestion:', error);
    return null;
  }
  return data as Suggestion;
}

// Upvote a suggestion
export async function upvoteSuggestion(suggestionId: number): Promise<Suggestion | null> {
  const { data, error } = await supabase.rpc('increment_votes', { suggestion_id: suggestionId });

  if (error) {
    console.error('Error upvoting suggestion:', error);
    return null;
  }
  return data;
}

// Subscribe to real-time updates for suggestions
export function onSuggestionsUpdate(playlistId: string, callback: (suggestions: Suggestion[]) => void): () => Promise<"ok" | "timed out" | "error"> {
  const channel = supabase
    .channel(`playlist_suggestions:${playlistId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'playlist_suggestions', filter: `playlist_id=eq.${playlistId}` },
      async (payload) => {
        const { data, error } = await supabase
          .from('playlist_suggestions')
          .select('*')
          .eq('playlist_id', playlistId)
          .order('votes', { ascending: false });

        if (error) {
          console.error('Error fetching updated suggestions:', error);
          return;
        }
        callback(data as Suggestion[]);
      }
    )
    .subscribe();

  // Fetch initial data
  (async () => {
    const { data, error } = await supabase
      .from('playlist_suggestions')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('votes', { ascending: false });
    if (!error) {
      callback(data as Suggestion[]);
    }
  })();

  return () => supabase.removeChannel(channel);
}
