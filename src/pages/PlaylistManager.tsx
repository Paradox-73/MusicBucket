import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  Plus,
  Loader2,
  Save,
  Wand2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Users,
  Info,
  ExternalLink,
  CheckCircle2,
  Tag,
  Activity,
  AlertTriangle,
  Library,
} from 'lucide-react';
import SpotifyConnectGate from '../components/common/SpotifyConnectGate';
import TrackRow from '../components/common/TrackRow';
import { usePreviewPlayer } from '../components/common/usePreviewPlayer';
import { searchArtists, buildTrackPool, PMArtist, COMMON_GENRES } from '../services/Playlist_Manager/buildPool';
import { UITrack } from '../components/common/trackTypes';
import { usePlaylistManagerStore } from '../store/Playlist_Manager/playlistManagerStore';
import { findOrCreateOwnedPlaylist, replacePlaylistTracks } from '../services/common/playlistSync';

const CURRENT_YEAR = new Date().getFullYear();

type SearchMode = 'artist' | 'genre';

const PlaylistManagerInner: React.FC = () => {
  // Persistent state (survives navigation).
  const {
    seedArtists,
    seedGenres,
    filters,
    pool,
    reserve,
    artistCount,
    hasBuilt,
    audioUnavailable,
    name,
    isPublic,
    addSeedArtist,
    removeSeedArtist,
    addSeedGenre,
    removeSeedGenre,
    updateFilter,
    toggleGenreFilter,
    setPoolResult,
    moveTrack,
    removeTrack,
    setName,
    setIsPublic,
  } = usePlaylistManagerStore();

  // Transient UI state.
  const [searchMode, setSearchMode] = useState<SearchMode>('artist');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PMArtist[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [building, setBuilding] = useState(false);
  // Live progress while scanning the saved library by genre (MusicBrainz is slow).
  const [buildProgress, setBuildProgress] = useState<{ processed: number; total: number } | null>(null);
  const [streamTracks, setStreamTracks] = useState<UITrack[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<{ url: string; created: boolean } | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const { playingId, toggle } = usePreviewPlayer();

  // Close the search/genre dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced artist search (only in artist mode).
  useEffect(() => {
    if (searchMode !== 'artist' || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const results = await searchArtists(query);
      setSearchResults(results);
      setSearching(false);
    }, 350);
    return () => clearTimeout(handle);
  }, [query, searchMode]);

  // Genre suggestions filtered by the current query (genre mode).
  const genreSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMON_GENRES.filter((g) => !seedGenres.includes(g) && (q === '' || g.includes(q))).slice(0, 12);
  }, [query, seedGenres]);

  const availableGenres = useMemo(
    () => Array.from(new Set(seedArtists.flatMap((s) => s.genres))).sort(),
    [seedArtists],
  );

  const hasSeeds = seedArtists.length > 0 || seedGenres.length > 0;

  const handleAddArtist = (artist: PMArtist) => {
    addSeedArtist(artist);
    setQuery('');
    setSearchResults([]);
    setDropdownOpen(false);
  };

  const handleAddGenre = (genre: string) => {
    addSeedGenre(genre);
    setQuery('');
    setDropdownOpen(false);
  };

  const handleBuild = async () => {
    if (!hasSeeds) return;
    setBuilding(true);
    setError(null);
    setSavedInfo(null);
    setBuildProgress(null);
    setStreamTracks([]);
    try {
      const result = await buildTrackPool(seedArtists, seedGenres, filters, (p) => {
        setBuildProgress({ processed: p.processed, total: p.total });
        if (p.newTracks.length > 0) setStreamTracks((prev) => [...prev, ...p.newTracks]);
      });
      setPoolResult(result);
      if (result.tracks.length === 0) {
        setError('No tracks matched your filters. Try widening the popularity/year ranges or removing genre filters.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong while building the pool. Please try again.');
    } finally {
      setBuilding(false);
      setBuildProgress(null);
      setStreamTracks([]);
    }
  };

  const handleSave = async () => {
    if (pool.length === 0) return;
    setSaving(true);
    setError(null);
    setSavedInfo(null);
    try {
      const playlist = await findOrCreateOwnedPlaylist(
        name.trim() || 'My MusicBucket Playlist',
        'Built with the MusicBucket Playlist Manager.',
        isPublic,
      );
      await replacePlaylistTracks(playlist.id, pool.map((t) => t.uri));
      setSavedInfo({ url: playlist.url, created: playlist.created });
    } catch (err) {
      console.error(err);
      if ((err as { status?: number })?.status === 403) {
        setError('Your Spotify connection is missing playlist permissions. Please reconnect Spotify and try again.');
      } else {
        setError('Failed to save the playlist to Spotify. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <header className="border-b border-primary/10 bg-white/60 backdrop-blur-sm dark:border-secondary/10 dark:bg-gray-900/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Playlist Manager</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build a playlist by filtering on artists, genres and vibe — preview the pool, fine-tune, then save to Spotify.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Filters */}
          <section className="lg:col-span-2">
            <div className="space-y-4 lg:sticky lg:top-24">
              {/* Seed picker */}
              <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:border-secondary/10 dark:bg-gray-800">
                <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Seeds</h2>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Build the pool around artists, genres, or both.
                </p>

                {/* Mode toggle */}
                <div className="mb-3 inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                  {(['artist', 'genre'] as SearchMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSearchMode(mode);
                        setQuery('');
                        setSearchResults([]);
                      }}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                        searchMode === mode
                          ? 'bg-white text-primary shadow-sm dark:bg-gray-800 dark:text-secondary'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {mode === 'artist' ? 'By artist' : 'By genre'}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative" ref={searchRef}>
                  {searchMode === 'artist' ? (
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  ) : (
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={query}
                    onFocus={() => setDropdownOpen(true)}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (searchMode === 'genre' && e.key === 'Enter' && query.trim()) {
                        handleAddGenre(query);
                      }
                    }}
                    placeholder={searchMode === 'artist' ? 'Search for an artist…' : 'Pick or type a genre…'}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-secondary dark:focus:ring-secondary/30"
                  />

                  {/* Artist results dropdown */}
                  {dropdownOpen && searchMode === 'artist' && (searching || searchResults.length > 0) && (
                    <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {searching && (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                          <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                        </div>
                      )}
                      {!searching &&
                        searchResults.map((artist) => (
                          <button
                            key={artist.id}
                            onClick={() => handleAddArtist(artist)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {artist.image ? (
                              <img src={artist.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-gray-900 dark:text-white">
                                {artist.name}
                              </span>
                              {artist.genres.length > 0 && (
                                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                  {artist.genres.slice(0, 3).join(', ')}
                                </span>
                              )}
                            </span>
                            <Plus className="h-4 w-4 shrink-0 text-primary dark:text-secondary" />
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Genre suggestions dropdown */}
                  {dropdownOpen && searchMode === 'genre' && genreSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 flex max-h-56 w-full flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {genreSuggestions.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleAddGenre(genre)}
                          className="min-h-[36px] rounded-full border border-gray-300 px-2.5 py-1.5 text-xs capitalize text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-300 dark:hover:border-secondary dark:hover:text-secondary"
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected seeds */}
                {hasSeeds && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seedArtists.map((artist) => (
                      <span
                        key={artist.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-2 pr-1 text-sm text-primary dark:bg-secondary/10 dark:text-secondary"
                      >
                        {artist.image && (
                          <img src={artist.image} alt="" className="h-5 w-5 rounded-full object-cover" />
                        )}
                        {artist.name}
                        <button
                          onClick={() => removeSeedArtist(artist.id)}
                          aria-label={`Remove ${artist.name}`}
                          className="rounded-full p-1.5 hover:bg-primary/20 dark:hover:bg-secondary/20"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    {seedGenres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 py-1 pl-2 pr-1 text-sm capitalize text-primary dark:border-secondary/30 dark:text-secondary"
                      >
                        <Tag className="h-3.5 w-3.5" />
                        {genre}
                        <button
                          onClick={() => removeSeedGenre(genre)}
                          aria-label={`Remove ${genre}`}
                          className="rounded-full p-1.5 hover:bg-primary/20 dark:hover:bg-secondary/20"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <label className="mt-4 flex cursor-pointer items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Users className="h-4 w-4" /> Include related artists
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.expandRelated}
                    onChange={(e) => updateFilter('expandRelated', e.target.checked)}
                    className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 transition-colors checked:bg-primary dark:bg-gray-600 dark:checked:bg-secondary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
                  />
                </label>

                <label className="mt-3 flex cursor-pointer items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Library className="h-4 w-4" /> Only songs from your library
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.libraryOnly}
                    onChange={(e) => updateFilter('libraryOnly', e.target.checked)}
                    className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 transition-colors checked:bg-primary dark:bg-gray-600 dark:checked:bg-secondary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
                  />
                </label>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  On, the pool is built from your saved library: artist seeds pull every saved song by that artist, and
                  genre seeds match saved songs by genre using Last.fm track tags (with a Spotify fallback). First build
                  is slower, then cached.
                </p>
              </div>

              {/* Refine */}
              <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:border-secondary/10 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Refine</h2>

                {/* Genre filter (from seed artists) */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filter by genre
                  </label>
                  {availableGenres.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Add seed artists to narrow the pool by their genres.
                    </p>
                  ) : (
                    <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                      {availableGenres.map((genre) => {
                        const active = filters.genres.includes(genre);
                        return (
                          <button
                            key={genre}
                            onClick={() => toggleGenreFilter(genre)}
                            className={`min-h-[36px] rounded-full border px-2.5 py-1.5 text-xs capitalize transition-colors ${
                              active
                                ? 'border-transparent bg-primary text-white dark:bg-secondary dark:text-gray-900'
                                : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary dark:border-gray-600 dark:text-gray-300 dark:hover:border-secondary dark:hover:text-secondary'
                            }`}
                          >
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <RangeControl
                  label="Popularity"
                  hint="Lower = deeper cuts, higher = mainstream"
                  min={0}
                  max={100}
                  valueMin={filters.minPopularity}
                  valueMax={filters.maxPopularity}
                  onChange={(lo, hi) => {
                    updateFilter('minPopularity', lo);
                    updateFilter('maxPopularity', hi);
                  }}
                />

                <RangeControl
                  label="Release years"
                  min={1950}
                  max={CURRENT_YEAR}
                  valueMin={filters.minYear}
                  valueMax={filters.maxYear}
                  onChange={(lo, hi) => {
                    updateFilter('minYear', lo);
                    updateFilter('maxYear', hi);
                  }}
                />

                <SliderControl
                  label="Playlist size"
                  min={10}
                  max={100}
                  step={5}
                  value={filters.targetSize}
                  suffix=" tracks"
                  onChange={(v) => updateFilter('targetSize', v)}
                />

                <SliderControl
                  label="Max per artist"
                  min={1}
                  max={10}
                  step={1}
                  value={filters.tracksPerArtist}
                  onChange={(v) => updateFilter('tracksPerArtist', v)}
                />

                {/* Advanced: audio features (ReccoBeats) */}
                <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setAudioOpen((o) => !o)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary dark:text-secondary" />
                      Audio features
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        approx
                      </span>
                    </span>
                    {audioOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {audioOpen && (
                    <div className="border-t border-gray-200 px-3 pb-3 pt-3 dark:border-gray-700">
                      <label className="mb-3 flex cursor-pointer items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Filter by vibe
                        </span>
                        <input
                          type="checkbox"
                          checked={filters.audioEnabled}
                          onChange={(e) => updateFilter('audioEnabled', e.target.checked)}
                          className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 transition-colors checked:bg-primary dark:bg-gray-600 dark:checked:bg-secondary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
                        />
                      </label>

                      <div className={filters.audioEnabled ? '' : 'pointer-events-none opacity-40'}>
                        <RangeControl
                          label="Energy"
                          min={0}
                          max={100}
                          valueMin={filters.minEnergy}
                          valueMax={filters.maxEnergy}
                          onChange={(lo, hi) => {
                            updateFilter('minEnergy', lo);
                            updateFilter('maxEnergy', hi);
                          }}
                        />
                        <RangeControl
                          label="Danceability"
                          min={0}
                          max={100}
                          valueMin={filters.minDanceability}
                          valueMax={filters.maxDanceability}
                          onChange={(lo, hi) => {
                            updateFilter('minDanceability', lo);
                            updateFilter('maxDanceability', hi);
                          }}
                        />
                        <RangeControl
                          label="Positivity (valence)"
                          min={0}
                          max={100}
                          valueMin={filters.minValence}
                          valueMax={filters.maxValence}
                          onChange={(lo, hi) => {
                            updateFilter('minValence', lo);
                            updateFilter('maxValence', hi);
                          }}
                        />
                        <RangeControl
                          label="Tempo (BPM)"
                          min={0}
                          max={250}
                          valueMin={filters.minTempo}
                          valueMax={filters.maxTempo}
                          onChange={(lo, hi) => {
                            updateFilter('minTempo', lo);
                            updateFilter('maxTempo', hi);
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Powered by ReccoBeats (Spotify removed its own audio-features API). Values are approximate and
                        looked up on build — first build may take a little longer, then results are cached.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBuild}
                  disabled={building || !hasSeeds}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {building ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Building pool…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" /> {hasBuilt ? 'Rebuild pool' : 'Build pool'}
                    </>
                  )}
                </button>
                {!hasSeeds && (
                  <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                    Add at least one seed artist or genre to start.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Preview */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:border-secondary/10 dark:bg-gray-800">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {hasBuilt ? `Track pool · ${pool.length}` : 'Track pool'}
                  </h2>
                  {hasBuilt && reserve.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Delete a track and a fresh one slides in from your reserve of {reserve.length}.
                    </p>
                  )}
                </div>
                {pool.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    from {artistCount} artist{artistCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {/* Save controls */}
              {pool.length > 0 && (
                <div className="mb-5 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/40 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                      Playlist name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-secondary dark:focus:ring-secondary/30"
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="accent-primary dark:accent-secondary"
                    />
                    Public
                  </label>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#1DB954] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ed760] disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save to Spotify
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              )}
              {audioUnavailable && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Couldn’t reach the ReccoBeats audio-feature service, so vibe filters were skipped for this build. The
                    pool still reflects your artist, genre, popularity and year filters.
                  </span>
                </div>
              )}
              {savedInfo && (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {savedInfo.created ? 'Playlist created and saved!' : 'Playlist updated on Spotify!'}
                  <a
                    href={savedInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline"
                  >
                    Open in Spotify <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* List / states */}
              {building ? (
                buildProgress ? (
                  <div className="space-y-3">
                    <BuildProgressBar
                      processed={buildProgress.processed}
                      total={buildProgress.total}
                      matched={streamTracks.length}
                    />
                    {streamTracks.length > 0 ? (
                      <div className="space-y-2">
                        {streamTracks.map((track, i) => (
                          <TrackRow
                            key={`${track.id}-stream-${i}`}
                            track={track}
                            index={i + 1}
                            isPlaying={playingId === track.id}
                            onTogglePlay={(t) => toggle(t.id, t.previewUrl)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Scanning your library for matches…
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary dark:text-secondary" />
                    <p className="text-gray-600 dark:text-gray-300">Gathering tracks and applying your filters…</p>
                  </div>
                )
              ) : pool.length > 0 ? (
                <div className="space-y-2">
                  {pool.map((track, i) => (
                    <TrackRow
                      key={`${track.id}-${i}`}
                      track={track}
                      index={i + 1}
                      isPlaying={playingId === track.id}
                      onTogglePlay={(t) => toggle(t.id, t.previewUrl)}
                      actions={
                        <>
                          <button
                            onClick={() => moveTrack(i, -1)}
                            disabled={i === 0}
                            aria-label="Move up"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveTrack(i, 1)}
                            disabled={i === pool.length - 1}
                            aria-label="Move down"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeTrack(track.id)}
                            aria-label="Remove track"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState hasBuilt={hasBuilt} />
              )}

              <div className="mt-6 flex gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-xs text-gray-600 dark:text-gray-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <p>
                  Filters use Spotify’s own catalogue data (artist genres, track popularity and release year). Deeper
                  audio-feature filtering (energy, danceability, tempo) needs a server-side enrichment step and is on the roadmap.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const BuildProgressBar: React.FC<{ processed: number; total: number; matched: number }> = ({
  processed,
  total,
  matched,
}) => {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-primary/10 bg-gray-50 p-4 dark:border-secondary/10 dark:bg-gray-700/40">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary dark:text-secondary" />
          Scanning library · {processed}/{total}
        </span>
        <span className="tabular-nums">
          {matched} match{matched === 1 ? '' : 'es'} · {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const SliderControl: React.FC<{
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({ label, min, max, step, value, suffix = '', onChange }) => (
  <div className="mb-4">
    <div className="mb-1.5 flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <span className="text-sm font-semibold text-primary dark:text-secondary">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary dark:accent-secondary"
    />
  </div>
);

const RangeControl: React.FC<{
  label: string;
  hint?: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (lo: number, hi: number) => void;
}> = ({ label, hint, min, max, valueMin, valueMax, onChange }) => (
  <div className="mb-5">
    <div className="mb-1.5 flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <span className="text-sm font-semibold tabular-nums text-primary dark:text-secondary">
        {valueMin} – {valueMax}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="range"
        aria-label={`${label} minimum`}
        min={min}
        max={max}
        value={valueMin}
        onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
        className="w-full accent-primary dark:accent-secondary"
      />
      <input
        type="range"
        aria-label={`${label} maximum`}
        min={min}
        max={max}
        value={valueMax}
        onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
        className="w-full accent-primary dark:accent-secondary"
      />
    </div>
    {hint && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
);

const EmptyState: React.FC<{ hasBuilt: boolean }> = ({ hasBuilt }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
      <Wand2 className="h-7 w-7 text-primary dark:text-secondary" />
    </div>
    <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
      {hasBuilt ? 'No tracks matched' : 'Nothing here yet'}
    </h3>
    <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
      {hasBuilt
        ? 'Try widening your filters or adding more seeds.'
        : 'Pick some seed artists or genres and filters, then build your track pool.'}
    </p>
  </div>
);

const PlaylistManager: React.FC = () => (
  <SpotifyConnectGate
    title="Playlist Manager"
    description="Connect your Spotify account to search artists and genres, filter by vibe, and save the playlists you build straight to your library."
    icon={<SlidersHorizontal className="h-8 w-8" />}
  >
    <PlaylistManagerInner />
  </SpotifyConnectGate>
);

export default PlaylistManager;
