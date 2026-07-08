import { spotifyApi } from '../../lib/spotify';
import { getArtistTopTracks, getRelatedArtists } from '../../lib/spotify';
import { UITrack, toUITrack } from '../../components/common/trackTypes';
import { fetchAudioFeatures } from './audioFeatures';

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
 * filters. Pure Spotify data: seed artists (+ artists found by genre, +
 * optionally related artists) → their top tracks → filtered by genre,
 * popularity and release year.
 */
export async function buildTrackPool(
  seeds: PMArtist[],
  seedGenres: string[],
  filters: PoolFilters,
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

  // --- Resolve the full artist set ----------------------------------------
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

  // --- Gather + filter tracks per artist ----------------------------------
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
      const pop = t.popularity ?? 50;
      const year = t.year ?? filters.maxYear;
      if (pop < filters.minPopularity || pop > filters.maxPopularity) continue;
      if (year < filters.minYear || year > filters.maxYear) continue;
      seen.add(t.id);
      collected.push(t);
      takenForArtist++;
    }
  });

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
    artistCount: matchingArtists.length,
    audioUnavailable,
  };
}
