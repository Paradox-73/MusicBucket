import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  Flame,
  Clock3,
  Compass,
  Info,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Radio,
} from 'lucide-react';
import SpotifyConnectGate from '../components/common/SpotifyConnectGate';
import TrackRow from '../components/common/TrackRow';
import { usePreviewPlayer } from '../components/common/usePreviewPlayer';
import { UITrack } from '../components/common/trackTypes';
import {
  generateDailyMix,
  DailyMixSettings,
  DEFAULT_DAILY_MIX_SETTINGS,
} from '../services/Daily_Mix/generateDailyMix';
import { useDailyMixStore } from '../store/Daily_Mix/dailyMixStore';
import { findOrCreateOwnedPlaylist, replacePlaylistTracks } from '../services/common/playlistSync';

const STORAGE_KEY = 'musicbucket.dailyMix.settings';

function loadSettings(): DailyMixSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_DAILY_MIX_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore malformed storage */
  }
  return DEFAULT_DAILY_MIX_SETTINGS;
}

const bucketMeta = [
  {
    key: 'ratioHeavy' as const,
    label: 'Heavy rotation',
    hint: 'Your most-played tracks right now',
    icon: <Flame className="h-4 w-4" />,
  },
  {
    key: 'ratioOlder' as const,
    label: 'Older favourites',
    hint: 'Liked songs you haven’t heard lately',
    icon: <Clock3 className="h-4 w-4" />,
  },
  {
    key: 'ratioDiscovery' as const,
    label: 'Discovery',
    hint: 'New artists from the genres you love',
    icon: <Compass className="h-4 w-4" />,
  },
];

const DailyMixInner: React.FC = () => {
  const [settings, setSettings] = useState<DailyMixSettings>(loadSettings);
  const { tracks, reserve, stats, hasGenerated, lastfmUsed, setResult, removeTrack } = useDailyMixStore();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<{ url: string; created: boolean } | null>(null);
  const { playingId, toggle } = usePreviewPlayer();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [settings]);

  const update = <K extends keyof DailyMixSettings>(key: K, value: DailyMixSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const ratioTotal = settings.ratioHeavy + settings.ratioOlder + settings.ratioDiscovery || 1;
  const pct = (v: number) => Math.round((v / ratioTotal) * 100);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSavedInfo(null);
    try {
      const res = await generateDailyMix(settings);
      if (res.tracks.length === 0) {
        setError('Couldn’t build a mix — make sure your Spotify account has some liked songs and listening history.');
      }
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while building your mix. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (tracks.length === 0) return;
    setSaving(true);
    setError(null);
    setSavedInfo(null);
    try {
      const playlist = await findOrCreateOwnedPlaylist(
        settings.name.trim() || DEFAULT_DAILY_MIX_SETTINGS.name,
        'Your daily custom shuffle, built by MusicBucket.',
        settings.isPublic,
      );
      await replacePlaylistTracks(playlist.id, tracks.map((t) => t.uri));
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
      {/* Hero header */}
      <header className="border-b border-primary/10 bg-white/60 backdrop-blur-sm dark:border-secondary/10 dark:bg-gray-900/60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Daily Mix</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A fresh, custom shuffle built from your own listening — heavy rotation, old favourites, and new discoveries.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Settings */}
          <section className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:border-secondary/10 dark:bg-gray-800">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">Customise your mix</h2>

                {/* Playlist name */}
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Playlist name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="MusicBucket Daily Mix"
                  className="mb-5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-secondary dark:focus:ring-secondary/30"
                />

                {/* Size */}
                <div className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Playlist size</label>
                    <span className="text-sm font-semibold text-primary dark:text-secondary">{settings.size} tracks</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={settings.size}
                    onChange={(e) => update('size', Number(e.target.value))}
                    className="w-full accent-primary dark:accent-secondary"
                  />
                </div>

                {/* Ratios */}
                <div className="mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mix balance</label>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    How much of each kind of track to include.
                  </p>
                  <div className="space-y-4">
                    {bucketMeta.map((b) => (
                      <div key={b.key}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <span className="text-primary dark:text-secondary">{b.icon}</span>
                            {b.label}
                          </span>
                          <span className="tabular-nums text-gray-500 dark:text-gray-400">{pct(settings[b.key])}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={settings[b.key]}
                          onChange={(e) => update(b.key, Number(e.target.value))}
                          className="w-full accent-primary dark:accent-secondary"
                        />
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{b.hint}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Public toggle */}
                <label className="mt-5 flex cursor-pointer items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make playlist public</span>
                  <input
                    type="checkbox"
                    checked={settings.isPublic}
                    onChange={(e) => update('isPublic', e.target.checked)}
                    className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 transition-colors checked:bg-primary dark:bg-gray-600 dark:checked:bg-secondary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
                  />
                </label>

                {/* Last.fm (optional) */}
                <div className="mt-5">
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Radio className="h-4 w-4 text-[#d51007]" /> Last.fm username
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.lastfmUsername ?? ''}
                    onChange={(e) => update('lastfmUsername', e.target.value)}
                    placeholder="your Last.fm handle"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-secondary dark:focus:ring-secondary/30"
                  />
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    Add it to power the mix with your real scrobbles — heavy rotation, recently-heard exclusion, and
                    loved-track discovery.
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Building your mix…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" /> {hasGenerated ? 'Regenerate mix' : 'Generate mix'}
                    </>
                  )}
                </button>
              </div>

              {/* Automation note */}
              <div className="mt-4 flex gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-sm text-gray-600 dark:text-gray-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <p>
                  Generate and save your mix any time. Fully automatic daily refresh runs on the server and is coming soon —
                  for now, refresh it whenever you want a new shuffle.
                </p>
              </div>
            </div>
          </section>

          {/* Preview */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:border-secondary/10 dark:bg-gray-800">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {hasGenerated ? `Your mix · ${tracks.length} tracks` : 'Preview'}
                  </h2>
                  {hasGenerated && reserve.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Delete a track and a fresh one slides in from your reserve of {reserve.length}.
                    </p>
                  )}
                </div>
                {tracks.length > 0 && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#1DB954] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ed760] disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save to Spotify
                  </button>
                )}
              </div>

              {/* Stats */}
              {stats && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <StatBadge icon={<Flame className="h-3.5 w-3.5" />} label="Heavy" value={stats.heavy} />
                  <StatBadge icon={<Clock3 className="h-3.5 w-3.5" />} label="Older" value={stats.older} />
                  <StatBadge icon={<Compass className="h-3.5 w-3.5" />} label="Discovery" value={stats.discovery} />
                  {lastfmUsed && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d51007]/10 px-3 py-1 text-xs font-medium text-[#d51007]">
                      <Radio className="h-3.5 w-3.5" /> Powered by Last.fm
                    </span>
                  )}
                </div>
              )}

              {/* Last.fm requested but unavailable → fell back to Spotify-only */}
              {hasGenerated && !lastfmUsed && settings.lastfmUsername?.trim() && (
                <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Couldn’t reach Last.fm for “{settings.lastfmUsername}”, so this mix used your Spotify data only. Check the
                  username, or that the Last.fm proxy function is deployed.
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {error}
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

              {/* Track list / empty state */}
              {tracks.length > 0 ? (
                <TrackList tracks={tracks} playingId={playingId} onToggle={toggle} onRemove={removeTrack} />
              ) : (
                !generating && <EmptyState />
              )}

              {generating && !hasGenerated && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary dark:text-secondary" />
                  <p className="text-gray-600 dark:text-gray-300">Analysing your listening and building a shuffle…</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const StatBadge: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-secondary/10 dark:text-secondary">
    {icon}
    {value} {label}
  </span>
);

const TrackList: React.FC<{
  tracks: UITrack[];
  playingId: string | null;
  onToggle: (id: string, previewUrl?: string) => void;
  onRemove: (id: string) => void;
}> = ({ tracks, playingId, onToggle, onRemove }) => (
  <div className="space-y-2">
    {tracks.map((track, i) => (
      <TrackRow
        key={`${track.id}-${i}`}
        track={track}
        index={i + 1}
        isPlaying={playingId === track.id}
        onTogglePlay={(t) => onToggle(t.id, t.previewUrl)}
        actions={
          <button
            onClick={() => onRemove(track.id)}
            aria-label={`Remove ${track.name}`}
            title="Remove — a reserve track takes its place"
            className="rounded-md p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
      <RefreshCw className="h-7 w-7 text-primary dark:text-secondary" />
    </div>
    <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">No mix yet</h3>
    <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
      Tweak the balance on the left, then hit <span className="font-medium">Generate mix</span> to build your shuffle.
    </p>
  </div>
);

const DailyMix: React.FC = () => (
  <SpotifyConnectGate
    title="Daily Mix"
    description="Connect your Spotify account so MusicBucket can build a personalised daily shuffle from your top tracks, liked songs, and new discoveries."
    icon={<CalendarClock className="h-8 w-8" />}
  >
    <DailyMixInner />
  </SpotifyConnectGate>
);

export default DailyMix;
