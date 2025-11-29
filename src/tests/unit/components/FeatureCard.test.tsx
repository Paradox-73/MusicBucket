import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/fixtures/test-utils';
import FeatureCard from '@/components/FeatureCard';

describe('FeatureCard Component', () => {
    const defaultProps = {
        title: 'Test Feature',
        description: 'This is a test description',
        icon: '🎵',
        link: '/test-link',
    };

    it('renders title and description correctly', () => {
        render(<FeatureCard {...defaultProps} />);

        expect(screen.getByText('Test Feature')).toBeInTheDocument();
        expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('renders the icon', () => {
        render(<FeatureCard {...defaultProps} />);
        expect(screen.getByText('🎵')).toBeInTheDocument();
    });

    it('renders a link with correct href', () => {
        render(<FeatureCard {...defaultProps} />);

        const link = screen.getByRole('link', { name: /explore/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test-link');
    });

    it('applies hover styles (snapshot)', () => {
        const { container } = render(<FeatureCard {...defaultProps} />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
