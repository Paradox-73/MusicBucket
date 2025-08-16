import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SpotifyAuth } from '../lib/spotify/auth';
import { getMe, spotifyApi } from '../lib/spotify';
import type { SpotifyProfile } from '../types/spotify';

const Navbar = () => {
  console.log('Navbar: Component rendering.');
  const { user } = useAuthStore();
  const [spotifyUser, setSpotifyUser] = useState<SpotifyProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log('Navbar: user state changed:', user);
    const currentSpotifyAccessToken = spotifyApi.getAccessToken();
    console.log('Navbar: Spotify Access Token directly from spotifyApi:', currentSpotifyAccessToken);

    if (user && currentSpotifyAccessToken) {
      console.log('Navbar: Fetching Spotify profile...');
      getMe().then(profile => {
        if (profile) {
          console.log('Navbar: Spotify profile fetched:', profile);
          setSpotifyUser(profile);
        } else {
          console.log('Navbar: Failed to fetch Spotify profile.');
          setSpotifyUser(null);
        }
      });
    } else if (!user) {
      console.log('Navbar: Supabase user logged out, clearing Spotify user.');
      setSpotifyUser(null);
    }
  }, [user, spotifyApi.getAccessToken()]);

  const handleLogin = () => {
    SpotifyAuth.getInstance().authenticate();
  };

  const handleLogout = () => {
    SpotifyAuth.getInstance().logout();
    setSpotifyUser(null);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">MusicBucket</Link>
        <div className="flex items-center">
          {spotifyUser ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={spotifyUser.images?.[0]?.url}
                  alt={spotifyUser.display_name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{spotifyUser.display_name}</span>
              </div>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Login with Spotify
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;