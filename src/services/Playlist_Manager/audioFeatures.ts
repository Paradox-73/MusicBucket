/**
 * Audio-feature enrichment via ReccoBeats — a keyless public API that stands in
 * for Spotify's deprecated `/v1/audio-features` endpoint (removed Nov 2024).
 *
 * Ported from the Personal Media Intelligence Hub pipeline. Two-step flow:
 *   1) GET /v1/track?ids=<spotify_ids>          → ReccoBeats internal ids (+ spotify href)
 *   2) GET /v1/track/<recco_id>/audio-features  → the 9 metrics
 *
 * Results are cached in localStorage so repeat builds are instant and a flaky
 * response never costs the whole pool. Values are approximations.
 */

export interface AudioFeatures {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

const RECCOBEATS_BASE = 'https://api.reccobeats.com/v1';
const CACHE_KEY = 'musicbucket.reccobeats.cache.v1';
const SPOTIFY_ID_RE = /[A-Za-z0-9]{22}/;
const FEATURE_KEYS: (keyof AudioFeatures)[] = [
  'acousticness',
  'danceability',
  'energy',
  'instrumentalness',
  'liveness',
  'loudness',
  'speechiness',
  'tempo',
  'valence',
];

type Cache = Record<string, AudioFeatures | null>;

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
    /* quota / privacy-mode — features just won't persist */
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** ReccoBeats echoes the Spotify URL in an href field; pull the 22-char id. */
function extractSpotifyId(obj: Record<string, unknown>): string | null {
  for (const key of ['href', 'spotifyId', 'spotify_id', 'externalUrls', 'url']) {
    const val = obj[key];
    if (typeof val === 'string') {
      const m = SPOTIFY_ID_RE.exec(val);
      if (m) return m[0];
    } else if (val && typeof val === 'object') {
      for (const v of Object.values(val as Record<string, unknown>)) {
        if (typeof v === 'string') {
          const m = SPOTIFY_ID_RE.exec(v);
          if (m) return m[0];
        }
      }
    }
  }
  return null;
}

/** Run async tasks with a bounded concurrency (browser-friendly rate limiting). */
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

export interface AudioFeatureResult {
  features: Record<string, AudioFeatures | null>;
  /** How many of the requested tracks we actually resolved features for. */
  resolved: number;
  /** True when the service couldn't be reached at all for the uncached tracks. */
  unavailable: boolean;
}

/**
 * Fetch audio features for the given Spotify track ids, using and updating the
 * localStorage cache. Never throws — unreachable tracks resolve to `null`.
 */
export async function fetchAudioFeatures(spotifyIds: string[]): Promise<AudioFeatureResult> {
  const cache = loadCache();
  const todo = spotifyIds.filter((id) => !(id in cache));

  let networkAttempts = 0;
  let networkFailures = 0;

  for (const batch of chunk(todo, 40)) {
    // Step 1: map Spotify ids → ReccoBeats ids.
    let content: Record<string, unknown>[] = [];
    networkAttempts++;
    try {
      const res = await fetch(`${RECCOBEATS_BASE}/track?ids=${encodeURIComponent(batch.join(','))}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json?.content ?? json;
        content = Array.isArray(raw) ? raw : raw?.content ?? [];
      } else {
        networkFailures++;
      }
    } catch {
      networkFailures++;
      // Whole batch unreachable — mark null so we don't retry every build.
      batch.forEach((id) => (cache[id] = null));
      saveCache(cache);
      continue;
    }

    const reccoMap = new Map<string, string>();
    for (const obj of content) {
      const sid = extractSpotifyId(obj);
      const rid = obj?.id;
      if (sid && typeof rid === 'string') reccoMap.set(sid, rid);
    }

    // Step 2: per-track audio features (endpoint takes the ReccoBeats id).
    await pMap(batch, 6, async (tid) => {
      const rid = reccoMap.get(tid);
      if (!rid) {
        cache[tid] = null;
        return;
      }
      try {
        const fr = await fetch(`${RECCOBEATS_BASE}/track/${rid}/audio-features`, {
          headers: { Accept: 'application/json' },
        });
        if (fr.ok) {
          const feats = await fr.json();
          cache[tid] = FEATURE_KEYS.reduce((acc, k) => {
            acc[k] = typeof feats?.[k] === 'number' ? feats[k] : 0;
            return acc;
          }, {} as AudioFeatures);
        } else {
          cache[tid] = null;
        }
      } catch {
        cache[tid] = null;
      }
    });
    saveCache(cache);
  }

  const features: Record<string, AudioFeatures | null> = {};
  let resolved = 0;
  for (const id of spotifyIds) {
    const f = cache[id] ?? null;
    features[id] = f;
    if (f) resolved++;
  }

  // "Unavailable" = we made network calls for uncached tracks and every one failed.
  const unavailable = todo.length > 0 && networkAttempts > 0 && networkFailures === networkAttempts && resolved === 0;

  return { features, resolved, unavailable };
}
