import { describe, it, expect } from 'vitest';
import MapGridSystem from '../../src/MapGridSystem';

describe('MapGridSystem', () => {
    let gridSystem;

    beforeAll(() => {
        gridSystem = new MapGridSystem(10, 10, 20, 400, 400);
    });

    it('should correctly convert grid coordinates to pixel coordinates', () => {
        expect(gridSystem.gridToPixel(0, 0)).toEqual({ x: 10, y: 10 });
        expect(gridSystem.gridToPixel(5, 5)).toEqual({ x: 105, y: 105 });
        expect(gridSystem.gridToPixel(9, 9)).toEqual({ x: 190, y: 190 });
    });

    it('should correctly convert pixel coordinates to grid coordinates', () => {
        expect(gridSystem.pixelToGrid(10, 10)).toEqual({ gridX: 0, gridY: 0 });
        expect(gridSystem.pixelToGrid(105, 105)).toEqual({ gridX: 5, gridY: 5 });
        expect(gridSystem.pixelToGrid(190, 190)).toEqual({ gridX: 9, gridY: 9 });
    });

    it('should handle custom tile size in gridToPixel and pixelToGrid', () => {
        const customGridSystem = new MapGridSystem(10, 10, 30, 400, 400);
        expect(customGridSystem.gridToPixel(0, 0)).toEqual({ x: 15, y: 15 });
        expect(customGridSystem.pixelToGrid(15, 15)).toEqual({ gridX: 0, gridY: 0 });
        expect(customGridSystem.gridToPixel(5, 5)).toEqual({ x: 165, y: 165 });
        expect(customGridSystem.pixelToGrid(165, 165)).toEqual({ gridX: 5, gridY: 5 });
    });

    it('should correctly convert percent to grid coordinates', () => {
        expect(gridSystem.percentToGrid(0, 0)).toEqual({ gridX: 0, gridY: 0 });
        expect(gridSystem.percentToGrid(0.5, 0.5)).toEqual({ gridX: 4.5, gridY: 4.5 });
        expect(gridSystem.percentToGrid(1, 1)).toEqual({ gridX: 9, gridY: 9 });
    });

    it('should correctly convert grid coordinates to percent', () => {
        expect(gridSystem.gridToPercent(0, 0)).toEqual({ x: 0, y: 0 });
        expect(gridSystem.gridToPercent(5, 5)).toEqual({ x: 0.5, y: 0.5 });
        expect(gridSystem.gridToPercent(9, 9)).toEqual({ x: 1, y: 1 });
    });

    it('should validate grid coordinates at exact bounds', () => {
        expect(gridSystem.isValidGridCoord(0, 0)).toBe(true);
        expect(gridSystem.isValidGridCoord(9, 9)).toBe(true);
    });

    it('should invalidate grid coordinates one step out of bounds', () => {
        expect(gridSystem.isValidGridCoord(-1, 0)).toBe(false);
        expect(gridSystem.isValidGridCoord(0, -1)).toBe(false);
        expect(gridSystem.isValidGridCoord(10, 0)).toBe(false);
        expect(gridSystem.isValidGridCoord(0, 10)).toBe(false);
    });

    it('should clamp grid coordinates', () => {
        expect(gridSystem.clampGridCoord(-1, -1)).toEqual({ gridX: 0, gridY: 0 });
        expect(gridSystem.clampGridCoord(10, 10)).toEqual({ gridX: 9, gridY: 9 });
        expect(gridSystem.clampGridCoord(5, 5)).toEqual({ gridX: 5, gridY: 5 });
    });

    it('should correctly generate and parse grid keys', () => {
        const key = gridSystem.getGridKey(3, 4);
        expect(gridSystem.parseGridKey(key)).toEqual({ gridX: 3, gridY: 4 });
        const negativeKey = gridSystem.getGridKey(-1, -2);
        expect(gridSystem.parseGridKey(negativeKey)).toEqual({ gridX: -1, gridY: -2 });
    });

    it('should correctly get grid rectangle excluding out-of-bounds cells', () => {
        const rect = gridSystem.getGridRect(0, 0, 10, 10);
        expect(rect.length).toBe(100);
        const outOfBoundsRect = gridSystem.getGridRect(-5, -5, 10, 10);
        expect(outOfBoundsRect.length).toBe(64);
    });

    it('should correctly get grid circle boundary (radius=0 â†’ just center if valid)', () => {
        const circle = gridSystem.getGridCircle(0, 0, 0);
        expect(circle.length).toBe(1);
        expect(circle[0]).toEqual({ x: 0, y: 0 });
        const invalidCircle = gridSystem.getGridCircle(10, 10, 0);
        expect(invalidCircle.length).toBe(0);
    });

    it('should correctly calculate grid distance', () => {
        expect(gridSystem.gridDistance(0, 0, 0, 0)).toBe(0);
        expect(gridSystem.gridDistance(0, 0, 1, 1)).toBeCloseTo(Math.sqrt(2));
        expect(gridSystem.gridDistance(0, 0, 9, 9)).toBeCloseTo(Math.sqrt(162));
    });

    it('should return defensive copy of bounds from getConfig', () => {
        const config = gridSystem.getConfig();
        expect(config.bounds).toEqual({ minX: 0, minY: 0, maxX: 9, maxY: 9 });
        config.bounds.minX = -10;
        expect(gridSystem.getConfig().bounds.minX).toBe(0);
    });
});