import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import TierListImage from './TierListImage';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import ItemBank from './ItemBank';
import TierRow from './TierRow';
import TierItem from './TierItem';
import { useAuth } from '../../hooks/useAuth';
import { saveTierList, updateTierList, getTierList, publishTierList, getMyTierLists, deleteTierList } from '../../lib/supabaseTierMaker';
import { getSeveralArtists, getSeveralAlbums, getSeveralTracks, getMyFollowedArtists, getMySavedAlbums, getAlbumTracks, searchSpotify } from '../../lib/spotify';
import { Save, Plus, FolderOpen, Share2, ImageDown, Trash2 } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';

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
  const [myTierLists, setMyTierLists] = useState<any[]>([]);
  const [showMyTierLists, setShowMyTierLists] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false); // New state for image loading
  const [showOverlayText, setShowOverlayText] = useState(true); // New state for overlay text
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const fetchBankItems = async (scope, token, albumId, searchQuery) => {
    if (!token) {
        setBankError('Spotify access token not available. Please log in.');
        return [];
    }

    setLoadingBankItems(true);
    setBankError(null);
    try {
        let fetchedItems: any[] = [];
        if (scope === 'artist') {
            fetchedItems = await getMyFollowedArtists();
        } else if (scope === 'album') {
            const savedAlbums = await getMySavedAlbums();
            fetchedItems = savedAlbums.map(savedAlbum => savedAlbum.album);
        } else if (scope === 'track') {
            if (albumId) {
                const tracks = await getAlbumTracks(albumId);
                const albumResult = await getSeveralAlbums([albumId]);
                if (albumResult && albumResult.length > 0) {
                    const album = albumResult[0];
                    fetchedItems = tracks.map((track: any) => ({ ...track, album }));
                } else {
                    fetchedItems = tracks;
                }
            }
        } else if (scope === 'search') {
            if (searchQuery) {
                const searchResults = await searchSpotify(searchQuery, ['artist', 'album', 'track']);
                const artists = searchResults.artists?.items || [];
                const albums = searchResults.albums?.items || [];
                const tracks = searchResults.tracks?.items || [];
                
                const typedArtists = artists.map(item => ({ ...item, itemType: 'artist' }));
                const typedAlbums = albums.map(item => ({ ...item, itemType: 'album' }));
                const typedTracks = tracks.map(item => ({ ...item, itemType: 'track' }));

                fetchedItems = [...typedArtists, ...typedAlbums, ...typedTracks];
            }
        }
        return fetchedItems;
    } catch (err) {
        console.error('Error fetching bank items:', err);
        setBankError('Failed to fetch items. Please try again.');
        return [];
    } finally {
        setLoadingBankItems(false);
    }
  };

  

  const [tiers, setTiers] = useState<Tier[]>([
    { id: 's-tier', label: 'S', color: '#ff7f7f', rank: 0, items: [] },
    { id: 'a-tier', label: 'A', color: '#ffbf7f', rank: 1, items: [] },
    { id: 'b-tier', label: 'B', color: '#ffff7f', rank: 2, items: [] },
    { id: 'c-tier', label: 'C', color: '#bfff7f', rank: 3, items: [] },
    { id: 'd-tier', label: 'D', color: '#7fffff', rank: 4, items: [] },
  ]);

  // Function to collect all image URLs from tiers
  const getAllImageUrls = () => {
    const urls: string[] = [];
    tiers.forEach(tier => {
      tier.items.forEach(item => {
        if (item.images && item.images.length > 0) {
          urls.push(item.images[0].url);
        } else if (item.album && item.album.images && item.album.images.length > 0) {
          urls.push(item.album.images[0].url);
        }
      });
    });
    return urls;
  };

  // Function to preload images
  const preloadImages = (urls: string[]) => {
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    return Promise.all(promises);
  };

  useEffect(() => {
    if (isGeneratingImage && imageContainerRef.current) {
      html2canvas(imageContainerRef.current, {
        allowTaint: true,
        useCORS: true,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${tierTitle.replace(/\s+/g, '_').toLowerCase()}_tier_list.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsGeneratingImage(false);
        setIsLoadingImages(false); // Reset loading state
      }).catch(error => {
        console.error('Error generating image:', error);
        setIsGeneratingImage(false);
        setIsLoadingImages(false); // Reset loading state
        alert('Failed to generate image. Please try again.');
      });
    }
  }, [isGeneratingImage, tierTitle, tiers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the user to move the pointer by 5px before a drag starts
      // This helps prevent accidental drags when scrolling on mobile
      activationConstraint: {
        distance: 5,
      },
    })
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
    const updateBank = async () => {
        const items = await fetchBankItems(tierScope, accessToken, selectedAlbumId, debouncedSearchQuery);
        setBankItems(items);
    }
    updateBank();
  }, [tierScope, accessToken, selectedAlbumId, debouncedSearchQuery]);

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

  const handleFetchMyTierLists = async () => {
    if (!user) return;
    if (showMyTierLists) {
      setShowMyTierLists(false);
      return;
    }
    try {
      const lists = await getMyTierLists(user.id);
      if (lists) {
        setMyTierLists(lists);
        setShowMyTierLists(true);
      }
    } catch (error) {
      console.error('Error fetching user tier lists:', error);
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
              if (loadedList.scope_context) {
                const albums = await getSeveralAlbums([loadedList.scope_context]);
                if (albums && albums.length > 0) {
                  const album = albums[0];
                  spotifyItems = spotifyItems.map((track: any) => ({ ...track, album }));
                }
              }
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

        const itemsInTiers = new Set(newTiers.flatMap(t => t.items.map(i => i.id)));
        const newBankItems = await fetchBankItems(loadedList.scope, accessToken, loadedList.scope_context, '');
        const filteredBankItems = newBankItems.filter(item => !itemsInTiers.has(item.id));
        setBankItems(filteredBankItems);

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

  const handleDeleteTierList = async () => {
    if (!tierListId) {
      alert('Please save your tier list first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this tier list? This action cannot be undone.')) {
      try {
        const result = await deleteTierList(tierListId);
        if (result.success) {
          alert('Tier list deleted successfully!');
          setTierListId(null);
          setTierTitle('My Awesome Tier List');
          setTierDescription('');
          setTiers([
            { id: 's-tier', label: 'S', color: '#ff7f7f', rank: 0, items: [] },
            { id: 'a-tier', label: 'A', color: '#ffbf7f', rank: 1, items: [] },
            { id: 'b-tier', label: 'B', color: '#ffff7f', rank: 2, items: [] },
            { id: 'c-tier', label: 'C', color: '#bfff7f', rank: 3, items: [] },
            { id: 'd-tier', label: 'D', color: '#7fffff', rank: 4, items: [] },
          ]);
          setBankItems([]);
        } else {
          alert('Failed to delete tier list.');
        }
      } catch (error) {
        console.error('Error deleting tier list:', error);
        alert('An error occurred while deleting the tier list.');
      }
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
      <div className="flex flex-col lg:flex-row">
        <div className="flex-grow p-2 sm:p-4 lg:w-2/3">
          <div className="relative mb-4">
            <h1 className="text-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
              Tier Maker
            </h1>
            <h2 className="absolute right-0 top-1/2 -translate-y-1/2 text-base font-semibold text-gray-500 dark:text-gray-400">
              Tier Canvas
            </h2>
          </div>
          <div className="mb-4">
            <div className="flex flex-col md:flex-row gap-2 items-start">
              <div className="flex-grow w-full">
                <input
                  type="text"
                  placeholder="Tier List Title"
                  className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white break-words"
                  value={tierTitle}
                  onChange={(e) => setTierTitle(e.target.value)}
                />
                <Collapsible.Root>
                  <Collapsible.Trigger asChild>
                    <button className="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-2">
                      {tierDescription ? 'Edit Description' : 'Add Description'}
                    </button>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <textarea
                      placeholder="Description (optional)"
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={2}
                      value={tierDescription}
                      onChange={(e) => setTierDescription(e.target.value)}
                    ></textarea>
                  </Collapsible.Content>
                </Collapsible.Root>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleSaveTierList}
                  title="Save Tier List"
                  className="p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={handleAddTier}
                  title="Add New Tier"
                  className="p-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                >
                  <Plus size={20} />
                </button>
                <div className="relative inline-block text-left">
                  <button
                    onClick={handleFetchMyTierLists}
                    title="Load Tier List"
                    className="p-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                  >
                    <FolderOpen size={20} />
                  </button>
                  {showMyTierLists && myTierLists.length > 0 && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-800 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {myTierLists.map(list => (
                          <a
                            href="#"
                            key={list.id}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLoadTierList(list.id);
                              setShowMyTierLists(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
                            role="menuitem"
                          >
                            {list.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {tierListId && (
                  <>
                    <button
                      onClick={handleShareTierList}
                      title="Share Tier List"
                      className="p-2 bg-purple-500 hover:bg-purple-700 text-white font-bold rounded"
                    >
                      <Share2 size={20} />
                    </button>
                    <button
                      onClick={handleDeleteTierList}
                      title="Delete Tier List"
                      className="p-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={async () => {
                        setIsLoadingImages(true);
                        const imageUrls = getAllImageUrls();
                        try {
                          await preloadImages(imageUrls);
                          setIsGeneratingImage(true);
                        } catch (error) {
                          console.error('Error preloading images:', error);
                          alert('Failed to load all images. Please check your internet connection or try again.');
                          setIsLoadingImages(false);
                        }
                      }}
                      title="Download as Image"
                      className={`p-2 bg-teal-500 hover:bg-teal-700 text-white font-bold rounded ${isLoadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isLoadingImages}
                    >
                      {isLoadingImages ? '...' : <ImageDown size={20} />}
                    </button>
                  </>
                )}
              </div>
            </div>
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
        <div className="lg:w-1/3 lg:h-screen lg:overflow-y-auto p-2 sm:p-4 sticky bottom-0 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm lg:relative lg:bg-transparent dark:lg:bg-transparent">
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
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
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

      {isGeneratingImage && (
        <div ref={imageContainerRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <TierListImage
            title={tierTitle}
            tiers={tiers}
            scope={tierScope}
            user={user}
            showOverlayText={showOverlayText} // Pass the new prop
          />
        </div>
      )}
    </DndContext>
  );
};

export default TierMaker;