/**
 * A lightweight, UI-friendly track shape shared by the Spotify-powered feature
 * pages (Daily Mix, Playlist Manager). Normalised from the various Spotify SDK
 * response types so components don't have to juggle `SpotifyApi.*` shapes.
 */
export interface UITrack {
  id: string;
  uri: string;
  name: string;
  /** Comma-separated artist names, ready to render. */
  artists: string;
  /** Primary artist id, useful for grouping / de-duping. */
  primaryArtistId?: string;
  albumArt?: string;
  previewUrl?: string;
  durationMs: number;
  popularity?: number;
  /** Release year parsed from the album, when available. */
  year?: number;
}

/** Normalise a full Spotify track object into a {@link UITrack}. */
export function toUITrack(track: SpotifyApi.TrackObjectFull): UITrack {
  const albumImages = track?.album?.images ?? [];
  const releaseDate: string | undefined = track?.album?.release_date;
  const year = releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : undefined;
  return {
    id: track.id,
    uri: track.uri ?? `spotify:track:${track.id}`,
    name: track.name,
    artists: (track.artists ?? []).map((a) => a.name).join(', '),
    primaryArtistId: track.artists?.[0]?.id,
    albumArt: albumImages[albumImages.length - 1]?.url ?? albumImages[0]?.url,
    previewUrl: track.preview_url ?? undefined,
    durationMs: track.duration_ms ?? 0,
    popularity: typeof track.popularity === 'number' ? track.popularity : undefined,
    year: Number.isFinite(year) ? year : undefined,
  };
}

/** Format a millisecond duration as `m:ss`. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
