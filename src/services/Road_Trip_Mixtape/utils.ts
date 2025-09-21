import { AcousticBrainzData } from './acousticbrainz';

// Helper to check if a track matches the selected vibe
export function checkVibe(acousticData: AcousticBrainzData, vibe: string): boolean {
  if (vibe === 'any' || !acousticData) return true;

  switch (vibe) {
    case 'upbeat':
      return acousticData.mood_party?.all?.party > 0.5;
    case 'chill':
      return acousticData.mood_relaxed?.all?.relaxed > 0.5;
    case 'energetic':
      return acousticData.mood_energetic?.all?.energetic > 0.5;
    case 'sad':
      return acousticData.mood_sad?.all?.sad > 0.5;
    default:
      return true;
  }
}

export function checkVibeFromSpotifyFeatures(features: any, vibe: string): boolean {
  if (vibe === 'any' || !features) return true;

  switch (vibe) {
    case 'upbeat':
      return features.danceability > 0.6 && features.valence > 0.6;
    case 'chill':
      return features.acousticness > 0.5 && features.energy < 0.5;
    case 'energetic':
      return features.energy > 0.7 && features.danceability > 0.5;
    case 'sad':
      return features.valence < 0.3 && features.energy < 0.4;
    default:
      return true;
  }
}