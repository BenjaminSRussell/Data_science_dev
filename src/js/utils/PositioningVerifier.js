/**
 * PositioningVerifier.js
 * Verifies all positioning is correct and consistent
 * Ensures elements are positioned as documented
 */

import { PositioningHelper } from './PositioningHelper.js';

export class PositioningVerifier {
    constructor() {
        this.issues = [];
        this.warnings = [];
    }

    /**
     * Verify location positioning
     */
    async verifyLocations(locations) {
        const results = {
            total: locations.length,
            gridCoordinates: [],
            invalidCoordinates: [],
            conflicts: []
        };

        // Check each location
        locations.forEach(location => {
            const pos = location.position;
            if (!pos || pos.x === undefined || pos.y === undefined) {
                results.invalidCoordinates.push({
                    id: location.id,
                    reason: 'Missing or invalid position'
                });
                return;
            }

            // Detect coordinate system
            const system = PositioningHelper.detectCoordinateSystem(pos, 30);
            
            if (system === 'grid') {
                // Verify grid bounds
                if (pos.x < 0 || pos.x > 29 || pos.y < 0 || pos.y > 29) {
                    results.invalidCoordinates.push({
                        id: location.id,
                        position: pos,
                        reason: 'Grid coordinates out of bounds (0-29)'
                    });
                } else {
                    results.gridCoordinates.push({
                        id: location.id,
                        position: pos
                    });
                }
            } else {
                results.invalidCoordinates.push({
                    id: location.id,
                    position: pos,
                    reason: 'Invalid coordinate system - must be grid (0-30)'
                });
            }
        });

        // Check for conflicts (same grid cell)
        const gridPositions = new Map();
        results.gridCoordinates.forEach(loc => {
            const key = `${loc.position.x},${loc.position.y}`;
            if (gridPositions.has(key)) {
                results.conflicts.push({
                    location1: gridPositions.get(key),
                    location2: loc.id,
                    position: loc.position
                });
            } else {
                gridPositions.set(key, loc.id);
            }
        });

        return results;
    }

    /**
     * Verify element positioning
     */
    verifyElementPositioning(element, expectedSystem, expectedPosition) {
        const issues = [];

        // Check if element has position style
        const position = element.style.position;
        if (!position || position === 'static') {
            issues.push({
                element: element.id || element.className,
                issue: 'Element has no positioning (static)',
                severity: 'error'
            });
        }

        // Check if centered
        const transform = element.style.transform;
        if (position === 'absolute' && !transform?.includes('translate')) {
            issues.push({
                element: element.id || element.className,
                issue: 'Absolute positioned element not centered (missing transform)',
                severity: 'warning'
            });
        }

        // Check z-index
        const zIndex = element.style.zIndex;
        if (position === 'absolute' && !zIndex) {
            issues.push({
                element: element.id || element.className,
                issue: 'Absolute positioned element missing z-index',
                severity: 'warning'
            });
        }

        return issues;
    }

    /**
     * Verify image positioning
     */
    verifyImagePositioning(img, expectedPosition) {
        const issues = [];

        const objectFit = img.style.objectFit;
        const objectPosition = img.style.objectPosition;

        if (!objectFit) {
            issues.push({
                element: img.src,
                issue: 'Image missing object-fit',
                severity: 'warning'
            });
        }

        if (!objectPosition) {
            issues.push({
                element: img.src,
                issue: 'Image missing object-position',
                severity: 'warning'
            });
        } else if (expectedPosition && objectPosition !== expectedPosition) {
            issues.push({
                element: img.src,
                issue: `Image object-position is '${objectPosition}', expected '${expectedPosition}'`,
                severity: 'warning'
            });
        }

        return issues;
    }

    /**
     * Generate positioning report
     */
    async generateReport(game) {
        const report = {
            timestamp: new Date().toISOString(),
            locations: null,
            elements: [],
            images: [],
            summary: {}
        };

        // Verify locations
        if (game?.worldMap) {
            const locations = game.worldMap?.getAccessibleLocations() || [];
            report.locations = await this.verifyLocations(locations);
        }

        // Verify elements (sample check)
        const mapContainer = document.getElementById('world-map');
        if (mapContainer) {
            const elements = mapContainer.querySelectorAll('[style*="position"]');
            elements.forEach(el => {
                const issues = this.verifyElementPositioning(el);
                report.elements.push(...issues);
            });
        }

        // Verify images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            let expectedPosition = null;
            
            // Determine expected position based on class/parent
            if (img.closest('.character, .npc')) {
                expectedPosition = 'center bottom';
            } else if (img.closest('.map-building, .map-npc-house')) {
                expectedPosition = 'center bottom';
            } else {
                expectedPosition = 'center center';
            }

            const issues = this.verifyImagePositioning(img, expectedPosition);
            report.images.push(...issues);
        });

        // Generate summary
        report.summary = {
            locations: {
                total: report.locations?.total || 0,
                gridCoordinates: report.locations?.gridCoordinates.length || 0,
                percentageCoordinates: report.locations?.percentageCoordinates.length || 0,
                invalid: report.locations?.invalidCoordinates.length || 0,
                conflicts: report.locations?.conflicts.length || 0
            },
            elements: {
                total: report.elements.length,
                errors: report.elements.filter(i => i.severity === 'error').length,
                warnings: report.elements.filter(i => i.severity === 'warning').length
            },
            images: {
                total: report.images.length,
                errors: report.images.filter(i => i.severity === 'error').length,
                warnings: report.images.filter(i => i.severity === 'warning').length
            }
        };

        return report;
    }

    /**
     * Check if positioning is correct
     */
    isPositioningCorrect(report) {
        const summary = report.summary;
        
        // All locations should use grid coordinates
        if (summary.locations.invalid > 0) {
            return false; // Invalid coordinates
        }
        if (summary.locations.conflicts > 0) {
            return false; // Overlapping positions
        }

        // Check elements
        if (summary.elements.errors > 0) {
            return false; // Critical positioning errors
        }

        // Check images
        if (summary.images.errors > 0) {
            return false; // Critical image positioning errors
        }

        return true;
    }
}
