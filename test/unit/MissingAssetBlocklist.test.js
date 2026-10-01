/**
 * MissingAssetBlocklist must only list assets that really do not ship.
 * A stale entry makes AssetManager.loadImage serve a placeholder and the
 * validators skip an asset that exists (e.g. sedan.png after #2537).
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MISSING_ASSETS, isAssetMissing } from '../../src/js/assets/MissingAssetBlocklist.js';

const projectRoot = path.resolve(__dirname, '../..');

// Vite serves both the project root (root: './') and publicDir ('public') at "/".
function shipsOnDisk(assetPath) {
    return fs.existsSync(path.join(projectRoot, assetPath)) ||
        fs.existsSync(path.join(projectRoot, 'public', assetPath));
}

describe('MissingAssetBlocklist', () => {
    it('should only list assets that are absent on disk', () => {
        const present = [...MISSING_ASSETS].filter(shipsOnDisk);
        expect(present).toEqual([]);
    });

    it('should not block the sedan icon or the_hacker portrait, which ship', () => {
        expect(isAssetMissing('/assets/icons/vehicles/sedan.png')).toBe(false);
        expect(isAssetMissing('/assets/npcs/the_hacker.png')).toBe(false);
    });
});
