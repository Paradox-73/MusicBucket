// Using Natural Earth Data in GeoJSON format
export const worldGeoData = {
  type: "FeatureCollection",
  features: [
    // For brevity, this is a simplified example. In production, this would contain all countries
    {
      type: "Feature",
      properties: {
        ADMIN: "United States",
        ISO_A2: "US"
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: []
      }
    },
    {
      type: "Feature",
      properties: {
        ADMIN: "United Kingdom",
        ISO_A2: "GB"
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: []
      }
    }
  ]
};