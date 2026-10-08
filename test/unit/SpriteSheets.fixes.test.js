/**
 * PixiSpriteManager: sheetId stored on animated sprites (#70, #1840, #2300),
 * sheets can be unloaded (#1053). SpriteSheetManager: registered animations
 * drive the frame math instead of being overwritten (#2294, #1050).
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('pixi.js', () => {
    class Sprite { constructor(t) { this.texture = t; } }
    class AnimatedSprite extends Sprite {
        constructor(textures) { super(textures[0]); this.textures = textures; this.playing = false; }
        play() { this.playing = true; }
    }
    return { Sprite, AnimatedSprite, Assets: {}, Spritesheet: class {} };
});

const { PixiSpriteManager } = await import('../../src/js/assets/PixiSpriteManager.js');
const { SpriteSheetManager } = await import('../../src/js/assets/SpriteSheetManager.js');

function managerWithSheet() {
    const m = new PixiSpriteManager();
    const animations = { walk: ['w1', 'w2'], talk: ['t1', 't2', 't3'] };
    const sheet = { textures: {}, animations, destroy: vi.fn() };
    m.spriteSheets.set('npc', sheet);
    m.animations.set('npc', animations);
    return { m, sheet };
}

describe('PixiSpriteManager', () => {
    it('createAnimatedSprite stores sheetId so playAnimation can switch textures', () => {
        const { m } = managerWithSheet();
        const sprite = m.createAnimatedSprite('npc', 'walk');
        expect(sprite.sheetId).toBe('npc');
        m.playAnimation(sprite, 'talk', false);
        expect(sprite.textures).toEqual(['t1', 't2', 't3']);
        expect(sprite.loop).toBe(false);
        expect(sprite.playing).toBe(true);
    });

    it('unloadSpriteSheet destroys and forgets the sheet', () => {
        const { m, sheet } = managerWithSheet();
        expect(m.unloadSpriteSheet('npc')).toBe(true);
        expect(sheet.destroy).toHaveBeenCalledWith(true);
        expect(m.getSpriteSheet('npc')).toBeNull();
        expect(m.animations.has('npc')).toBe(false);
        expect(m.unloadSpriteSheet('npc')).toBe(false);
    });
});

describe('SpriteSheetManager', () => {
    function loaded(config) {
        const m = new SpriteSheetManager();
        m.registerSpriteSheet('s', config);
        const sheet = m.spriteSheets.get('s');
        sheet.image = {}; // pretend the image loaded
        m.parseAnimations('s');
        return m;
    }

    it('uses the animations passed to registerSpriteSheet', () => {
        const m = loaded({ url: 'x.png', frameWidth: 32, frameHeight: 32, columns: 4, rows: 4,
            animations: { greet: { startFrame: 1, frameCount: 2, row: 2 } } });
        const greet = m.getAnimationFrames('s', 'greet');
        expect(greet.frames).toEqual([
            { x: 32, y: 64, width: 32, height: 32 },
            { x: 64, y: 64, width: 32, height: 32 }
        ]);
        expect(m.getAnimationFrames('s', 'idle')).toBeNull();
    });

    it('falls back to the default layout when no animations are given', () => {
        const m = loaded({ url: 'x.png', frameWidth: 64, frameHeight: 64, columns: 8 });
        const right = m.getAnimationFrames('s', 'walk_right');
        expect(right.frames[0]).toEqual({ x: 0, y: 128, width: 64, height: 64 }); // frame 16 = row 2
        expect(Object.keys(SpriteSheetManager.DEFAULT_ANIMATIONS)).toContain('talk');
    });
});
