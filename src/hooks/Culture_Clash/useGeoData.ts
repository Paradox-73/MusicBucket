import { useState, useEffect } from 'react';
import { FeatureCollection } from 'geojson';
import { fetchWorldGeoData } from '../../services/Culture_Clash/geoData';

export function useGeoData() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchWorldGeoData()
      .then(data => setGeoData(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { geoData, loading, error };
}