const BASE_URL = 'https://api.spotify.com/v1';

export async function getRecommendation(
  token: string,
  type: string,
  useHistory: boolean
) {
  if (!token) throw new Error('No token provided');

  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    if (useHistory) {
      // Get recommendations based on user's top items
      switch (type.toLowerCase()) {
        case 'track': {
          // Get user's top tracks and use them as seed for recommendations
          const topTracksResponse = await fetch(`${BASE_URL}/me/top/tracks?limit=50`, { headers });
          if (!topTracksResponse.ok) throw new Error('Failed to fetch top tracks');
          const topTracks = await topTracksResponse.json();
          
          // Use top track IDs as seeds for recommendations
          const seedTracks = topTracks.items.slice(0, 2).map((track: any) => track.id).join(',');
          const response = await fetch(
            `${BASE_URL}/recommendations?seed_tracks=${seedTracks}&limit=20`,
            { headers }
          );
          if (!response.ok) throw new Error('Failed to fetch track recommendations');
          const data = await response.json();
          return data.tracks[Math.floor(Math.random() * data.tracks.length)];
        }

        case 'artist': {
          // Get user's top artists and find related artists
          const topArtistsResponse = await fetch(`${BASE_URL}/me/top/artists?limit=50`, { headers });
          if (!topArtistsResponse.ok) throw new Error('Failed to fetch top artists');
          const topArtists = await topArtistsResponse.json();
          
          if (!topArtists.items.length) {
            return getRandomRecommendation(type, headers);
          }

          // Get related artists for a random top artist
          const randomTopArtist = topArtists.items[Math.floor(Math.random() * topArtists.items.length)];
          const response = await fetch(
            `${BASE_URL}/artists/${randomTopArtist.id}/related-artists`,
            { headers }
          );
          
          if (!response.ok) {
            console.warn('Failed to fetch related artists, falling back to random recommendation');
            return getRandomRecommendation(type, headers);
          }
          
          const data = await response.json();
          if (!data.artists?.length) {
            return getRandomRecommendation(type, headers);
          }
          
          return data.artists[Math.floor(Math.random() * data.artists.length)];
        }

        case 'genre': {
          // Get user's top artists and extract their genres
          const topArtistsResponse = await fetch(`${BASE_URL}/me/top/artists?limit=50`, { headers });
          if (!topArtistsResponse.ok) throw new Error('Failed to fetch top artists');
          const topArtists = await topArtistsResponse.json();
          
          // Collect all genres from top artists
          const genres = new Set(topArtists.items.flatMap((artist: any) => artist.genres));
          const genresList = Array.from(genres);
          
          if (!genresList.length) {
            return getRandomRecommendation(type, headers);
          }
          
          return {
            name: genresList[Math.floor(Math.random() * genresList.length)],
            type: 'genre'
          };
        }

        default:
          // For other types, fall back to non-history based recommendations
          return getRandomRecommendation(type, headers);
      }
    }

    // If not using history, get random recommendations
    return getRandomRecommendation(type, headers);
  } catch (error) {
    console.error('Spotify API error:', error);
    throw error;
  }
}

async function getRandomRecommendation(type: string, headers: HeadersInit) {
  switch (type.toLowerCase()) {
    case 'track': {
      const genresResponse = await fetch(`${BASE_URL}/recommendations/available-genre-seeds`, { headers });
      if (!genresResponse.ok) throw new Error('Failed to fetch genres');
      const { genres } = await genresResponse.json();
      
      const randomGenres = genres
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .join(',');

      const response = await fetch(
        `${BASE_URL}/recommendations?seed_genres=${randomGenres}&limit=50`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch track recommendations');
      const data = await response.json();
      return data.tracks[Math.floor(Math.random() * data.tracks.length)];
    }

    case 'artist': {
      const genresResponse = await fetch(`${BASE_URL}/recommendations/available-genre-seeds`, { headers });
      if (!genresResponse.ok) throw new Error('Failed to fetch genres');
      const { genres } = await genresResponse.json();
      
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      const response = await fetch(
        `${BASE_URL}/search?q=genre:"${randomGenre}"&type=artist&limit=50`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch artist recommendations');
      const data = await response.json();
      
      return data.artists.items[Math.floor(Math.random() * data.artists.items.length)];
    }

    case 'playlist': {
      const response = await fetch(
        `${BASE_URL}/browse/categories/toplists/playlists?limit=50`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json();
      return data.playlists.items[Math.floor(Math.random() * data.playlists.items.length)];
    }

    case 'album': {
      // Get available genres to use as search terms
      const genresResponse = await fetch(`${BASE_URL}/recommendations/available-genre-seeds`, { headers });
      if (!genresResponse.ok) throw new Error('Failed to fetch genres');
      const { genres } = await genresResponse.json();
      
      // Pick a random genre to search
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      
      const response = await fetch(
        `${BASE_URL}/search?q=genre:"${randomGenre}"&type=album&limit=50`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch albums');
      const data = await response.json();
      
      // Filter out singles and EPs
      const fullAlbums = data.albums.items.filter((album: any) => album.total_tracks >= 5);
      if (!fullAlbums.length) {
        return data.albums.items[Math.floor(Math.random() * data.albums.items.length)];
      }
      return fullAlbums[Math.floor(Math.random() * fullAlbums.length)];
    }

    case 'genre': {
      const response = await fetch(`${BASE_URL}/recommendations/available-genre-seeds`, { headers });
      if (!response.ok) throw new Error('Failed to fetch genres');
      const { genres } = await response.json();
      return { 
        name: genres[Math.floor(Math.random() * genres.length)],
        type: 'genre'
      };
    }

    case 'podcast': {
      const response = await fetch(
        `${BASE_URL}/search?q=podcast&type=show&market=US&limit=50`,
        { headers }
      );
      if (!response.ok) throw new Error('Failed to fetch podcasts');
      const data = await response.json();
      return data.shows.items[Math.floor(Math.random() * data.shows.items.length)];
    }

    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}