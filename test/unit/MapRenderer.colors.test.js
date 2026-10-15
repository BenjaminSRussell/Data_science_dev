/**
 * MapRenderer building colours stay aligned with WorldMap location types (#1451).
 * training, shopping, and investment must not fall through to the business grey.
 */
import { describe, it, expect } from 'vitest';
import { MapRenderer } from '../../src/js/game/MapRenderer.js';

function renderTypes(types) {
    const container = document.createElement('div');
    const renderer = Object.create(MapRenderer.prototype);
    renderer.container = container;
    const grid = {
        totalWidth: 300,
        totalHeight: 300,
        gridToPixel: (x, y) => ({ x: x * 10, y: y * 10 })
    };
    renderer.mapManager = {
        getBuildingSystem: () => ({
            getAllBuildings: () => types.map((type, i) => ({
                id: `b-${type}`,
                type,
                position: { x: i + 1, y: 1 },
                size: { width: 2, height: 2 }
            }))
        }),
        getGridSystem: () => grid
    };
    renderer.renderBuildings();
    return container;
}

function painted(container, type) {
    const el = container.querySelector(`.map-building-block.${type}`);
    return `${el.style.background} ${el.style.backgroundImage} ${el.style.cssText}`.toLowerCase().replace(/\s+/g, '');
}

/** jsdom may keep the authored hex or rewrite it to rgb(). */
function hasHex(style, hex) {
    const h = hex.toLowerCase();
    if (style.includes(h)) return true;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return style.includes(`rgb(${r},${g},${b})`);
}

describe('MapRenderer building colours (#1451)', () => {
    it('paints training, shopping, and investment differently from business', () => {
        const container = renderTypes(['training', 'shopping', 'investment', 'business', 'shop']);
        const training = painted(container, 'training');
        const shopping = painted(container, 'shopping');
        const investment = painted(container, 'investment');
        const business = painted(container, 'business');
        const shop = painted(container, 'shop');

        expect(hasHex(training, '#ef4444')).toBe(true);
        expect(hasHex(shopping, '#fb923c')).toBe(true);
        expect(hasHex(investment, '#0ea5e9')).toBe(true);
        expect(hasHex(business, '#64748b')).toBe(true);
        expect(hasHex(shop, '#f59e0b')).toBe(true);
        expect(hasHex(training, '#64748b')).toBe(false);
        expect(hasHex(shopping, '#64748b')).toBe(false);
        expect(hasHex(investment, '#64748b')).toBe(false);
        expect(hasHex(shopping, '#f59e0b')).toBe(false);
    });
});
