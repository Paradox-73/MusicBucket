import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Culture_Clash/Navbar';
import Globe from '../components/Culture_Clash/Globe';
import { CountryMusic } from '../components/Culture_Clash/CountryMusic';
import Footer from '../components/Culture_Clash/Footer';

const CultureClash = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold text-center text-white mb-8">
                Explore World Music
              </h1>
              <p className="text-[#00CCCC] text-center mb-12 max-w-2xl mx-auto">
                Discover the rich musical heritage of different cultures. 
                Spin the globe, select a country, and immerse yourself in its unique sounds.
              </p>
              
              <Globe />
            </div>
          } />
          <Route path="/country/:countryCode" element={<CountryMusic />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default CultureClash;