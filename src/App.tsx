// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import ArtistExploration from './pages/ArtistExploration';
// import BucketList from './pages/BucketList';
// import Dashboard from './pages/Dashboard';
// import RabbitHole from './pages/RabbitHole';
// import RecommendationRoulette from './pages/RecommendationRoulette';
// import RoadTripMixtape from './pages/RoadTripMixtape';

// const App = () => {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/artist-exploration" element={ArtistExploration} />
//         <Route path="/bucket-list" element={BucketList} />
//         <Route path="/exploration-score" element={ExplorationScore} />
//         <Route path="/rabbit-hole" element={RabbitHole} />
//         <Route path="/recommendation-roulette" element={RecommendationRoulette} />
//         <Route path="/road-trip-mixtape" element={RoadTripMixtape} />
//         <Route path="/" element={<h1>Welcome to MusicBucket</h1>} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import ArtistExploration from './pages/ArtistExploration';
import BucketList from './pages/BucketList';
import RoadTripMixtape from './pages/RoadTripMixtape';
import Dashboard from './pages/Dashboard';
import RecommendationRoulette from './pages/RecommendationRoulette';
import { SpotifyCallback } from './components/SpotifyCallback';
import AboutUs from './pages/AboutUs';
import Support from './pages/Support';
import Legal from './pages/Legal';
import { SpotifyAuth } from './lib/spotify/auth';
import { AuthCallback } from './components/Bucket_List/AuthCallback';
import CultureClashPage from './pages/CultureClashPage';
import PublicBucketListPage from './pages/PublicBucketListPage';
import TierMakerPage from './pages/TierMakerPage';
import PublicTierListPage from './pages/PublicTierListPage';
import ShareBucketListPage from './pages/ShareBucketListPage'; // New Cozy Share Page
import BucketListJoinPage from './pages/BucketListJoinPage';
import { useAuthStore } from './store/authStore';
import { useDashboardDataStore } from './store/Dashboard/dashboardDataStore';

const isProduction = import.meta.env.PROD;

function App() {
  const { session, user } = useAuthStore();
  const { initializeDashboardData, queryClient } = useDashboardDataStore();

  useEffect(() => {
    SpotifyAuth.getInstance().initialize();
  }, []);

  useEffect(() => {
    if (session && user) {
      initializeDashboardData(true, user.id);
    } else {
      initializeDashboardData(false); // Clear or reset if not authenticated
    }
  }, [session, user, initializeDashboardData]);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/bucket-list/callback" element={<AuthCallback />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/*<Route path="artist-exploration" element={isProduction ? <ComingSoon /> : <ArtistExploration />} />*/}
          <Route path="bucket-list/*" element={<BucketList />} />
          <Route path="dashboard/*" element={<Dashboard />} />
          {/*<Route path="rabbit-hole" element={<ComingSoon />} />*/}
          {/*<Route path="recommendation-roulette" element={isProduction ? <ComingSoon /> : <RecommendationRoulette />} />*/}
          <Route path="roadtrip-mixtape" element={<RoadTripMixtape />} />
          <Route path="tiermaker" element={ <TierMakerPage />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="support" element={<Support />} />
          <Route path="privacy" element={<Legal />} />
          <Route path="terms" element={<Legal />} />
          <Route path="profile" element={<ComingSoon />} />
          {/*<Route path="culture-clash" element={isProduction ? <ComingSoon /> : <CultureClashPage />} />*/}
        </Route>
        <Route path="/bucketlist/share/:id" element={<PublicBucketListPage />} />
        <Route path="/bucketlist/join/:token" element={<BucketListJoinPage />} />
        <Route path="/tiermaker/share/:id" element={isProduction ? <ComingSoon /> : <PublicTierListPage />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;