import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Music, List, Globe, LayoutDashboard, Shuffle, Car, Trophy } from 'lucide-react';
import { SpotifyLoginButton } from '../components/SpotifyLoginButton';
import { useSpotifyAuthBridge } from '../lib/spotifyAuth';
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard'; // Import the new FeatureCard component

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

  const features = [
    {
      title: 'Dashboard',
      description: 'Get a comprehensive overview of your listening habits, top artists, tracks, and personalized insights.',
      icon: <LayoutDashboard />,
      link: '/dashboard',
    },
    // {
    //   title: 'Artist Exploration',
    //   description: 'Dive deep into your favorite artists, discover new ones, and explore their musical journeys.',
    //   icon: <Music />,
    //   link: '/artist-exploration',
    // },
    {
      title: 'Bucket List',
      description: 'Create and manage your ultimate music bucket list. Never forget a song or artist you want to check out.',
      icon: <List />,
      link: '/bucket-list',
    },
    // {
    //   title: 'Culture Clash',
    //   description: 'Explore music from different cultures around the world. Discover global sounds and their origins.',
    //   icon: <Globe />,
    //   link: '/culture-clash',
    // },
    
    // {
    //   title: 'Recommendation Roulette',
    //   description: 'Spin the wheel and get surprising music recommendations tailored to your taste.',
    //   icon: <Shuffle />,
    //   link: '/recommendation-roulette',
    // },
    {
      title: 'Road Trip Mixtape',
      description: 'Generate the perfect playlist for your road trips based on your destination and mood.',
      icon: <Car />,
      link: '/road-trip-mixtape',
    },
    {
      title: 'Tier Maker',
      description: 'Rank your favorite albums, artists, or songs using our interactive tier list creator.',
      icon: <Trophy />,
      link: '/tier-maker',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-gradient-to-br from-primary-dark to-secondary-dark overflow-hidden py-16">
      {/* Background overlay for aesthetic */}
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

      {/* Hero Section */}
      <div className="container mx-auto text-center relative z-10 p-4 mb-16">
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

      {/* Features Section */}
      <section className="w-full bg-gradient-to-br from-gray-900 to-black py-16 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Explore Our Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                link={feature.link}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
