/**
 * Unit tests for PositioningVerifier
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PositioningVerifier } from '../../src/js/utils/PositioningVerifier.js';

describe('PositioningVerifier', () => {
    let verifier;

    beforeEach(() => {
        verifier = new PositioningVerifier();
    });

    describe('verifyLocations', () => {
        it('should report missing position in invalidCoordinates', async () => {
            const locations = [
                { id: 'loc1', position: { x: 10, y: 15 } },
                { id: 'loc2' } // missing position
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.total).toBe(2);
            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].id).toBe('loc2');
            expect(results.invalidCoordinates[0].reason).toBe('Missing or invalid position');
        });

        it('should report undefined position coordinates in invalidCoordinates', async () => {
            const locations = [
                { id: 'loc1', position: { x: 10 } } // missing y
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].reason).toBe('Missing or invalid position');
        });

        it('should classify valid in-bounds grid coordinates', async () => {
            const locations = [
                { id: 'loc1', position: { x: 5, y: 10 } },
                { id: 'loc2', position: { x: 0, y: 0 } },
                { id: 'loc3', position: { x: 29, y: 29 } }
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.total).toBe(3);
            expect(results.gridCoordinates).toHaveLength(3);
            expect(results.gridCoordinates[0].id).toBe('loc1');
            expect(results.gridCoordinates[1].id).toBe('loc2');
            expect(results.gridCoordinates[2].id).toBe('loc3');
            expect(results.invalidCoordinates).toHaveLength(0);
        });

        it('should classify pixel coordinates (exceed gridSize) as invalid', async () => {
            const locations = [
                { id: 'loc1', position: { x: 35, y: 10 } } // exceeds gridSize of 30
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].id).toBe('loc1');
            expect(results.invalidCoordinates[0].reason).toBe('Invalid coordinate system - must be grid (0-30)');
        });

        it('should report grid coordinates exceeding usable range (0-29)', async () => {
            const locations = [
                { id: 'loc1', position: { x: 30, y: 5 } } // x is exactly 30, exceeds usable range
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].id).toBe('loc1');
            expect(results.invalidCoordinates[0].reason).toBe('Grid coordinates out of bounds (0-29)');
        });

        it('should report grid coordinates with negative values as out of bounds', async () => {
            const locations = [
                { id: 'loc1', position: { x: -1, y: 10 } }
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.invalidCoordinates).toHaveLength(1);
            expect(results.invalidCoordinates[0].reason).toBe('Grid coordinates out of bounds (0-29)');
        });

        it('should detect conflicts when two locations share same coordinates', async () => {
            const locations = [
                { id: 'loc1', position: { x: 15, y: 20 } },
                { id: 'loc2', position: { x: 15, y: 20 } },
                { id: 'loc3', position: { x: 10, y: 10 } }
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.gridCoordinates).toHaveLength(3);
            expect(results.conflicts).toHaveLength(1);
            expect(results.conflicts[0].location1).toBe('loc1');
            expect(results.conflicts[0].location2).toBe('loc2');
            expect(results.conflicts[0].position).toEqual({ x: 15, y: 20 });
        });

        it('should detect multiple conflicts in same location', async () => {
            const locations = [
                { id: 'loc1', position: { x: 10, y: 10 } },
                { id: 'loc2', position: { x: 10, y: 10 } },
                { id: 'loc3', position: { x: 10, y: 10 } }
            ];

            const results = await verifier.verifyLocations(locations);

            expect(results.conflicts).toHaveLength(2);
            expect(results.conflicts[0].location1).toBe('loc1');
            expect(results.conflicts[0].location2).toBe('loc2');
            expect(results.conflicts[1].location1).toBe('loc1');
            expect(results.conflicts[1].location2).toBe('loc3');
        });
    });

    describe('verifyElementPositioning', () => {
        it('should report error for element with static positioning', () => {
            const element = document.createElement('div');
            element.id = 'test-div';
            element.style.position = 'static';

            const issues = verifier.verifyElementPositioning(element);

            expect(issues).toHaveLength(1);
            expect(issues[0].severity).toBe('error');
            expect(issues[0].issue).toBe('Element has no positioning (static)');
        });

        it('should report error for element with no positioning style', () => {
            const element = document.createElement('div');
            element.id = 'test-div';
            // no position style set

            const issues = verifier.verifyElementPositioning(element);

            expect(issues).toHaveLength(1);
            expect(issues[0].severity).toBe('error');
            expect(issues[0].issue).toBe('Element has no positioning (static)');
        });

        it('should report warning for absolute positioned element without transform', () => {
            const element = document.createElement('div');
            element.id = 'test-div';
            element.style.position = 'absolute';
            element.style.left = '10%';
            element.style.top = '10%';
            element.style.zIndex = '100'; // add zIndex to isolate transform warning
            // no transform

            const issues = verifier.verifyElementPositioning(element);

            expect(issues).toHaveLength(1);
            expect(issues[0].severity).toBe('warning');
            expect(issues[0].issue).toContain('not centered (missing transform)');
        });

        it('should not report issue when element has absolute position with transform', () => {
            const element = document.createElement('div');
            element.id = 'test-div';
            element.style.position = 'absolute';
            element.style.left = '50%';
            element.style.top = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.zIndex = '100';

            const issues = verifier.verifyElementPositioning(element);

            expect(issues).toHaveLength(0);
        });

        it('should report warning for absolute positioned element with transform but no z-index', () => {
            const element = document.createElement('div');
            element.id = 'test-div';
            element.style.position = 'absolute';
            element.style.transform = 'translate(-50%, -50%)';
            // no z-index

            const issues = verifier.verifyElementPositioning(element);

            expect(issues).toHaveLength(1);
            expect(issues[0].severity).toBe('warning');
            expect(issues[0].issue).toContain('missing z-index');
        });

        it('should use className when element has no id', () => {
            const element = document.createElement('div');
            element.className = 'test-class';
            element.style.position = 'static';

            const issues = verifier.verifyElementPositioning(element);

            expect(issues[0].element).toBe('test-class');
        });
    });

    describe('verifyImagePositioning', () => {
        it('should flag missing object-fit and object-position on bare image', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            // no object-fit or object-position

            const issues = verifier.verifyImagePositioning(img);

            expect(issues).toHaveLength(2);
            const issues_text = issues.map(i => i.issue);
            expect(issues_text).toContain('Image missing object-fit');
            expect(issues_text).toContain('Image missing object-position');
        });

        it('should flag only missing object-fit', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            img.style.objectPosition = 'center bottom';
            // no object-fit

            const issues = verifier.verifyImagePositioning(img);

            expect(issues).toHaveLength(1);
            expect(issues[0].issue).toBe('Image missing object-fit');
        });

        it('should flag only missing object-position', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            img.style.objectFit = 'contain';
            // no object-position

            const issues = verifier.verifyImagePositioning(img);

            expect(issues).toHaveLength(1);
            expect(issues[0].issue).toBe('Image missing object-position');
        });

        it('should not flag issues when both object-fit and object-position are set correctly', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center bottom';

            const issues = verifier.verifyImagePositioning(img);

            expect(issues).toHaveLength(0);
        });

        it('should flag mismatch when objectPosition differs from expected', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center center';

            const issues = verifier.verifyImagePositioning(img, 'center bottom');

            expect(issues).toHaveLength(1);
            expect(issues[0].severity).toBe('warning');
            expect(issues[0].issue).toContain("Image object-position is 'center center', expected 'center bottom'");
        });

        it('should not flag mismatch when objectPosition matches expected', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center bottom';

            const issues = verifier.verifyImagePositioning(img, 'center bottom');

            expect(issues).toHaveLength(0);
        });

        it('should not check expectedPosition if not provided', () => {
            const img = document.createElement('img');
            img.src = 'test.png';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center center';

            const issues = verifier.verifyImagePositioning(img);

            expect(issues).toHaveLength(0);
        });
    });
});
