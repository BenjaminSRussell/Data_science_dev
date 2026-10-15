/**
 * PositioningHelper.js
 * Coordinate-system detection for PositioningVerifier.
 * Live map placement uses MapGridSystem, not this helper (#1937).
 */

import { WORLD_GRID_SIZE } from '../config/mapGrid.js';

export class PositioningHelper {
    /**
     * Detect coordinate system from a position object.
     * Magnitude alone can't tell a 0-30 percent value from a grid value, so
     * anything inside the grid range (fractional sub-cell positions included)
     * is treated as grid.
     * @param {Object} position - Position object {x, y}
     * @param {number} gridSize - Grid size (default: WORLD_GRID_SIZE)
     * @returns {string} 'grid' | 'pixel'
     */
    static detectCoordinateSystem(position, gridSize = WORLD_GRID_SIZE) {
        const { x, y } = position || {};
        if (Number.isFinite(x) && Number.isFinite(y) && x <= gridSize && y <= gridSize) {
            return 'grid';
        }
        return 'pixel';
    }
}
