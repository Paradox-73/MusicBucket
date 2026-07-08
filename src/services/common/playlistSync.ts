import { spotifyApi } from '../../lib/spotify';

/** Chunk an array into sub-arrays of at most `size` items. */
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Find a playlist owned by the current user with the exact given name, or
 * create a fresh one. Mirrors the "find-or-create by name (owned-by-user)"
 * behaviour of the original daily-shuffle script.
 */
export async function findOrCreateOwnedPlaylist(
  name: string,
  description: string,
  isPublic: boolean,
): Promise<{ id: string; created: boolean; url: string }> {
  const me = await spotifyApi.getMe();

  // Page through the user's playlists looking for an owned, exact-name match.
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await spotifyApi.getUserPlaylists(me.id, { limit: 50, offset });
    const match = page.items.find(
      (p) => p.owner?.id === me.id && p.name === name,
    );
    if (match) {
      return {
        id: match.id,
        created: false,
        url: match.external_urls?.spotify ?? `https://open.spotify.com/playlist/${match.id}`,
      };
    }
    if (!page.next) break;
    offset += page.items.length;
  }

  const created = await spotifyApi.createPlaylist(me.id, {
    name,
    description,
    public: isPublic,
  });
  return {
    id: created.id,
    created: true,
    url: created.external_urls?.spotify ?? `https://open.spotify.com/playlist/${created.id}`,
  };
}

/**
 * Replace the entire contents of a playlist with the given track URIs.
 * Spotify caps each request at 100 URIs, so the first 100 are used to replace
 * and the remainder are appended in chunks.
 */
export async function replacePlaylistTracks(playlistId: string, uris: string[]): Promise<void> {
  const batches = chunk(uris, 100);
  // Replace clears the playlist even when there are no tracks.
  await spotifyApi.replaceTracksInPlaylist(playlistId, batches[0] ?? []);
  for (let i = 1; i < batches.length; i++) {
    await spotifyApi.addTracksToPlaylist(playlistId, batches[i]);
  }
}

/** Append track URIs to a playlist, chunked to Spotify's 100-per-request cap. */
export async function appendPlaylistTracks(playlistId: string, uris: string[]): Promise<void> {
  for (const batch of chunk(uris, 100)) {
    await spotifyApi.addTracksToPlaylist(playlistId, batch);
  }
}
