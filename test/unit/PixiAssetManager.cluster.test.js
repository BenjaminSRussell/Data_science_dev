import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PixiAssetManager } from '../../src/js/assets/PixiAssetManager.js';
import { AssetManager } from '../../src/js/assets/AssetManager.js';

const fakeAssets = (missing = new Set()) => {
    const store = new Map();
    let registered = new Map();
    return {
        cache: {}, // Pixi always has this, so init() must not use it as a signal (#68)
        init: vi.fn(async ({ manifest }) => {
            registered = new Map(manifest.bundles.flatMap(b => b.assets.map(a => [a.alias, a.src])));
        }),
        load: vi.fn(async (alias) => {
            if (!registered.has(alias) || missing.has(alias)) throw new Error('404 ' + alias);
            store.set(alias, { texture: registered.get(alias) });
            return store.get(alias);
        }),
        get: vi.fn(alias => store.get(alias)),
        registered: () => registered
    };
};

const manifest = () => new AssetManager().getAssetManifest();

describe('PixiAssetManager cluster', () => {
    beforeEach(() => PixiAssetManager.resetForTests());

    it('#68 init() calls Assets.init even though Assets.cache exists', async () => {
        const assets = fakeAssets();
        const pam = new PixiAssetManager(assets);
        expect(await pam.init(manifest())).toBe(true);
        expect(assets.init).toHaveBeenCalledTimes(1);
        expect(pam.manifest.bundles.length).toBeGreaterThan(0);
        await pam.init(manifest());
        expect(assets.init).toHaveBeenCalledTimes(1);
    });

    it('#2299 sprite-sheet descriptors are one asset; metadata strings are not URLs', () => {
        const pam = new PixiAssetManager(fakeAssets());
        const entries = pam.convertManifestToAssets(manifest().characters, 'characters');
        expect(entries.some(e => e.src === 'spriteSheet')).toBe(false);
        expect(entries.some(e => e.alias.endsWith('.type'))).toBe(false);
        const sheet = entries.find(e => e.alias === 'characters.spriteSheets.main');
        expect(sheet.src).toBe('/assets/characters/sprites/character_sheet.png');
        expect(sheet.data).toMatchObject({ frameWidth: 64, columns: 8, type: 'spriteSheet' });
    });

    it('#2297 bundles come from the real manifest sections, none empty', () => {
        const bundles = PixiAssetManager.buildBundles(manifest());
        const names = bundles.map(b => b.name);
        expect(names).toEqual(expect.arrayContaining(['characters', 'locations', 'map', 'ui']));
        for (const b of bundles) expect(b.assets.length).toBeGreaterThan(0);
        const aliases = bundles.flatMap(b => b.assets.map(a => a.alias));
        expect(aliases).toContain('locations.office');
        expect(aliases).toContain('map.base');
        expect(aliases).toContain('icons.locations.home');
        expect(new Set(aliases).size).toBe(aliases.length);
    });

    it('#2298 #1054 getters resolve what init registered and loadAll loaded', async () => {
        const assets = fakeAssets(new Set(['characters.emotions.excited']));
        const pam = new PixiAssetManager(assets);
        await pam.init(manifest());
        expect(await pam.loadAll()).toBe(true);
        expect(pam.getCharacterEmotion('happy')).toEqual({ texture: '/assets/characters/emotions/happy.svg' });
        expect(pam.getCharacterBodyLanguage('sitting')).toEqual({ texture: '/assets/characters/body_language/sitting.png' });
        expect(pam.getLocationBackground('office')).toEqual({ texture: '/assets/backgrounds/locations/office/office_backdrop_00.png' });
        // A missing file is skipped, and the pose getter falls back to the base sprite
        expect(pam.failed).toEqual(['characters.emotions.excited']);
        expect(pam.getCharacterEmotion('excited')).toBeNull();
        expect(pam.getCharacterBodyLanguage('nope')).toEqual({ texture: '/assets/npcs/player_young.png' });
        expect(pam.getProgress()).toBe(100);
    });

    it('loadAll before init reports failure instead of throwing', async () => {
        const pam = new PixiAssetManager(fakeAssets());
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(await pam.loadAll()).toBe(false);
    });
});
