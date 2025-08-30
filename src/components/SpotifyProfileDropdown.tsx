import React, { useState, useRef, useEffect } from 'react';
import { SpotifyAuth } from '../lib/spotify/auth';
import { getMe } from '../lib/spotify';
import type { SpotifyProfile } from '../types/spotify';
import { useAuth } from '../hooks/useAuth'; // Import useAuth

const SpotifyProfileDropdown: React.FC = () => {
  const { user, accessToken } = useAuth(); // Use user and accessToken from useAuth
  const [spotifyUser, setSpotifyUser] = useState<SpotifyProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const toggleElement = document.getElementById('spotify-profile-toggle');
        if (toggleElement && toggleElement.contains(event.target as Node)) {
          return;
        }
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      getMe().then(profile => {
        if (profile) {
          setSpotifyUser(profile);
        } else {
          setSpotifyUser(null);
        }
      });
    } else if (!user) {
      setSpotifyUser(null);
    }
  }, [user, accessToken]); // React to changes in user and accessToken

  const handleLogin = () => {
    SpotifyAuth.getInstance().authenticate();
  };

  const handleLogout = () => {
    SpotifyAuth.getInstance().logout();
    setSpotifyUser(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {spotifyUser ? (
        <>
          <div
            id="spotify-profile-toggle"
            className="flex items-center cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src={spotifyUser.images?.[0]?.url}
              alt={spotifyUser.display_name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-gray-600 dark:text-gray-300">{spotifyUser.display_name}</span>
          </div>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <button onClick={handleLogin} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Login with Spotify
        </button>
      )}
    </div>
  );
};

export default SpotifyProfileDropdown;