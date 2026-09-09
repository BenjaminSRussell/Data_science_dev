/**
 * Unit tests for groupFilesByExtension
 */

import { describe, it, expect } from 'vitest';
import { groupFilesByExtension } from '../../scripts/lib/groupFilesByExtension.js';

describe('groupFilesByExtension', () => {
    it('groups multiple files sharing an extension together', () => {
        const files = [
            { path: 'a.js', extension: '.js', size: 10 },
            { path: 'b.js', extension: '.js', size: 20 },
            { path: 'c.css', extension: '.css', size: 5 }
        ];

        const result = groupFilesByExtension(files);

        expect(result['.js']).toHaveLength(2);
        expect(result['.js']).toEqual([
            { path: 'a.js', extension: '.js', size: 10 },
            { path: 'b.js', extension: '.js', size: 20 }
        ]);
        expect(result['.css']).toHaveLength(1);
        expect(result['.css'][0].path).toBe('c.css');
    });

    it('places a file with no extension in the (no extension) bucket', () => {
        const files = [
            { path: 'README', extension: '', size: 1 },
            { path: 'LICENSE', extension: undefined, size: 2 },
            { path: 'a.js', extension: '.js', size: 3 }
        ];

        const result = groupFilesByExtension(files);

        expect(result['(no extension)']).toHaveLength(2);
        expect(result['(no extension)'].map(f => f.path)).toEqual(['README', 'LICENSE']);
        expect(result['.js']).toHaveLength(1);
    });

    it('computes correct per-group size totals', () => {
        const files = [
            { path: 'a.js', extension: '.js', size: 100 },
            { path: 'b.js', extension: '.js', size: 250 },
            { path: 'c.png', extension: '.png', size: 4096 }
        ];

        const result = groupFilesByExtension(files);

        const jsTotal = result['.js'].reduce((sum, f) => sum + f.size, 0);
        const pngTotal = result['.png'].reduce((sum, f) => sum + f.size, 0);

        expect(jsTotal).toBe(350);
        expect(pngTotal).toBe(4096);
    });

    it('returns an empty map for an empty files array', () => {
        const result = groupFilesByExtension([]);

        expect(result).toEqual({});
        expect(Object.keys(result)).toHaveLength(0);
    });
});
