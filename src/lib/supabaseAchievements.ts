import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserData {
  allTracks: any[];
  topArtists: any[];
  musicTasteMetrics: any;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // e.g., a Lucide icon name or URL
}

export interface FullAchievement extends Achievement {
  check: (data: UserData) => boolean;
  getProgress: (data: UserData) => { current: number; target: number; unit: string };
}

// Define your achievements here
export const ALL_ACHIEVEMENTS: FullAchievement[] = [
  {
    id: 'archivist',
    name: 'The Archivist',
    description: 'Have a library of over 1000 songs.',
    icon: 'archive',
    check: (data: UserData) => data.allTracks.length >= 1000,
    getProgress: (data: UserData) => ({
      current: data.allTracks.length,
      target: 1000,
      unit: 'songs',
    }),
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    description: 'Have a high diversity score.',
    icon: 'compass',
    check: (data: UserData) => data.musicTasteMetrics.artistDiversity >= 70,
    getProgress: (data: UserData) => ({
      current: Math.round(data.musicTasteMetrics.artistDiversity),
      target: 70,
      unit: 'diversity score',
    }),
  },
  {
    id: 'adhd-crazy',
    name: 'ADHD Crazy',
    description: 'Your average track length is less than 2 minutes.',
    icon: 'zap',
    check: (data: UserData) => {
      const totalDuration = data.allTracks.reduce((sum, track) => sum + track.track.duration_ms, 0);
      const averageDuration = totalDuration / data.allTracks.length;
      return averageDuration < 120000; // 2 minutes in ms
    },
    getProgress: (data: UserData) => {
      const totalDuration = data.allTracks.reduce((sum, track) => sum + track.track.duration_ms, 0);
      const averageDuration = totalDuration / data.allTracks.length;
      return {
        current: Math.round(averageDuration / 1000 / 60),
        target: 2,
        unit: 'minutes',
      };
    },
  },
  {
    id: 'long-form-listener',
    name: 'Long Form Listener',
    description: 'Your average track length is more than 5 minutes.',
    icon: 'hourglass',
    check: (data: UserData) => {
      const totalDuration = data.allTracks.reduce((sum, track) => sum + track.track.duration_ms, 0);
      const averageDuration = totalDuration / data.allTracks.length;
      return averageDuration > 300000; // 5 minutes in ms
    },
    getProgress: (data: UserData) => {
      const totalDuration = data.allTracks.reduce((sum, track) => sum + track.track.duration_ms, 0);
      const averageDuration = totalDuration / data.allTracks.length;
      return {
        current: Math.round(averageDuration / 1000 / 60),
        target: 5,
        unit: 'minutes',
      };
    },
  },
  {
    id: 'deep-cut-diver',
    name: 'Deep Cut Diver',
    description: 'Your average track popularity is less than 10.',
    icon: 'diving-mask',
    check: (data: UserData) => {
      const totalPopularity = data.allTracks.reduce((sum, track) => sum + track.track.popularity, 0);
      const averagePopularity = totalPopularity / data.allTracks.length;
      return averagePopularity < 10;
    },
    getProgress: (data: UserData) => {
      const totalPopularity = data.allTracks.reduce((sum, track) => sum + track.track.popularity, 0);
      const averagePopularity = totalPopularity / data.allTracks.length;
      return {
        current: Math.round(averagePopularity),
        target: 10,
        unit: 'popularity',
      };
    },
  },
  {
    id: 'stan-demic-spreader',
    name: 'Stan-demic Spreader',
    description: 'Your top 5 artists together form 50% or more of your total top artists.',
    icon: 'users',
    check: (data: UserData) => {
      if (data.topArtists.length < 5) return false;
      const top5ArtistIds = data.topArtists.slice(0, 5).map(artist => artist.id);
      const countTop5InAllTopArtists = data.topArtists.filter(artist => top5ArtistIds.includes(artist.id)).length;
      return countTop5InAllTopArtists / data.topArtists.length >= 0.5;
    },
    getProgress: (data: UserData) => {
      if (data.topArtists.length < 5) return { current: 0, target: 50, unit: '%' };
      const top5ArtistIds = data.topArtists.slice(0, 5).map(artist => artist.id);
      const countTop5InAllTopArtists = data.topArtists.filter(artist => top5ArtistIds.includes(artist.id)).length;
      return {
        current: Math.round((countTop5InAllTopArtists / data.topArtists.length) * 100),
        target: 50,
        unit: '%',
      };
    },
  },
  // Add more achievements here
];

export async function getUserAchievements(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
  return data.map(row => row.achievement_id);
}

export async function grantAchievement(userId: string, achievementId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_id: achievementId });

  if (error) {
    // Ignore unique constraint violation errors (user already has the achievement)
    if (error.code === '23505') { // unique_violation
      console.log(`User ${userId} already has achievement ${achievementId}.`);
      return false;
    }
    console.error('Error granting achievement:', error);
    return false;
  }
  console.log(`Achievement ${achievementId} granted to user ${userId}.`);
  return true;
}
