import React, { useState, useEffect  } from 'react';
import { LocationInput } from '../components/Road_Trip_Mixtape/LocationInput';
import { PlaylistView } from '../components/Road_Trip_Mixtape/PlaylistView'; 
import { generatePlaylist } from '../services/Road_Trip_Mixtape/playlist';
import { Music, LogIn } from 'lucide-react';
import { TripMap } from '../components/Road_Trip_Mixtape/Map';
import { useAppStore } from '../store/Road_Trip_Mixtape';
import { getRoute, getRouteRegions } from '../services/Road_Trip_Mixtape/geocoding';
import { Location } from '../types/Road_Trip_Mixtape';
import axios from 'axios';
import { MainAppSpotifyAuth } from '../lib/spotifyAuth';
import { useMapboxStatusStore } from '../store/mapboxStatusStore';

// Import the token from Map component
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const RoadTripMixtape = () => {
  const [startQuery, setStartQuery] = React.useState('');
  const [endQuery, setEndQuery] = React.useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { isMapboxApiAvailable, setMapboxApiAvailability } = useMapboxStatusStore();
  
  const {
    setStartLocation,
    setEndLocation,
    startLocation,
    endLocation,
    setRoute,
    setPlaylist,
    setIsLoading,
    setError,
    isLoading,
    error,
    setArtists
  } = useAppStore();
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Check if user is authenticated with Spotify
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const spotifyAuth = MainAppSpotifyAuth.getInstance();
        const authStatus = await spotifyAuth.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          try {
            const response = await axios.get(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
            );
            const locationName = response.data.features[0].place_name;
            setUserLocation({ lat, lng, name: locationName });
          } catch (error) {
            console.error('Error getting location name:', error);
            setMapboxApiAvailability(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setMapboxApiAvailability(false);
        }
      );
    } else {
      setMapboxApiAvailability(false); // Geolocation not supported
    }
  }, []);

  const handleGeneratePlaylist = async () => {
    if (!startLocation || !endLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      const { route, duration } = await getRoute(startLocation, endLocation);
      setRoute({ startLocation, endLocation, waypoints: route, duration });

      // Get administrative regions for each waypoint
      const waypoints = await getRouteRegions(route);

      // Generate playlist with waypoints
      const { tracks, artists } = await generatePlaylist(waypoints, duration);
      setPlaylist(tracks);
      setArtists(artists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (type: 'start' | 'end', location: Location) => {
    if (type === 'start') {
      setStartLocation(location);
    } else {
      setEndLocation(location);
    }
  };
  
  const handleLogin = async () => {
    const spotifyAuth = MainAppSpotifyAuth.getInstance();
    await spotifyAuth.authenticate();
  };
  
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 h-12 w-12"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking Spotify authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Music className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Road Trip Playlist Generator</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">To generate playlists for your road trips, you need to connect to Spotify first. This app requires permission to create and modify playlists on your behalf.</p>
          <button
            onClick={handleLogin}
            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            <span>Connect with Spotify</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Music className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Road Trip Playlist Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="space-y-4">
              <LocationInput
                label="Starting Point"
                placeholder="Enter starting location"
                value={startQuery}
                onChange={setStartQuery}
                onSelect={(location) => handleLocationSelect('start', location)}
                userLocation={userLocation || undefined}
                disabled={!isMapboxApiAvailable}
              />
              <LocationInput
                label="Destination"
                placeholder="Enter destination"
                value={endQuery}
                onChange={setEndQuery}
                onSelect={(location) => handleLocationSelect('end', location)}
                userLocation={userLocation || undefined}
                disabled={!isMapboxApiAvailable}
              />
                <button
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={isLoading || !startLocation || !endLocation || !isMapboxApiAvailable}
                  onClick={handleGeneratePlaylist}
                >
                  {isLoading ? 'Generating...' : 'Generate Playlist'}
                </button>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                {!isMapboxApiAvailable && (
                  <p className="text-red-500 text-sm">Map services are currently unavailable. Please try again later.</p>
                )}
              </div>
            </div>
            <PlaylistView />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 h-[300px] sm:h-[400px] lg:h-[600px]">
            <TripMap userLocation={userLocation as Location | null} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoadTripMixtape;