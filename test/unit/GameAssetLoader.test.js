/**
 * Unit tests for GameAssetLoader removal (issue #2287)
 * The class was never imported. Location backdrops and NPC portraits
 * already go through LocationBackgroundSystem and NPCImageMapper.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('GameAssetLoader Removal (issue #2287)', () => {
    it('should be removed from the codebase', () => {
        const loaderPath = path.join(__dirname, '../../src/js/assets/GameAssetLoader.js');
        expect(fs.existsSync(loaderPath)).toBe(false);
    });

    it('should not be imported or constructed in application code', () => {
        const srcRoot = path.join(__dirname, '../../src');
        const offenders = [];

        function walk(dir) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(full);
                    continue;
                }
                if (!entry.name.endsWith('.js')) continue;
                const text = fs.readFileSync(full, 'utf8');
                if (/GameAssetLoader/.test(text)) offenders.push(path.relative(srcRoot, full));
            }
        }

        walk(srcRoot);
        expect(offenders).toEqual([]);
    });
});
