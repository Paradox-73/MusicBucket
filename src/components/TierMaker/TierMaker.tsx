import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import ItemBank from './ItemBank';
import TierRow from '././TierRow';
import TierItem from './TierItem';
import TierEditorModal from './TierEditorModal';
import { useAuth } from '../../hooks/useAuth';
import { saveTierList, updateTierList, getTierList, publishTierList } from '../../lib/supabaseTierMaker';
import { getSeveralArtists, getSeveralAlbums, getSeveralTracks, getMyFollowedArtists, getMySavedAlbums, getAlbumTracks } from '../../lib/spotify';

interface Tier {
  id: string;
  label: string;
  color: string;
  rank: number;
  items: any[];
}

const TierMaker: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [activeItem, setActiveItem] = useState<any>(null);
  const [tierListId, setTierListId] = useState<string | null>(null);
  const [tierTitle, setTierTitle] = useState<string>('My Awesome Tier List');
  const [tierDescription, setTierDescription] = useState<string>('');
  const [tierScope, setTierScope] = useState<string>('artist'); // Default scope
  const [tierScopeContext, setTierScopeContext] = useState<string | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [bankItems, setBankItems] = useState<any[]>([]); // Items in the bank
  const [loadingBankItems, setLoadingBankItems] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [userAlbums, setUserAlbums] = useState<any[]>([]);

  const [tiers, setTiers] = useState<Tier[]>([
    { id: 's-tier', label: 'S Tier', color: '#FF7F7F', rank: 0, items: [] },
    { id: 'a-tier', label: 'A Tier', color: '#FFBF7F', rank: 1, items: [] },
    { id: 'b-tier', label: 'B Tier', color: '#FFFF7F', rank: 2, items: [] },
    { id: 'c-tier', label: 'C Tier', color: '#BFFF7F', rank: 3, items: [] },
    { id: 'd-tier', label: 'D Tier', color: '#7FFFFF', rank: 4, items: [] },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  // Fetch user albums for track scope
  useEffect(() => {
    const fetchUserAlbums = async () => {
      if (!accessToken) return;
      try {
        const albums = await getMySavedAlbums();
        setUserAlbums(albums.map((item: any) => item.album)); // Extract album object
      } catch (err) {
        console.error('Error fetching user albums:', err);
      }
    };
    fetchUserAlbums();
  }, [accessToken]);

  // Fetch items for the bank based on scope
  useEffect(() => {
    const fetchBankItems = async () => {
      if (!accessToken) {
        setBankError('Spotify access token not available. Please log in.');
        return;
      }

      setLoadingBankItems(true);
      setBankError(null);
      try {
        let fetchedItems: any[] = [];
        if (tierScope === 'artist') {
          fetchedItems = await getMyFollowedArtists();
        } else if (tierScope === 'album') {
          const savedAlbums = await getMySavedAlbums();
          fetchedItems = savedAlbums.map(savedAlbum => savedAlbum.album);
        } else if (tierScope === 'track') {
          if (selectedAlbumId) {
            fetchedItems = await getAlbumTracks(selectedAlbumId);
          } else {
            setBankItems([]);
            setLoadingBankItems(false);
            return;
          }
        }
        setBankItems(fetchedItems);
      } catch (err) {
        console.error('Error fetching bank items:', err);
        setBankError('Failed to fetch items. Please try again.');
      } finally {
        setLoadingBankItems(false);
      }
    };

    fetchBankItems();
  }, [tierScope, accessToken, selectedAlbumId]);

  const handleDragStart = (event: any) => {
    setActiveItem(event.active.data.current.itemData);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!active || !active.data.current || !active.data.current.itemData) {
      setActiveItem(null);
      return;
    }

    const draggedItem = active.data.current.itemData;
    const sourceContainerId = active.data.current.containerId; // 'bank' or a tier ID
    const targetContainerId = over?.id; // 'bank' or a tier ID

    // If dropped outside any valid droppable, reset active item
    if (!targetContainerId) {
      setActiveItem(null);
      return;
    }

    // Create copies of current states to modify
    let updatedTiers = tiers.map(tier => ({ ...tier, items: [...tier.items] }));
    let updatedBankItems = [...bankItems];

    // Remove dragged item from its source container
    if (sourceContainerId === 'bank') {
      updatedBankItems = updatedBankItems.filter(item => item.id !== draggedItem.id);
    } else {
      const sourceTier = updatedTiers.find(tier => tier.id === sourceContainerId);
      if (sourceTier) {
        sourceTier.items = sourceTier.items.filter(item => item.id !== draggedItem.id);
      }
    }

    // Add dragged item to its target container
    const targetTier = updatedTiers.find(tier => tier.id === targetContainerId);
    if (targetTier) {
      targetTier.items.push(draggedItem);
    } else if (targetContainerId === 'bank') {
      updatedBankItems.push(draggedItem);
    }

    setActiveItem(null);
    requestAnimationFrame(() => {
      setTiers(updatedTiers);
      setBankItems(updatedBankItems);
    });
  };

  const handleSaveTierList = async () => {
    if (!user) {
      alert('Please log in to save your tier list.');
      return;
    }

    try {
      const tierDataForSave = tiers.map(tier => ({
        id: tier.id,
        label: tier.label,
        color: tier.color,
        rank: tier.rank,
        items: tier.items.map(item => ({ id: item.id })) // Only send Spotify IDs
      }));

      let result;
      if (tierListId) {
        result = await updateTierList(tierListId, tierTitle, tierDescription, tierScope, tierScopeContext, tierDataForSave);
      } else {
        result = await saveTierList(user.id, tierTitle, tierDescription, tierScope, tierScopeContext, tierDataForSave);
        if (result.success) {
          setTierListId(result.data.id);
        }
      }

      if (result.success) {
        alert('Tier list saved successfully!');
      } else {
        alert('Failed to save tier list.');
      }
    } catch (error) {
      console.error('Error saving tier list:', error);
      alert('An error occurred while saving the tier list.');
    }
  };

  const handleLoadTierList = async (id: string) => {
    try {
      const result = await getTierList(id);
      if (result.success && result.data) {
        const loadedList = result.data;
        setTierListId(loadedList.id);
        setTierTitle(loadedList.title);
        setTierDescription(loadedList.description || '');
        setTierScope(loadedList.scope);
        setTierScopeContext(loadedList.scope_context);

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
        // Sort tiers by rank
        newTiers.sort((a, b) => a.rank - b.rank);
        setTiers(newTiers);
        alert('Tier list loaded successfully!');
      } else {
        alert('Failed to load tier list.');
      }
    } catch (error) {
      console.error('Error loading tier list:', error);
      alert('An error occurred while loading the tier list.');
    }
  };

  const handleEditorSave = (updatedTiers: Tier[]) => {
    // Preserve items in tiers when updating tier structure
    setTiers(prevTiers => {
      const newTiers = updatedTiers.map(updatedTier => {
        const existingTier = prevTiers.find(pt => pt.id === updatedTier.id);
        return {
          ...updatedTier,
          items: existingTier ? existingTier.items : []
        };
      });
      return newTiers;
    });
    setIsEditorModalOpen(false);
  };

  const handleShareTierList = async () => {
    if (!tierListId) {
      alert('Please save your tier list first.');
      return;
    }

    try {
      const result = await publishTierList(tierListId);
      if (result.success) {
        const shareUrl = `${window.location.origin}/tiermaker/share/${tierListId}`;
        navigator.clipboard.writeText(shareUrl);
        alert(`Tier list is public! Share this link: ${shareUrl} (copied to clipboard)`);
      } else {
        alert('Failed to make tier list public.');
      }
    } catch (error) {
      console.error('Error sharing tier list:', error);
      alert('An error occurred while sharing the tier list.');
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col">
        <div className="flex-grow p-4">
          <h2 className="text-2xl font-bold mb-4">Tier Canvas</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tier List Title"
              className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={tierTitle}
              onChange={(e) => setTierTitle(e.target.value)}
            />
            <textarea
              placeholder="Description (optional)"
              className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={tierDescription}
              onChange={(e) => setTierDescription(e.target.value)}
            ></textarea>
            <button
              onClick={handleSaveTierList}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Save Tier List
            </button>
            <button
              onClick={() => setIsEditorModalOpen(true)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Edit Tiers
            </button>
            <button
              onClick={() => {
                const id = prompt('Enter Tier List ID to load:');
                if (id) handleLoadTierList(id);
              }}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Load Tier List
            </button>
            {tierListId && (
              <button
                onClick={handleShareTierList}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Share Tier List
              </button>
            )}
          </div>

          {tiers.map((tier) => (
            <TierRow key={tier.id} id={tier.id} label={tier.label} color={tier.color}>
              {tier.items.map((item) => (
                <TierItem
                  key={item.id}
                  item={item}
                  itemType={tierScope}
                  containerId={tier.id} // Pass containerId for draggable
                />
              ))}
            </TierRow>
          ))}
        </div>
        <div className="p-4">
          <ItemBank
            items={bankItems}
            loading={loadingBankItems}
            error={bankError}
            selectedScope={tierScope}
            onScopeChange={setTierScope}
            selectedAlbumId={selectedAlbumId}
            onAlbumSelect={setSelectedAlbumId}
            userAlbums={userAlbums}
            containerId="bank" // Indicate this is the bank
          />
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="w-20 h-20 bg-blue-500 flex items-center justify-center text-white rounded">
            {activeItem.name || activeItem.id}
          </div>
        ) : null}
      </DragOverlay>

      <TierEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        tiers={tiers}
        onSave={handleEditorSave}
      />
    </DndContext>
  );
};

export default TierMaker;