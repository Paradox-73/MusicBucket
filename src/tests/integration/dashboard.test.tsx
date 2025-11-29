import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, queryClient } from '@/tests/fixtures/test-utils';
import Dashboard from '@/pages/Dashboard';
import { useDashboardDataStore } from '@/store/Dashboard/dashboardDataStore';
import { createSpotifyApi } from '@/lib/Dashboard/spotify';

// Mock SpotifyAuth class
vi.mock('@/lib/spotify/auth', () => ({
    SpotifyAuth: {
        getInstance: vi.fn().mockReturnValue({
            initialize: vi.fn().mockResolvedValue(true),
            authenticate: vi.fn().mockResolvedValue(true),
            isAuthenticated: vi.fn().mockResolvedValue(true),
            getAccessToken: vi.fn().mockReturnValue('mock-token'),
            logout: vi.fn(),
            clearToken: vi.fn(),
        }),
    },
}));

// Mock createSpotifyApi
vi.mock('@/lib/Dashboard/spotify', () => ({
    createSpotifyApi: vi.fn().mockReturnValue({
        getCurrentUser: vi.fn().mockResolvedValue({ data: { id: 'test-user', display_name: 'Test User' } }),
        getTopArtists: vi.fn().mockResolvedValue({ data: { items: [] } }),
        getTopTracks: vi.fn().mockResolvedValue({ data: { items: [] } }),
        getPlaylists: vi.fn().mockResolvedValue({ data: { items: [] } }),
        getSavedTracks: vi.fn().mockResolvedValue({ data: { items: [] } }),
    }),
}));

// Mock Dashboard Store
vi.mock('@/store/Dashboard/dashboardDataStore', () => ({
    useDashboardDataStore: vi.fn(),
}));

vi.mock('@/store/authStore', () => ({
    useAuthStore: () => ({
        user: { id: 'test-user' },
    }),
}));

describe('Dashboard Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
        // Seed the query cache to avoid "Query data cannot be undefined"
        queryClient.setQueryData(['all-tracks-analysis'], {
            allTracks: [],
            playlists: [],
            uniqueSongCount: 0
        });
    });

    it('renders dashboard layout', async () => {
        (useDashboardDataStore as any).mockReturnValue({
            isLoading: false,
            stats: { totalTracks: 0, totalArtists: 0 },
            recentActivity: [],
        });

        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText(/your top charts/i)).toBeInTheDocument();
        });
    });

    it('displays loading state', async () => { // Make it async
        (useDashboardDataStore as any).mockReturnValue({
            isLoading: true,
            stats: null,
        });

        render(<Dashboard />);
        await waitFor(() => { // Wrap assertion in waitFor
            expect(screen.getByText(/checking spotify authentication/i)).toBeInTheDocument();
        });
    });

    it('displays top artist when loaded', async () => {
        (useDashboardDataStore as any).mockReturnValue({
            isLoading: false,
            stats: { totalTracks: 150, totalArtists: 45 },
            recentActivity: [],
        });

        // Mock data for stats using vi.mocked
        vi.mocked(createSpotifyApi).mockReturnValue({
            getCurrentUser: vi.fn().mockResolvedValue({ data: { id: 'test-user', display_name: 'Test User' } }),
            getTopArtists: vi.fn().mockResolvedValue({
                data: {
                    items: Array(45).fill(null).map((_, i) => ({
                        id: `artist-${i}`,
                        name: `Artist ${i + 1}`,
                        genres: ['pop'],
                        images: [{ url: 'https://example.com/image.jpg' }],
                        external_urls: { spotify: `https://spotify.com/artist/${i}` }
                    }))
                }
            }),
            getTopTracks: vi.fn().mockResolvedValue({
                data: {
                    items: Array(150).fill(null).map((_, i) => ({
                        id: `track-${i}`,
                        name: `Track ${i + 1}`,
                        artists: [{ name: `Artist ${i + 1}` }],
                        album: { images: [{ url: 'https://example.com/image.jpg' }] },
                        external_urls: { spotify: `https://spotify.com/track/${i}` }
                    }))
                }
            }),
            getPlaylists: vi.fn().mockResolvedValue({ data: { items: [] } }),
            getSavedTracks: vi.fn().mockResolvedValue({ data: { items: [] } }),
        } as any);

        render(<Dashboard />);

        await waitFor(() => {
            // Check for the artist name which should be rendered in TopArtistCard
            const artistElements = screen.getAllByText('Artist 1');
            expect(artistElements.length).toBeGreaterThan(0);
        });
    });
});
