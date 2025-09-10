import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // e.g., a Lucide icon name or URL
}

// Define your achievements here
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Artist Exploration achievements removed as per user request.
  // Add more achievements as needed
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
