/**
 * UnifiedMapSystem render lifecycle, icons, colours and shared grid size
 * (#1909, #1349, #214, #156, #1910, #1934, #1167)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const loaded = [];
vi.mock('pixi.js', () => {
    class Container {
        constructor() { this.children = []; this.scale = { x: 1, y: 1 }; this.destroyed = false; }
        addChild(c) { this.children.push(c); return c; }
        removeChildren() { const out = this.children; this.children = []; return out; }
        destroy() { this.destroyed = true; }
        on() { return this; }
    }
    class Graphics extends Container {
        constructor() { super(); this.fills = []; }
        beginFill(color) { this.fills.push(color); return this; }
        lineStyle() { return this; }
        drawCircle() { return this; }
        drawRoundedRect() { return this; }
        drawRect() { return this; }
    }
    class Text extends Container {
        constructor(text) { super(); this.text = text; this.anchor = { set() {} }; this.style = {}; }
    }
    class Sprite extends Container {
        constructor(texture) { super(); this.texture = texture; this.anchor = { set() {} }; }
    }
    const Assets = { load: vi.fn(async (url) => { loaded.push(url); return { url }; }) };
    return { Container, Graphics, Text, Sprite, Assets, Application: class {} };
});

import { UnifiedMapSystem } from '../../src/js/game/UnifiedMapSystem.js';
import { WORLD_GRID_SIZE } from '../../src/js/config/mapGrid.js';
import { PositioningHelper } from '../../src/js/utils/PositioningHelper.js';
import { MapGridSystem } from '../../src/js/game/MapGridSystem.js';
import * as PIXI from 'pixi.js';

function makeSystem(locations = []) {
    const ticker = { callbacks: new Set(), lastTime: 0, add(fn) { this.callbacks.add(fn); }, remove(fn) { this.callbacks.delete(fn); } };
    const worldMap = {
        currentLocation: locations[0]?.id,
        getAccessibleLocations: () => locations,
        getCurrentLocation: () => locations[0]
    };
    const sys = new UnifiedMapSystem(document.createElement('div'), { worldMap, gameState: {} });
    sys.app = { screen: { width: 300, height: 300 }, ticker };
    for (const name of ['grass', 'zones', 'parks', 'roads', 'buildings', 'locations', 'ui']) sys.layers[name] = new PIXI.Container();
    return { sys, ticker };
}

const loc = (over = {}) => ({ id: 'home', name: 'Home', type: 'residence', position: { x: 15, y: 15 }, ...over });

describe('UnifiedMapSystem', () => {
    beforeEach(() => { loaded.length = 0; });

    it('uses the shared grid size everywhere', () => {
        const { sys } = makeSystem();
        expect(sys.gridSize).toBe(WORLD_GRID_SIZE);
        expect(new MapGridSystem().gridWidth).toBe(WORLD_GRID_SIZE);
        expect(PositioningHelper.gridToPercent(WORLD_GRID_SIZE, 0).x).toBe(100);
    });

    it('clearLayer destroys what it removes', () => {
        const { sys } = makeSystem();
        const child = new PIXI.Graphics();
        sys.layers.locations.addChild(child);
        sys.clearLayer(sys.layers.locations);
        expect(child.destroyed).toBe(true);
        expect(sys.layers.locations.children).toHaveLength(0);
    });

    it('keeps one pulse ticker callback across map updates, and removes it on destroy', () => {
        const { sys, ticker } = makeSystem([loc()]);
        sys.rendered = true;
        sys.renderPlayerMarker();
        sys.update();
        sys.update();
        expect(ticker.callbacks.size).toBe(1);
        sys.removePulseTicker();
        expect(ticker.callbacks.size).toBe(0);
    });

    it('draws image icons as sprites and text icons as text', async () => {
        const { sys } = makeSystem([loc({ icon: '/assets/icons/home.png' }), loc({ id: 'cafe', icon: 'C', position: { x: 5, y: 5 } })]);
        sys.renderLocalLocations();
        await Promise.resolve();
        await Promise.resolve();
        expect(loaded).toEqual(['/assets/icons/home.png']);
        const kids = sys.layers.locations.children;
        expect(kids.some(c => c instanceof PIXI.Sprite && c.texture.url === '/assets/icons/home.png')).toBe(true);
        expect(kids.some(c => c instanceof PIXI.Text && c.text === 'C')).toBe(true);
    });

    it('a sprite that finishes loading after the layer was replaced is dropped', async () => {
        const { sys } = makeSystem();
        const pending = sys.addIconSprite('/x.png', 0, 0);
        sys.layers.locations = new PIXI.Container();
        expect(await pending).toBeNull();
    });

    it('colours shopping and investment buildings', () => {
        const { sys } = makeSystem([loc({ id: 'mall', type: 'shopping' }), loc({ id: 'fund', type: 'investment' }), loc({ id: 'x', type: 'business' })]);
        sys.renderLocalBuildings();
        const [shopping, investment, business] = sys.layers.buildings.children.map(b => b.fills[0]);
        expect(shopping).not.toBe(business);
        expect(investment).not.toBe(business);
        expect(shopping).not.toBe(investment);
    });
});

describe('updateMapScreen map loading (#1167)', () => {
    it('starts only one UnifiedMapSystem import while one is pending', async () => {
        const { updateMapScreen } = await import('../../src/js/helpers/MapHelpers.js');
        document.body.innerHTML = '<div id="world-map"></div>';
        const game = { worldMap: { getAccessibleLocations: () => [], locations: {} }, timeManager: { getCurrentSlot: () => null, getEnergyPercent: () => 50, getFormattedDate: () => '', energy: 50, maxEnergy: 100 } };
        try { updateMapScreen(game); } catch { /* later DOM helpers need more of the game */ }
        const first = game.unifiedMapSystemLoading;
        try { updateMapScreen(game); } catch { /* later DOM helpers need more of the game */ }
        expect(first).toBeInstanceOf(Promise);
        expect(game.unifiedMapSystemLoading).toBe(first);
    });
});
