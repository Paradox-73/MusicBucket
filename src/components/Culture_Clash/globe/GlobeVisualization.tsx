import React, { useRef, useEffect } from 'react';
import GlobeGL from 'react-globe.gl';
import { useNavigate } from 'react-router-dom';
import { useGlobeAnimation } from '../../../hooks/Culture_Clash/useGlobeAnimation';
import type { GeoFeature } from '../../../types/Culture_Clash/geo';
import type { FeatureCollection } from 'geojson';

interface GlobeVisualizationProps {
  geoData: FeatureCollection;
  isSpinning: boolean;
  selectedCountry: GeoFeature | null;
  onSpinComplete: (spinning: boolean) => void;
  onCountrySelect: (country: GeoFeature | null) => void;
}

export function GlobeVisualization({
  geoData,
  isSpinning,
  selectedCountry,
  onSpinComplete,
  onCountrySelect
}: GlobeVisualizationProps) {
  const globeRef = useRef();
  const navigate = useNavigate();
  const { startSpinAnimation } = useGlobeAnimation(globeRef);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().enableDamping = true;
      globeRef.current.controls().dampingFactor = 0.1;
    }
  }, []);

  useEffect(() => {
    if (isSpinning) {
      startSpinAnimation();
      // Set a timeout to complete the spinning after 2.5 seconds
      setTimeout(() => {
        onSpinComplete(false);
      }, 2500);
    }
  }, [isSpinning, startSpinAnimation, onSpinComplete]);

  return (
    <GlobeGL
      ref={globeRef}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      lineHoverPrecision={0}
      polygonsData={geoData.features}
      polygonAltitude={0.01}
      polygonCapColor={d => d === selectedCountry ? 'rgba(0, 204, 204, 0.3)' : 'rgba(128, 0, 128, 0.3)'}
      polygonSideColor={d => d === selectedCountry ? 'rgba(0, 204, 204, 0.7)' : 'rgba(128, 0, 128, 0.7)'}
      polygonStrokeColor={() => '#ffffff'}
      polygonLabel={({ properties: d }) => `
        <div class="bg-black/80 p-2 rounded-lg">
          <div class="text-white font-bold">${d?.ADMIN || 'Unknown'}</div>
          <div class="text-[#00CCCC]">Click to explore music</div>
        </div>
      `}
    />
  );
}