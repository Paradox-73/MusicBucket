import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Track } from '../types/Road_Trip_Mixtape';
import { Suggestion, onSuggestionsUpdate, addSuggestion, upvoteSuggestion } from '../lib/supabaseCollaboration';
import { useAuth } from '../hooks/useAuth';

const JoinMixtapePage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [originalPlaylist, setOriginalPlaylist] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!sessionId) return;

    // Fetch the original playlist
    const fetchOriginalPlaylist = async () => {
      const { data, error } = await supabase
        .from('shared_playlists')
        .select('tracks')
        .eq('id', sessionId)
        .single();
      
      if (error || !data) {
        setError('Could not find this collaborative playlist.');
      } else {
        setOriginalPlaylist(data.tracks as Track[]);
      }
    };

    fetchOriginalPlaylist();

    // Subscribe to updates
    const unsubscribe = onSuggestionsUpdate(sessionId, (newSuggestions) => {
      setSuggestions(newSuggestions);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const handleAddSuggestion = async () => {
    // In a real implementation, this would involve a track search UI
    // For now, we'll add a placeholder
    if (!sessionId || !user) return;
    const placeholderTrack: Track = {
      id: `sugg_${Date.now()}`,
      name: 'New Suggested Song',
      artist: { id: 'artist1', name: 'Suggestor', location: { lat: 0, lng: 0, name: '' }, genres: [], popularity: 0, images: [] },
      duration: 180,
      albumArt: 'https://via.placeholder.com/150'
    };
    await addSuggestion(sessionId, placeholderTrack, user.id);
  };

  const handleUpvote = async (suggestionId: number) => {
    await upvoteSuggestion(suggestionId);
  };

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Join the Mixtape!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Original Playlist</h2>
          <div className="space-y-2">
            {originalPlaylist.map(track => (
              <div key={track.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">{track.name} - {track.artist.name}</div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Suggestions</h2>
          <button onClick={handleAddSuggestion} className="mb-4 w-full bg-blue-500 text-white py-2 rounded-lg">+ Suggest a Song</button>
          <div className="space-y-2">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="p-3 bg-white dark:bg-gray-700 rounded-lg flex justify-between items-center">
                <div>{suggestion.track_data.name}</div>
                <button onClick={() => handleUpvote(suggestion.id)} className="p-2 rounded-full bg-green-500 text-white">^ {suggestion.votes}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinMixtapePage;
