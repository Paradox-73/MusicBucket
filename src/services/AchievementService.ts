import { supabase } from '../lib/supabase';
import { ALL_ACHIEVEMENTS, UserData } from '../lib/supabaseAchievements';

const awardAchievement = async (userId: string, achievementId: string) => {
  const { error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievementId });
  if (error) {
    console.error(`Error awarding achievement ${achievementId}:`, error);
  }
};

export const checkAndAwardAchievements = async (userId: string, data: UserData) => {
  const { data: unlockedAchievements, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user achievements:', error);
    return;
  }

  const unlockedAchievementIds = new Set(unlockedAchievements.map(a => a.achievement_id));

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (!unlockedAchievementIds.has(achievement.id)) {
      if (achievement.check(data)) {
        await awardAchievement(userId, achievement.id);
      }
    }
  }
};