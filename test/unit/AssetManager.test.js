import { describe, it, expect, beforeEach } from 'jest';
import { AssetManager } from '../../src/js/assets/AssetManager';
import { isAssetMissing } from '../../src/js/assets/MissingAssetBlocklist';

describe('AssetManager', () => {
    let assetManager;

    beforeEach(() => {
        assetManager = new AssetManager();
    });

    describe('countAssets', () => {
        it('should count assets in a minimal fixture', () => {
            const obj = { a: 'x', b: { c: 'y', d: 'z' } };
            expect(assetManager.countAssets(obj)).toBe(3);
        });

        it('should return 0 for an empty object', () => {
            const obj = {};
            expect(assetManager.countAssets(obj)).toBe(0);
        });

        it('should count assets in the real getAssetManifest', () => {
            const manifest = assetManager.getAssetManifest();
            expect(assetManager.countAssets(manifest)).toBeGreaterThan(50);
        });
    });

    describe('getAsset', () => {
        it('should retrieve an asset by key', () => {
            assetManager.assets.set('test.key', 'value');
            expect(assetManager.getAsset('test.key')).toBe('value');
        });

        it('should return null for an unset key', () => {
            expect(assetManager.getAsset('unset.key')).toBeNull();
        });
    });

    describe('getCharacterEmotion', () => {
        it('should retrieve a character emotion', () => {
            assetManager.assets.set('characters.emotions.happy', 'happy.png');
            expect(assetManager.getCharacterEmotion('happy')).toBe('happy.png');
        });

        it('should return null for an unset emotion', () => {
            expect(assetManager.getCharacterEmotion('unset')).toBeNull();
        });
    });

    describe('getCharacterBodyLanguage', () => {
        it('should return base value if pose is unset but base is set', () => {
            assetManager.assets.set('characters.bodyLanguage.base', 'base.png');
            expect(assetManager.getCharacterBodyLanguage('unset')).toBe('base.png');
        });

        it('should return null if neither pose nor base is set', () => {
            expect(assetManager.getCharacterBodyLanguage('unset')).toBeNull();
        });
    });

    describe('Icon getters', () => {
        const iconGetters = [
            { method: 'getLocationIcon', key: 'locations.test', fallback: '/assets/icons/locations/test.png' },
            { method: 'getNPCIcon', key: 'npcs.hacker', fallback: '/assets/icons/npcs/hacker.png' },
            { method: 'getUIIcon', key: 'ui.close', fallback: '/assets/icons/ui/close.png' },
            { method: 'getVehicleIcon', key: 'vehicles.car', fallback: '/assets/icons/vehicles/car.png' },
            { method: 'getItemIcon', key: 'items.coin', fallback: '/assets/icons/items/coin.png' },
            { method: 'getFeatureIcon', key: 'features.pool', fallback: '/assets/icons/features/pool.png' },
            { method: 'getChartIcon', key: 'charts.bar', fallback: '/assets/icons/charts/bar.png' }
        ];

        iconGetters.forEach(({ method, key, fallback }) => {
            it(`should return stored asset for ${method}`, () => {
                assetManager.assets.set(key, 'stored.png');
                expect(assetManager[method](key.split('.').pop())).toBe('stored.png');
            });

            it(`should return fallback for unset ${method}`, () => {
                expect(assetManager[method](key.split('.').pop())).toBe(fallback);
            });
        });

        it('should return null for unset map icon', () => {
            expect(assetManager.getMapIcon('unset')).toBeNull();
        });
    });

    describe('isLoaded/getLoadProgress', () => {
        it('should reflect loaded and loadProgress directly', () => {
            assetManager.loaded = true;
            assetManager.loadProgress = 0.75;
            expect(assetManager.isLoaded()).toBe(true);
            expect(assetManager.getLoadProgress()).toBe(0.75);
        });
    });

    describe('loadImage', () => {
        it('should resolve immediately for blocklisted src', () => {
            const src = '/assets/blocklisted/image.png';
            assetManager.loadImage(src, 'blocklisted.key');
            expect(assetManager.assets.get('blocklisted.key')).toBeNull();
            expect(assetManager.loadedAssets).toContain(src);
            expect(assetManager.loadProgress).toBeGreaterThan(0);
        });

        it('should handle non-blocklisted src with onload', () => {
            const src = '/assets/non-blocklisted/image.png';
            const key = 'non-blocklisted.key';
            const mockImage = { onload: jest.fn(), onerror: jest.fn() };
            global.Image = jest.fn(() => mockImage);

            assetManager.loadImage(src, key);
            mockImage.onload();
            expect(assetManager.assets.get(key)).toBe(src);
            expect(assetManager.loadedAssets).toContain(src);
            expect(assetManager.loadProgress).toBeGreaterThan(0);
        });

        it('should handle non-blocklisted src with onerror', () => {
            const src = '/assets/non-blocklisted/image.png';
            const key = 'non-blocklisted.key';
            const mockImage = { onload: jest.fn(), onerror: jest.fn() };
            global.Image = jest.fn(() => mockImage);

            assetManager.loadImage(src, key);
            mockImage.onerror();
            expect(assetManager.assets.get(key)).toBeNull();
            expect(assetManager.loadedAssets).toContain(src);
            expect(assetManager.loadProgress).toBeGreaterThan(0);
        });
    });

    describe('loadAll', () => {
        it('should load all assets and resolve true', async () => {
            const mockImage = { onload: jest.fn(), onerror: jest.fn() };
            global.Image = jest.fn(() => mockImage);

            const manifest = assetManager.getAssetManifest();
            const mockKeys = Object.keys(manifest).slice(0, 5); // mock a subset of keys

            mockKeys.forEach(key => {
                assetManager.loadImage(manifest[key], key);
                mockImage.onload();
            });

            await assetManager.loadAll();
            expect(assetManager.isLoaded()).toBe(true);
            expect(assetManager.getLoadProgress()).toBe(1);
        });
    });
});