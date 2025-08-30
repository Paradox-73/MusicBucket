import { X } from 'lucide-react';

export const ShareModal = ({ isOpen, onClose, shareUrl }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Share Tier List</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        <p className="mb-4">Share this link:</p>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={shareUrl}
            className="flex-grow p-2 bg-gray-700 rounded text-sm"/>
          <button onClick={handleCopy} className="px-4 py-2 bg-blue-600 rounded">Copy</button>
        </div>
      </div>
    </div>
  );
};
