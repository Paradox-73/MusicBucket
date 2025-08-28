import { spotifyApi } from '../spotify';
import { supabase } from "../supabase";

export class SpotifyAuth {
  private static instance: SpotifyAuth;
  private isInitialized: boolean = false;

  

  private constructor() {
    // Immediately try to set access token from current session on instantiation
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.provider_token) {
        spotifyApi.setAccessToken(session.provider_token);
        this.isInitialized = true;
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      console.log('SpotifyAuth: onAuthStateChange - Event:', event, 'Session:', session);
      if (session && session.provider_token) { // Always use provider_token if session exists
        spotifyApi.setAccessToken(session.provider_token);
        this.isInitialized = true;
      } else if (event === 'SIGNED_OUT') {
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
    if (session && session.provider_token) { // Ensure provider_token is present
      spotifyApi.setAccessToken(session.provider_token);
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
    console.log('SpotifyAuth: getAccessToken - Returning token:', token);
    return token;
  }

  public setToken(token: string, expiresIn: number): void {
    console.log('SpotifyAuth: setToken called (Supabase manages token).');
    // Supabase manages the token, so no direct setting needed here
    // The token will be set via the onAuthStateChange listener
  }
}
