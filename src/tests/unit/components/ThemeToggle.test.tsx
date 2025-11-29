import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

// Mock the useTheme hook
vi.mock('@/hooks/useTheme', () => ({
    useTheme: vi.fn(),
}));

describe('ThemeToggle Component', () => {
    it('renders correctly in light mode', () => {
        (useTheme as any).mockReturnValue({
            theme: 'light',
            toggleTheme: vi.fn(),
        });

        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /switch to dark mode/i });
        expect(button).toBeInTheDocument();
        // Check for Moon icon (which is shown in light mode to switch to dark)
        // Since we can't easily check for the icon component itself without more setup, 
        // checking the aria-label is a good proxy for now.
    });

    it('renders correctly in dark mode', () => {
        (useTheme as any).mockReturnValue({
            theme: 'dark',
            toggleTheme: vi.fn(),
        });

        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /switch to light mode/i });
        expect(button).toBeInTheDocument();
    });

    it('calls toggleTheme when clicked', () => {
        const toggleThemeMock = vi.fn();
        (useTheme as any).mockReturnValue({
            theme: 'light',
            toggleTheme: toggleThemeMock,
        });

        render(<ThemeToggle />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(toggleThemeMock).toHaveBeenCalledTimes(1);
    });
});
