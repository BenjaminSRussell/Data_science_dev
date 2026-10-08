import { describe, it, expect, vi, afterEach } from 'vitest';
import { ComprehensiveSpriteSystem } from '../../src/js/assets/ComprehensiveSpriteSystem.js';
import { bodyLanguageMapper } from '../../src/js/characters/BodyLanguageMapper.js';

afterEach(() => vi.restoreAllMocks());

function fakeImage(w, h) {
    return { naturalWidth: w, naturalHeight: h, width: w, height: h };
}

describe('ComprehensiveSpriteSystem cluster', () => {
    it('#2301 #1839 pose loading uses the mapper accessor that exists and requests every pose sprite', async () => {
        const sys = new ComprehensiveSpriteSystem(null, null);
        const spy = vi.spyOn(sys, 'loadSprite').mockResolvedValue(null);
        await sys.loadBodyLanguageSprites();
        const poses = bodyLanguageMapper.getAllPoses();
        expect(spy).toHaveBeenCalledTimes(poses.length);
        expect(spy).toHaveBeenCalledWith(bodyLanguageMapper.getBodyLanguage(poses[0]).sprite, `pose_${poses[0]}`);
    });

    it('#2136 loadSprite reuses an image the AssetManager already has', async () => {
        const img = fakeImage(64, 64);
        const sys = new ComprehensiveSpriteSystem({ getAsset: (k) => (k === 'pose_standing' ? img : null) }, null);
        await expect(sys.loadSprite('/x.png', 'pose_standing')).resolves.toBe(img);
        expect(sys.getBodyLanguageSprite('standing')).toBe(img);
    });

    it('#2135 #1052 combined sprite scales to the pose size and is a ready-to-draw canvas', () => {
        const sys = new ComprehensiveSpriteSystem(null, null);
        const drawImage = vi.fn();
        const ctx = { drawImage, globalAlpha: 1 };
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
        sys.loadedSprites.set('pose_standing', fakeImage(128, 96));
        sys.loadedSprites.set('emotion_happy', fakeImage(32, 32));
        const out = sys.getCombinedSprite('happy', 'standing');
        expect(out).toBeInstanceOf(HTMLCanvasElement);
        expect(out.width).toBe(128);
        expect(out.height).toBe(96);
        expect(drawImage).toHaveBeenNthCalledWith(1, expect.anything(), 0, 0, 128, 96);
        expect(drawImage).toHaveBeenNthCalledWith(2, expect.anything(), 0, 0, 128, 96);
        expect(sys.getCombinedSprite('happy', 'standing')).toBe(out);
    });
});
