import { spotifyApi } from '../../lib/spotify';
import { getArtistTopTracks, getRelatedArtists, getSavedTracks } from '../../lib/spotify';
import { UITrack, toUITrack } from '../../components/common/trackTypes';
import { fetchAudioFeatures } from './audioFeatures';
import { fetchTrackGenres } from './libraryGenres';

/** A simplified artist used as a filter seed. */
export interface PMArtist {
  id: string;
  name: string;
  image?: string;
  genres: string[];
  popularity?: number;
}

export interface PoolFilters {
  /** Widen the net by including each seed's related artists. */
  expandRelated: boolean;
  /** Only keep tracks the user has saved to their Spotify library. */
  libraryOnly: boolean;
  /** Only keep tracks from artists tagged with at least one of these genres. Empty = no genre filter. */
  genres: string[];
  minPopularity: number;
  maxPopularity: number;
  minYear: number;
  maxYear: number;
  /** Max tracks contributed per artist (after filtering). */
  tracksPerArtist: number;
  /** Target pool size. */
  targetSize: number;

  /** Enable ReccoBeats audio-feature filtering (energy/danceability/valence/tempo). */
  audioEnabled: boolean;
  /** Energy / danceability / valence ranges expressed 0–100 for the UI sliders. */
  minEnergy: number;
  maxEnergy: number;
  minDanceability: number;
  maxDanceability: number;
  minValence: number;
  maxValence: number;
  /** Tempo range in BPM. */
  minTempo: number;
  maxTempo: number;
}

export const DEFAULT_POOL_FILTERS: PoolFilters = {
  expandRelated: false,
  libraryOnly: false,
  genres: [],
  minPopularity: 0,
  maxPopularity: 100,
  minYear: 1950,
  maxYear: new Date().getFullYear(),
  tracksPerArtist: 5,
  targetSize: 50,
  audioEnabled: false,
  minEnergy: 0,
  maxEnergy: 100,
  minDanceability: 0,
  maxDanceability: 100,
  minValence: 0,
  maxValence: 100,
  minTempo: 0,
  maxTempo: 250,
};

/**
 * Incremental progress emitted while building from the library by genre — the
 * MusicBrainz lookup is slow, so the UI streams matches and shows a % bar.
 */
export interface BuildProgress {
  /** Saved tracks whose genre has been resolved so far. */
  processed: number;
  /** Total saved tracks being checked. */
  total: number;
  /** Tracks newly matched since the last callback (already filtered + ready to show). */
  newTracks: UITrack[];
}

export interface PoolResult {
  tracks: UITrack[];
  /** Extra vetted tracks held back to refill the pool when the user deletes songs. */
  reserve: UITrack[];
  /** The size the pool is kept at when refilling. */
  targetSize: number;
  /** Every genre present across the resolved artist set (for the genre picker). */
  availableGenres: string[];
  /** Number of artists that contributed to the pool. */
  artistCount: number;
  /** True when audio filtering was requested but ReccoBeats couldn't be reached. */
  audioUnavailable: boolean;
}

function simplifyArtist(a: SpotifyApi.ArtistObjectFull): PMArtist {
  const images = a.images ?? [];
  return {
    id: a.id,
    name: a.name,
    image: images[images.length - 1]?.url ?? images[0]?.url,
    genres: a.genres ?? [],
    popularity: a.popularity,
  };
}

/** Search Spotify for artists matching `query`. */
export async function searchArtists(query: string): Promise<PMArtist[]> {
  if (!query.trim()) return [];
  try {
    const res = await spotifyApi.searchArtists(query, { limit: 8 });
    return (res.artists?.items ?? []).map(simplifyArtist);
  } catch (err) {
    console.error('Error searching artists:', err);
    return [];
  }
}

/** Find representative artists for a genre using Spotify's `genre:` search filter. */
export async function searchArtistsByGenre(genre: string, limit = 12): Promise<PMArtist[]> {
  if (!genre.trim()) return [];
  try {
    const res = await spotifyApi.searchArtists(`genre:"${genre}"`, { limit });
    return (res.artists?.items ?? []).map(simplifyArtist);
  } catch (err) {
    console.error(`Error searching artists for genre "${genre}":`, err);
    return [];
  }
}

/**
 * A curated list of common Spotify genres, offered as suggestions in the genre
 * search box. Users can also type any free-text genre.
 */
export const COMMON_GENRES: string[] = [
  'pop', 'rock', 'hip hop', 'rap', 'r&b', 'soul', 'funk', 'jazz', 'blues',
  'country', 'folk', 'indie', 'indie rock', 'indie pop', 'alternative',
  'electronic', 'edm', 'house', 'techno', 'trance', 'drum and bass',
  'dubstep', 'lo-fi', 'ambient', 'classical', 'metal', 'heavy metal',
  'punk', 'reggae', 'reggaeton', 'latin', 'k-pop', 'j-pop', 'afrobeat',
  'disco', 'gospel', 'soundtrack', 'singer-songwriter', 'grunge', 'emo',
];

/** Shuffle helper (Fisher–Yates). */
function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a candidate track pool from the selected seed artists, seed genres and
 * filters. Gathers candidates one of two ways — Spotify's catalogue
 * ({@link gatherFromCatalogue}) or, when `filters.libraryOnly` is set, the
 * user's saved library ({@link gatherFromLibrary}) — then applies the optional
 * audio-feature filter and trims to the target size.
 */
export async function buildTrackPool(
  seeds: PMArtist[],
  seedGenres: string[],
  filters: PoolFilters,
  onProgress?: (progress: BuildProgress) => void,
): Promise<PoolResult> {
  if (seeds.length === 0 && seedGenres.length === 0) {
    return {
      tracks: [],
      reserve: [],
      targetSize: 0,
      availableGenres: [],
      artistCount: 0,
      audioUnavailable: false,
    };
  }

  // --- Gather candidate tracks --------------------------------------------
  // Two strategies: draw from Spotify's catalogue (each artist's top tracks),
  // or, when the user restricts to their library, from their saved tracks.
  const { collected, availableGenres, artistCount } = filters.libraryOnly
    ? await gatherFromLibrary(seeds, seedGenres, filters, onProgress)
    : await gatherFromCatalogue(seeds, seedGenres, filters);

  // --- Optional ReccoBeats audio-feature filtering ------------------------
  let filtered = collected;
  let audioUnavailable = false;
  if (filters.audioEnabled && collected.length > 0) {
    const { features, resolved, unavailable } = await fetchAudioFeatures(collected.map((t) => t.id));
    if (unavailable || resolved === 0) {
      // Service unreachable or nothing resolved — skip audio filtering rather
      // than return an empty pool, and let the UI surface a notice.
      audioUnavailable = true;
    } else {
      filtered = collected.filter((t) => {
        const f = features[t.id];
        if (!f) return false; // unknown features are excluded while audio filtering is on
        const energy = f.energy * 100;
        const dance = f.danceability * 100;
        const valence = f.valence * 100;
        return (
          energy >= filters.minEnergy &&
          energy <= filters.maxEnergy &&
          dance >= filters.minDanceability &&
          dance <= filters.maxDanceability &&
          valence >= filters.minValence &&
          valence <= filters.maxValence &&
          f.tempo >= filters.minTempo &&
          f.tempo <= filters.maxTempo
        );
      });
    }
  }

  const shuffled = shuffle(filtered);
  const tracks = shuffled.slice(0, filters.targetSize);
  const reserve = shuffled.slice(filters.targetSize);

  return {
    tracks,
    reserve,
    targetSize: tracks.length,
    availableGenres,
    artistCount,
    audioUnavailable,
  };
}

interface GatherResult {
  collected: UITrack[];
  /** Every genre present across the resolved artist set (for the genre picker). */
  availableGenres: string[];
  /** Number of artists that contributed tracks. */
  artistCount: number;
}

/** Keep tracks whose popularity and release year fall inside the filter ranges. */
function withinPopularityAndYear(t: UITrack, filters: PoolFilters): boolean {
  const pop = t.popularity ?? 50;
  const year = t.year ?? filters.maxYear;
  return (
    pop >= filters.minPopularity &&
    pop <= filters.maxPopularity &&
    year >= filters.minYear &&
    year <= filters.maxYear
  );
}

/**
 * Catalogue strategy: resolve seeds (+ genre-representative and related artists)
 * to a set of artists, then draw and filter their Spotify top tracks.
 */
async function gatherFromCatalogue(
  seeds: PMArtist[],
  seedGenres: string[],
  filters: PoolFilters,
): Promise<GatherResult> {
  const artistMap = new Map<string, PMArtist>();
  seeds.forEach((s) => artistMap.set(s.id, s));

  // Genre seeds expand into representative artists of that genre.
  if (seedGenres.length > 0) {
    const genreArtistLists = await Promise.all(seedGenres.map((g) => searchArtistsByGenre(g)));
    genreArtistLists.flat().forEach((a) => {
      if (!artistMap.has(a.id)) artistMap.set(a.id, a);
    });
  }

  if (filters.expandRelated && seeds.length > 0) {
    const relatedLists = await Promise.all(seeds.map((s) => getRelatedArtists(s.id)));
    relatedLists.flat().forEach((a) => {
      if (!artistMap.has(a.id)) artistMap.set(a.id, simplifyArtist(a));
    });
  }

  const allArtists = [...artistMap.values()];
  const availableGenres = Array.from(new Set(allArtists.flatMap((a) => a.genres))).sort();

  // Apply genre filter at the artist level.
  const selected = filters.genres.map((g) => g.toLowerCase());
  const matchingArtists =
    selected.length === 0
      ? allArtists
      : allArtists.filter((a) => a.genres.some((g) => selected.includes(g.toLowerCase())));

  const seen = new Set<string>();
  const collected: UITrack[] = [];

  const perArtistTracks = await Promise.all(
    matchingArtists.map(async (artist) => {
      const raw = await getArtistTopTracks(artist.id);
      return raw.map(toUITrack);
    }),
  );

  perArtistTracks.forEach((tracks) => {
    let takenForArtist = 0;
    for (const t of shuffle(tracks)) {
      if (takenForArtist >= filters.tracksPerArtist) break;
      if (seen.has(t.id)) continue;
      if (!withinPopularityAndYear(t, filters)) continue;
      seen.add(t.id);
      collected.push(t);
      takenForArtist++;
    }
  });

  return { collected, availableGenres, artistCount: matchingArtists.length };
}

/**
 * Library strategy: draw only from the user's saved tracks. Artist seeds keep
 * every saved track by that artist (not just its top tracks); genre seeds keep
 * saved tracks whose genre tags match, resolved via Last.fm track tags with a
 * Spotify artist-genre fallback (Spotify deprecated its genre/recommendation
 * endpoints).
 */
async function gatherFromLibrary(
  seeds: PMArtist[],
  seedGenres: string[],
  filters: PoolFilters,
  onProgress?: (progress: BuildProgress) => void,
): Promise<GatherResult> {
  // De-dupe the saved library by track id.
  const savedById = new Map<string, SpotifyApi.TrackObjectFull>();
  for (const item of await getSavedTracks()) {
    const t = item.track;
    if (t?.id && !savedById.has(t.id)) savedById.set(t.id, t);
  }
  const savedTracks = [...savedById.values()];

  const matched = new Map<string, SpotifyApi.TrackObjectFull>();
  const contributingArtists = new Set<string>();

  // Artist seeds (+ related, when enabled) → every saved track by those artists.
  const artistIds = new Set(seeds.map((s) => s.id));
  if (filters.expandRelated && seeds.length > 0) {
    const relatedLists = await Promise.all(seeds.map((s) => getRelatedArtists(s.id)));
    relatedLists.flat().forEach((a) => artistIds.add(a.id));
  }
  if (artistIds.size > 0) {
    for (const t of savedTracks) {
      const hit = (t.artists ?? []).find((a) => artistIds.has(a.id));
      if (hit) {
        matched.set(t.id, t);
        contributingArtists.add(hit.id);
      }
    }
  }

  // Genre seeds → saved tracks whose genre tags match. Genres come from Last.fm
  // track tags (track-level) with a Spotify artist-genre fallback. Broad seeds
  // match specific tags in either direction ("rock" ⇄ "alternative rock"). The
  // lookup can be slow, so we stream matches out via `onProgress` as each track
  // resolves rather than waiting for the whole library.
  if (seedGenres.length > 0) {
    const wanted = seedGenres.map((g) => g.toLowerCase());
    const candidates = savedTracks.filter((t) => !matched.has(t.id));
    const candidateById = new Map(candidates.map((t) => [t.id, t]));
    await fetchTrackGenres(
      candidates.map((t) => ({
        id: t.id,
        name: t.name,
        artistId: t.artists?.[0]?.id,
        artist: t.artists?.[0]?.name ?? '',
      })),
      (input, tags, progress) => {
        const track = candidateById.get(input.id);
        let newTracks: UITrack[] = [];
        if (track) {
          const isMatch = tags.some((tag) => wanted.some((w) => tag.includes(w) || w.includes(tag)));
          if (isMatch) {
            matched.set(track.id, track);
            if (track.artists?.[0]?.id) contributingArtists.add(track.artists[0].id);
            const ui = toUITrack(track);
            if (withinPopularityAndYear(ui, filters)) newTracks = [ui];
          }
        }
        onProgress?.({ processed: progress.processed, total: progress.total, newTracks });
      },
    );
  }

  const collected = [...matched.values()]
    .map(toUITrack)
    .filter((t) => withinPopularityAndYear(t, filters));
  const availableGenres = Array.from(new Set(seeds.flatMap((s) => s.genres))).sort();

  return { collected, availableGenres, artistCount: contributingArtists.size };
}
