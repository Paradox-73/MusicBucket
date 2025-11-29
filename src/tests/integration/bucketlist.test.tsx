import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/tests/fixtures/test-utils';
import BucketList from '@/pages/BucketList';
import { useSpotifyAuth } from '@/hooks/Bucket_List/useSpotifyAuth';
import { getBucketLists } from '@/services/Bucket_List/supabaseBucketList';

// Mock useSpotifyAuth hook
vi.mock('@/hooks/Bucket_List/useSpotifyAuth', () => ({
    useSpotifyAuth: vi.fn().mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
    }),
}));

// Mock Supabase Service
vi.mock('@/services/Bucket_List/supabaseBucketList', () => ({
    getBucketLists: vi.fn(),
    createBucketList: vi.fn(),
    deleteBucketList: vi.fn(),
    updateBucketList: vi.fn(),
    uploadBucketListCover: vi.fn(),
}));

// Mock Auth Store
const mockUser = { id: 'test-user' };
const mockSession = { access_token: 'token' };

vi.mock('@/store/authStore', () => ({
    useAuthStore: () => ({
        user: mockUser,
        session: mockSession,
    }),
}));

// Mock useAuth hook if used directly
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: mockUser,
        session: mockSession,
        loading: false,
    }),
}));

describe('BucketList Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default mock implementation
        (useSpotifyAuth as any).mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
        });
        (getBucketLists as any).mockResolvedValue([]);
    });

    it('renders the bucket list page title', async () => {
        render(<BucketList />);
        await waitFor(() => {
            expect(screen.getByText(/bucket list/i)).toBeInTheDocument();
        });
    });

    it('fetches and displays bucket list items', async () => {
        const mockData = [
            { id: '1', name: 'Song 1', items: [], created_at: '2023-01-01' },
            { id: '2', name: 'Song 2', items: [], created_at: '2023-01-02' },
        ];

        (getBucketLists as any).mockResolvedValue(mockData);

        render(<BucketList />);

        await waitFor(() => {
            expect(screen.getByText('Song 1')).toBeInTheDocument();
            expect(screen.getByText('Song 2')).toBeInTheDocument();
        });
    });

    it('handles empty state correctly', async () => {
        (getBucketLists as any).mockResolvedValue([]);

        render(<BucketList />);

        // Verify loading state is initially present
        expect(screen.getByText('Loading your Bucket Lists...')).toBeInTheDocument();

        // Wait for empty state to appear
        expect(await screen.findByText(/no bucket lists yet/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        (useSpotifyAuth as any).mockReturnValue({
            isAuthenticated: false,
            isLoading: true,
        });

        render(<BucketList />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
