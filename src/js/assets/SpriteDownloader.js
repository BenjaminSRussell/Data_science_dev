/**
 * SpriteDownloader.js
 * Helps find and download sprites
 * Provides instructions and validation
 */

export class SpriteDownloader {
    constructor() {
        this.sources = [
            {
                name: 'Universal LPC Spritesheet',
                url: 'https://opengameart.org/content/universal-lpc-spritesheet-character-generator',
                license: 'CC-BY-SA 3.0',
                type: 'character',
                instructions: [
                    '1. Visit the URL above',
                    '2. Download the complete sprite sheet pack',
                    '3. Use the character generator to create variations',
                    '4. Export sprite sheets',
                    '5. Place in assets/characters/sprites/'
                ]
            },
            {
                name: 'Kenney Character Pack',
                url: 'https://kenney.nl/assets/abstract-characters',
                license: 'CC0',
                type: 'character',
                instructions: [
                    '1. Visit Kenney.nl',
                    '2. Download Abstract Characters pack',
                    '3. Extract to assets/characters/sprites/'
                ]
            },
            {
                name: 'OpenGameArt Character Sprites',
                url: 'https://opengameart.org/art-search-advanced?keys=character+sprite+sheet',
                license: 'Various',
                type: 'character',
                instructions: [
                    '1. Search for "character sprite sheet"',
                    '2. Filter by license (CC0 or CC-BY)',
                    '3. Download sprite sheets',
                    '4. Place in assets/characters/sprites/'
                ]
            }
        ];
    }
    
    /**
     * Get download instructions
     */
    getDownloadInstructions(type = 'character') {
        const source = this.sources.find(s => s.type === type);
        if (!source) return null;
        
        return {
            source: source.name,
            url: source.url,
            license: source.license,
            instructions: source.instructions,
            targetDirectory: `assets/${type}s/sprites/`
        };
    }
    
    /**
     * Validate downloaded sprite
     */
    validateSprite(file, type) {
        const validations = {
            character: {
                formats: ['png', 'jpg'],
                minSize: { width: 64, height: 64 },
                maxSize: { width: 512, height: 512 },
                required: true
            },
            background: {
                formats: ['png', 'jpg'],
                minSize: { width: 800, height: 600 },
                maxSize: { width: 3840, height: 2160 },
                required: false
            }
        };
        
        return validations[type] || {};
    }
    
    /**
     * Get sprite organization structure
     */
    getSpriteStructure() {
        return {
            characters: {
                sprites: 'assets/characters/sprites/',
                emotions: 'assets/characters/emotions/',
                body_language: 'assets/characters/body_language/',
                files: [
                    'character_sheet.png',
                    'character_walk.png',
                    'character_idle.png',
                    'happy.png',
                    'sad.png',
                    'angry.png'
                ]
            },
            backgrounds: {
                locations: 'assets/backgrounds/locations/',
                maps: 'assets/backgrounds/maps/',
                files: [
                    'home.png',
                    'office.png',
                    'coffee_shop.png',
                    'university.png',
                    'bank.png',
                    'park.png'
                ]
            }
        };
    }
}

