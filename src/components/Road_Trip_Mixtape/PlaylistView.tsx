import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Edit, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/Road_Trip_Mixtape';
import { PlaylistEditor } from './PlaylistEditor';
import { MainAppSpotifyAuth } from '../../lib/spotifyAuth';
import { SpotifyAuth } from '../../lib/spotify/auth';

export const PlaylistView: React.FC = () => {
  const { playlist, setPlaylist, route } = useAppStore();
  const [playing, setPlaying] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const spotifyAuth = MainAppSpotifyAuth.getInstance();
        const authenticated = await spotifyAuth.isAuthenticated();
        setIsConnected(authenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsConnected(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Get the access to the BucketList SpotifyAuth to handle logout
      const bucketListAuth = SpotifyAuth.getInstance();
      bucketListAuth.clearToken();
      setIsConnected(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePlayPause = (trackId: string, previewUrl?: string) => {
    if (!previewUrl) return;

    if (playing === trackId) {
      audio?.pause();
      setPlaying(null);
      setPlayingAll(false);
    } else {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      const newAudio = new Audio(previewUrl);
      newAudio.volume = 0.5; // Set default volume
      newAudio.onended = () => {
        setPlaying(null);
        setPlayingAll(false);
      };
      newAudio.play().catch(error => {
        console.error('Error playing audio:', error);
        setError('Unable to play preview. Please try again.');
      });
      setAudio(newAudio);
      setPlaying(trackId);
    }
  };

  React.useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTripDuration = (seconds: number) =>{
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handlePlayAll = () => {
    if (playingAll) {
      audio?.pause();
      setPlayingAll(false);
      setPlaying(null);
    } else {
      playNextTrack(0);
    }
  };

  const playNextTrack = (index: number) => {
    if (index >= playlist.length) {
      setPlayingAll(false);
      setPlaying(null);
      return;
    }

    const track = playlist[index];
    if (!track.previewUrl) {
      playNextTrack(index + 1);
      return;
    }

    const newAudio = new Audio(track.previewUrl);
    newAudio.onended = () => playNextTrack(index + 1);
    newAudio.play();
    setAudio(newAudio);
    setPlaying(track.id);
    setPlayingAll(true);
  };

  const handleSavePlaylist = async (playlistDetails: { 
    name: string; 
    description: string; 
    isPublic: boolean;
    image?: FormData;
  }) => {
    try {
      const spotifyAuth = MainAppSpotifyAuth.getInstance();
      const isAuthenticated = await spotifyAuth.isAuthenticated();
      
      if (!isAuthenticated) {
        await spotifyAuth.authenticate();
        return;
      }

      // Initialize the API
      await spotifyAuth.initialize();
      
      // Get the Spotify API instance
      const bucketListAuth = SpotifyAuth.getInstance();
      const accessToken = await bucketListAuth.getAccessToken();
      
      if (!accessToken) {
        setError('Failed to get access token');
        return;
      }
      
      // Create a Spotify API instance
      const spotifyApi = await import('@spotify/web-api-ts-sdk');
      const api = spotifyApi.SpotifyApi.withAccessToken(
        import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: ''
        }
      );

      // Get current user and create playlist
      const user = await api.currentUser.profile();
      const newPlaylist = await api.playlists.createPlaylist(user.id, {
        name: playlistDetails.name,
        description: playlistDetails.description,
        public: playlistDetails.isPublic
      });

      // Add tracks to playlist
      await api.playlists.addItemsToPlaylist(newPlaylist.id, 
        playlist.map(track => `spotify:track:${track.id}`)
      );

      // Upload playlist cover image if provided
      if (playlistDetails.image) {
        const imageFile = playlistDetails.image.get('image') as File;
        if (imageFile) {
          const base64Image = await convertImageToBase64(imageFile);
          // Remove the "data:image/jpeg;base64," prefix
          const base64String = base64Image.split(',')[1];
          
          await fetch(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/images`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'image/jpeg'
            },
            body: base64String
          });
        }
      }

      setIsEditing(false);
      setSuccess('Playlist saved successfully!');
    } catch (error: any) {
      console.error('Error saving playlist:', error);
      
      // Check for specific error conditions
      if (error.status === 401) {
        // Unauthorized - token expired
        const spotifyAuth = MainAppSpotifyAuth.getInstance();
        await spotifyAuth.authenticate();
      } else if (error.status === 403 || (error.message && error.message.includes("Insufficient client scope"))) {
        // Insufficient permissions
        setError('Your Spotify connection does not have the required permissions. Please log out and log back in.');
        
        // Show logout button or handle differently
        const bucketListAuth = SpotifyAuth.getInstance();
        bucketListAuth.clearToken();
        setIsConnected(false);
      } else {
        setError('Failed to save playlist. Please try again.');
      }
    }
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Road Trip Playlist</h2>
          {route && (
            <p className="text-gray-600 mt-1">
              Trip duration: {formatTripDuration(route.duration)}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayAll}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {playingAll ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Edit className="w-5 h-5" />
          </button>
          {isConnected ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                const spotifyAuth = MainAppSpotifyAuth.getInstance();
                await spotifyAuth.authenticate();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Connect to Spotify
            </button>
          )}
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 mb-4 rounded-lg ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {error || success}
        </div>
      )}

      {isEditing ? (
        <PlaylistEditor
          tracks={playlist}
          onSave={handleSavePlaylist}
        />
      ) : (
        <div className="space-y-4">
          {playlist.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={track.albumArt} 
                  alt={track.name}
                  className="w-12 h-12 rounded-md"
                />
                <button
                  onClick={() => handlePlayPause(track.id, track.previewUrl)}
                  className={`p-2 rounded-full ${track.previewUrl ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={!track.previewUrl}
                >
                  {playing === track.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h3 className="font-medium">{track.name}</h3>
                  <p className="text-sm text-gray-600">
                    {track.artist.name} • {track.artist.location.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(track.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};