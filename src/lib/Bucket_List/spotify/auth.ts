import { SPOTIFY_CONFIG } from './config';
import type { SpotifyTokenResponse } from './types';

const TOKEN_KEY = 'spotify_token';
const EXPIRES_KEY = 'spotify_expires_at';

export class SpotifyAuth {
  private static instance: SpotifyAuth;
  private accessToken: string | null = null;
  private expiresAt: number = 0;

  private constructor() {
    // Load token from localStorage on initialization
    this.loadToken();
  }

  static getInstance(): SpotifyAuth {
    if (!SpotifyAuth.instance) {
      SpotifyAuth.instance = new SpotifyAuth();
    }
    return SpotifyAuth.instance;
  }

  private loadToken(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiresAt = localStorage.getItem(EXPIRES_KEY);
    
    if (token && expiresAt) {
      this.accessToken = token;
      this.expiresAt = parseInt(expiresAt, 10);
    }
  }

  private saveToken(token: string, expiresAt: number): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
  }

  getLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: SPOTIFY_CONFIG.redirectUri,
      scope: SPOTIFY_CONFIG.scopes.join(' '),
    });

    return `${SPOTIFY_CONFIG.authEndpoint}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<void> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_CONFIG.redirectUri,
    });

    const response = await fetch(SPOTIFY_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`
        )}`,
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to get access token');
    }

    const data = await response.json() as SpotifyTokenResponse;
    this.setAccessToken(data.access_token, data.expires_in);
  }

  private setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token;
    this.expiresAt = Date.now() + expiresIn * 1000;
    this.saveToken(token, this.expiresAt);
  }

  async getAccessToken(): Promise<string | null> {
    // Check if token exists and is still valid
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    // Clear invalid token
    this.clearToken();
    return null;
  }

  clearToken(): void {
    this.accessToken = null;
    this.expiresAt = 0;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }
}