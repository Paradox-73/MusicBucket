import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('Spotify API Integration', () => {
    it('should fetch user profile', async () => {
        const response = await fetch('https://api.spotify.com/v1/me');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            id: 'test-user',
            display_name: 'Test User',
            email: 'test@example.com',
        });
    });

    it('should handle 401 Unauthorized', async () => {
        // You would need to add a handler for this in handlers.ts or override here
        // For now, let's assume we can override
        server.use(
            http.get('https://api.spotify.com/v1/me', () => {
                return new HttpResponse(null, { status: 401 });
            })
        );

        const response = await fetch('https://api.spotify.com/v1/me');
        expect(response.status).toBe(401);
    });

    it('should handle 500 Server Error', async () => {
        server.use(
            http.get('https://api.spotify.com/v1/me', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        const response = await fetch('https://api.spotify.com/v1/me');
        expect(response.status).toBe(500);
    });
});
