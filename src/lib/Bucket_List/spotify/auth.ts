import { SPOTIFY_CONFIG } from './config';
import type { SpotifyTokenResponse } from './types';

const TOKEN_KEY = 'spotify_token';
const EXPIRES_KEY = 'spotify_expires_at';

import { spotifyApi } from '../../spotify';

export class SpotifyAuth {
  private static instance: SpotifyAuth;
  private isInitialized: boolean = false;
  private tokenExpiration: number | null = null;

  private constructor() {}

  static getInstance(): SpotifyAuth {
    if (!SpotifyAuth.instance) {
      SpotifyAuth.instance = new SpotifyAuth();
    }
    return SpotifyAuth.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const token = localStorage.getItem('spotify_token');
    const expiration = localStorage.getItem('spotify_token_expiration');
    
    if (token && expiration) {
      const expirationTime = parseInt(expiration);
      if (expirationTime > Date.now()) {
        spotifyApi.setAccessToken(token);
        this.tokenExpiration = expirationTime;
        this.isInitialized = true;
        return true;
      } else {
        // Token has expired, clear it
        this.clearToken();
      }
    }

    return false;
  }

  public async authenticate(): Promise<boolean> {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/callback`;
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read';

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
    return true;
  }

  public async isAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    // Check if token is expired
    if (this.tokenExpiration && this.tokenExpiration <= Date.now()) {
      this.clearToken();
      return false;
    }

    return !!spotifyApi.getAccessToken();
  }

  public async logout(): Promise<void> {
    this.clearToken();
  }

  public clearToken(): void {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiration');
    spotifyApi.setAccessToken('');
    this.isInitialized = false;
    this.tokenExpiration = null;
  }

  public getAccessToken(): string | null {
    return spotifyApi.getAccessToken();
  }

  public setToken(token: string, expiresIn: number): void {
    localStorage.setItem('spotify_token', token);
    const expirationTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem('spotify_token_expiration', expirationTime.toString());
    spotifyApi.setAccessToken(token);
    this.tokenExpiration = expirationTime;
    this.isInitialized = true;
  }
}