import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('https://api.spotify.com/v1/me', () => {
        return HttpResponse.json({
            id: 'test-user',
            display_name: 'Test User',
            email: 'test@example.com',
        });
    }),
];
