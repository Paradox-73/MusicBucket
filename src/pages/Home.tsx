import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SpotifyLoginButton } from '../components/SpotifyLoginButton';
import { useSpotifyAuthBridge } from '../lib/spotifyAuth';
import { motion } from 'framer-motion'; // Import motion

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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-secondary-dark overflow-hidden">
      {/* Background overlay for aesthetic */}
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
      {/* Optional: Add a subtle pattern or image here */}
      {/* <img src="/path/to/your/music-pattern.png" alt="Music Pattern" className="absolute inset-0 w-full h-full object-cover opacity-10 z-0" /> */}

      <div className="container mx-auto text-center relative z-10 p-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6"
        >
          Your Musical Journey Starts Here
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-200 max-w-2xl mx-auto mb-8"
        >
          Discover, collect, and share music like never before. MusicBucket helps you explore new sounds, create perfect playlists, and track your musical adventures.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          {!isAuthenticated ? (
            <SpotifyLoginButton />
          ) : (
            <Link
              to="/dashboard"
              className="bg-primary text-white px-6 py-3 sm:px-8 rounded-full hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center text-lg font-semibold"
            >
              Go to Dashboard <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          )}
          <Link
            to="/about"
            className="border-2 border-primary text-primary px-6 py-3 sm:px-8 rounded-full hover:bg-primary hover:text-white transition-colors duration-200 flex items-center justify-center text-lg font-semibold"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;