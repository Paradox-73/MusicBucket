import React, { useRef, useEffect, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import { useNavigate } from 'react-router-dom';
import { useGeoData } from '../../hooks/Culture_Clash/useGeoData';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import { SpinButton } from './globe/SpinButton';

export default function Globe() {
  const globeRef = useRef();
  const navigate = useNavigate();
  const { geoData, loading, error } = useGeoData();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    if (globeRef.current) {
      // Cast globeRef.current to any to avoid TypeScript error
      const controls = (globeRef.current as any).controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Enable smooth camera animations
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }
    }
  }, []);
  const handleCountryClick = (coords: { lat: number; lng: number }, event: MouseEvent) => {
    const target = event.target as any;
    if (!isSpinning && target?.__data?.properties?.ISO_A2) {
      navigate(`/country/${target.__data.properties.ISO_A2}`);
    }
  };

  const handleSpinGlobe = () => {
    if (!globeRef.current || isSpinning) return;

    setIsSpinning(true);
    setSelectedCountry(null);

    const controls = (globeRef.current as any).controls();
    const globe = globeRef.current;

    // Increased initial speed and duration
    const spinDuration = 3000 + Math.random() * 2000; // Random duration between 3-5 seconds
    const maxSpeed = 50; // Increased from 15 to 50 for multiple rotations
    const finalSpeed = 0.5;

    // Start with max speed
    controls.autoRotateSpeed = maxSpeed;

    // Gradually slow down the rotation
    const startTime = Date.now();
    const animate = () => {
      const progress = (Date.now() - startTime) / spinDuration;
      
      if (progress < 1) {
        // Modified easing function for a longer fast spin
        const factor = Math.pow(progress, 2); // Changed from cubic to quadratic for smoother deceleration
        controls.autoRotateSpeed = maxSpeed - (maxSpeed - finalSpeed) * factor;
        requestAnimationFrame(animate);
      } else {
        controls.autoRotateSpeed = finalSpeed;
        setIsSpinning(false);
        // Get the center point of the globe
        const pointer = (globe as any).renderer().domElement.getBoundingClientRect();
        const centerX = pointer.left + pointer.width / 2;
        const centerY = pointer.top + pointer.height / 2;
        // Use Globe.gl's built-in methods to find country
        const intersects = (globe as any).scene().children
          .find((obj: any) => obj.name === 'polygons')
          ?.children
          .map((obj: { position: { x: number, y: number, z: number } }) => ({
            object: obj,
            point: (globe as any).toGeoCoords((globe as any).camera().position)
          }))
          .sort((a: { object: { position: { x: number, y: number, z: number } } }, b: { object: { position: { x: number, y: number, z: number } } }) =>
            (globe as any).camera().position.distanceTo(a.object.position) -
            (globe as any).camera().position.distanceTo(b.object.position)
          );

        if (intersects?.length) {
          const country = intersects[0].object.__data;
          if (country) {
            setSelectedCountry(country);
            setTimeout(() => {
              // Create a mock event with the required data
              const mockEvent = { target: { __data: country } } as any;
              handleCountryClick({ lat: 0, lng: 0 }, mockEvent);
            }, 500);
          }
        }
      }
    };

    animate();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load globe data" />;
  if (!geoData) return null;

  return (
    <div className="relative h-[600px] w-full">
      <SpinButton isSpinning={isSpinning} onSpin={handleSpinGlobe} />
      <GlobeGL
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        onGlobeClick={handleCountryClick}
        polygonsData={geoData.features}
        polygonAltitude={0.01}
        polygonCapColor={d => d === selectedCountry ? 'rgba(0, 204, 204, 0.3)' : 'rgba(128, 0, 128, 0.3)'}
        polygonSideColor={d => d === selectedCountry ? 'rgba(0, 204, 204, 0.7)' : 'rgba(128, 0, 128, 0.7)'}
        polygonStrokeColor={() => '#ffffff'}
        polygonLabel={(obj: any) => `
          <div class="bg-black/80 p-2 rounded-lg">
            <div class="text-white font-bold">${obj.properties?.ADMIN || 'Unknown'}</div>
            <div class="text-[#00CCCC]">Click to explore music</div>
          </div>
        `}
      />
    </div>
  );
}