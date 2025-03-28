export const calculateRecencyWeight = (releaseDate: string): number => {
  const releaseTimestamp = new Date(releaseDate).getTime();
  const now = new Date().getTime();
  const daysSinceRelease = (now - releaseTimestamp) / (1000 * 60 * 60 * 24);
  
  // Use exponential decay function
  // Newer songs (less days) will have lower scores
  const maxDays = 365 * 50; // 50 years as max age
  const normalizedDays = Math.min(daysSinceRelease, maxDays) / maxDays;
  
  // Transform to 0.5-1.0 range
  //return 0.5 + (normalizedDays * 0.5);
  return 1;
};