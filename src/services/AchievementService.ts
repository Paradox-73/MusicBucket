import { supabase } from '../lib/supabase';

interface UserData {
  allTracks: any[];
  topArtists: any[];
  musicTasteMetrics: any;
}

export const achievements = [
  {
    id: 'archivist',
    name: 'The Archivist',
    description: 'Have a library of over 1000 songs.',
    icon: 'archive',
    check: (data: UserData) => data.allTracks.length > 1000,
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    description: 'Have a high diversity score.',
    icon: 'compass',
    check: (data: UserData) => data.musicTasteMetrics.artistDiversity > 70,
  },
  // Add more achievements here
];

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

  for (const achievement of achievements) {
    if (!unlockedAchievementIds.has(achievement.id)) {
      if (achievement.check(data)) {
        await awardAchievement(userId, achievement.id);
      }
    }
  }
};