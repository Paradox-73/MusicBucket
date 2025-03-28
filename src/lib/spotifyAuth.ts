import { SpotifyAuth } from './spotify/auth';
import { spotifyApi } from './spotify';

// Class to handle Spotify authentication in the context of the main app
export class MainAppSpotifyAuth {
  private static instance: MainAppSpotifyAuth;
  private isInitialized: boolean = false;
  private spotifyAuth: SpotifyAuth;

  private constructor() {
    this.spotifyAuth = SpotifyAuth.getInstance();
  }

  // Singleton pattern to ensure we only have one instance
  public static getInstance(): MainAppSpotifyAuth {
    if (!MainAppSpotifyAuth.instance) {
      MainAppSpotifyAuth.instance = new MainAppSpotifyAuth();
    }
    return MainAppSpotifyAuth.instance;
  }

  // Initialize Spotify authentication
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const success = await this.spotifyAuth.initialize();
    if (success) {
      this.isInitialized = true;
    }
    return success;
  }

  // Authenticate with Spotify
  public async authenticate(): Promise<boolean> {
    return this.spotifyAuth.authenticate();
  }

  // Check if user is authenticated
  public async isAuthenticated(): Promise<boolean> {
    return this.spotifyAuth.isAuthenticated();
  }

  // Logout from Spotify
  public async logout(): Promise<void> {
    await this.spotifyAuth.logout();
    this.isInitialized = false;
  }

  // Clear the Spotify token
  public clearToken(): void {
    this.spotifyAuth.clearToken();
    this.isInitialized = false;
  }

  // Get the current access token
  public getAccessToken(): string | null {
    return this.spotifyAuth.getAccessToken();
  }
}

// Hook to use Spotify authentication in components
export function useSpotifyAuthBridge() {
  const spotifyAuth = MainAppSpotifyAuth.getInstance();

  return {
    initialize: () => spotifyAuth.initialize(),
    authenticate: () => spotifyAuth.authenticate(),
    isAuthenticated: () => spotifyAuth.isAuthenticated(),
    logout: () => spotifyAuth.logout(),
    clearToken: () => spotifyAuth.clearToken(),
    getAccessToken: () => spotifyAuth.getAccessToken()
  };
} 