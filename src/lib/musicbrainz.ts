import axios from 'axios';

const MUSICBRAINZ_API_BASE = 'https://musicbrainz.org/ws/2';
const ACOUSTICBRAINZ_API_BASE = 'https://acousticbrainz.org/api/v1';

interface MusicBrainzRecording {
  id: string;
  title: string;
  'artist-credit': Array<{
    artist: {
      name: string;
    };
  }>;
  'release-groups'?: Array<{
    id: string;
  }>;
  genres?: Array<{
    'genre': string;
    'count': number;
  }>;
  tags?: Array<{
    'name': string;
    'count': number;
  }>;
}

interface MusicBrainzResponse {
  recordings: MusicBrainzRecording[];
}

interface AcousticBrainzHighLevelFeatures {
  // Define relevant high-level features you expect from AcousticBrainz
  // This is a simplified example, actual response is more complex
  mood?: {
    value: string;
  };
  genre_rosamerica?: {
    value: string;
  };
  // ... other features
}

export const getMusicBrainzIdAndGenre = async (trackName: string, artistName: string): Promise<{ mbid: string | null; genre: string | null }> => {
  try {
    // 1. Search for the recording
    const searchUrl = `${MUSICBRAINZ_API_BASE}/recording?query=recording:"${encodeURIComponent(trackName)}" AND artist:"${encodeURIComponent(artistName)}"&fmt=json`;
    const searchResponse = await axios.get<MusicBrainzResponse>(searchUrl);

    const recordings = searchResponse.data.recordings;
    if (!recordings || recordings.length === 0) {
      return { mbid: null, genre: null };
    }

    // Prioritize exact matches or the highest score
    const bestMatch = recordings.sort((a, b) => {
      // Simple scoring: prefer exact title match, then artist match
      const aScore = (a.title.toLowerCase() === trackName.toLowerCase() ? 2 : 0) +
                     (a['artist-credit']?.[0]?.artist?.name.toLowerCase() === artistName.toLowerCase() ? 1 : 0);
      const bScore = (b.title.toLowerCase() === trackName.toLowerCase() ? 2 : 0) +
                     (b['artist-credit']?.[0]?.artist?.name.toLowerCase() === artistName.toLowerCase() ? 1 : 0);
      return bScore - aScore;
    })[0];

    const mbid = bestMatch.id;

    // 2. Retrieve genres for the recording
    const lookupUrl = `${MUSICBRAINZ_API_BASE}/recording/${mbid}?inc=genres+tags&fmt=json`;
    const lookupResponse = await axios.get<MusicBrainzRecording>(lookupUrl);

    let genre: string | null = null;
    if (lookupResponse.data.genres && lookupResponse.data.genres.length > 0) {
      // Take the most frequent genre
      genre = lookupResponse.data.genres.sort((a, b) => b.count - a.count)[0].genre;
    } else if (lookupResponse.data.tags && lookupResponse.data.tags.length > 0) {
      // Fallback to tags if no genres
      genre = lookupResponse.data.tags.sort((a, b) => b.count - a.count)[0].name;
    } else if (bestMatch['release-groups'] && bestMatch['release-groups'].length > 0) {
      // If no genres/tags on recording, try release group
      const releaseGroupMbid = bestMatch['release-groups'][0].id;
      const releaseGroupLookupUrl = `${MUSICBRAINZ_API_BASE}/release-group/${releaseGroupMbid}?inc=genres+tags&fmt=json`;
      const releaseGroupLookupResponse = await axios.get<MusicBrainzRecording>(releaseGroupLookupUrl);
      if (releaseGroupLookupResponse.data.genres && releaseGroupLookupResponse.data.genres.length > 0) {
        genre = releaseGroupLookupResponse.data.genres.sort((a, b) => b.count - a.count)[0].genre;
      } else if (releaseGroupLookupResponse.data.tags && releaseGroupLookupResponse.data.tags.length > 0) {
        genre = releaseGroupLookupResponse.data.tags.sort((a, b) => b.count - a.count)[0].name;
      }
    }

    return { mbid, genre };

  } catch (error) {
    console.error(`Error fetching MusicBrainz data for ${trackName} by ${artistName}:`, error);
    return { mbid: null, genre: null };
  }
};

export const getAcousticBrainzFeatures = async (mbid: string): Promise<AcousticBrainzHighLevelFeatures | null> => {
  try {
    const url = `${ACOUSTICBRAINZ_API_BASE}/high-level/${mbid}`;
    const response = await axios.get<AcousticBrainzHighLevelFeatures>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching AcousticBrainz data for MBID ${mbid}:`, error);
    return null;
  }
};
