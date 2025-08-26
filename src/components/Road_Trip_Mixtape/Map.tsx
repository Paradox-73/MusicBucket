import React, { useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { useAppStore } from '../../store/Road_Trip_Mixtape';
import { Location } from '../../types/Road_Trip_Mixtape';
import mapboxgl from 'mapbox-gl';
import { useTheme } from '../../hooks/useTheme';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface TripMapProps {
  userLocation: Location | null;
}

export const TripMap: React.FC<TripMapProps> = ({ userLocation }) => {
  const { route, artists } = useAppStore();
  const mapRef = useRef<any>();
  const { theme } = useTheme();

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 10,
      duration: 2000
    });
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !route) return;

    const points = [
      route.startLocation,
      route.endLocation,
      ...(userLocation ? [userLocation] : []),
      ...route.waypoints
    ].filter(point => point && point.lng && point.lat);

    if (points.length < 2) return;

    const bounds = new mapboxgl.LngLatBounds();
    points.forEach(point => {
      bounds.extend([point.lng, point.lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      duration: 2000
    });
  }, [route, userLocation]);

  const routeLayer = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#3b82f6',
      'line-width': 3,
    },
  } as const;

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: userLocation?.lng || -98,
        latitude: userLocation?.lat || 39,
        zoom: userLocation ? 10 : 3.5,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={theme === 'dark' ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11'}
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {userLocation && (
        <Marker
          longitude={userLocation.lng}
          latitude={userLocation.lat}
          anchor="bottom"
        >
          <div className="relative">
            <div className="absolute -top-8 -left-2 bg-blue-500 text-white dark:bg-blue-600 px-2 py-1 rounded text-sm whitespace-nowrap">
              You are here
            </div>
            <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded-full" />
          </div>
        </Marker>
      )}
      {route && (
        <>
          <Marker longitude={route.startLocation.lng} latitude={route.startLocation.lat}>
            <MapPin className="w-6 h-6 text-green-500" />
          </Marker>
          <Marker longitude={route.endLocation.lng} latitude={route.endLocation.lat}>
            <MapPin className="w-6 h-6 text-red-500" />
          </Marker>
          <Source
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.waypoints.map(wp => [wp.lng, wp.lat])
              }
            }}
          >
            <Layer {...routeLayer} />
          </Source>
        </>
      )}
    </Map>
  );
};