/**
 * Optional Last.fm enrichment for Daily Mix.
 *
 * Reading a user's public scrobbles needs only their username + the app's API
 * key — no per-user OAuth. The key must stay server-side, so all calls go
 * through the `lastfm` Supabase Edge Function (which injects the key). This
 * module talks to that proxy and resolves Last.fm track names to Spotify ids so
 * the results can be added to a Spotify playlist.
 */

import { supabase } from '../../lib/supabase';
import { spotifyApi } from '../../lib/spotify';

export interface LastfmTrack {
  name: string;
  artist: string;
}

/** A track as returned by the Last.fm API (artist may be a string or object). */
interface LastfmApiTrack {
  name: string;
  artist?: string | { name?: string; '#text'?: string };
}

/** The subset of Last.fm response shapes this module reads. */
interface LastfmResponse {
  error?: number;
  message?: string;
  user?: { name?: string };
  toptracks?: { track?: LastfmApiTrack[] };
  lovedtracks?: { track?: LastfmApiTrack[] };
  recenttracks?: { track?: LastfmApiTrack[] };
  similartracks?: { track?: LastfmApiTrack[] };
  toptags?: { tag?: Array<{ name?: string; count?: number }> };
}

async function callLastfm(method: string, params: Record<string, unknown>): Promise<LastfmResponse> {
  const { data, error } = await supabase.functions.invoke('lastfm', { body: { method, params } });
  if (error) throw error;
  const res = (data ?? {}) as LastfmResponse;
  if (res.error) throw new Error(res.message || `Last.fm error ${res.error}`);
  return res;
}

/** Confirm a Last.fm username exists (and the proxy is reachable). */
export async function validateLastfmUser(username: string): Promise<boolean> {
  if (!username.trim()) return false;
  try {
    const data = await callLastfm('user.getinfo', { user: username });
    return Boolean(data.user?.name);
  } catch {
    return false;
  }
}

function artistName(a: unknown): string {
  if (!a) return '';
  if (typeof a === 'string') return a;
  const obj = a as Record<string, string>;
  return obj.name ?? obj['#text'] ?? '';
}

function toLastfmTracks(items: LastfmApiTrack[] | undefined): LastfmTrack[] {
  return (items ?? [])
    .map((t) => ({ name: t.name, artist: artistName(t.artist) }))
    .filter((t) => t.name);
}

/** Most-played tracks over the past week (the true "heavy rotation" source). */
export async function getWeeklyTopTracks(username: string, limit = 100): Promise<LastfmTrack[]> {
  const data = await callLastfm('user.gettoptracks', { user: username, period: '7day', limit });
  return toLastfmTracks(data.toptracks?.track);
}

/** Tracks the user has explicitly loved on Last.fm (discovery seeds). */
export async function getLovedTracks(username: string, limit = 100): Promise<LastfmTrack[]> {
  const data = await callLastfm('user.getlovedtracks', { user: username, limit });
  return toLastfmTracks(data.lovedtracks?.track);
}

/** Recently scrobbled tracks — used to exclude "recently heard" songs. */
export async function getRecentTracks(username: string, limit = 200): Promise<LastfmTrack[]> {
  const data = await callLastfm('user.getrecenttracks', { user: username, limit });
  return toLastfmTracks(data.recenttracks?.track);
}

/** Tracks similar to a given track (Last.fm-powered discovery). */
export async function getSimilarTracks(track: string, artist: string, limit = 20): Promise<LastfmTrack[]> {
  const data = await callLastfm('track.getsimilar', { track, artist, limit, autocorrect: 1 });
  return toLastfmTracks(data.similartracks?.track);
}

/**
 * Community tags for a single track, lowercased and ordered most-popular first.
 * Track-level (not artist-level), so two songs by the same artist can carry
 * different genre tags. Returns [] on miss or error.
 */
export async function getTrackTopTags(artist: string, track: string, limit = 15): Promise<string[]> {
  try {
    const data = await callLastfm('track.gettoptags', { artist, track, autocorrect: 1 });
    return (data.toptags?.tag ?? [])
      .map((t) => t.name)
      .filter((n): n is string => Boolean(n))
      .slice(0, limit)
      .map((n) => n.toLowerCase());
  } catch {
    return [];
  }
}

/** Normalised cache key for a name/artist pair. */
export function trackKey(name: string, artist: string): string {
  return `${name}|${artist}`.toLowerCase().trim();
}

// --- Last.fm name/artist → Spotify id resolution --------------------------- #
const RESOLVE_CACHE_KEY = 'musicbucket.lastfm.resolve.v1';

function loadResolveCache(): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(RESOLVE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveResolveCache(cache: Record<string, string | null>) {
  try {
    localStorage.setItem(RESOLVE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

async function pMap<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

/**
 * Resolve Last.fm tracks to Spotify track ids via search (cached). Returns the
 * ids in the same order, skipping anything that couldn't be matched.
 */
export async function resolveToSpotifyIds(tracks: LastfmTrack[]): Promise<string[]> {
  const cache = loadResolveCache();
  const todo = tracks.filter((t) => !(trackKey(t.name, t.artist) in cache));

  await pMap(todo, 5, async (t) => {
    const key = trackKey(t.name, t.artist);
    try {
      const res = await spotifyApi.searchTracks(`track:${t.name} artist:${t.artist}`, { limit: 1 });
      cache[key] = res.tracks?.items?.[0]?.id ?? null;
    } catch {
      cache[key] = null;
    }
  });
  saveResolveCache(cache);

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const t of tracks) {
    const id = cache[trackKey(t.name, t.artist)];
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}
