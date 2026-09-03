/**
 * PositioningHelper.js
 * Utility functions for consistent positioning throughout the game
 * Ensures all elements are positioned correctly
 */

export class PositioningHelper {
    /**
     * Convert grid coordinates to percentage
     * @param {number} gridX - Grid X coordinate (0-30)
     * @param {number} gridY - Grid Y coordinate (0-30)
     * @param {number} gridSize - Grid size (default: 30)
     * @returns {Object} {x: percentage, y: percentage}
     */
    static gridToPercent(gridX, gridY, gridSize = 30) {
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
    static percentToGrid(percentX, percentY, gridSize = 30) {
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
    static positionAtGrid(element, gridX, gridY, gridSize = 30) {
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
     * @param {boolean} center - Center element on the point (default: true)
     */
    static positionAtPixels(element, x, y, center = true) {
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        if (center) {
            element.style.transform = 'translate(-50%, -50%)';  // Center on pixel point
        }
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
     * Detect coordinate system from position object
     * @param {Object} position - Position object {x, y}
     * @param {number} gridSize - Grid size (default: 30)
     * @returns {string} 'grid' | 'pixel'
     * @deprecated All locations now use grid coordinates (0-30)
     */
    static detectCoordinateSystem(position, gridSize = 30) {
        if (position.x <= gridSize && position.y <= gridSize && 
            Number.isInteger(position.x) && Number.isInteger(position.y)) {
            return 'grid';
        }
        return 'pixel';
    }

    /**
     * Normalize position to percentage
     * @param {Object} position - Position object {x, y} (grid coordinates)
     * @param {number} gridSize - Grid size (default: 30)
     * @returns {Object} {x: percentage, y: percentage}
     */
    static normalizeToPercent(position, gridSize = 30) {
        // All positions are grid coordinates - convert to percentage
        return this.gridToPercent(position.x, position.y, gridSize);
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
            gridSize = 30,
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
            this.positionAtPixels(element, position.x, position.y, center);
        }

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
