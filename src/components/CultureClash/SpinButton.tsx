import React from 'react';
import { useCultureClashStore } from '../../store/cultureClashStore';

export const SpinButton: React.FC = () => {
  const { startSpin, stopSpin, selectCountry } = useCultureClashStore();

  const handleSpin = () => {
    startSpin();
    // Simulate a random country selection after a delay
    setTimeout(() => {
      const countries = ['India', 'United States', 'Brazil', 'Japan', 'Nigeria']; // Example countries
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      selectCountry(randomCountry);
      stopSpin();
    }, 3000); // Spin for 3 seconds
  };

  return (
    <button
      onClick={handleSpin}
      className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
    >
      Spin Me!
    </button>
  );
};
