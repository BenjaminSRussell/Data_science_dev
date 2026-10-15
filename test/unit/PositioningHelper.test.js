import { describe, it, expect } from 'vitest';
import { PositioningHelper as P } from '../../src/js/utils/PositioningHelper.js';

describe('PositioningHelper.detectCoordinateSystem (#1939)', () => {
    it('detectCoordinateSystem', () => {
        expect(P.detectCoordinateSystem({ x: 15, y: 20 })).toBe('grid');
        expect(P.detectCoordinateSystem({ x: 15.5, y: 20 })).toBe('grid'); // sub-cell grid position (#1939)
        expect(P.detectCoordinateSystem({ x: 45, y: 20 })).toBe('pixel');
        expect(P.detectCoordinateSystem({ x: 30, y: 30 })).toBe('grid');
        expect(P.detectCoordinateSystem({ x: 31, y: 0 })).toBe('pixel');
    });
});
