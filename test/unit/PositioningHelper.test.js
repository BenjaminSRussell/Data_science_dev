import { describe, it, expect } from 'vitest';
import { PositioningHelper as P } from '../../src/js/utils/PositioningHelper.js';

describe('PositioningHelper coordinate math (#483)', () => {
    it('gridToPercent and percentToGrid are inverses for whole cells', () => {
        for (const [x, y] of [[0, 0], [15, 15], [29, 29]]) {
            const pct = P.gridToPercent(x, y);
            expect(pct.x).toBeCloseTo((x / 30) * 100);
            expect(P.percentToGrid(pct.x, pct.y)).toEqual({ x, y });
        }
    });

    it('percentToGrid rounds to the nearest cell', () => {
        expect(P.percentToGrid(51, 49)).toEqual({ x: 15, y: 15 });
        expect(P.gridToPercent(5, 5, 10)).toEqual({ x: 50, y: 50 });
    });

    it('detectCoordinateSystem', () => {
        expect(P.detectCoordinateSystem({ x: 15, y: 20 })).toBe('grid');
        expect(P.detectCoordinateSystem({ x: 15.5, y: 20 })).toBe('grid'); // sub-cell grid position (#1939)
        expect(P.detectCoordinateSystem({ x: 45, y: 20 })).toBe('pixel');
        expect(P.detectCoordinateSystem({ x: 30, y: 30 })).toBe('grid');
        expect(P.detectCoordinateSystem({ x: 31, y: 0 })).toBe('pixel');
    });

    it('normalizeToPercent delegates to gridToPercent', () => {
        expect(P.normalizeToPercent({ x: 3, y: 6 }, 12)).toEqual(P.gridToPercent(3, 6, 12));
    });

    it('setZIndex maps layers, falls back to 0, and adds the offset', () => {
        const el = document.createElement('div');
        const expected = { background: 0, map: 50, game: 100, ui: 200, modal: 300, tooltip: 400, debug: 500, cursor: 1000 };
        for (const [layer, z] of Object.entries(expected)) {
            P.setZIndex(el, layer);
            expect(el.style.zIndex).toBe(String(z));
        }
        P.setZIndex(el, 'mystery');
        expect(el.style.zIndex).toBe('0');
        P.setZIndex(el, 'ui', 5);
        expect(el.style.zIndex).toBe('205');
    });
});

describe('PositioningHelper DOM methods (#484)', () => {
    it('positionAtGrid uses percentages and centers', () => {
        const el = document.createElement('div');
        P.positionAtGrid(el, 15, 6, 30);
        expect(el.style.position).toBe('absolute');
        expect(el.style.left).toBe('50%');
        expect(el.style.top).toBe('20%');
        expect(el.style.transform).toBe('translate(-50%, -50%)');
    });

    it('positionAtPercent sets values directly and centers', () => {
        const el = document.createElement('div');
        P.positionAtPercent(el, 12, 34);
        expect(el.style.left).toBe('12%');
        expect(el.style.top).toBe('34%');
        expect(el.style.transform).toBe('translate(-50%, -50%)');
    });

    it('positionAtPixels uses px and no transform', () => {
        const el = document.createElement('div');
        P.positionAtPixels(el, 10, 20);
        expect(el.style.left).toBe('10px');
        expect(el.style.top).toBe('20px');
        expect(el.style.transform).toBe('');
    });

    it('centerElement / centerHorizontal / centerVertical', () => {
        const a = document.createElement('div');
        P.centerElement(a);
        expect([a.style.top, a.style.left, a.style.transform]).toEqual(['50%', '50%', 'translate(-50%, -50%)']);
        const h = document.createElement('div');
        P.centerHorizontal(h);
        expect(h.style.left).toBe('50%');
        expect(h.style.top).toBe('');
        expect(h.style.transform).toBe('translateX(-50%)');
        const v = document.createElement('div');
        P.centerVertical(v);
        expect(v.style.top).toBe('50%');
        expect(v.style.left).toBe('');
        expect(v.style.transform).toBe('translateY(-50%)');
    });

    it('image position helpers', () => {
        const c = document.createElement('img');
        P.setCharacterImagePosition(c);
        expect([c.style.objectFit, c.style.objectPosition]).toEqual(['contain', 'center bottom']);
        const b = document.createElement('img');
        P.setBuildingImagePosition(b);
        expect(b.style.objectPosition).toBe('center bottom');
        const i = document.createElement('img');
        P.setIconImagePosition(i);
        expect([i.style.objectFit, i.style.objectPosition]).toEqual(['contain', 'center center']);
    });

    it('createPositionedElement builds a grid-placed, sized, layered image', () => {
        const el = P.createPositionedElement({
            tag: 'img', className: 'npc-1', position: { x: 5, y: 5 }, coordinateSystem: 'grid',
            size: { width: 64, height: 'auto' }, layer: 'ui', imagePosition: 'character'
        });
        expect(el.tagName).toBe('IMG');
        expect(el.className).toBe('npc-1');
        expect(parseFloat(el.style.left)).toBeCloseTo(16.6667, 3);
        expect(el.style.transform).toBe('translate(-50%, -50%)');
        expect(el.style.width).toBe('64px');
        expect(el.style.height).toBe('');
        expect(el.style.zIndex).toBe('200');
        expect(el.style.objectPosition).toBe('center bottom');
    });

    it('createPositionedElement honours explicit zIndex, pixel coords and center:false', () => {
        const el = P.createPositionedElement({
            position: { x: 10, y: 20 }, coordinateSystem: 'percentage', zIndex: 7, layer: 'ui', center: false
        });
        expect(el.style.left).toBe('10%');
        expect(el.style.zIndex).toBe('7');
        expect(el.style.transform).toBe('');
        const px = P.createPositionedElement({ position: { x: 3, y: 4 }, coordinateSystem: 'pixel', size: { width: '50%', height: 10 } });
        expect(px.style.left).toBe('3px');
        expect(px.style.width).toBe('50%');
        expect(px.style.height).toBe('10px');
    });
});
