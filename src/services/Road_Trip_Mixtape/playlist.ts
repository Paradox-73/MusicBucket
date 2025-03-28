import { Artist, Track, Location } from '../../types/Road_Trip_Mixtape';
import { searchArtistsByLocation, getTopTracks } from './spotify';

export async function generatePlaylist(
  route: Location[],
  duration: number,
  genres?: string[]
): Promise<{ tracks: Track[]; artists: Artist[] }> {
  // Get artists along the route
  const artistResults = await Promise.all(
    route.map(location => searchArtistsByLocation(location.name, genres))
  );
  
  // Assign locations to artists based on route points
  const artistsWithLocations = artistResults.map((artists, index) => 
    artists.map(artist => ({
      ...artist,
      location: route[index]
    }))
  ).flat();

  // Filter to unique artists and sort by popularity
  const uniqueArtists = Array.from(
    new Map(
      artistsWithLocations
        .sort((a, b) => b.popularity - a.popularity)
        .map(artist => [artist.id, artist])
    ).values()
  );

  // Group artists by their waypoint index
  const artistsByWaypoint = uniqueArtists.reduce((acc, artist) => {
    const waypointIndex = route.findIndex(loc => 
      loc.name === artist.location.name
    );
    if (!acc[waypointIndex]) acc[waypointIndex] = [];
    acc[waypointIndex].push(artist);
    return acc;
  }, {} as Record<number, Artist[]>);

  // Get tracks for each artist and group them by waypoint
  const tracksByWaypoint: Record<number, Track[]> = {};
  for (const [index, artists] of Object.entries(artistsByWaypoint)) {
    const tracks = (await Promise.all(
      artists.map(artist => getTopTracks(artist.id))
    )).flat();
    tracksByWaypoint[Number(index)] = tracks;
  }

  // Calculate approximate duration for each segment
  const segmentDuration = duration / (route.length - 1);
  const playlist: Track[] = [];
  let currentDuration = 0;

  // Build playlist following the route
  for (let i = 0; i < route.length; i++) {
    const segmentTracks = tracksByWaypoint[i] || [];
    let segmentCurrentDuration = 0;

    while (
      segmentCurrentDuration < segmentDuration && 
      segmentTracks.length > 0 && 
      currentDuration < duration
    ) {
      const randomIndex = Math.floor(Math.random() * segmentTracks.length);
      const track = segmentTracks[randomIndex];
      
      // Update track with full artist info
      const artist = uniqueArtists.find(a => a.id === track.artist.id);
      if (artist) {
        track.artist = artist;
      }
      
      playlist.push(track);
      segmentCurrentDuration += track.duration;
      currentDuration += track.duration;
      segmentTracks.splice(randomIndex, 1);
    }
  }

  return { tracks: playlist, artists: uniqueArtists };
}