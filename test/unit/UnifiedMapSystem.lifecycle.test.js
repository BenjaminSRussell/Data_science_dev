/**
 * UnifiedMapSystem lifecycle, layering and resize/update branches (#422)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const apps = [];
vi.mock('pixi.js', () => {
    class Container {
        constructor() { this.children = []; }
        addChild(c) { this.children.push(c); return c; }
        removeChildren() { this.children = []; }
    }
    class Application {
        constructor() {
            this.stage = new Container();
            this.canvas = document.createElement('canvas');
            this.renderer = { resize: vi.fn() };
            this.destroy = vi.fn();
            apps.push(this);
        }
        async init(opts) { this.opts = opts; }
    }
    class Graphics extends Container {}
    class Text extends Container {}
    return { Application, Container, Graphics, Text };
});

import { UnifiedMapSystem } from '../../src/js/game/UnifiedMapSystem.js';

const created = [];
const LAYERS = ['grass', 'zones', 'parks', 'roads', 'buildings', 'locations', 'ui'];

function makeSystem(container = document.createElement('div')) {
    const game = { gameState: { tooltipManager: {} }, worldMap: {} };
    const sys = new UnifiedMapSystem(container, game);
    created.push(sys);
    vi.spyOn(sys, 'renderLocalMap').mockResolvedValue();
    vi.spyOn(sys, 'renderLocalLocations').mockImplementation(() => {});
    vi.spyOn(sys, 'renderPlayerMarker').mockImplementation(() => {});
    return sys;
}

function sizeOf(el, w, h) {
    Object.defineProperty(el, 'clientWidth', { value: w, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: h, configurable: true });
}

describe('UnifiedMapSystem lifecycle', () => {
    beforeEach(() => { apps.length = 0; document.body.innerHTML = ''; });
    afterEach(() => {
        created.splice(0).forEach(sys => sys.destroy());
        vi.restoreAllMocks();
    });

    it('initialize builds one app, the canvas and the layers in z-order', async () => {
        const sys = makeSystem();
        await sys.initialize();
        expect(apps).toHaveLength(1);
        expect(sys.container.querySelector('canvas')).toBe(apps[0].canvas);
        expect(apps[0].stage.children.map(c => c.name)).toEqual(LAYERS);
        expect(sys.rendered).toBe(true);
        expect(sys.renderLocalMap).toHaveBeenCalledTimes(1);
        await sys.initialize();
        expect(apps).toHaveLength(1);
    });

    it('concurrent initialize/update calls share one init', async () => {
        const sys = makeSystem();
        const a = sys.initialize();
        sys.update();
        await a;
        expect(apps).toHaveLength(1);
    });

    it('a missing container logs and does nothing', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        const sys = makeSystem(null);
        await sys.initialize();
        expect(apps).toHaveLength(0);
        expect(err).toHaveBeenCalled();
    });

    it('dimensions: container, then parent, then 800x600', () => {
        const parent = document.createElement('div');
        const el = document.createElement('div');
        parent.appendChild(el);
        const sys = makeSystem(el);
        sizeOf(el, 500, 400);
        expect(sys.getDimensions()).toEqual({ width: 500, height: 400 });
        sizeOf(el, 0, 0);
        sizeOf(parent, 640, 480);
        expect(sys.getDimensions()).toEqual({ width: 640, height: 480 });
        sizeOf(parent, 0, 0);
        expect(sys.getDimensions()).toEqual({ width: 800, height: 600 });
        expect(makeSystem(document.createElement('div')).getDimensions()).toEqual({ width: 800, height: 600 });
    });

    it('handleResize resizes the renderer and re-renders only when rendered', async () => {
        const sys = makeSystem();
        sys.handleResize(); // no app yet
        await sys.initialize();
        sys.renderLocalMap.mockClear();
        sizeOf(sys.container, 300, 200);
        window.dispatchEvent(new Event('resize'));
        expect(apps[0].renderer.resize).toHaveBeenCalledWith(300, 200);
        expect(sys.renderLocalMap).toHaveBeenCalledTimes(1);
        sys.rendered = false;
        sys.handleResize();
        expect(sys.renderLocalMap).toHaveBeenCalledTimes(1);
    });

    it('update re-renders locations and the marker once rendered', async () => {
        const sys = makeSystem();
        await sys.initialize();
        sys.layers.locations.addChild({});
        sys.layers.ui.addChild({});
        sys.update();
        expect(sys.layers.locations.children).toEqual([]);
        expect(sys.layers.ui.children).toEqual([]);
        expect(sys.renderLocalLocations).toHaveBeenCalled();
        expect(sys.renderPlayerMarker).toHaveBeenCalled();
    });

    it('destroy tears down the app and resize listener and allows re-init', async () => {
        const sys = makeSystem();
        await sys.initialize();
        const app = apps[0];
        sys.destroy();
        expect(app.destroy).toHaveBeenCalledWith(true);
        expect(sys.app).toBeNull();
        expect(sys.container.innerHTML).toBe('');
        window.dispatchEvent(new Event('resize'));
        expect(app.renderer.resize).not.toHaveBeenCalled();
        await sys.initialize();
        expect(apps).toHaveLength(2);
        expect(() => makeSystem(null).destroy()).not.toThrow();
    });
});
