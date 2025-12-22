/**
 * FilterManager.js
 * Manages PixiJS filters for visual polish
 * Priority 1: Visual Enhancement
 */

export class FilterManager {
    constructor() {
        this.filters = {
            glow: null,
            blur: null,
            dropShadow: null,
            colorMatrix: null
        };
        this.initialized = false;
    }

    /**
     * Initialize filters
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // PixiJS v8 has filters built-in
            // Filters are created on-demand, no need to pre-create
            this.initialized = true;
            return true;
        } catch (error) {
            console.warn('Filter initialization failed:', error);
            return false;
        }
    }


    /**
     * Apply glow to sprite - DISABLED (blur filters removed)
     */
    applyGlow(sprite, color = 0x8b5cf6, distance = 15) {
        // Blur filters disabled - return early
        return false;
    }

    /**
     * Apply blur to sprite - DISABLED (blur filters removed)
     */
    applyBlur(sprite, strength = 4) {
        // Blur filters disabled - return early
        return false;
    }

    /**
     * Apply drop shadow to sprite - DISABLED (blur filters removed)
     */
    applyDropShadow(sprite, options = {}) {
        // Blur filters disabled - return early
        return false;
    }

    /**
     * Apply color adjustment
     */
    applyColorAdjustment(sprite, brightness = 0, contrast = 0, saturation = 0) {
        if (!this.initialized) this.initialize();
        
        try {
            import('pixi.js').then((PIXI) => {
                if (!PIXI || !PIXI.filters) {
                    console.warn('PixiJS filters not available');
                    return;
                }
                
                const ColorMatrixFilter = PIXI.filters.ColorMatrixFilter || PIXI.ColorMatrixFilter;
                if (!ColorMatrixFilter) {
                    console.warn('ColorMatrixFilter not available');
                    return;
                }
                
                const colorMatrix = new ColorMatrixFilter();
                
                if (brightness !== 0) colorMatrix.brightness(brightness, false);
                if (contrast !== 0) colorMatrix.contrast(contrast, false);
                if (saturation !== 0) colorMatrix.saturate(saturation, false);
                
                if (sprite && sprite.filters) {
                    sprite.filters.push(colorMatrix);
                } else if (sprite) {
                    sprite.filters = [colorMatrix];
                }
            }).catch((error) => {
                console.warn('Failed to import PixiJS:', error);
            });
            return true;
        } catch (error) {
            console.warn('Failed to apply color adjustment:', error);
            return false;
        }
    }

    /**
     * Remove all filters from sprite
     */
    removeFilters(sprite) {
        sprite.filters = null;
    }
}


