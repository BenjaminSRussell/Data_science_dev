/**
 * AssetResolver claimed to check PNG then SVG, but resolve() never called
 * assetExists() and nothing in the game imported it (#2246, #1046).
 * Keep it deleted rather than shipping a passthrough with fallback comments.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AssetResolver removal (issue #2246)', () => {
    const srcDir = path.join(__dirname, '../../src');

    function walkJs(dir, found = []) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walkJs(full, found);
            else if (entry.isFile() && entry.name.endsWith('.js')) found.push(full);
        }
        return found;
    }

    it('does not keep src/js/utils/AssetResolver.js', () => {
        const assetResolverPath = path.join(__dirname, '../../src/js/utils/AssetResolver.js');
        expect(fs.existsSync(assetResolverPath)).toBe(false);
    });

    it('is not referenced from application code', () => {
        const hits = walkJs(srcDir).filter((file) => /AssetResolver/.test(fs.readFileSync(file, 'utf8')));
        expect(hits).toEqual([]);
    });
});
