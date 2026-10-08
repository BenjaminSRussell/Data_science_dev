import { describe, it, expect, vi, afterEach } from 'vitest';
import { AssetValidator } from '../../src/js/dev/AssetValidator.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

const manifest = {
    characters: {
        spriteSheets: {
            main: { url: '/assets/characters/sprites/real_sheet.png', frameWidth: 64, frameHeight: 64, columns: 8, rows: 8 }
        },
        base: '/assets/characters/sprites/lpc_sprite_0.png'
    },
    emotions: { happy: '/assets/characters/emotions/happy.svg' },
    backgrounds: { locations: { office: { day: '/assets/backgrounds/office_day.png' } } },
    map: { tiles: ['/assets/map/road_01.png', '/assets/map/road_01.png'] },
    meta: { version: '1.0' }
};

const game = (extra = {}) => ({ assetManager: { getAssetManifest: () => manifest }, ...extra });

afterEach(() => vi.restoreAllMocks());

describe('AssetValidator cluster', () => {
    it('#1045 getImagePaths covers the whole manifest, not just backgrounds, without a cap', () => {
        const paths = new AssetValidator(game()).getImagePaths();
        expect(paths).toEqual(expect.arrayContaining([
            '/assets/characters/emotions/happy.svg',
            '/assets/backgrounds/office_day.png',
            '/assets/map/road_01.png'
        ]));
        expect(paths.filter(p => p === '/assets/map/road_01.png')).toHaveLength(1);
        // sprites are validated separately
        expect(paths).not.toContain('/assets/characters/sprites/real_sheet.png');
        expect(paths).not.toContain('1.0');
        expect(new AssetValidator(game()).getImagePaths(1)).toHaveLength(1);
    });

    it('#1438 no hardcoded sprite paths; blocklisted files are skipped, not counted as loaded', async () => {
        const v = new AssetValidator(game());
        expect(v.getSpritePaths()).toEqual([
            '/assets/characters/sprites/real_sheet.png',
            '/assets/characters/sprites/lpc_sprite_0.png'
        ]);
        const r = await v.validateImage('/assets/characters/sprites/character_sheet.png');
        expect(r).toMatchObject({ loaded: false, skipped: true });
    });

    it('#1440 validateSprites checks sheet geometry against the manifest', async () => {
        const v = new AssetValidator(game());
        vi.spyOn(v, 'validateImage').mockResolvedValue({ loaded: true });
        vi.spyOn(v, 'validateSpriteSheet').mockResolvedValue({ valid: true, totalFrames: 16, cols: 4, rows: 4 });
        const r = await v.validateSprites();
        expect(v.validateSpriteSheet).toHaveBeenCalledWith('/assets/characters/sprites/real_sheet.png', 64, 64);
        expect(r.sheets[0]).toMatchObject({ name: 'main', expectedFrames: 64, geometryOk: false });
        expect(r.errors[0].error).toMatch(/16 frames.*64/);
    });

    it('#864 audio check reads real music tracks; AudioManager has no dead sounds registry', () => {
        const am = new AudioManager();
        expect('sounds' in am).toBe(false);
        const paths = new AssetValidator(game({ audioManager: am })).getAudioPaths();
        expect(paths.length).toBeGreaterThan(0);
        expect(paths.every(p => p.startsWith('/assets/audio/music/'))).toBe(true);
    });
});
