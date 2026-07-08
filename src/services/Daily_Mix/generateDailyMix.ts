import { spotifyApi } from '../../lib/spotify';
import { getSavedTracks, getArtistTopTracks, getRelatedArtists } from '../../lib/spotify';
import { UITrack, toUITrack } from '../../components/common/trackTypes';
import {
  getWeeklyTopTracks,
  getLovedTracks,
  getRecentTracks,
  getSimilarTracks,
  resolveToSpotifyIds,
  trackKey,
  LastfmTrack,
} from './lastfm';

export interface DailyMixSettings {
  /** Target playlist name (find-or-create by this name). */
  name: string;
  /** Total number of tracks to aim for. */
  size: number;
  /** Relative weight of the "heavy rotation" bucket (0–100). */
  ratioHeavy: number;
  /** Relative weight of the "older favourites" bucket (0–100). */
  ratioOlder: number;
  /** Relative weight of the "discovery" bucket (0–100). */
  ratioDiscovery: number;
  /** How many top artists to fan out from for discovery. */
  discoverySeeds: number;
  /** Whether the resulting playlist should be public. */
  isPublic: boolean;
  /** Optional Last.fm username; when set, the mix is powered by real scrobbles. */
  lastfmUsername?: string;
}

export const DEFAULT_DAILY_MIX_SETTINGS: DailyMixSettings = {
  name: 'MusicBucket Daily Mix',
  size: 50,
  ratioHeavy: 34,
  ratioOlder: 33,
  ratioDiscovery: 33,
  discoverySeeds: 8,
  isPublic: false,
  lastfmUsername: '',
};

export interface DailyMixResult {
  tracks: UITrack[];
  /** Extra vetted tracks held back to refill the playlist when the user deletes songs. */
  reserve: UITrack[];
  /** The size the playlist should be kept at (may be < requested if data was thin). */
  targetSize: number;
  /** True when Last.fm scrobbles powered this mix. */
  lastfmUsed: boolean;
  stats: { heavy: number; older: number; discovery: number };
}

/** Fetch full Spotify track objects for a list of ids (chunked at 50). */
async function tracksByIds(ids: string[]): Promise<UITrack[]> {
  const out: UITrack[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const res = await spotifyApi.getTracks(ids.slice(i, i + 50));
      res.tracks.forEach((t) => t && out.push(toUITrack(t)));
    } catch (err) {
      console.error('Error fetching tracks by id:', err);
    }
  }
  return out;
}

/** Fisher–Yates shuffle returning a new array. */
function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Weighted random sample without replacement. `weightFn` returns a positive
 * weight per item; higher-weighted items are more likely to be picked first.
 */
function weightedSample<T>(items: T[], count: number, weightFn: (item: T, index: number) => number): T[] {
  const pool = items.map((item, index) => ({ item, weight: Math.max(weightFn(item, index), 0.0001) }));
  const chosen: T[] = [];
  while (chosen.length < count && pool.length > 0) {
    const total = pool.reduce((sum, p) => sum + p.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].weight;
      if (r <= 0) break;
    }
    const [picked] = pool.splice(Math.min(idx, pool.length - 1), 1);
    chosen.push(picked.item);
  }
  return chosen;
}

async function getMyTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term',
  limit = 50,
): Promise<SpotifyApi.TrackObjectFull[]> {
  try {
    const res = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit });
    return res.items;
  } catch (err) {
    console.error(`Error getting top tracks (${timeRange}):`, err);
    return [];
  }
}

async function getMyTopArtists(limit = 20): Promise<SpotifyApi.ArtistObjectFull[]> {
  try {
    const res = await spotifyApi.getMyTopArtists({ time_range: 'medium_term', limit });
    return res.items;
  } catch (err) {
    console.error('Error getting top artists:', err);
    return [];
  }
}

/**
 * Find artists that belong to a genre. Uses Spotify's search `genre:` field
 * filter, which still works — unlike the related-artists and recommendations
 * endpoints, which Spotify deprecated in Nov 2024.
 */
async function getArtistsByGenre(genre: string, limit = 8): Promise<SpotifyApi.ArtistObjectFull[]> {
  try {
    const res = await spotifyApi.searchArtists(`genre:"${genre}"`, { limit });
    return res.artists?.items ?? [];
  } catch (err) {
    console.error(`Error searching artists for genre "${genre}":`, err);
    return [];
  }
}

/**
 * Build a daily mix entirely client-side from the signed-in user's Spotify
 * data. This is a Spotify-native port of the original Last.fm-powered script:
 *
 *  - Heavy rotation  → short-term top tracks (user-top-read).
 *  - Older favourites → saved tracks the user isn't currently playing heavily,
 *    weighted toward the oldest-added songs.
 *  - Discovery       → top-artists → related-artists → their top tracks,
 *    excluding anything already saved/heard.
 *
 * "Recently heard" is approximated by the union of the user's short- and
 * medium-term top tracks, which avoids requesting an extra OAuth scope.
 */
export async function generateDailyMix(settings: DailyMixSettings): Promise<DailyMixResult> {
  const size = Math.max(10, Math.min(settings.size, 100));

  // --- Gather source data in parallel -------------------------------------
  const [shortTop, mediumTop, savedRaw, topArtists] = await Promise.all([
    getMyTopTracks('short_term', 50),
    getMyTopTracks('medium_term', 50),
    getSavedTracks(),
    getMyTopArtists(Math.max(settings.discoverySeeds, 5)),
  ]);

  const heardIds = new Set<string>([...shortTop, ...mediumTop].map((t) => t.id));
  const savedTracks = savedRaw
    .map((s) => ({ addedAt: s.added_at, track: s.track }))
    .filter((s) => s.track && s.track.id);
  const savedIds = new Set(savedTracks.map((s) => s.track.id));

  // --- Bucket 1: heavy rotation -------------------------------------------
  const heavyTracks: UITrack[] = shortTop.map(toUITrack);

  // --- Bucket 2: older favourites -----------------------------------------
  // Oldest-added first, exclude anything currently in heavy rotation.
  const olderCandidates = savedTracks
    .filter((s) => !heardIds.has(s.track.id))
    .sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
  // Weight favours the oldest entries (front of the list).
  const olderWeighted = weightedSample(
    olderCandidates,
    olderCandidates.length,
    (_item, index) => olderCandidates.length - index,
  );
  const olderTracks: UITrack[] = olderWeighted.map((s) => toUITrack(s.track));

  // --- Bucket 3: discovery -------------------------------------------------
  // Fan out from the genres the user actually listens to, find *other* artists
  // in those genres, and pull their top tracks. This avoids the deprecated
  // related-artists / recommendations endpoints entirely.
  const knownArtistIds = new Set<string>(topArtists.map((a) => a.id));
  const seedGenres = Array.from(new Set(topArtists.flatMap((a) => a.genres))).slice(
    0,
    Math.max(settings.discoverySeeds, 3),
  );
  const discoveryMap = new Map<string, UITrack>();

  await Promise.all(
    seedGenres.map(async (genre) => {
      const artistsInGenre = await getArtistsByGenre(genre, 8);
      // Prefer artists the user isn't already into.
      const fresh = artistsInGenre.filter((a) => !knownArtistIds.has(a.id)).slice(0, 4);
      await Promise.all(
        fresh.map(async (artist) => {
          const tracks = await getArtistTopTracks(artist.id);
          tracks.slice(0, 3).forEach((t) => {
            if (!savedIds.has(t.id) && !heardIds.has(t.id) && !discoveryMap.has(t.id)) {
              discoveryMap.set(t.id, toUITrack(t));
            }
          });
        }),
      );
    }),
  );

  // Best-effort supplement: related artists still works for some apps.
  if (discoveryMap.size < size) {
    await Promise.all(
      topArtists.slice(0, settings.discoverySeeds).map(async (artist) => {
        const related = await getRelatedArtists(artist.id);
        await Promise.all(
          related.slice(0, 3).map(async (rel) => {
            const tracks = await getArtistTopTracks(rel.id);
            tracks.slice(0, 2).forEach((t) => {
              if (!savedIds.has(t.id) && !heardIds.has(t.id) && !discoveryMap.has(t.id)) {
                discoveryMap.set(t.id, toUITrack(t));
              }
            });
          }),
        );
      }),
    );
  }

  const discoveryTracks = shuffle([...discoveryMap.values()]);

  // --- Optional: Last.fm-powered buckets ----------------------------------
  // When a username is supplied, replace the Spotify approximations with real
  // scrobble data. Any failure (proxy not deployed, bad username) falls back to
  // the Spotify-only buckets computed above.
  let heavyFinal = heavyTracks;
  let olderFinal = olderTracks;
  let discoveryFinal = discoveryTracks;
  let lastfmUsed = false;

  const username = settings.lastfmUsername?.trim();
  if (username) {
    try {
      // Heavy rotation → real weekly top tracks.
      const weekly = await getWeeklyTopTracks(username, 100);
      const heavyLf = await tracksByIds(await resolveToSpotifyIds(weekly));
      if (heavyLf.length > 0) heavyFinal = heavyLf;

      // Older favourites → saved tracks excluding anything recently scrobbled.
      const recent = await getRecentTracks(username, 200);
      const recentKeys = new Set(recent.map((t) => trackKey(t.name, t.artist)));
      const olderCand = savedTracks
        .filter((s) => !recentKeys.has(trackKey(s.track.name, s.track.artists?.[0]?.name ?? '')))
        .sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
      if (olderCand.length > 0) {
        olderFinal = weightedSample(
          olderCand,
          olderCand.length,
          (_item, index) => olderCand.length - index,
        ).map((s) => toUITrack(s.track));
      }

      // Discovery → tracks similar to loved + weekly favourites.
      const loved = await getLovedTracks(username, 50);
      const seeds = [...loved, ...weekly].slice(0, settings.discoverySeeds);
      const similarLists = await Promise.all(
        seeds.map((s) => getSimilarTracks(s.name, s.artist, 15).catch(() => [] as LastfmTrack[])),
      );
      const similarUnique = new Map<string, LastfmTrack>();
      similarLists.flat().forEach((t) => {
        const k = trackKey(t.name, t.artist);
        if (!similarUnique.has(k)) similarUnique.set(k, t);
      });
      const discLf = (await tracksByIds(await resolveToSpotifyIds([...similarUnique.values()]))).filter(
        (t) => !savedIds.has(t.id) && !heardIds.has(t.id),
      );
      if (discLf.length > 0) discoveryFinal = shuffle(discLf);

      lastfmUsed = true;
    } catch (err) {
      console.warn('Last.fm enrichment failed; using Spotify-only mix.', err);
    }
  }

  // --- Compose target counts ----------------------------------------------
  const totalRatio = settings.ratioHeavy + settings.ratioOlder + settings.ratioDiscovery || 1;
  const targetHeavy = Math.round((settings.ratioHeavy / totalRatio) * size);
  const targetOlder = Math.round((settings.ratioOlder / totalRatio) * size);
  const targetDiscovery = size - targetHeavy - targetOlder;

  const used = new Set<string>();
  const take = (source: UITrack[], n: number): UITrack[] => {
    const out: UITrack[] = [];
    for (const t of source) {
      if (out.length >= n) break;
      if (used.has(t.id)) continue;
      used.add(t.id);
      out.push(t);
    }
    return out;
  };

  const heavy = take(heavyFinal, targetHeavy);
  const older = take(olderFinal, targetOlder);
  const discovery = take(discoveryFinal, targetDiscovery);

  let combined = [...heavy, ...older, ...discovery];

  // Top-up if any bucket ran short: prefer discovery, then older, then heavy.
  if (combined.length < size) {
    combined = combined
      .concat(take(discoveryFinal, size))
      .concat(take(olderFinal, size))
      .concat(take(heavyFinal, size))
      .slice(0, size);
  }

  const tracks = shuffle(combined).slice(0, size);

  // Reserve pool: extra vetted tracks (roughly one more playlist's worth) kept
  // back so deletions can be refilled without regenerating the whole mix.
  const reserve = shuffle([
    ...take(discoveryFinal, size),
    ...take(olderFinal, size),
    ...take(heavyFinal, size),
  ]);

  return {
    tracks,
    reserve,
    lastfmUsed,
    targetSize: tracks.length,
    stats: { heavy: heavy.length, older: older.length, discovery: discovery.length },
  };
}
