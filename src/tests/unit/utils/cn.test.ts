import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/Bucket_List/cn';

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        const result = cn('bg-red-500', 'text-white');
        expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
        const result = cn('bg-red-500', true && 'text-white', false && 'hidden');
        expect(result).toBe('bg-red-500 text-white');
    });

    it('should merge tailwind classes correctly', () => {
        const result = cn('p-4', 'p-2');
        expect(result).toBe('p-2');
    });
});
