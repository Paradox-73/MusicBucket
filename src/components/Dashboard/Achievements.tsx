import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Award, CheckCircle2 } from 'lucide-react';
import { ALL_ACHIEVEMENTS, UserData, FullAchievement } from '../../lib/supabaseAchievements';

interface UserAchievement {
  achievement_id: string;
}

interface AchievementsProps {
  allTracks: any[];
  topArtists: any[];
  musicTasteMetrics: any;
}

export const Achievements: React.FC<AchievementsProps> = ({ allTracks, topArtists, musicTasteMetrics }) => {

  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery<UserAchievement[]>({ 
    queryKey: ['userAchievements'], 
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id);
      if (error) throw error;
      return data;
    }
  });

  const unlockedAchievementIds = new Set(userAchievements?.map(a => a.achievement_id));

  if (isLoadingUserAchievements) {
    return <p>Loading achievements...</p>;
  }

  const userData: UserData = { allTracks, topArtists, musicTasteMetrics };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_ACHIEVEMENTS.map((achievement: FullAchievement) => {
          const isUnlocked = unlockedAchievementIds.has(achievement.id);
          const progress = achievement.getProgress(userData);
          const progressText = !isUnlocked && progress ? `${progress.current}/${progress.target} ${progress.unit}` : '';

          return (
            <div key={achievement.id} className={`p-4 rounded-lg ${isUnlocked ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isUnlocked ? 'bg-green-500' : 'bg-gray-500'}`}>
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  {!isUnlocked && progressText && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Progress: {progressText}</p>
                  )}
                </div>
                {isUnlocked && <CheckCircle2 size={24} className="text-green-500 ml-auto" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
