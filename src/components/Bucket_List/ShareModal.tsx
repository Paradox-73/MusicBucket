import React, { useState } from 'react';
import { createInviteToken } from '../../services/Bucket_List/supabaseBucketList';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  listName: string;
  ownerName: string;
  listId: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl, listName, ownerName, listId }) => {
  const [inviteLink, setInviteLink] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleCreateInviteLink = async () => {
    try {
      const token = await createInviteToken(listId);
      const newInviteLink = `${window.location.origin}/bucketlist/join/${token}`;
      setInviteLink(newInviteLink);
    } catch (error) {
      console.error('Error creating invite link:', error);
      alert('Failed to create invite link. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Share Your Bucket List</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">List: <span className="font-semibold">{listName}</span></p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Owner: <span className="font-semibold">{ownerName}</span></p>

        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-grow bg-transparent outline-none text-gray-900 dark:text-white"
          />
          <button
            onClick={() => handleCopy(shareUrl)}
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Copy
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handleCreateInviteLink}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 mb-2"
          >
            Create Invite Link for Collaborators
          </button>
          {inviteLink && (
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-grow bg-transparent outline-none text-gray-900 dark:text-white"
              />
              <button
                onClick={() => handleCopy(inviteLink)}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;