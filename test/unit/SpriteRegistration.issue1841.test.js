/**
 * Hardcoded sprite-registration paths must resolve to files on disk (#1841).
 * The LPC atlas JSON must also match gridAtlas(), so a grid edit cannot
 * leave the committed atlas describing frames that are not in the sheet.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
    LPC_ATLAS_URL,
    LPC_SHEET_ANIMATIONS,
    LPC_SHEET_GRID,
    LPC_SHEET_URLS,
    lpcSheet
} from '../../src/js/assets/AssetManager.js';
import { gridAtlas } from '../../src/js/assets/gridAtlas.js';

const ROOT = process.cwd();

function onDisk(urlPath) {
    const rel = String(urlPath || '').replace(/^\//, '');
    return fs.existsSync(path.join(ROOT, rel));
}

function quotedAssetPaths(source) {
    return [...source.matchAll(/['"`]((?:\/)?assets\/[^'"`]+)['"`]/g)]
        .map(m => m[1])
        .filter(p => !p.includes('${'));
}

describe('sprite registration asset paths (#1841)', () => {
    it('the main character sheet is a real LPC image plus the shared atlas, not character_sheet.png', () => {
        const sheet = lpcSheet(LPC_SHEET_URLS.basic);
        expect(sheet.url).toMatch(/\/lpc_sprite_\d+\.png$/);
        expect(sheet.url).not.toMatch(/character_sheet/);
        expect(sheet.jsonUrl).toBe(LPC_ATLAS_URL);
        expect(onDisk(sheet.url), sheet.url).toBe(true);
        expect(onDisk(sheet.jsonUrl), sheet.jsonUrl).toBe(true);
        for (const url of Object.values(LPC_SHEET_URLS)) {
            expect(onDisk(url), url).toBe(true);
        }

        const atlas = JSON.parse(fs.readFileSync(path.join(ROOT, sheet.jsonUrl.replace(/^\//, '')), 'utf8'));
        const expected = gridAtlas({
            ...LPC_SHEET_GRID,
            animations: LPC_SHEET_ANIMATIONS,
            image: sheet.url.split('/').pop()
        });
        expect(atlas).toEqual(expected);
        expect(atlas.meta.size).toEqual({ w: 832, h: 1344 });
        // walk_down is row 10 of a 13-column, 64px sheet
        expect(atlas.frames.walk_down_0.frame).toEqual({ x: 0, y: 640, w: 64, h: 64 });
    });

    it('every hardcoded asset path in sprite-registration sources exists', () => {
        const files = [
            'src/js/assets/ComprehensiveSpriteSystem.js',
            'src/js/assets/PixiSpriteManager.js',
            'src/js/assets/gridAtlas.js'
        ];
        const paths = files.flatMap(file => quotedAssetPaths(fs.readFileSync(path.join(ROOT, file), 'utf8')));
        paths.push(LPC_ATLAS_URL, ...Object.values(LPC_SHEET_URLS));
        expect(paths.length).toBeGreaterThan(0);
        for (const assetPath of paths) {
            expect(onDisk(assetPath), assetPath).toBe(true);
        }

        const registration = fs.readFileSync(path.join(ROOT, 'src/js/assets/ComprehensiveSpriteSystem.js'), 'utf8');
        const body = registration.slice(
            registration.indexOf('async registerSpriteSheets'),
            registration.indexOf('getEmotionSprite')
        );
        expect(body).toMatch(/\.loadSpriteSheet\s*\(/);
        expect(body).not.toMatch(/\.registerSpriteSheet\s*\(/);
        expect(body).not.toContain('character_sheet.png');
    });
});
