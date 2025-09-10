import React from 'react';

interface CommentsSectionProps {
  listId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ listId }) => {
  return (
    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <div className="space-y-4">
        {/* Placeholder for comments */}
        <p className="text-gray-600 dark:text-gray-300">No comments yet. Be the first to comment!</p>
      </div>
      {/* Placeholder for comment input */}
      <textarea
        className="w-full p-2 mt-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder="Add a comment..."
        rows={3}
      ></textarea>
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Post Comment
      </button>
    </div>
  );
};

export default CommentsSection;