import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SpotifyLoginButton } from '../components/SpotifyLoginButton';
import { useSpotifyAuthBridge } from '../lib/spotifyAuth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const spotifyAuth = useSpotifyAuthBridge();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await spotifyAuth.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  return (
    <div className="pt-20 sm:pt-32 pb-10 sm:pb-20 px-2 sm:px-4"> {/* Adjusted padding */}
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Your Musical Journey Starts Here
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Discover, collect, and share music like never before. MusicBucket helps you explore new sounds, create perfect playlists, and track your musical adventures.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isAuthenticated ? (
            <SpotifyLoginButton />
          ) : (
            <Link
              to="/dashboard"
              className="bg-primary text-white px-6 py-3 sm:px-8 rounded-full hover:bg-primary-dark transition-colors duration-200 flex items-center"> {/* Adjusted padding */}
              Go to Dashboard <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          )}
          <Link
            to="/about"
            className="border-2 border-primary text-primary dark:text-secondary px-6 py-3 sm:px-8 rounded-full hover:bg-primary hover:text-white dark:hover:bg-secondary dark:hover:text-gray-900 transition-colors duration-200"> {/* Adjusted padding */}
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;