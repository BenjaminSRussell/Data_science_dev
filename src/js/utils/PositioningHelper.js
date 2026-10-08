/**
 * PositioningHelper.js
 * Utility functions for consistent positioning throughout the game
 * Ensures all elements are positioned correctly
 */

import { WORLD_GRID_SIZE } from '../config/mapGrid.js';

export class PositioningHelper {
    /**
     * Convert grid coordinates to percentage
     * @param {number} gridX - Grid X coordinate (0-30)
     * @param {number} gridY - Grid Y coordinate (0-30)
     * @param {number} gridSize - Grid size (default: 30)
     * @returns {Object} {x: percentage, y: percentage}
     */
    static gridToPercent(gridX, gridY, gridSize = WORLD_GRID_SIZE) {
        return {
            x: (gridX / gridSize) * 100,
            y: (gridY / gridSize) * 100
        };
    }

    /**
     * Convert percentage to grid coordinates
     * @param {number} percentX - Percentage X (0-100)
     * @param {number} percentY - Percentage Y (0-100)
     * @param {number} gridSize - Grid size (default: 30)
     * @returns {Object} {x: gridX, y: gridY}
     */
    static percentToGrid(percentX, percentY, gridSize = WORLD_GRID_SIZE) {
        return {
            x: Math.round((percentX / 100) * gridSize),
            y: Math.round((percentY / 100) * gridSize)
        };
    }

    /**
     * Position element at grid coordinates (centered)
     * @param {HTMLElement} element - Element to position
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {number} gridSize - Grid size (default: 30)
     */
    static positionAtGrid(element, gridX, gridY, gridSize = WORLD_GRID_SIZE) {
        const percent = this.gridToPercent(gridX, gridY, gridSize);
        element.style.position = 'absolute';
        element.style.left = `${percent.x}%`;
        element.style.top = `${percent.y}%`;
        element.style.transform = 'translate(-50%, -50%)';  // Center on grid cell
    }

    /**
     * Position element at percentage coordinates (centered)
     * @param {HTMLElement} element - Element to position
     * @param {number} percentX - Percentage X (0-100)
     * @param {number} percentY - Percentage Y (0-100)
     */
    static positionAtPercent(element, percentX, percentY) {
        element.style.position = 'absolute';
        element.style.left = `${percentX}%`;
        element.style.top = `${percentY}%`;
        element.style.transform = 'translate(-50%, -50%)';  // Center
    }

    /**
     * Position element at pixel coordinates
     * @param {HTMLElement} element - Element to position
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     */
    static positionAtPixels(element, x, y) {
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    /**
     * Center element horizontally and vertically
     * @param {HTMLElement} element - Element to center
     */
    static centerElement(element) {
        element.style.position = 'absolute';
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
    }

    /**
     * Center element horizontally only
     * @param {HTMLElement} element - Element to center
     */
    static centerHorizontal(element) {
        element.style.position = 'absolute';
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
    }

    /**
     * Center element vertically only
     * @param {HTMLElement} element - Element to center
     */
    static centerVertical(element) {
        element.style.position = 'absolute';
        element.style.top = '50%';
        element.style.transform = 'translateY(-50%)';
    }

    /**
     * Set image positioning for character (bottom-aligned)
     * @param {HTMLImageElement} img - Image element
     */
    static setCharacterImagePosition(img) {
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center bottom';  // Characters stand on ground
    }

    /**
     * Set image positioning for icon (center-aligned)
     * @param {HTMLImageElement} img - Image element
     */
    static setIconImagePosition(img) {
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center center';  // Icons centered
    }

    /**
     * Set image positioning for building (bottom-aligned)
     * @param {HTMLImageElement} img - Image element
     */
    static setBuildingImagePosition(img) {
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center bottom';  // Buildings on ground
    }

    /**
     * Set image positioning for background (cover)
     * @param {HTMLElement} element - Background element
     */
    static setBackgroundPosition(element) {
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center center';
        element.style.backgroundRepeat = 'no-repeat';
    }

    /**
     * Detect coordinate system from position object.
     * Magnitude alone can't tell a 0-30 percent value from a grid value, so
     * anything inside the grid range (fractional sub-cell positions included)
     * is treated as grid. Callers that know their system should say so via
     * normalizeToPercent(position, gridSize, coordinateSystem).
     * @param {Object} position - Position object {x, y}
     * @param {number} gridSize - Grid size (default: 30)
     * @returns {string} 'grid' | 'pixel'
     */
    static detectCoordinateSystem(position, gridSize = WORLD_GRID_SIZE) {
        const { x, y } = position || {};
        if (Number.isFinite(x) && Number.isFinite(y) && x <= gridSize && y <= gridSize) {
            return 'grid';
        }
        return 'pixel';
    }

    /**
     * Normalize a position to percentages.
     * @param {Object} position - Position object {x, y}
     * @param {number} gridSize - Grid size (default: 30)
     * @param {string} coordinateSystem - 'grid' (default) | 'percentage' | 'pixel' | 'auto'
     * @param {{width:number,height:number}|null} container - required for pixel positions
     * @returns {Object} {x: percentage, y: percentage}
     */
    static normalizeToPercent(position, gridSize = WORLD_GRID_SIZE, coordinateSystem = 'grid', container = null) {
        const system = coordinateSystem === 'auto'
            ? this.detectCoordinateSystem(position, gridSize)
            : coordinateSystem;
        switch (system) {
            case 'grid':
                return this.gridToPercent(position.x, position.y, gridSize);
            case 'percentage':
                return { x: position.x, y: position.y };
            case 'pixel':
                if (!container || !(container.width > 0) || !(container.height > 0)) {
                    throw new RangeError('normalizeToPercent: pixel positions need a container {width, height}');
                }
                return {
                    x: (position.x / container.width) * 100,
                    y: (position.y / container.height) * 100
                };
            default:
                throw new RangeError(`normalizeToPercent: unknown coordinate system "${coordinateSystem}"`);
        }
    }

    /**
     * Set z-index based on layer
     * @param {HTMLElement} element - Element to set z-index
     * @param {string} layer - Layer name (background, map, game, ui, modal, tooltip)
     * @param {number} offset - Additional offset (default: 0)
     */
    static setZIndex(element, layer, offset = 0) {
        const layers = {
            background: 0,
            map: 50,
            game: 100,
            ui: 200,
            modal: 300,
            tooltip: 400,
            debug: 500,
            cursor: 1000
        };
        
        const baseZ = layers[layer] || 0;
        element.style.zIndex = (baseZ + offset).toString();
    }

    /**
     * Create positioned element with all settings
     * @param {Object} config - Configuration object
     * @returns {HTMLElement} Created and positioned element
     */
    static createPositionedElement(config) {
        const {
            tag = 'div',
            className = '',
            position = { x: 0, y: 0 },
            coordinateSystem = 'grid',
            gridSize = WORLD_GRID_SIZE,
            size = { width: 'auto', height: 'auto' },
            zIndex = null,
            layer = null,
            center = true,
            imagePosition = null
        } = config;

        const element = document.createElement(tag);
        if (className) element.className = className;

        // Position element
        if (coordinateSystem === 'grid') {
            this.positionAtGrid(element, position.x, position.y, gridSize);
        } else if (coordinateSystem === 'percentage') {
            this.positionAtPercent(element, position.x, position.y);
        } else {
            this.positionAtPixels(element, position.x, position.y);
        }
        // center: true centres the element on the coordinate in every system;
        // center: false keeps the top-left corner on it
        element.style.transform = center ? 'translate(-50%, -50%)' : '';

        // Set size
        if (size.width !== 'auto') {
            element.style.width = typeof size.width === 'number' ? `${size.width}px` : size.width;
        }
        if (size.height !== 'auto') {
            element.style.height = typeof size.height === 'number' ? `${size.height}px` : size.height;
        }

        // Set z-index
        if (zIndex !== null) {
            element.style.zIndex = zIndex.toString();
        } else if (layer) {
            this.setZIndex(element, layer);
        }

        // Set image positioning if image element
        if (imagePosition && element.tagName === 'IMG') {
            switch (imagePosition) {
                case 'character':
                    this.setCharacterImagePosition(element);
                    break;
                case 'icon':
                    this.setIconImagePosition(element);
                    break;
                case 'building':
                    this.setBuildingImagePosition(element);
                    break;
            }
        }

        return element;
    }
}
