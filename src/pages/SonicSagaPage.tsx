import React, { useEffect, useState } from 'react';
import SonicSagaCard from '../components/SonicSaga/SonicSagaCard';
import { SonicSagaService, UserCard } from '../services/SonicSagaService';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/Dashboard/LoadingSpinner'; // Assuming a LoadingSpinner component exists
import { ErrorMessage } from '../components/Dashboard/ErrorMessage'; // Assuming an ErrorMessage component exists
import { SpotifyAuth } from '../lib/spotify/auth'; // Import SpotifyAuth to get access token

const SonicSagaPage: React.FC = () => {
  const { user } = useAuthStore();
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState<string | null>(null);

  const fetchUserCards = async () => {
    if (!user?.id) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cards = await SonicSagaService.getUserCards(user.id);
      setUserCards(cards);
    } catch (err) {
      setError('Failed to fetch Sonic Sagas cards.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, [user]);

  const handleProcessSonicSagas = async () => {
    if (!user?.id) {
      alert('Please log in to process your Sonic Sagas.');
      return;
    }

    setProcessing(true);
    setProcessMessage(null);
    setError(null);

    try {
      const spotifyAccessToken = SpotifyAuth.getInstance().getAccessToken();
      if (!spotifyAccessToken) {
        alert('Please connect your Spotify account.');
        setProcessing(false);
        return;
      }

      const result = await SonicSagaService.processSonicSagasClient(user.id, spotifyAccessToken);
      setProcessMessage(result.message || 'Sonic Sagas processed successfully!');
      setProcessMessage(result.message || 'Sonic Sagas processed successfully!');
      // Re-fetch cards after processing
      await fetchUserCards();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during processing.');
      console.error('Error processing Sonic Sagas:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <LoadingSpinner />
        <p>Loading your Sonic Sagas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sonic Sagas</h1>
      <p className="mb-6">Welcome to Sonic Sagas! Your music monster collection awaits.</p>

      <div className="mb-6">
        <button
          onClick={handleProcessSonicSagas}
          disabled={processing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Process My Sonic Sagas'}
        </button>
        {processMessage && <p className="text-green-600 mt-2">{processMessage}</p>}
        {error && <ErrorMessage message={error} />}
      </div>

      {userCards.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          You haven't collected any Sonic Sagas yet. Click "Process My Sonic Sagas" to discover new artists and unlock cards!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userCards.map((userCard) => (
            <SonicSagaCard
              key={userCard.id}
              artistName={userCard.artist_card.artist_name}
              artworkUrl={userCard.artist_card.artwork_url || 'https://via.placeholder.com/150'} // Placeholder image
              primaryGenre={userCard.artist_card.primary_genre}
              level={userCard.level}
              hp={userCard.artist_card.base_hp + (userCard.level * 5)}
              attack={userCard.artist_card.base_attack + (userCard.level * 3)}
              defense={userCard.artist_card.base_defense + (userCard.level * 2)}
              rarity={userCard.artist_card.rarity}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SonicSagaPage;