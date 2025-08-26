import React, { useState, useEffect } from 'react';
import { GlobeComponent } from '../components/CultureClash/GlobeComponent';
import { CountryInfoPanel } from '../components/CultureClash/CountryInfoPanel';
import { SearchInput } from '../components/CultureClash/SearchInput';
import { SpinButton } from '../components/CultureClash/SpinButton';
import { useCultureClashStore } from '../store/cultureClashStore';
import { LoadingSpinner } from '../components/Dashboard/LoadingSpinner'; // Assuming reuse
import { ErrorMessage } from '../components/Dashboard/ErrorMessage'; // Assuming reuse

const CultureClashPage: React.FC = () => {
  const { selectedCountry, loadingCountryData, errorCountryData, fetchCountryData, countryData, selectCountry } = useCultureClashStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedCountry && !countryData[selectedCountry]) {
      fetchCountryData(selectedCountry);
    }
  }, [selectedCountry, fetchCountryData, countryData]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // In a real scenario, you'd filter countries on the globe or suggest them
    // For POC, we'll just use it to potentially select India if searched
    if (term.toLowerCase() === 'india') {
      selectCountry('India');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-gray-900 text-white">
      <div className="relative flex-1 flex items-center justify-center p-4">
        <GlobeComponent />
        <div className="absolute top-4 left-4 z-10">
          <SearchInput onSearch={handleSearch} />
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          <SpinButton />
        </div>
      </div>
      <div className="w-full lg:w-1/3 p-4 overflow-y-auto bg-gray-800 shadow-lg">
        {loadingCountryData && <LoadingSpinner />}
        {errorCountryData && <ErrorMessage message={errorCountryData} />}
        {selectedCountry && countryData[selectedCountry] && (
          <CountryInfoPanel country={countryData[selectedCountry]} />
        )}
        {!selectedCountry && !loadingCountryData && !errorCountryData && (
          <div className="text-center text-gray-400 mt-10">
            Select a country on the globe or use the search to explore its music culture.
          </div>
        )}
      </div>
    </div>
  );
};

export default CultureClashPage;
