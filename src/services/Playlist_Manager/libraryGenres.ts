/**
 * Genre lookup for Playlist Manager's library-only mode.
 *
 * Spotify deprecated its genre-seed / recommendation endpoints, so when the
 * user filters their saved library by genre we resolve each track's genres in
 * two layers:
 *
 *   1. Last.fm track tags (track-level) — the primary source, because genre
 *      varies song-to-song within an artist (one track "conscious hip hop",
 *      another "rap"). Goes through the `lastfm` Supabase Edge Function proxy.
 *   2. Spotify artist genres (artist-level) — a fast, keyless fallback for
 *      tracks Last.fm has no tags for, so nothing is left ungenred.
 *
 * Last.fm track tags are fetched one request at a time (throttled to stay under
 * the rate limit) and cached in localStorage so repeat builds are instant.
 */

import { getSeveralArtists } from '../../lib/spotify';
import { getTrackTopTags } from '../Daily_Mix/lastfm';

const CACHE_KEY = 'musicbucket.trackgenres.cache.v1';
/** Last.fm allows ~5 req/s; stay comfortably under it. */
const MIN_INTERVAL_MS = 250;

type Cache = Record<string, string[]>;

function loadCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* quota / privacy-mode — genres just won't persist */
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export interface GenreLookupInput {
  id: string;
  name: string;
  /** Primary artist id, used for the Spotify artist-genre fallback. */
  artistId?: string;
  /** Primary artist name, used for the Last.fm track-tag lookup. */
  artist: string;
}

export interface GenreProgress {
  /** How many tracks have been resolved so far. */
  processed: number;
  /** Total tracks to resolve. */
  total: number;
}

/**
 * Resolve genres for the given tracks. `onResolved` fires once per track in
 * input order — immediately for tracks answered by cache or the Spotify
 * fallback, after the throttled Last.fm call otherwise — so callers can stream
 * results and drive a progress bar. Never throws; unresolved tracks map to [].
 */
export async function fetchTrackGenres(
  tracks: GenreLookupInput[],
  onResolved?: (track: GenreLookupInput, genres: string[], progress: GenreProgress) => void,
): Promise<Record<string, string[]>> {
  // Fallback layer: batch-fetch Spotify artist genres up front (50 ids/call).
  const artistIds = Array.from(new Set(tracks.map((t) => t.artistId).filter((id): id is string => Boolean(id))));
  const artistGenres = new Map<string, string[]>();
  for (const batch of chunk(artistIds, 50)) {
    const artists = await getSeveralArtists(batch);
    for (const a of artists) {
      if (a?.id) artistGenres.set(a.id, (a.genres ?? []).map((g) => g.toLowerCase()));
    }
  }

  // Primary layer: Last.fm track tags, one throttled request per uncached track.
  const cache = loadCache();
  const out: Record<string, string[]> = {};
  const total = tracks.length;

  let last = 0;
  let processed = 0;
  for (const t of tracks) {
    if (!(t.id in cache)) {
      const wait = MIN_INTERVAL_MS - (Date.now() - last);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      last = Date.now();
      cache[t.id] = await getTrackTopTags(t.artist, t.name);
      saveCache(cache);
    }
    // Track-level tags win; fall back to the artist's Spotify genres when empty.
    const genres = cache[t.id]?.length ? cache[t.id] : (t.artistId && artistGenres.get(t.artistId)) || [];
    out[t.id] = genres;
    processed++;
    onResolved?.(t, genres, { processed, total });
  }

  return out;
}
