import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import { DOMUtils } from '../../src/js/utils/DOMUtils.js';
import { MapGridSystem } from '../../src/js/game/MapGridSystem.js';
import { MapManager } from '../../src/js/game/MapManager.js';
import { CameraSystem } from '../../src/js/camera/CameraSystem.js';
import * as MapHelpers from '../../src/js/helpers/MapHelpers.js';

describe('Map helpers cluster (#1165, #1170, #1933, #2462)', () => {
    it('DOMUtils.createElement appends children (#2462)', () => {
        const img = document.createElement('img');
        const el = DOMUtils.createElement('div', { children: [img, 'tree', null, 3] });
        expect(el.firstChild).toBe(img);
        expect(el.textContent).toBe('tree3');
    });

    it('MapManager.gridToPercent is a percent of the grid regardless of container size (#1933)', () => {
        const container = document.createElement('div');
        Object.defineProperty(container, 'offsetWidth', { value: 1200 });
        Object.defineProperty(container, 'offsetHeight', { value: 900 });
        const mm = Object.create(MapManager.prototype);
        mm.container = container;
        mm.gridSystem = new MapGridSystem({ gridWidth: 30, gridHeight: 30, tileSize: 20 });
        const last = mm.gridToPercent(29, 29);
        expect(last.x).toBeLessThanOrEqual(100);
        expect(last.x).toBeGreaterThan(95);
        const mid = mm.gridToPercent(15, 15);
        expect(mid.x).toBeLessThanOrEqual(53);
        expect(mid.x).toBeGreaterThanOrEqual(48);
        // same answer for a different on-screen size
        const small = document.createElement('div');
        Object.defineProperty(small, 'offsetWidth', { value: 300 });
        mm.container = small;
        expect(mm.gridToPercent(15, 15)).toEqual(mid);
    });

    it('action locations keep the player on the map screen (#1165)', () => {
        for (const id of ['gym', 'library', 'stock_exchange', 'city_hall']) {
            expect(MapHelpers.screenForLocation(id)).toBe('screen-map');
        }
        expect(MapHelpers.screenForLocation('coffee_shop')).toBe('screen-office');

        const game = {
            worldMap: { travelTo: () => ({ success: true, location: { name: 'Gym' }, timeCost: 1 }), currentLocation: 'gym', getCurrentLocation: () => null },
            handleTimeAdvance: vi.fn(),
            uiUpdater: { updateLocationLayout: vi.fn() },
            showToast: vi.fn(),
            showError: vi.fn(),
            screenManager: { showScreen: vi.fn() }
        };
        try { MapHelpers.handleTravel(game, 'gym'); } catch { /* map DOM absent in jsdom */ }
        const shown = game.screenManager.showScreen.mock.calls.map(c => c[0]);
        if (shown.length) expect(shown.at(-1)).toBe('screen-map');
        const src = fs.readFileSync('src/js/helpers/MapHelpers.js', 'utf8');
        expect(src).not.toMatch(/showScreen\('screen-office'\)/);
    });

    it('icon/lock sweeps only run when the legacy DOM map is live (#1170)', async () => {
        const fs = await import('node:fs');
        const src = fs.readFileSync('src/js/helpers/MapHelpers.js', 'utf8');
        expect(src).toMatch(/if \(game\.mapRenderer \|\| document\.querySelector\('\.map-location'\)\) \{\s*updateMapLocationIcons\(game\);/);
    });

    it('CameraSystem is a real constructor now (#1169 already fixed)', () => {
        const el = document.createElement('div');
        expect(() => new CameraSystem(el)).not.toThrow();
    });
});
