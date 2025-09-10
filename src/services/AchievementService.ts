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