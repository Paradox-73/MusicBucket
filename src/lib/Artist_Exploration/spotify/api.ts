export async function getLikedTracks(token: string) {
  const tracks = [];
  let next = 'https://api.spotify.com/v1/me/tracks?limit=50';

  while (next) {
    const response = await fetch(next, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch liked tracks');
    const data = await response.json();
    tracks.push(...data.items.map((item: any) => item.track));
    next = data.next;
  }

  return tracks;
}

export async function getArtistAllTracks(artistId: string, token: string) {
  const albums = await getAllArtistAlbums(artistId, token);
  const tracks = [];

  for (const album of albums) {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${album.id}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch album tracks');
    const data = await response.json();
    tracks.push(...data.items);
  }

  return tracks;
}

export async function getAllArtistAlbums(artistId: string, token: string) {
  const albums = [];
  let next = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50`;

  while (next) {
    const response = await fetch(next, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch artist albums');
    const data = await response.json();
    albums.push(...data.items);
    next = data.next;
  }

  return albums;
}