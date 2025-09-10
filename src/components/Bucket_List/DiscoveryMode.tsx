import React, { useState, useEffect, useMemo } from 'react';
import { XCircle, Search, Dices, Save } from 'lucide-react';
import { getPublicBucketLists, cloneBucketList } from '../../services/Bucket_List/supabaseBucketList';
import { useAuth } from '../../hooks/useAuth';

interface PublicList {
  id: string;
  name: string;
  description?: string;
  owner_email: string;
}

interface DiscoveryModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscoveryMode: React.FC<DiscoveryModeProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [publicLists, setPublicLists] = useState<PublicList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPublicLists();
    }
  }, [isOpen]);

  const fetchPublicLists = async () => {
    setLoading(true);
    try {
      const lists = await getPublicBucketLists();
      console.log('Fetched public lists:', lists);
      setPublicLists(lists);
    } catch (error) {
      console.error('Error fetching public bucket lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLists = useMemo(() => {
    return publicLists.filter(list =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [publicLists, searchTerm]);

  const handleFeelingLucky = () => {
    if (publicLists.length > 0) {
      const randomIndex = Math.floor(Math.random() * publicLists.length);
      const randomList = publicLists[randomIndex];
      // For now, we just log the random list. A better implementation could scroll to it.
      console.log('Feeling Lucky:', randomList);
      alert(`You should check out: ${randomList.name}`);
    }
  };

  const handleSaveList = async (listId: string) => {
    if (!user) {
      alert('You must be logged in to save a bucket list.');
      return;
    }
    setSaving(listId);
    try {
      await cloneBucketList(listId, user.id);
      alert('Bucket list saved to your profile!');
    } catch (error) {
      console.error('Error saving bucket list:', error);
      alert('Failed to save bucket list. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 text-white">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        title="Close Discovery Mode"
      >
        <XCircle size={32} />
      </button>
      <div className="w-full h-full p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">Discovery Mode</h1>
        <div className="w-full max-w-4xl mb-8 flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for public bucket lists..."
              className="w-full p-3 pl-10 rounded-full bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleFeelingLucky}
            className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 flex items-center gap-2"
          >
            <Dices size={20} />
            Feeling Lucky
          </button>
        </div>

        {loading ? (
          <div className="text-lg">Loading public bucket lists...</div>
        ) : (
          <div className="w-full max-w-4xl overflow-y-auto">
            {filteredLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLists.map(list => (
                  <div key={list.id} className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{list.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{list.description || 'No description.'}</p>
                      <p className="text-xs text-gray-500">Created by: {list.owner_email}</p>
                    </div>
                    <button
                      onClick={() => handleSaveList(list.id)}
                      disabled={saving === list.id}
                      className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-500"
                    >
                      <Save size={16} />
                      {saving === list.id ? 'Saving...' : 'Save to My Lists'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-lg">No public bucket lists found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryMode;
