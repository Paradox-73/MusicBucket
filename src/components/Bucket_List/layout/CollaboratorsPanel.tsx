import React, { useState, useEffect } from 'react';
import { getCollaborators, addCollaborator, removeCollaborator, getUserByEmail } from '../../../services/Bucket_List/supabaseBucketList';

interface Collaborator {
  user_id: string;
  profiles: {
    email: string;
  } | null;
}

interface CollaboratorsPanelProps {
  listId: string;
}

const CollaboratorsPanel: React.FC<CollaboratorsPanelProps> = ({ listId }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, [listId]);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const data = await getCollaborators(listId);
      if (data) {
        setCollaborators(data);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const user = await getUserByEmail(newCollaboratorEmail);
      if (user) {
        await addCollaborator(listId, user.id);
        setNewCollaboratorEmail('');
        fetchCollaborators(); // Refresh the list
      } else {
        alert('User with this email not found.');
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      alert('Failed to add collaborator. Please try again.');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await removeCollaborator(listId, userId);
      fetchCollaborators(); // Refresh the list
    } catch (error) {
      console.error('Error removing collaborator:', error);
      alert('Failed to remove collaborator. Please try again.');
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Collaborators</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Enter collaborator's email"
          className="flex-grow p-2 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
          value={newCollaboratorEmail}
          onChange={(e) => setNewCollaboratorEmail(e.target.value)}
        />
        <button
          onClick={handleAddCollaborator}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading collaborators...</p>
      ) : (
        <ul className="space-y-2">
          {collaborators.map(c => (
            <li key={c.user_id} className="flex justify-between items-center bg-gray-200 dark:bg-gray-600 p-2 rounded-md">
              <span>{c.profiles?.email || 'Unknown User'}</span>
              <button
                onClick={() => handleRemoveCollaborator(c.user_id)}
                className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CollaboratorsPanel;
