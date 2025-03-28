import React, { useState } from 'react';
import { useGeoData } from '../../../hooks/Culture_Clash/useGeoData';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { SpinButton } from './SpinButton';
import { GlobeVisualization } from './GlobeVisualization';
import { CountrySelection } from './CountrySelection';
import type { GeoFeature } from '../../../types/Culture_Clash/geo';

export default function GlobeContainer() {
  const { geoData, loading, error } = useGeoData();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<GeoFeature | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load globe data" />;
  if (!geoData) return null;

  return (
    <div className="relative h-[600px] w-full">
      <SpinButton isSpinning={isSpinning} onSpin={() => setIsSpinning(true)} />
      <GlobeVisualization 
        geoData={geoData}
        isSpinning={isSpinning}
        selectedCountry={selectedCountry}
        onSpinComplete={setIsSpinning}
        onCountrySelect={setSelectedCountry}
      />
      {selectedCountry && !isSpinning && (
        <CountrySelection country={selectedCountry} />
      )}
    </div>
  );
}