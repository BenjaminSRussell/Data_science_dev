import { describe, it, expect, vi, beforeAll } from 'vitest';
import fs from 'node:fs';
import { AssetManager } from '../../src/js/assets/AssetManager.js';

let MainGame;
beforeAll(async () => {
    globalThis.__DSD_NO_AUTOBOOT__ = true;
    ({ MainGame } = await import('../../src/js/main.js'));
});

describe('AssetManager cluster (#1040, #1043, #1675, #1676, #2309)', () => {
    it('sprite-sheet descriptors count as one asset each; metadata is not a URL (#1043)', () => {
        const entries = AssetManager.collectEntries({ sheets: { main: { url: '/a.png', type: 'spriteSheet', frameWidth: 64 } }, x: '/b.png' });
        expect(entries.map(e => e.src)).toEqual(['/a.png', '/b.png']);
        expect(entries[0].key).toBe('sheets.main');
        const am = new AssetManager();
        const all = AssetManager.collectEntries(am.getAssetManifest());
        expect(all.some(e => e.src === 'spriteSheet')).toBe(false);
        expect(am.countAssets(am.getAssetManifest())).toBe(all.length);
    });

    it('map manifest points at files that exist on disk (#1040)', () => {
        const map = new AssetManager().getAssetManifest().map;
        const srcs = AssetManager.collectEntries(map).map(e => e.src);
        expect(srcs.length).toBeGreaterThan(30);
        for (const src of srcs) expect(fs.existsSync(src.replace(/^\//, ''))).toBe(true);
    });

    it('loads images in parallel up to the pool size (#1676)', async () => {
        const am = new AssetManager();
        let inFlight = 0, peak = 0;
        am.loadImage = vi.fn(() => {
            inFlight++; peak = Math.max(peak, inFlight);
            return new Promise(r => setTimeout(() => { inFlight--; r(null); }, 5));
        });
        const manifest = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k${i}`, `/img${i}.png`]));
        await am.loadAssets(manifest);
        expect(am.loadImage).toHaveBeenCalledTimes(20);
        expect(peak).toBe(AssetManager.LOAD_CONCURRENCY);
    });

    it('AssetValidator finds nested background images (#2309)', async () => {
        const { AssetValidator } = await import('../../src/js/dev/AssetValidator.js');
        const v = Object.create(AssetValidator.prototype);
        v.game = { assetManager: new AssetManager() };
        const paths = v.getImagePaths();
        expect(paths.length).toBeGreaterThan(0);
        // Nested backgrounds are found; other manifest images are included too (#1045)
        expect(paths.filter(p => p.includes('/backgrounds/')).length).toBeGreaterThan(0);
    });

    it('startNewGame waits for assets (capped) before "Ready!" (#1675)', async () => {
        vi.useFakeTimers();
        try {
            let resolveLoad;
            const fake = {
                assetManager: { loadProgress: 40 },
                loadAssetsInBackground: () => new Promise(r => { resolveLoad = r; }),
                showLoadingProgress: vi.fn()
            };
            let done = false;
            MainGame.prototype.waitForAssets.call(fake, 4000).then(() => { done = true; });
            await vi.advanceTimersByTimeAsync(300);
            expect(done).toBe(false);
            expect(fake.showLoadingProgress).toHaveBeenCalledWith('Loading assets... 40%', expect.any(Number));
            resolveLoad(true);
            await vi.advanceTimersByTimeAsync(1);
            expect(done).toBe(true);

            let done2 = false;
            const stuck = { assetManager: {}, loadAssetsInBackground: () => new Promise(() => {}), showLoadingProgress: vi.fn() };
            MainGame.prototype.waitForAssets.call(stuck, 1000).then(() => { done2 = true; });
            await vi.advanceTimersByTimeAsync(1001);
            expect(done2).toBe(true);
        } finally {
            vi.useRealTimers();
        }
        const src = fs.readFileSync('src/js/main.js', 'utf8');
        expect(src.indexOf('this.waitForAssets().then(')).toBeLessThan(src.indexOf("this.showLoadingProgress('Ready!', 100)"));
    });
});
