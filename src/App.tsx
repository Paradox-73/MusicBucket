// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import ArtistExploration from './pages/ArtistExploration';
// import BucketList from './pages/BucketList';
// import CultureClash from './pages/CultureClash';
// import ExplorationScore from './pages/ExplorationScore';
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
//         <Route path="/culture-clash" element={CultureClash} />
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
import Layout from './components/Layout';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import ArtistExploration from './pages/ArtistExploration';
import BucketList from './pages/BucketList';
import RoadTripMixtape from './pages/RoadTripMixtape';
import ExplorationScore from './pages/ExplorationScore';
import CultureClash from './pages/CultureClash';
import RecommendationRoulette from './pages/RecommendationRoulette';
import { SpotifyCallback } from './components/SpotifyCallback';
import AboutUs from './pages/AboutUs';
import Support from './pages/Support';
import Legal from './pages/Legal';
import { SpotifyAuth } from './lib/spotify/auth';

function App() {
  useEffect(() => {
    SpotifyAuth.getInstance().initialize();
  }, []);

  return (
    <Routes>
      <Route path="/callback" element={<SpotifyCallback />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="artist-exploration" element={<ArtistExploration />} />
        <Route path="bucket-list/*" element={<BucketList />} />
        <Route path="culture-clash" element={<CultureClash />} />
        <Route path="exploration-score/*" element={<ExplorationScore />} />
        <Route path="rabbit-hole" element={<ComingSoon />} />
        <Route path="recommendation-roulette" element={<RecommendationRoulette />} />
        <Route path="roadtrip-mixtape" element={<RoadTripMixtape />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="support" element={<Support />} />
        <Route path="privacy" element={<Legal />} />
        <Route path="terms" element={<Legal />} />
        <Route path="profile" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}

export default App;



