// Normalize popularity score between 0.2 and 1.0
export const calculatePopularityWeight = (popularity: number): number => {
  // Spotify popularity is already 0-100
  // Transform to 0.2-1.0 range
  //return 1 - (popularity / 100) * 0.8;
  return 1;
};