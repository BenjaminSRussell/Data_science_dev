/**
 * AssetFinder.js
 * Helps find and add assets from the web
 * Provides workflow for asset integration
 */

export class AssetFinder {
    constructor() {
        this.sources = [
            {
                name: 'OpenGameArt.org',
                url: 'https://opengameart.org',
                license: 'Various (CC0, CC-BY)',
                categories: ['characters', 'backgrounds', 'icons'],
                searchTerms: ['2d character', 'pixel art', 'cartoon background']
            },
            {
                name: 'Kenney.nl',
                url: 'https://kenney.nl/assets',
                license: 'CC0 (Public Domain)',
                categories: ['characters', 'ui', 'icons'],
                searchTerms: ['character', 'ui pack', 'icons']
            },
            {
                name: 'Itch.io Free Assets',
                url: 'https://itch.io/game-assets/free',
                license: 'Various',
                categories: ['characters', 'backgrounds', 'all'],
                searchTerms: ['free', '2d', 'pixel art']
            },
            {
                name: 'Game Icons',
                url: 'https://game-icons.net',
                license: 'CC-BY 3.0',
                categories: ['icons'],
                searchTerms: ['map', 'location', 'building']
            }
        ];
    }
    
    /**
     * Get asset search recommendations
     */
    getSearchRecommendations(assetType) {
        const recommendations = {
            characters: {
                searchTerms: ['2d character sprite', 'pixel art character', 'character animation'],
                requiredFiles: ['base.png', 'walk.png', 'idle.png'],
                emotions: ['happy.png', 'sad.png', 'angry.png', 'neutral.png'],
                bodyLanguage: ['standing.png', 'sitting.png', 'talking.png']
            },
            backgrounds: {
                searchTerms: ['cartoon background', '2d background', 'game background'],
                requiredFiles: ['home.png', 'office.png', 'coffee_shop.png', 'university.png', 'bank.png', 'park.png'],
                style: 'cartoonish, colorful, 2d'
            },
            icons: {
                searchTerms: ['map icon', 'location icon', 'building icon'],
                requiredFiles: ['home_icon.png', 'office_icon.png', 'coffee_icon.png'],
                format: 'SVG or PNG, 32x32 to 64x64'
            }
        };
        
        return recommendations[assetType] || {};
    }
    
    /**
     * Generate asset checklist
     */
    generateChecklist() {
        return {
            characters: {
                sprites: ['character_base.png', 'character_walk.png', 'character_idle.png'],
                emotions: ['happy.png', 'sad.png', 'angry.png', 'neutral.png', 'excited.png', 'thinking.png'],
                bodyLanguage: ['standing.png', 'sitting.png', 'talking.png', 'thinking.png', 'working.png'],
                status: 'pending'
            },
            backgrounds: {
                locations: ['home.png', 'office.png', 'coffee_shop.png', 'university.png', 'bank.png', 'park.png'],
                maps: ['city_map.png', 'district_map.png'],
                status: 'pending'
            },
            icons: {
                locations: ['home_icon.png', 'office_icon.png', 'coffee_icon.png', 'university_icon.png', 'bank_icon.png', 'park_icon.png'],
                map: ['marker.png', 'location_pin.png', 'player.png'],
                status: 'pending'
            },
            ui: {
                elements: ['buttons.png', 'panels.png', 'frames.png'],
                status: 'pending'
            }
        };
    }
    
    /**
     * Validate asset file
     */
    validateAsset(file, type) {
        const validations = {
            character: {
                format: ['png'],
                size: { min: 64, max: 128 },
                transparency: true
            },
            background: {
                format: ['png', 'jpg'],
                size: { min: 800, max: 1920 },
                transparency: false
            },
            icon: {
                format: ['svg', 'png'],
                size: { min: 32, max: 64 },
                transparency: true
            }
        };
        
        return validations[type] || {};
    }
    
    /**
     * Get asset integration steps
     */
    getIntegrationSteps() {
        return [
            '1. Download asset from source',
            '2. Check license (must be free/commercial use)',
            '3. Rename file to match manifest (see AssetManager.js)',
            '4. Place in correct directory (assets/characters/, assets/backgrounds/, etc.)',
            '5. Verify format and size match requirements',
            '6. Test in game - asset should load automatically',
            '7. If missing, fallback asset will be used'
        ];
    }
}

