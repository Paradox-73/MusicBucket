import { spotifyApi } from '../spotify';
import { supabase } from "../supabase";
import { Session } from '@supabase/supabase-js'; // Import Session type

export class SpotifyAuth {
  private static instance: SpotifyAuth;
  private isInitialized: boolean = false;

  private constructor() {
    const setSpotifyToken = async (session: Session | null) => {
      let spotifyAccessToken: string | null | undefined = null;

      if (session) {
        // 1. Try provider_token (available immediately after OAuth redirect)
        spotifyAccessToken = session.provider_token;

        // 2. If not found, try fetching from user_metadata (if stored there by Supabase)
        if (!spotifyAccessToken && session.user?.user_metadata?.access_token) {
          spotifyAccessToken = session.user.user_metadata.access_token as string;
        }

        // 3. If still not found, fetch from the 'profiles' table
        if (!spotifyAccessToken && session.user?.id) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('spotify_access_token')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile for Spotify token:', error);
          } else if (profile?.spotify_access_token) {
            spotifyAccessToken = profile.spotify_access_token;
          }
        }
      }

      if (spotifyAccessToken) {
        spotifyApi.setAccessToken(spotifyAccessToken);
        this.isInitialized = true;
      } else {
        spotifyApi.setAccessToken('');
        this.isInitialized = false;
      }
      console.log('SpotifyAuth: setSpotifyToken - Final token status:', this.isInitialized ? 'Token set' : 'No token');
    };

    // Immediately try to set access token from current session on instantiation
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSpotifyToken(session);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      console.log('SpotifyAuth: onAuthStateChange - Event:', event, 'Session:', session);
      setSpotifyToken(session);
      if (event === 'SIGNED_OUT') {
        console.log('SpotifyAuth: SIGNED_OUT');
        spotifyApi.setAccessToken('');
        this.isInitialized = false;
      }
    });
  }

  public static getInstance(): SpotifyAuth {
    if (!SpotifyAuth.instance) {
      SpotifyAuth.instance = new SpotifyAuth();
    }
    return SpotifyAuth.instance;
  }

  public async initialize(): Promise<boolean> {
    console.log('SpotifyAuth: Initializing...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('SpotifyAuth: Initial session check - Session:', session);
    
    let spotifyAccessToken: string | null | undefined = null;
    if (session) {
      spotifyAccessToken = session.provider_token;
      if (!spotifyAccessToken && session.user?.user_metadata?.access_token) {
        spotifyAccessToken = session.user.user_metadata.access_token as string;
      }
      if (!spotifyAccessToken && session.user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('spotify_access_token')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile for Spotify token during initialize:', error);
        } else if (profile?.spotify_access_token) {
          spotifyAccessToken = profile.spotify_access_token;
        }
      }
    }

    if (spotifyAccessToken) {
      spotifyApi.setAccessToken(spotifyAccessToken);
      this.isInitialized = true;
      return true;
    }
    this.isInitialized = false;
    return false;
  }

  public async authenticate(): Promise<boolean> {
    console.log('SpotifyAuth: Authenticating with Spotify...');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read playlist-modify-public playlist-modify-private user-top-read',
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      console.error('Error during Spotify authentication:', error);
      return false;
    }
    console.log('SpotifyAuth: signInWithOAuth initiated. Data:', data);
    // Supabase handles the redirect, so we don't need to do anything here
    return true;
  }

  public async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('SpotifyAuth: isAuthenticated check - Session:', session, 'isInitialized:', this.isInitialized);
    return !!session && this.isInitialized;
  }

  public async logout(): Promise<void> {
    console.log('SpotifyAuth: Attempting to log out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during Spotify logout:', error);
    } else {
      console.log('SpotifyAuth: Supabase signOut successful.');
    }
    spotifyApi.setAccessToken('');
    this.isInitialized = false;
    console.log('SpotifyAuth: Logged out and token cleared.');
  }

  public clearToken(): void {
    console.log('SpotifyAuth: Clearing token...');
    // Supabase manages the token, so no direct clearing needed here
    spotifyApi.setAccessToken('');
    this.isInitialized = false;
    console.log('SpotifyAuth: Token cleared.');
  }

  public getAccessToken(): string | null {
    const token = spotifyApi.getAccessToken();
    console.log('SpotifyAuth: getAccessToken - Returning token:', token); // Added log
    return token;
  }

  public setToken(token: string, expiresIn: number): void {
    console.log('SpotifyAuth: setToken called (Supabase manages token).');
    // Supabase manages the token, so no direct setting needed here
    // The token will be set via the onAuthStateChange listener
  }
}
