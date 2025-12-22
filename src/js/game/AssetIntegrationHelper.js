/**
 * AssetIntegrationHelper.js
 * Helper functions to integrate downloaded assets into the game
 * Based on research from free asset sources and best practices
 */

export class AssetIntegrationHelper {
    /**
     * Get recommended asset sources with direct links
     */
    static getAssetSources() {
        return {
            kenney: {
                name: 'Kenney Assets',
                url: 'https://kenney.nl/assets',
                license: 'CC0 Public Domain',
                recommended: [
                    'RPG Urban Kit',
                    'City Kit (Roads)',
                    'Pico-8 City',
                    'Sketch Town'
                ],
                description: 'High-quality, CC0 licensed assets. No attribution required.'
            },
            opengameart: {
                name: 'OpenGameArt.org',
                url: 'https://opengameart.org',
                license: 'Various (check each)',
                recommended: [
                    'Hyptosis Tiles Collection',
                    'Isometric City'
                ],
                description: 'Large collection of free game assets. Check licenses.'
            },
            openpixel: {
                name: 'OpenPixelProject',
                url: 'https://openpixelproject.com',
                license: 'Public Domain',
                recommended: [
                    '2000+ tiles',
                    '100+ animated sprites'
                ],
                description: 'Completely free, public domain pixel art assets.'
            },
            itch: {
                name: 'itch.io Free Assets',
                url: 'https://itch.io/game-assets/free/tag-city-builder',
                license: 'CC0 (check each)',
                recommended: [
                    'Tiny Islands 16x16 Tilemap',
                    'Rachel\'s CC0 Assets',
                    'City Builder Free Tiles'
                ],
                description: 'Community-created free assets. Many CC0 licensed.'
            }
        };
    }

    /**
     * Get asset specifications for different asset types
     */
    static getAssetSpecs() {
        return {
            mapTiles: {
                size: '32x32px or 64x64px',
                format: 'PNG',
                style: 'Pixel art or low-poly',
                notes: 'Use powers of 2 for best performance'
            },
            buildings: {
                size: '64x64px to 128x128px',
                format: 'PNG',
                style: 'Consistent with map tiles',
                notes: 'Should match tile grid alignment'
            },
            icons: {
                size: '128x128px',
                format: 'PNG',
                style: 'Simple, recognizable',
                notes: 'Should work at smaller sizes too'
            },
            backgrounds: {
                size: '1920x1080px',
                format: 'PNG or JPG',
                style: 'Low-poly or pixel art',
                notes: '16:9 aspect ratio recommended'
            },
            characters: {
                size: '64x64px per frame',
                format: 'PNG sprite sheet',
                style: 'Consistent with game style',
                notes: 'Use sprite sheets for animations'
            }
        };
    }

    /**
     * Validate asset before adding to game
     */
    static validateAsset(file, type) {
        const specs = this.getAssetSpecs()[type];
        if (!specs) {
            return { valid: false, error: 'Unknown asset type' };
        }

        // Check file extension
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
            return { valid: false, error: 'File must be PNG or JPG' };
        }

        // Note: Actual size validation would require loading the image
        return { valid: true, message: 'Asset appears valid' };
    }

    /**
     * Generate asset path based on type and name
     */
    static generateAssetPath(type, name, category = '') {
        const basePath = '/assets';
        
        const pathMap = {
            mapTile: `${basePath}/map/tiles/${name}.png`,
            building: `${basePath}/map/buildings/${name}.png`,
            tree: `${basePath}/map/trees/${name}.png`,
            locationIcon: `${basePath}/icons/locations/${name}.png`,
            npcIcon: `${basePath}/icons/npcs/${name}.png`,
            uiIcon: `${basePath}/icons/ui/${name}.png`,
            background: `${basePath}/backgrounds/locations/${name}.png`,
            character: `${basePath}/characters/sprites/${name}.png`
        };

        return pathMap[type] || `${basePath}/${category}/${name}.png`;
    }

    /**
     * Get image rendering CSS for pixel art
     */
    static getPixelArtCSS() {
        return {
            imageRendering: 'pixelated',
            imageRenderingMoz: '-moz-crisp-edges',
            imageRenderingWebkit: '-webkit-optimize-contrast',
            imageRenderingMs: '-ms-interpolation-mode: nearest-neighbor',
            imageRenderingStandard: 'crisp-edges'
        };
    }

    /**
     * Apply pixel art rendering to an image element
     */
    static applyPixelArtRendering(imgElement) {
        const css = this.getPixelArtCSS();
        imgElement.style.imageRendering = css.imageRendering;
        imgElement.style.imageRendering = css.imageRenderingMoz;
        imgElement.style.imageRendering = css.imageRenderingWebkit;
        imgElement.style.imageRendering = css.imageRenderingStandard;
    }

    /**
     * Create optimized image element with proper settings
     */
    static createOptimizedImage(src, alt = '', className = '') {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        if (className) img.className = className;
        
        // Apply pixel art rendering
        this.applyPixelArtRendering(img);
        
        // Set loading attribute for performance
        img.loading = 'lazy';
        
        // Add error handler - hide image if it fails to load
        img.onerror = function() {
            this.style.display = 'none';
        };
        
        return img;
    }

    /**
     * Check if asset exists (async)
     */
    static async checkAssetExists(path) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get fallback for missing asset
     */
    static getFallbackAsset(type) {
        const fallbacks = {
            mapTile: '⬜', // White square
            building: '', // Building emoji
            tree: '', // Tree emoji
            locationIcon: '', // Location pin
            npcIcon: '', // Person icon
            uiIcon: '', // Settings icon
            background: null, // Use CSS gradient
            character: '' // Person icon
        };
        
        return fallbacks[type] || '';
    }
}
