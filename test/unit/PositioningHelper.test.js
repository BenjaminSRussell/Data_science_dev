/**
 * Unit tests for PositioningHelper
 */

import { describe, it, expect } from 'vitest';
import { PositioningHelper } from '../../src/js/utils/PositioningHelper.js';

describe('PositioningHelper', () => {
    describe('gridToPercent / percentToGrid', () => {
        it('should convert grid (0,0) to percent (0,0)', () => {
            expect(PositioningHelper.gridToPercent(0, 0)).toEqual({ x: 0, y: 0 });
        });

        it('should convert grid (15,15) to percent (50,50)', () => {
            expect(PositioningHelper.gridToPercent(15, 15)).toEqual({ x: 50, y: 50 });
        });

        it('should convert grid (29,29) to percent (~96.67,~96.67)', () => {
            const result = PositioningHelper.gridToPercent(29, 29);
            expect(result.x).toBeCloseTo((29 / 30) * 100);
            expect(result.y).toBeCloseTo((29 / 30) * 100);
        });

        it('should respect a custom gridSize', () => {
            expect(PositioningHelper.gridToPercent(10, 20, 100)).toEqual({ x: 10, y: 20 });
        });

        it('should convert percent (0,0) back to grid (0,0)', () => {
            expect(PositioningHelper.percentToGrid(0, 0)).toEqual({ x: 0, y: 0 });
        });

        it('should convert percent (50,50) back to grid (15,15)', () => {
            expect(PositioningHelper.percentToGrid(50, 50)).toEqual({ x: 15, y: 15 });
        });

        it('should convert percent for grid (29,29) back to grid (29,29)', () => {
            const percent = PositioningHelper.gridToPercent(29, 29);
            expect(PositioningHelper.percentToGrid(percent.x, percent.y)).toEqual({ x: 29, y: 29 });
        });

        it('should round percentToGrid results to the nearest integer', () => {
            // 49.5% of 30 = 14.85 -> 15
            expect(PositioningHelper.percentToGrid(49.5, 49.5)).toEqual({ x: 15, y: 15 });
            // 1% of 30 = 0.3 -> 0
            expect(PositioningHelper.percentToGrid(1, 1)).toEqual({ x: 0, y: 0 });
        });

        it('should be approximate inverses for a few cells', () => {
            for (const [gx, gy] of [[0, 0], [15, 15], [29, 29]]) {
                const percent = PositioningHelper.gridToPercent(gx, gy);
                const back = PositioningHelper.percentToGrid(percent.x, percent.y);
                expect(back).toEqual({ x: gx, y: gy });
            }
        });
    });

    describe('detectCoordinateSystem', () => {
        it('should return "grid" for integer coordinates within gridSize', () => {
            expect(PositioningHelper.detectCoordinateSystem({ x: 15, y: 20 })).toBe('grid');
        });

        it('should return "pixel" for non-integer coordinates even if within gridSize', () => {
            expect(PositioningHelper.detectCoordinateSystem({ x: 15.5, y: 20 })).toBe('pixel');
        });

        it('should return "pixel" when a coordinate exceeds gridSize', () => {
            expect(PositioningHelper.detectCoordinateSystem({ x: 45, y: 20 })).toBe('pixel');
        });

        it('should return "grid" at the boundary (x === gridSize, y === gridSize)', () => {
            expect(PositioningHelper.detectCoordinateSystem({ x: 30, y: 30 })).toBe('grid');
        });
    });

    describe('normalizeToPercent', () => {
        it('should delegate to gridToPercent', () => {
            const position = { x: 15, y: 20 };
            expect(PositioningHelper.normalizeToPercent(position)).toEqual(
                PositioningHelper.gridToPercent(15, 20)
            );
            expect(PositioningHelper.normalizeToPercent(position, 30)).toEqual({ x: 50, y: (20 / 30) * 100 });
        });
    });

    describe('setZIndex', () => {
        it('should map known layers to their documented base values', () => {
            const cases = [
                ['background', 0],
                ['map', 50],
                ['game', 100],
                ['ui', 200],
                ['modal', 300],
                ['tooltip', 400],
                ['debug', 500],
                ['cursor', 1000]
            ];
            for (const [layer, base] of cases) {
                const el = document.createElement('div');
                PositioningHelper.setZIndex(el, layer);
                expect(el.style.zIndex).toBe(String(base));
            }
        });

        it('should fall back to base 0 for unrecognized layers', () => {
            const el = document.createElement('div');
            PositioningHelper.setZIndex(el, 'not-a-layer');
            expect(el.style.zIndex).toBe('0');
        });

        it('should add a non-zero offset to the base value', () => {
            const el = document.createElement('div');
            PositioningHelper.setZIndex(el, 'ui', 10);
            expect(el.style.zIndex).toBe('210');
        });
    });
});
