/**
 * initializeMapRenderer must not keep a renderer that failed mid-init.
 * A throw used to leave game.mapRenderer truthy, so every later call no-oped.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const behavior = vi.hoisted(() => ({
    mode: 'success',
    constructed: 0,
    initialized: 0
}));

vi.mock('../../src/js/game/MapRenderer.js', () => {
    class MapRenderer {
        constructor(container, game) {
            behavior.constructed += 1;
            this.container = container;
            this.game = game;
            this.rendered = false;
            if (behavior.mode === 'ctor-throw') {
                throw new Error('constructor failed');
            }
        }

        initialize() {
            behavior.initialized += 1;
            if (this.game.mapRenderer) {
                throw new Error('mapRenderer assigned before initialize() returned');
            }
            if (behavior.mode === 'init-throw') {
                throw new Error('renderZones failed');
            }
            this.rendered = true;
        }
    }

    return { MapRenderer };
});

import { initializeMapRenderer } from '../../src/js/game/MapSystemInitializer.js';

describe('initializeMapRenderer mid-init failure', () => {
    let errorSpy;
    let warnSpy;

    beforeEach(() => {
        behavior.mode = 'success';
        behavior.constructed = 0;
        behavior.initialized = 0;
        document.body.innerHTML = '<div id="world-map"></div>';
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        errorSpy.mockRestore();
        warnSpy.mockRestore();
        document.body.innerHTML = '';
    });

    it('returns true and assigns the renderer only after initialize() succeeds', () => {
        const game = {};

        const result = initializeMapRenderer(game);

        expect(result).toBe(true);
        expect(game.mapRenderer).toBeTruthy();
        expect(game.mapRenderer.rendered).toBe(true);
        expect(game.mapRenderer.container.id).toBe('world-map');
        expect(behavior.constructed).toBe(1);
        expect(behavior.initialized).toBe(1);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('leaves game.mapRenderer unset and returns false when initialize() throws', () => {
        behavior.mode = 'init-throw';
        const game = {};

        const result = initializeMapRenderer(game);

        expect(result).toBe(false);
        expect(game.mapRenderer).toBeUndefined();
        expect(behavior.constructed).toBe(1);
        expect(behavior.initialized).toBe(1);
        expect(errorSpy).toHaveBeenCalledWith(
            'Failed to initialize map renderer:',
            expect.any(Error)
        );
    });

    it('leaves game.mapRenderer unset when the constructor throws', () => {
        behavior.mode = 'ctor-throw';
        const game = {};

        const result = initializeMapRenderer(game);

        expect(result).toBe(false);
        expect(game.mapRenderer).toBeUndefined();
        expect(behavior.constructed).toBe(1);
        expect(behavior.initialized).toBe(0);
        expect(errorSpy).toHaveBeenCalled();
    });

    it('retries after a mid-init throw instead of locking out for the page lifetime', () => {
        behavior.mode = 'init-throw';
        const game = {};

        expect(initializeMapRenderer(game)).toBe(false);
        expect(game.mapRenderer).toBeUndefined();

        behavior.mode = 'success';
        const result = initializeMapRenderer(game);

        expect(result).toBe(true);
        expect(game.mapRenderer).toBeTruthy();
        expect(game.mapRenderer.rendered).toBe(true);
        expect(behavior.constructed).toBe(2);
        expect(behavior.initialized).toBe(2);
    });

    it('does not construct another renderer when one is already ready', () => {
        const game = {};
        expect(initializeMapRenderer(game)).toBe(true);
        const ready = game.mapRenderer;

        const result = initializeMapRenderer(game);

        expect(result).toBe(true);
        expect(game.mapRenderer).toBe(ready);
        expect(behavior.constructed).toBe(1);
        expect(behavior.initialized).toBe(1);
    });

    it('returns false and does not construct a renderer when the map container is missing', () => {
        document.body.innerHTML = '';
        const game = {};

        const result = initializeMapRenderer(game);

        expect(result).toBe(false);
        expect(game.mapRenderer).toBeUndefined();
        expect(behavior.constructed).toBe(0);
        expect(warnSpy).toHaveBeenCalledWith('Map container not found');
        expect(errorSpy).not.toHaveBeenCalled();
    });
});
