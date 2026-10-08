import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/js/assets/MissingAssetBlocklist.js', () => ({ isAssetMissing: vi.fn(() => false) }));

import { isAssetMissing } from '../../src/js/assets/MissingAssetBlocklist.js';
import { getNPCImage, getAllNPCImagePaths, getNPCFallback } from '../../src/js/utils/NPCImageMapper.js';

// Same 32-bit hash the mapper uses
const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
    return Math.abs(h);
};

describe('NPCImageMapper (#481)', () => {
    beforeEach(() => isAssetMissing.mockReset().mockReturnValue(false));

    it('an explicit image wins', () => {
        expect(getNPCImage({ id: 'alex_rivera', image: '/custom/path.png' })).toBe('/custom/path.png');
    });

    it('known ids map to their hardcoded portraits', () => {
        expect(getNPCImage({ id: 'alex_rivera' })).toBe('/assets/npcs/alex_young.png');
        expect(getNPCImage({ id: 'vinnie_shark' })).toBe('/assets/npcs/loan_shark.png');
        expect(getNPCImage({ id: 'player' })).toBe('/assets/npcs/player_young.png');
    });

    it('generates a deterministic type/variant path', () => {
        const npc = { id: 'brand_new_npc', type: 'mentor', personality: 'wise' };
        const expected = `/assets/npcs/mentor_${hash('brand_new_npcmentorwise') % 10}.png`;
        expect(getNPCImage(npc)).toBe(expected);
        expect(getNPCImage({ ...npc })).toBe(expected);
    });

    it('unknown types fall back to the friend category', () => {
        expect(getNPCImage({ id: 'q', type: 'alien', personality: 'odd' })).toMatch(/^\/assets\/npcs\/friend_\d\.png$/);
    });

    it('missing assets become an SVG placeholder with initials and a palette color', () => {
        isAssetMissing.mockReturnValue(true);
        const uri = getNPCImage({ id: 'x', name: 'Jane Doe', type: 'unknown_blocked' });
        expect(uri.startsWith('data:image/svg+xml')).toBe(true);
        const svg = decodeURIComponent(uri.split(',').slice(1).join(','));
        expect(svg).toContain('>JD<');
        const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
        const fill = svg.match(/<rect[^>]*fill="([^"]+)"/)[1];
        expect(fill).toBe(palette[hash('Jane Doe') % palette.length]);
    });

    it('placeholder works for NPCs without a name, and null input does not throw', () => {
        isAssetMissing.mockReturnValue(true);
        expect(() => getNPCImage({ id: 'nameless' })).not.toThrow();
        expect(decodeURIComponent(getNPCImage({ id: 'nameless' }))).toContain('>?<');
        expect(() => getNPCImage(null)).not.toThrow();
    });

    it('getAllNPCImagePaths keeps order and length', () => {
        const npcs = [{ id: 'player' }, { image: '/a.png' }, { id: 'zero_cool' }];
        expect(getAllNPCImagePaths(npcs)).toEqual(['/assets/npcs/player_young.png', '/a.png', '/assets/npcs/the_hacker.png']);
        expect(getAllNPCImagePaths(undefined)).toEqual([]);
    });

    it('getNPCFallback prefers icon, then type text, then NPC', () => {
        expect(getNPCFallback({ icon: '*' })).toBe('*');
        expect(getNPCFallback({ type: 'mentor' })).toBe('Prof');
        expect(getNPCFallback({ type: 'nope' })).toBe('NPC');
        expect(getNPCFallback(null)).toBe('NPC');
    });
});
