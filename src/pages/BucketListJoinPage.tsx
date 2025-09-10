import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { acceptInvite } from '../services/Bucket_List/supabaseBucketList';

const BucketListJoinPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      const handleAcceptInvite = async () => {
        try {
          const listId = await acceptInvite(token, user.id);
          if (listId) {
            navigate(`/bucketlist/${listId}`);
          } else {
            alert('Invalid invite link.');
            navigate('/');
          }
        } catch (error) {
          console.error('Error accepting invite:', error);
          alert('Failed to accept invite. Please try again.');
          navigate('/');
        }
      };
      handleAcceptInvite();
    } else if (!user) {
      // If the user is not logged in, we can store the token and redirect after login
      localStorage.setItem('invite_token', token || '');
      navigate('/'); // Redirect to home page for login
    }
  }, [user, token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 h-12 w-12"></div>
        <p className="text-gray-600 dark:text-gray-300">Joining bucket list...</p>
      </div>
    </div>
  );
};

export default BucketListJoinPage;
