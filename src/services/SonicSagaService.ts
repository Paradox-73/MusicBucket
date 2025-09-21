import { supabase } from '../lib/supabase'; // Assuming supabase client is initialized here
import { createSpotifyApi } from '../lib/Dashboard/spotify'; // Reusing Spotify API client creation
import { SpotifyAuth } from '../lib/spotify/auth'; // For getting access token

export interface ArtistCard {
  id: string;
  artist_id: string;
  artist_name: string;
  artwork_url: string;
  primary_genre: string;
  secondary_genre?: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  special_ability_name?: string;
  special_ability_description?: string;
  vibe_score?: number;
  rarity: string;
  created_at: string;
  updated_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  artist_card_id: string;
  current_xp: number;
  level: number;
  acquired_at: string;
  last_played_at?: string;
  is_shiny: boolean;
  created_at: string;
  updated_at: string;
  artist_card: ArtistCard; // Joined data
}

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const SonicSagaService = {
  async getUserCards(userId: string): Promise<UserCard[]> {
    const { data, error } = await supabase
      .from('user_cards')
      .select(`
        *,
        artist_card:artist_cards(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user cards:', error);
      throw error;
    }
    return data as UserCard[];
  },

  async getArtistCardById(cardId: string): Promise<ArtistCard | null> {
    const { data, error } = await supabase
      .from('artist_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error) {
      console.error('Error fetching artist card:', error);
      throw error;
    }
    return data as ArtistCard;
  },

  async createArtistCard(cardData: Omit<ArtistCard, 'id' | 'created_at' | 'updated_at'>): Promise<ArtistCard | null> {
    const { data, error } = await supabase
      .from('artist_cards')
      .insert([cardData])
      .select()
      .single();

    if (error) {
      console.error('Error creating artist card:', error);
      throw error;
    }
    return data as ArtistCard;
  },

  async createUserCard(userId: string, artistCardId: string): Promise<UserCard | null> {
    const { data, error } = await supabase
      .from('user_cards')
      .insert([{ user_id: userId, artist_card_id: artistCardId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user card:', error);
      throw error;
    }
    return data as UserCard;
  },

  async updateUserCardXP(userCardId: string, newXP: number): Promise<UserCard | null> {
    const { data, error } = await supabase
      .from('user_cards')
      .update({ current_xp: newXP, updated_at: new Date().toISOString() })
      .eq('id', userCardId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user card XP:', error);
      throw error;
    }
    return data as UserCard;
  },

  async processSonicSagasClient(userId: string, spotifyAccessToken: string): Promise<{ message: string }> {
    const spotifyApi = createSpotifyApi(spotifyAccessToken, () => {}); // Dummy rate limit handler for now

    // 1. Fetch current user to get their ID
    const { data: currentUser, error: userError } = await spotifyApi.getCurrentUser();
    if (userError) {
      console.error('Error fetching current user:', userError);
      throw new Error('Failed to fetch current user from Spotify.');
    }
    const spotifyUserId = currentUser.id;

    // 2. Fetch Top Artists for different time ranges
    const timeRanges: TimeRange[] = ['long_term', 'medium_term', 'short_term'];
    const allTopArtists: any[] = [];

    for (const range of timeRanges) {
      const { data: topArtistsResponse, error: topArtistsError } = await spotifyApi.getTopArtists(range, 50);
      if (topArtistsError) {
        console.error(`Error fetching top artists for ${range}:`, topArtistsError);
        // Continue to next range even if one fails
        continue;
      }
      allTopArtists.push(...topArtistsResponse.items);
    }

    // Remove duplicates based on artist ID
    const uniqueTopArtists = Array.from(new Map(allTopArtists.map(artist => [artist.id, artist])).values());

    let newCardsAcquired = 0;
    let existingCardsProcessed = 0;

    for (const artist of uniqueTopArtists) {
      // Check if an ArtistCard already exists for this Spotify artist ID
      let artistCard: ArtistCard | null = null;
      const { data: existingArtistCard, error: fetchArtistCardError } = await supabase
        .from('artist_cards')
        .select('*')
        .eq('artist_id', artist.id)
        .single();

      if (existingArtistCard) {
        artistCard = existingArtistCard;
      } else if (fetchArtistCardError && fetchArtistCardError.code === 'PGRST116') { // No rows found
        // If ArtistCard doesn't exist, create it
        const primaryGenre = artist.genres && artist.genres.length > 0 ? artist.genres[0] : 'Unknown';
        const artworkUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : 'https://via.placeholder.com/150';

        // Basic stat generation (this needs to be refined based on design doc)
        const base_hp = 50 + Math.floor(artist.popularity / 2);
        const base_attack = 10 + Math.floor(artist.popularity / 5);
        const base_defense = 5 + Math.floor(artist.popularity / 10);
        const rarity = artist.popularity > 80 ? 'Legendary' : artist.popularity > 60 ? 'Epic' : artist.popularity > 40 ? 'Rare' : 'Common';

        const newArtistCardData = {
          artist_id: artist.id,
          artist_name: artist.name,
          artwork_url: artworkUrl,
          primary_genre: primaryGenre,
          base_hp: base_hp,
          base_attack: base_attack,
          base_defense: base_defense,
          rarity: rarity,
        };
        artistCard = await SonicSagaService.createArtistCard(newArtistCardData);
      } else if (fetchArtistCardError) {
        console.error('Error checking for existing artist card:', fetchArtistCardError);
        continue; // Skip this artist if there's a Supabase error
      }

      if (!artistCard) {
        console.error('Failed to get or create artist card for artist:', artist.name);
        continue;
      }

      // Check if UserCard already exists for this user and artistCard
      const { data: existingUserCard, error: fetchUserCardError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('artist_card_id', artistCard.id)
        .single();

      if (!existingUserCard) {
        if (fetchUserCardError && fetchUserCardError.code === 'PGRST116') { // No rows found
          await SonicSagaService.createUserCard(userId, artistCard.id);
          newCardsAcquired++;
        } else if (fetchUserCardError) {
          console.error('Error checking for existing user card:', fetchUserCardError);
        }
      } else {
        existingCardsProcessed++;
        // TODO: Implement XP gain or strengthening logic for existing cards here
      }
    }

    let message = '';
    if (newCardsAcquired > 0) {
      message += `Acquired ${newCardsAcquired} new Sonic Saga card(s)! `;
    }
    if (existingCardsProcessed > 0) {
      message += `Processed ${existingCardsProcessed} existing card(s).`;
    }
    if (newCardsAcquired === 0 && existingCardsProcessed === 0) {
      message = 'No new Sonic Saga cards acquired or existing cards processed.';
    }

    return { message: message.trim() };
  },

  // Add more functions as needed for card acquisition, leveling, etc.
};
