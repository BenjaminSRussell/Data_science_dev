import { describe, it, expect } from 'vitest';
import { MISSING_ASSETS, isAssetMissing } from '../../src/js/assets/MissingAssetBlocklist.js';

describe('MissingAssetBlocklist (#463)', () => {
    const known = 'assets/characters/sprites/character_sheet.png';

    it('stores entries without a leading slash', () => {
        expect(MISSING_ASSETS.has(known)).toBe(true);
        for (const p of MISSING_ASSETS) expect(p.startsWith('/')).toBe(false);
    });

    it('matches a listed path with a leading slash', () => {
        expect(isAssetMissing('/' + known)).toBe(true);
    });

    it('matches the same path without a leading slash', () => {
        expect(isAssetMissing(known)).toBe(true);
    });

    it('returns false for paths not in the set', () => {
        expect(isAssetMissing('/assets/definitely/not/listed.png')).toBe(false);
    });

    it('treats falsy input as missing', () => {
        expect(isAssetMissing(null)).toBe(true);
        expect(isAssetMissing(undefined)).toBe(true);
        expect(isAssetMissing('')).toBe(true);
    });

    it('only strips one leading slash, keeping internal slashes', () => {
        expect(isAssetMissing('//' + known)).toBe(false);
        expect(isAssetMissing(known.replace(/\//g, ''))).toBe(false);
    });
});
