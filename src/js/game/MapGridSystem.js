/**
 * MapGridSystem.js
 * Tile-based grid coordinate system for blocky city map
 * Converts between grid coordinates (tiles) and pixel coordinates
 */

export class MapGridSystem {
    constructor(config = {}) {
        // Grid configuration
        this.gridWidth = config.gridWidth || 30;  // 30 tiles wide
        this.gridHeight = config.gridHeight || 30; // 30 tiles tall
        this.tileSize = config.tileSize || 20;     // 20px per tile
        
        // Calculate total dimensions
        this.totalWidth = this.gridWidth * this.tileSize;
        this.totalHeight = this.gridHeight * this.tileSize;
        
        // Grid bounds (in grid coordinates)
        this.bounds = {
            minX: 0,
            maxX: this.gridWidth - 1,
            minY: 0,
            maxY: this.gridHeight - 1
        };
    }

    /**
     * Convert grid coordinates to pixel coordinates (center of tile)
     * @param {number} gridX - Grid X coordinate (0 to gridWidth-1)
     * @param {number} gridY - Grid Y coordinate (0 to gridHeight-1)
     * @returns {Object} Pixel coordinates {x, y}
     */
    gridToPixel(gridX, gridY) {
        const x = (gridX + 0.5) * this.tileSize;
        const y = (gridY + 0.5) * this.tileSize;
        return { x, y };
    }

    /**
     * Convert pixel coordinates to grid coordinates
     * @param {number} pixelX - Pixel X coordinate
     * @param {number} pixelY - Pixel Y coordinate
     * @returns {Object} Grid coordinates {x, y}
     */
    pixelToGrid(pixelX, pixelY) {
        const gridX = Math.floor(pixelX / this.tileSize);
        const gridY = Math.floor(pixelY / this.tileSize);
        return { x: gridX, y: gridY };
    }

    /**
     * Convert percentage coordinates to grid coordinates
     * @param {number} percentX - Percentage X (0-100)
     * @param {number} percentY - Percentage Y (0-100)
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @returns {Object} Grid coordinates {x, y}
     */
    percentToGrid(percentX, percentY, containerWidth, containerHeight) {
        const pixelX = (percentX / 100) * containerWidth;
        const pixelY = (percentY / 100) * containerHeight;
        return this.pixelToGrid(pixelX, pixelY);
    }

    /**
     * Convert grid coordinates to percentage coordinates
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @returns {Object} Percentage coordinates {x, y}
     */
    gridToPercent(gridX, gridY, containerWidth, containerHeight) {
        const pixel = this.gridToPixel(gridX, gridY);
        const percentX = (pixel.x / containerWidth) * 100;
        const percentY = (pixel.y / containerHeight) * 100;
        return { x: percentX, y: percentY };
    }

    /**
     * Validate grid coordinates are within bounds
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {boolean} True if valid
     */
    isValidGridCoord(gridX, gridY) {
        return gridX >= this.bounds.minX && 
               gridX <= this.bounds.maxX &&
               gridY >= this.bounds.minY && 
               gridY <= this.bounds.maxY;
    }

    /**
     * Clamp grid coordinates to bounds
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {Object} Clamped coordinates {x, y}
     */
    clampGridCoord(gridX, gridY) {
        return {
            x: Math.max(this.bounds.minX, Math.min(this.bounds.maxX, gridX)),
            y: Math.max(this.bounds.minY, Math.min(this.bounds.maxY, gridY))
        };
    }

    /**
     * Get grid key for coordinate (for spatial indexing)
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {string} Grid key "x,y"
     */
    getGridKey(gridX, gridY) {
        return `${gridX},${gridY}`;
    }

    /**
     * Parse grid key back to coordinates
     * @param {string} key - Grid key "x,y"
     * @returns {Object} Grid coordinates {x, y}
     */
    parseGridKey(key) {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    }

    /**
     * Get all grid coordinates in a rectangle
     * @param {number} startX - Start X
     * @param {number} startY - Start Y
     * @param {number} width - Width in tiles
     * @param {number} height - Height in tiles
     * @returns {Array} Array of {x, y} coordinates
     */
    getGridRect(startX, startY, width, height) {
        const coords = [];
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                if (this.isValidGridCoord(x, y)) {
                    coords.push({ x, y });
                }
            }
        }
        return coords;
    }

    /**
     * Get grid coordinates in a circle/radius
     * @param {number} centerX - Center X
     * @param {number} centerY - Center Y
     * @param {number} radius - Radius in tiles
     * @returns {Array} Array of {x, y} coordinates
     */
    getGridCircle(centerX, centerY, radius) {
        const coords = [];
        const radiusSquared = radius * radius;
        
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (this.isValidGridCoord(x, y)) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    if (dx * dx + dy * dy <= radiusSquared) {
                        coords.push({ x, y });
                    }
                }
            }
        }
        return coords;
    }

    /**
     * Calculate distance between two grid coordinates
     * @param {number} x1 - First X
     * @param {number} y1 - First Y
     * @param {number} x2 - Second X
     * @param {number} y2 - Second Y
     * @returns {number} Distance in tiles
     */
    gridDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get configuration
     * @returns {Object} Grid configuration
     */
    getConfig() {
        return {
            gridWidth: this.gridWidth,
            gridHeight: this.gridHeight,
            tileSize: this.tileSize,
            totalWidth: this.totalWidth,
            totalHeight: this.totalHeight,
            bounds: { ...this.bounds }
        };
    }
}
