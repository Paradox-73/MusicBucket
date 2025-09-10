import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '/src/lib/supabase.ts';
import { getBucketLists, followUser, unfollowUser, getFollowingUsers } from '../services/Bucket_List/supabaseBucketList';

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserLists();
      checkIfFollowing();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    const { data, error } = await supabase.from('users').select('id, email').eq('id', userId).single();
    if (data) {
      setUser(data);
    }
  };

  const fetchUserLists = async () => {
    const userLists = await getBucketLists(userId!);
    setLists(userLists.filter(list => list.is_public));
  };

  const checkIfFollowing = async () => {
    if (currentUser) {
      const following = await getFollowingUsers(currentUser.id);
      setIsFollowing(following.some(f => f.following_id === userId));
    }
  };

  const handleFollow = async () => {
    if (currentUser) {
      await followUser(currentUser.id, userId!);
      setIsFollowing(true);
    }
  };

  const handleUnfollow = async () => {
    if (currentUser) {
      await unfollowUser(currentUser.id, userId!);
      setIsFollowing(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{user.email}</h1>
      {currentUser && currentUser.id !== userId && (
        <button onClick={isFollowing ? handleUnfollow : handleFollow} className="mt-4 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}
      <hr className="my-4" />
      <h2 className="text-xl font-semibold">Public Lists</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
        {lists.map(list => (
          <div key={list.id} className="rounded-lg border border-gray-200 dark:border-white/10 p-4">
            <h3 className="font-bold">{list.name}</h3>
            <p>{list.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
