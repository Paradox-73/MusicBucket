import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getUserAchievements, ALL_ACHIEVEMENTS, Achievement } from '../../lib/supabaseAchievements';
import { Loader2, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Props {
  user: User;
}

export function ArtistAchievements({ user }: Props) {
  const [achievedIds, setAchievedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          throw new Error('User not authenticated.');
        }
        const ids = await getUserAchievements(user.id);
        setAchievedIds(ids);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="mt-2 text-gray-600">Loading achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  const earnedAchievements = ALL_ACHIEVEMENTS.filter(achievement => achievedIds.includes(achievement.id));

  if (earnedAchievements.length === 0) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg text-center mt-4">
        <p className="text-gray-600">No achievements earned yet. Keep exploring!</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg mt-4 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">Your Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {earnedAchievements.map(achievement => {
          const IconComponent = (LucideIcons as any)[achievement.icon];
          return (
            <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-sm dark:bg-gray-700">
              {IconComponent && <IconComponent className="w-8 h-8 text-yellow-500" />}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{achievement.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}