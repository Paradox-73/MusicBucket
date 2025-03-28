import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/artist-exploration">Artist Exploration</Link></li>
        <li><Link to="/bucket-list">Bucket List</Link></li>
        <li><Link to="/culture-clash">Culture Clash</Link></li>
        <li><Link to="/exploration-score">Exploration Score</Link></li>
        <li><Link to="/rabbit-hole">Rabbit Hole</Link></li>
        <li><Link to="/recommendation-roulette">Recommendation Roulette</Link></li>
        <li><Link to="/road-trip-mixtape">Road Trip Mixtape</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar; 