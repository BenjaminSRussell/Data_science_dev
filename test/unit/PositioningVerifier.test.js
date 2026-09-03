/**
 * PositioningVerifier Unit Tests
 * Covers the synchronously-testable methods:
 *   - verifyLocations
 *   - verifyElementPositioning
 *   - verifyImagePositioning
 *
 * NOTE: generateReport / isPositioningCorrect are intentionally NOT tested.
 * generateReport pulls in game.worldMap and live DOM traversal, and has a
 * latent bug: its summary reads report.locations?.percentageCoordinates.length,
 * but verifyLocations never returns a percentageCoordinates field (only
 * total/gridCoordinates/invalidCoordinates/conflicts). The optional chaining
 * only guards report.locations itself being nullish, so when it is a real
 * object the unguarded .length on undefined throws. Flagged, not fixed.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PositioningVerifier } from '../../src/js/utils/PositioningVerifier.js';

describe('PositioningVerifier', () => {
    let verifier;

    beforeEach(() => {
        verifier = new PositioningVerifier();
    });

    describe('verifyLocations', () => {
        it('flags a location with a missing position as invalid', async () => {
            const results = await verifier.verifyLocations([
                { id: 'loc-missing', position: undefined },
                { id: 'loc-partial', position: { x: 5 } }
            ]);

            expect(results.invalidCoordinates).toHaveLength(2);
            results.invalidCoordinates.forEach(entry => {
                expect(entry.reason).toBe('Missing or invalid position');
            });
            expect(results.invalidCoordinates.map(e => e.id).sort())
                .toEqual(['loc-missing', 'loc-partial']);
        });

        it('classifies valid in-bounds grid coordinates and reports total', async () => {
            const locations = [
                { id: 'loc-a', position: { x: 0, y: 0 } },
                { id: 'loc-b', position: { x: 15, y: 20 } },
                { id: 'loc-c', position: { x: 29, y: 29 } }
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.total).toBe(locations.length);
            expect(results.gridCoordinates).toHaveLength(3);
            expect(results.gridCoordinates.map(e => e.id).sort())
                .toEqual(['loc-a', 'loc-b', 'loc-c']);
            expect(results.invalidCoordinates).toHaveLength(0);
            expect(results.conflicts).toHaveLength(0);
        });

        it('classifies pixel coordinates (exceeding gridSize) as invalid coordinate system', async () => {
            const results = await verifier.verifyLocations([
                { id: 'loc-pixel', position: { x: 35, y: 10 } }
            ]);

            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].id).toBe('loc-pixel');
            expect(results.invalidCoordinates[0].reason)
                .toBe('Invalid coordinate system - must be grid (0-30)');
            expect(results.gridCoordinates).toHaveLength(0);
        });

        it('flags grid-classified coordinates exceeding the 0-29 usable range as out of bounds', async () => {
            const results = await verifier.verifyLocations([
                { id: 'loc-oob', position: { x: 30, y: 5 } }
            ]);

            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].id).toBe('loc-oob');
            expect(results.invalidCoordinates[0].reason)
                .toBe('Grid coordinates out of bounds (0-29)');
            expect(results.gridCoordinates).toHaveLength(0);
        });

        it('records a conflict when two locations share the same grid cell', async () => {
            const results = await verifier.verifyLocations([
                { id: 'loc-first', position: { x: 7, y: 8 } },
                { id: 'loc-second', position: { x: 7, y: 8 } }
            ]);

            expect(results.gridCoordinates).toHaveLength(2);
            expect(results.conflicts).toHaveLength(1);
            expect(results.conflicts[0].location1).toBe('loc-first');
            expect(results.conflicts[0].location2).toBe('loc-second');
            expect(results.conflicts[0].position).toEqual({ x: 7, y: 8 });
        });
    });

    describe('verifyElementPositioning', () => {
        it('reports an error for a bare (static) div', () => {
            const el = document.createElement('div');
            el.id = 'bare-div';

            const issues = verifier.verifyElementPositioning(el, 'grid', { x: 1, y: 1 });

            expect(issues).toHaveLength(1);
            expect(issues[0]).toEqual({
                element: 'bare-div',
                issue: 'Element has no positioning (static)',
                severity: 'error'
            });
        });

        it('warns about missing centering transform for absolute positioning', () => {
            const el = document.createElement('div');
            el.id = 'abs-div';
            el.style.position = 'absolute';

            const issues = verifier.verifyElementPositioning(el, 'grid', { x: 1, y: 1 });

            expect(issues).toHaveLength(1);
            expect(issues[0].issue)
                .toBe('Absolute positioned element not centered (missing transform)');
            expect(issues[0].severity).toBe('warning');
        });

        it('reports no issues for absolute positioning with transform and z-index', () => {
            const el = document.createElement('div');
            el.id = 'good-div';
            el.style.position = 'absolute';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.zIndex = '100';

            const issues = verifier.verifyElementPositioning(el, 'grid', { x: 1, y: 1 });

            expect(issues).toHaveLength(0);
        });
    });

    describe('verifyImagePositioning', () => {
        it('flags a bare img for missing object-fit and object-position', () => {
            const img = document.createElement('img');
            img.src = 'assets/test.png';

            const issues = verifier.verifyImagePositioning(img, 'center bottom');

            expect(issues).toHaveLength(2);
            expect(issues.map(i => i.issue).sort()).toEqual([
                'Image missing object-fit',
                'Image missing object-position'
            ]);
            issues.forEach(i => {
                expect(i.element).toBe('assets/test.png');
                expect(i.severity).toBe('warning');
            });
        });

        it('warns about a mismatched object-position, naming both values', () => {
            const img = document.createElement('img');
            img.src = 'assets/mismatch.png';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center center';

            const issues = verifier.verifyImagePositioning(img, 'center bottom');

            expect(issues).toHaveLength(1);
            expect(issues[0].issue)
                .toBe("Image object-position is 'center center', expected 'center bottom'");
            expect(issues[0].severity).toBe('warning');
        });
    });
});
