import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicTierList } from '../lib/supabaseTierMaker';
import { getSeveralArtists, getSeveralAlbums, getSeveralTracks } from '../lib/spotify';
import TierRow from '../components/TierMaker/TierRow';
import TierItem from '../components/TierMaker/TierItem';

interface Tier {
  id: string;
  label: string;
  color: string;
  rank: number;
  items: any[];
}

const PublicTierListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tierList, setTierList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    const fetchTierList = async () => {
      if (!id) {
        setError('No tier list ID provided.');
        setLoading(false);
        return;
      }

      try {
        const result = await getPublicTierList(id);
        if (result.success && result.data) {
          const loadedList = result.data;
          setTierList(loadedList);

          const newTiers: Tier[] = [];
          for (const loadedTier of loadedList.tiers) {
            const spotifyIds = loadedTier.tier_list_placements.map((p: any) => p.item_spotify_id);
            let spotifyItems: any[] = [];

            if (spotifyIds.length > 0) {
              if (loadedList.scope === 'artist') {
                spotifyItems = await getSeveralArtists(spotifyIds);
              } else if (loadedList.scope === 'album') {
                spotifyItems = await getSeveralAlbums(spotifyIds);
              } else if (loadedList.scope === 'track') {
                spotifyItems = await getSeveralTracks(spotifyIds);
              }
            }

            newTiers.push({
              id: loadedTier.id,
              label: loadedTier.label,
              color: loadedTier.color,
              rank: loadedTier.rank,
              items: spotifyItems,
            });
          }
          newTiers.sort((a, b) => a.rank - b.rank);
          setTiers(newTiers);
        } else {
          setError('Tier list not found or not public.');
        }
      } catch (err) {
        console.error('Error fetching public tier list:', err);
        setError('Failed to load tier list.');
      } finally {
        setLoading(false);
      }
    };

    fetchTierList();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading tier list...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!tierList) {
    return <div className="text-center py-8">Tier list not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{tierList.title}</h1>
      {tierList.description && <p className="text-gray-600 dark:text-gray-400 mb-4">{tierList.description}</p>}
      <div className="flex flex-col">
        {tiers.map((tier) => (
          <TierRow key={tier.id} id={tier.id} label={tier.label} color={tier.color}>
            {tier.items.map((item) => (
              <TierItem
                key={item.id}
                item={item}
                itemType={tierList.scope}
              />
            ))}
          </TierRow>
        ))}
      </div>
    </div>
  );
};

export default PublicTierListPage;