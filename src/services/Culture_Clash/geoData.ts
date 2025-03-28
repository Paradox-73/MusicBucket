import { FeatureCollection } from 'geojson';

const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

export async function fetchWorldGeoData(): Promise<FeatureCollection> {
  try {
    const response = await fetch(GEOJSON_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch GeoJSON data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GeoJSON data:', error);
    throw error;
  }
}