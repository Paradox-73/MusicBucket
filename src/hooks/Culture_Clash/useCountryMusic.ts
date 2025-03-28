import { useState, useEffect } from 'react';
import { getCountryMusic } from '../../services/Culture_Clash/spotify';
import type { CountryMusic } from '../../types/Culture_Clash/spotify';

export function useCountryMusic(countryCode: string | undefined) {
  const [data, setData] = useState<CountryMusic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!countryCode) return;

    getCountryMusic(countryCode)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [countryCode]);

  return { data, loading, error };
}