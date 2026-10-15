import { describe, it, expect, afterEach } from 'vitest';
import { PositioningHelper as P } from '../../src/js/utils/PositioningHelper.js';
import { PositioningVerifier } from '../../src/js/utils/PositioningVerifier.js';

describe('PositioningVerifier.generateReport (#1938, #66)', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('does not throw when a world map exists and summarises locations', async () => {
        const game = {
            worldMap: {
                getAccessibleLocations: () => [
                    { id: 'a', position: { x: 3, y: 4 } },
                    { id: 'b', position: { x: 3.4, y: 4.2 } }, // same cell as a
                    { id: 'c', position: { x: 40, y: 4 } },
                ],
            },
        };
        const verifier = new PositioningVerifier();
        const report = await verifier.generateReport(game);
        expect(report.summary.locations).toEqual({
            total: 3, gridCoordinates: 2, invalid: 1, conflicts: 1,
        });
        expect(report.summary.locations).not.toHaveProperty('percentageCoordinates');
        expect(verifier.isPositioningCorrect(report)).toBe(false);
    });

    it('a clean map is reported correct', async () => {
        const game = { worldMap: { getAccessibleLocations: () => [{ id: 'a', position: { x: 1, y: 2 } }] } };
        const verifier = new PositioningVerifier();
        const report = await verifier.generateReport(game);
        expect(verifier.isPositioningCorrect(report)).toBe(true);
    });
});

describe('Coordinate detection (#1939)', () => {
    it('accepts fractional sub-cell grid positions', async () => {
        expect(P.detectCoordinateSystem({ x: 15.5, y: 20 })).toBe('grid');
        const results = await new PositioningVerifier().verifyLocations([
            { id: 'half', position: { x: 15.5, y: 29.5 } },
        ]);
        expect(results.gridCoordinates).toHaveLength(1);
        expect(results.invalidCoordinates).toHaveLength(0);
    });

    it('still rejects out-of-range or non-numeric positions', async () => {
        expect(P.detectCoordinateSystem({ x: 31, y: 0 })).toBe('pixel');
        expect(P.detectCoordinateSystem({ x: '3', y: 0 })).toBe('pixel');
        const results = await new PositioningVerifier().verifyLocations([
            { id: 'edge', position: { x: 30, y: 0 } },
        ]);
        expect(results.invalidCoordinates[0].reason).toMatch(/out of bounds/);
    });
});

