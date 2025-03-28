import { useCallback } from 'react';
import type { GeoFeature } from '../../types/Culture_Clash/geo';

interface SpinAnimationOptions {
  onComplete: (country: GeoFeature | null) => void;
}

export function useGlobeAnimation(globeRef: React.RefObject<any>) {
  const startSpinAnimation = useCallback(({ onComplete }: SpinAnimationOptions) => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    const globe = globeRef.current;

    const spinDuration = 2500; // 2.5 seconds
    const maxSpeed = 15;
    const finalSpeed = 0.5;

    controls.autoRotateSpeed = maxSpeed;

    const startTime = Date.now();
    const animate = () => {
      const progress = (Date.now() - startTime) / spinDuration;
      
      if (progress < 1) {
        const factor = 1 - Math.pow(1 - progress, 3);
        controls.autoRotateSpeed = maxSpeed - (maxSpeed - finalSpeed) * factor;
        requestAnimationFrame(animate);
      } else {
        controls.autoRotateSpeed = finalSpeed;
        
        // Get the center point of the globe
        const pointer = globe.renderer().domElement.getBoundingClientRect();
        const centerX = pointer.left + pointer.width / 2;
        const centerY = pointer.top + pointer.height / 2;
        
        // Convert screen coordinates to normalized device coordinates
        const normalizedX = (centerX / pointer.width) * 2 - 1;
        const normalizedY = -(centerY / pointer.height) * 2 + 1;
        
        // Use Globe.gl's built-in point finding method
        const intersection = globe.pointFromScreen({ x: normalizedX, y: normalizedY });
        if (intersection) {
          // Find the country at the intersection point
          const country = globe.polygonsData().find((d: GeoFeature) => {
            const polygonPoints = globe.polygonGeoJsonGeometry(d);
            return pointInPolygon(intersection, polygonPoints);
          });
          onComplete(country || null);
        } else {
          onComplete(null);
        }
      }
    };

    animate();
  }, [globeRef]);

  return { startSpinAnimation };
}

// Helper function to check if a point is inside a polygon
function pointInPolygon(point: [number, number], polygon: any): boolean {
  if (!polygon || !polygon.coordinates) return false;

  const [lon, lat] = point;
  let inside = false;

  // Handle MultiPolygon
  const coordinates = polygon.type === 'MultiPolygon' 
    ? polygon.coordinates.flat() 
    : polygon.coordinates;

  coordinates.forEach(ring => {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];

      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
  });

  return inside;
}