/**
 * renderLocalZones draws the canonical mapZones.js layout (#1907)
 */
import { describe, it, expect, vi } from 'vitest';

const rects = [];
vi.mock('pixi.js', () => {
    class Graphics {
        beginFill(color) { this.color = color; return this; }
        lineStyle() { return this; }
        drawRect(x, y, w, h) { rects.push({ x, y, w, h, color: this.color }); return this; }
    }
    return { Graphics, Application: class {}, Container: class { addChild() {} } };
});

const { UnifiedMapSystem } = await import('../../src/js/game/UnifiedMapSystem.js');
const { getAllZones } = await import('../../src/js/data/mapZones.js');

describe('UnifiedMapSystem.renderLocalZones', () => {
    it('draws one rect per canonical zone at that zone\'s bounds', () => {
        const added = [];
        const ctx = {
            game: { worldMap: {} },
            app: { screen: { width: 300, height: 300 } },
            gridSize: 30,
            layers: { zones: { addChild: g => added.push(g) } }
        };
        rects.length = 0;
        UnifiedMapSystem.prototype.renderLocalZones.call(ctx);
        const zones = getAllZones();
        expect(added).toHaveLength(zones.length);
        zones.forEach((zone, i) => {
            const b = zone.bounds;
            const r = rects[i];
            expect(r.x).toBeCloseTo(b.minX * 10, 6);
            expect(r.y).toBeCloseTo(b.minY * 10, 6);
            expect(r.w).toBeCloseTo((b.maxX - b.minX + 1) * 10, 6);
            expect(r.h).toBeCloseTo((b.maxY - b.minY + 1) * 10, 6);
            expect(r.color).toBe(UnifiedMapSystem.ZONE_TINTS[zone.type]);
        });
    });
});
