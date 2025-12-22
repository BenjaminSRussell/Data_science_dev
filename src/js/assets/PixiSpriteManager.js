/**
 * PixiSpriteManager.js
 * Replaces custom SpriteSheetManager with PixiJS Spritesheet
 * Phase 4: Code Reduction - Using PixiJS Spritesheet instead of custom parsing
 */

import { Assets, Spritesheet, AnimatedSprite, Sprite } from 'pixi.js';

export class PixiSpriteManager {
    constructor() {
        this.spriteSheets = new Map();
        this.animations = new Map();
    }

    /**
     * Load sprite sheet
     * Phase 4: Uses PixiJS Spritesheet class
     */
    async loadSpriteSheet(id, jsonUrl, imageUrl) {
        try {
            // Load the JSON data and image
            const [jsonData, texture] = await Promise.all([
                fetch(jsonUrl).then(r => r.json()),
                Assets.load(imageUrl)
            ]);

            // Create spritesheet
            const sheet = new Spritesheet(texture, jsonData);
            await sheet.parse();

            this.spriteSheets.set(id, sheet);

            // Extract animations if available
            if (sheet.animations) {
                this.animations.set(id, sheet.animations);
            }

            return sheet;
        } catch (error) {
            console.warn(`Failed to load sprite sheet: ${id}`, error);
            return null;
        }
    }

    /**
     * Create sprite from sheet
     */
    createSprite(sheetId, frameName) {
        const sheet = this.spriteSheets.get(sheetId);
        if (!sheet) return null;

        const texture = sheet.textures[frameName];
        if (!texture) return null;

        return new Sprite(texture);
    }

    /**
     * Create animated sprite
     * Phase 4: Uses PixiJS AnimatedSprite
     */
    createAnimatedSprite(sheetId, animationName) {
        const sheet = this.spriteSheets.get(sheetId);
        if (!sheet) return null;

        const animationFrames = sheet.animations?.[animationName];
        if (!animationFrames) return null;

        const animatedSprite = new AnimatedSprite(animationFrames);
        return animatedSprite;
    }

    /**
     * Play animation
     */
    playAnimation(sprite, animationName, loop = true) {
        if (!sprite || !(sprite instanceof AnimatedSprite)) return;

        // Get animation frames from current sheet
        const sheetId = sprite.sheetId; // Store sheetId when creating
        const animationFrames = this.animations.get(sheetId)?.[animationName];
        
        if (animationFrames) {
            sprite.textures = animationFrames;
            sprite.loop = loop;
            sprite.play();
        }
    }

    /**
     * Get sprite sheet
     */
    getSpriteSheet(id) {
        return this.spriteSheets.get(id) || null;
    }

    /**
     * Get animation frames
     */
    getAnimationFrames(sheetId, animationName) {
        const sheet = this.spriteSheets.get(sheetId);
        if (!sheet || !sheet.animations) return null;

        return sheet.animations[animationName] || null;
    }
}
