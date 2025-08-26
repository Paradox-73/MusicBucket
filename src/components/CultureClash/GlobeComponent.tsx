import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { useCultureClashStore } from '../../store/cultureClashStore';

export const GlobeComponent: React.FC = () => {
  const globeEl = useRef();
  const { selectCountry, selectedCountry } = useCultureClashStore();
  const [countries, setCountries] = useState({ features: [] });

  useEffect(() => {
    // Load country polygons data
    fetch('/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(countries => {
        setCountries(countries);
      })
      .catch(error => console.error("Error loading countries GeoJSON:", error));
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      // Auto-rotate the globe
      // @ts-ignore
      globeEl.current.controls().autoRotate = true;
      // @ts-ignore
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const handleCountryClick = (polygon: any) => {
    const countryName = polygon.properties.NAME;
    selectCountry(countryName);
    // @ts-ignore
    globeEl.current.controls().autoRotate = false; // Stop rotation on click
  };

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      polygonsData={countries.features}
      polygonAltitude={0.06}
      polygonCapColor={feat => feat.properties.NAME === selectedCountry ? '#FFD700' : 'rgba(200, 200, 200, 0.7)'}
      polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
      polygonStrokeColor={() => '#111'}
      onPolygonClick={handleCountryClick}
      polygonsTransitionDuration={300}
    />
  );
};