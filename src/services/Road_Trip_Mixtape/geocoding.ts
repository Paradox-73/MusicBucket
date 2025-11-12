import axios from 'axios';
import { Location } from '../../types/Road_Trip_Mixtape';
import { useMapboxStatusStore } from '../../store/mapboxStatusStore';

const MAPBOX_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export async function searchLocation(
  query: string, 
  userLocation?: Location
): Promise<Location[]> {
  if (!query || query.length < 3) {
    return [];
  }

  // Build the search parameters
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    types: 'place,address,poi,locality,neighborhood',
    limit: '5',
    language: 'en'
  });

  // If user location is available, add proximity for local bias
  if (userLocation) {
    params.append('proximity', `${userLocation.lng},${userLocation.lat}`);
  }

  try {
    const response = await axios.get(
      `${MAPBOX_API}/${encodeURIComponent(query)}.json?${params.toString()}`
    );
    useMapboxStatusStore.getState().setMapboxApiAvailability(true); // API is available
    return response.data.features.map((feature: any) => ({
      name: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0]
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    useMapboxStatusStore.getState().setMapboxApiAvailability(false); // API is unavailable
    throw error; // Re-throw to propagate the error
  }
}

export async function getRoute(start: Location, end: Location): Promise<{
  route: Location[];
  duration: number;
}> {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${ACCESS_TOKEN}`
    );

    const { coordinates } = response.data.routes[0].geometry;
    const duration = response.data.routes[0].duration;
    useMapboxStatusStore.getState().setMapboxApiAvailability(true); // API is available
    return {
      route: coordinates.map((coord: number[]) => ({
        lng: coord[0],
        lat: coord[1],
        name: ''
      })),
      duration
    };
  } catch (error) {
    console.error('Mapbox Directions API error:', error);
    useMapboxStatusStore.getState().setMapboxApiAvailability(false); // API is unavailable
    throw error; // Re-throw to propagate the error
  }
}

export async function getRouteRegions(route: Location[]): Promise<Location[]> {
  try {
    // Sample points at regular intervals (every 50km or significant turns)
    const sampledPoints = sampleRoutePoints(route, 50);
    
    // Get administrative regions for each point
    const regions = await Promise.all(
      sampledPoints.map(async point => {
        const response = await axios.get(
          `${MAPBOX_API}/${point.lng},${point.lat}.json`,
          {
            params: {
              access_token: ACCESS_TOKEN,
              types: 'region,district,locality'
            }
          }
        );
        
        // Get the most relevant administrative region
        const feature = response.data.features.find(
          (f: any) => f.place_type.includes('region') || f.place_type.includes('district')
        );
        
        return {
          ...point,
          name: feature?.place_name || point.name
        };
      })
    );
    useMapboxStatusStore.getState().setMapboxApiAvailability(true); // API is available
    // Remove duplicate consecutive regions
    return regions.filter((region, index, array) => 
      index === 0 || region.name !== array[index - 1].name
    );
  } catch (error) {
    console.error('Mapbox Geocoding API error for regions:', error);
    useMapboxStatusStore.getState().setMapboxApiAvailability(false); // API is unavailable
    throw error; // Re-throw to propagate the error
  }
}

function sampleRoutePoints(route: Location[], distanceKm: number): Location[] {
  const points: Location[] = [route[0]];
  let distance = 0;
  
  for (let i = 1; i < route.length; i++) {
    distance += calculateDistance(route[i-1], route[i]);
    if (distance >= distanceKm || i === route.length - 1) {
      points.push(route[i]);
      distance = 0;
    }
  }
  
  return points;
}

function calculateDistance(point1: Location, point2: Location): number {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}