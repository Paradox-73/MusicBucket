import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import ItemBank from './ItemBank';
import TierRow from './TierRow';
import TierItem from './TierItem';
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
  const [bankItems, setBankItems] = useState<any[]>([]); // Items in the bank
  const [loadingBankItems, setLoadingBankItems] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [userAlbums, setUserAlbums] = useState<any[]>([]);

  const [tiers, setTiers] = useState<Tier[]>([
    { id: 's-tier', label: 'S', color: '#ff7f7f', rank: 0, items: [] },
    { id: 'a-tier', label: 'A', color: '#ffbf7f', rank: 1, items: [] },
    { id: 'b-tier', label: 'B', color: '#ffff7f', rank: 2, items: [] },
    { id: 'c-tier', label: 'C', color: '#bfff7f', rank: 3, items: [] },
    { id: 'd-tier', label: 'D', color: '#7fffff', rank: 4, items: [] },
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
    const { active } = event;
    const { containerId } = active.data.current;
    const itemId = active.id;

    let item;
    if (containerId === 'bank') {
      item = bankItems.find(i => i.id === itemId);
    } else {
      const tier = tiers.find(t => t.id === containerId);
      if (tier) {
        item = tier.items.find(i => i.id === itemId);
      }
    }
    setActiveItem(item);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const sourceContainerId = active.data.current.containerId;
    const targetContainerId = over.id;
    const draggedItemId = active.id;

    if (!targetContainerId || sourceContainerId === targetContainerId) {
      setActiveItem(null);
      return;
    }

    setActiveItem(null);

    // Find the dragged item from the state at the time of the drag end
    let draggedItem;
    if (sourceContainerId === 'bank') {
      draggedItem = bankItems.find(i => i.id === draggedItemId);
    } else {
      const sourceTier = tiers.find(t => t.id === sourceContainerId);
      draggedItem = sourceTier?.items.find(i => i.id === draggedItemId);
    }

    if (!draggedItem) {
      return; // Item not found, maybe state updated since drag started
    }

    // From Bank to Tier
    if (sourceContainerId === 'bank' && targetContainerId !== 'bank') {
      setBankItems(prev => prev.filter(item => item.id !== draggedItemId));
      setTiers(prev => prev.map(tier => tier.id === targetContainerId ? { ...tier, items: [...tier.items, draggedItem] } : tier));
    }
    // From Tier to Bank
    else if (sourceContainerId !== 'bank' && targetContainerId === 'bank') {
      setTiers(prev => prev.map(tier => tier.id === sourceContainerId ? { ...tier, items: tier.items.filter(item => item.id !== draggedItemId) } : tier));
      setBankItems(prev => [...prev, draggedItem]);
    }
    // From Tier to Tier
    else if (sourceContainerId !== 'bank' && targetContainerId !== 'bank') {
      setTiers(prev => {
        const sourceTier = prev.find(t => t.id === sourceContainerId);
        const itemToMove = sourceTier?.items.find(i => i.id === draggedItemId);

        if (!itemToMove) return prev;

        return prev.map(t => {
          if (t.id === sourceContainerId) {
            return { ...t, items: t.items.filter(i => i.id !== draggedItemId) };
          }
          if (t.id === targetContainerId) {
            return { ...t, items: [...t.items, itemToMove] };
          }
          return t;
        });
      });
    }
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
        items: tier.items.map(item => ({ id: item.id }))
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

  const handleAddTier = () => {
    const newTier: Tier = {
      id: `tier-${Date.now()}`,
      label: 'New Tier',
      color: '#cccccc',
      rank: tiers.length,
      items: [],
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (id: string) => {
    setTiers(tiers.filter(tier => tier.id !== id));
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setTiers(tiers.map(tier => tier.id === id ? { ...tier, label: newLabel } : tier));
  };

  const handleColorChange = (id: string, newColor: string) => {
    setTiers(tiers.map(tier => tier.id === id ? { ...tier, color: newColor } : tier));
  };

  const handleMoveUp = (id: string) => {
    const index = tiers.findIndex(tier => tier.id === id);
    if (index > 0) {
      const newTiers = [...tiers];
      const [movedTier] = newTiers.splice(index, 1);
      newTiers.splice(index - 1, 0, movedTier);
      setTiers(newTiers.map((tier, i) => ({ ...tier, rank: i })));
    }
  };

  const handleMoveDown = (id: string) => {
    const index = tiers.findIndex(tier => tier.id === id);
    if (index < tiers.length - 1) {
      const newTiers = [...tiers];
      const [movedTier] = newTiers.splice(index, 1);
      newTiers.splice(index + 1, 0, movedTier);
      setTiers(newTiers.map((tier, i) => ({ ...tier, rank: i })));
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
              onClick={handleAddTier}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Add Tier
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
            <TierRow
              key={tier.id}
              id={tier.id}
              label={tier.label}
              color={tier.color}
              isDragging={activeItem !== null}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onLabelChange={handleLabelChange}
              onColorChange={handleColorChange}
              onRemove={handleRemoveTier}
            >
              {tier.items.map((item) => (
                <TierItem
                  key={item.id}
                  item={item}
                  itemType={tierScope}
                  containerId={tier.id}
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
            containerId="bank"
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
    </DndContext>
  );
};

export default TierMaker;