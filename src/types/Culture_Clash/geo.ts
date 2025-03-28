import type { Feature } from 'geojson';

export interface CountryProperties {
  ADMIN: string;
  ISO_A2: string;
}

export type GeoFeature = Feature<any, CountryProperties>;