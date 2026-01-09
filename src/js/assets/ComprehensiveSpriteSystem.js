/**
 * ComprehensiveSpriteSystem.js
 * Complete sprite system with all emotions and body language
 * Handles sprite loading, mapping, and rendering
 */

import { emotionSpriteMapper } from '../characters/EmotionSpriteMapper.js';
import { bodyLanguageMapper } from '../characters/BodyLanguageMapper.js';

export class ComprehensiveSpriteSystem {
    constructor(assetManager, spriteSheetManager) {
        this.assetManager = assetManager;
        this.spriteSheetManager = spriteSheetManager;
        this.loadedSprites = new Map();
        this.spriteCache = new Map();
    }

    /**
     * Initialize sprite system (fails gracefully)
     */
    async initialize() {
        try {
            // Load all emotion sprites
            await this.loadEmotionSprites();

            // Load all body language sprites
            await this.loadBodyLanguageSprites();

            // Register sprite sheets
            await this.registerSpriteSheets();
        } catch (error) {
            // Sprite system can work without all sprites loaded
        }
    }

    /**
     * Load all emotion sprites (fails gracefully)
     */
    async loadEmotionSprites() {
        try {
            const emotions = emotionSpriteMapper.getAllEmotions();
            const promises = emotions.map(emotion => {
                try {
                    const config = emotionSpriteMapper.getEmotion(emotion);
                    if (config && config.sprite) {
                        return this.loadSprite(config.sprite, `emotion_${emotion}`);
                    }
                } catch (error) {
                    // Skip this emotion if config is invalid
                }
                return Promise.resolve(null);
            });

            await Promise.allSettled(promises);
        } catch (error) {
            // Continue even if emotion loading fails
        }
    }

    /**
     * Load all body language sprites
     */
    async loadBodyLanguageSprites() {
        try {
            const poses = bodyLanguageMapper.getAllPoses();
            const promises = poses.map(pose => {
                try {
                    const config = bodyLanguageMapper.getBodyLanguage(pose);
                    if (config && config.sprite) {
                        return this.loadSprite(config.sprite, `pose_${pose}`);
                    }
                } catch (error) {
                    // Skip this pose if config is invalid
                }
                return Promise.resolve(null);
            });

            await Promise.allSettled(promises);
        } catch (error) {
            // Continue even if pose loading fails
        }
    }

    /**
     * Load a single sprite
     */
    async loadSprite(url, key) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                this.loadedSprites.set(key, img);
                resolve(img);
            };

            img.onerror = () => {
                // Sprite failed to load - don't add fallback
                resolve(null);
            };

            img.src = url;
        });
    }

    /**
     * Get sprite (returns null if not loaded)
     */
    getSprite(key) {
        return this.loadedSprites.get(key) || null;
    }

    /**
     * Register sprite sheets
     */
    async registerSpriteSheets() {
        // Main character sprite sheet
        if (this.spriteSheetManager?.registerSpriteSheet) {
            try {
                await this.spriteSheetManager?.registerSpriteSheet('main_character', {
                    url: '/assets/characters/sprites/character_sheet.png',
                    frameWidth: 64,
                    frameHeight: 64,
                    columns: 8,
                    rows: 8
                });

                // Register emotion animations
                // Note: Animation registration is handled through sprite sheet configuration
                // Individual animations are defined in the sprite sheet manifest
                // const emotions = emotionSpriteMapper.getAllEmotions();
                // emotions.forEach(emotion => {
                //     const coords = emotionSpriteMapper.getSpriteSheetCoords(emotion);
                //     const animation = emotionSpriteMapper.getEmotionAnimation(emotion);
                //     // Animation frames are handled by SpriteSheetManager.parseAnimations()
                // });

                // Register body language animations
                const poses = bodyLanguageMapper.getAllPoses();
                // Note: registerAnimation method doesn't exist in SpriteSheetManager
                // Animation registration is handled through registerSpriteSheet instead
                // poses.forEach(pose => {
                //     const coords = bodyLanguageMapper.getSpriteSheetCoords(pose);
                //     const animation = bodyLanguageMapper.getPoseAnimation(pose);
                //     
                //     this.spriteSheetManager.registerAnimation('main_character', animation, {
                //         frames: [
                //             { row: coords.row, col: coords.col },
                //             { row: coords.row, col: coords.col + 1 }
                //         ],
                //         speed: 8,
                //         loop: animation.includes('_loop') || animation.includes('_once')
                //     });
                // });


            } catch (error) {
                console.warn('Could not register sprite sheets:', error);
            }
        }
    }

    /**
     * Get sprite for emotion (returns null if not loaded)
     */
    getEmotionSprite(emotion) {
        const key = `emotion_${emotion}`;
        return this.loadedSprites.get(key) || null;
    }

    /**
     * Get sprite for body language (returns null if not loaded)
     */
    getBodyLanguageSprite(pose) {
        const key = `pose_${pose}`;
        return this.loadedSprites.get(key) || null;
    }

    /**
     * Get combined sprite (emotion + body language)
     * Returns null if either sprite is missing
     */
    getCombinedSprite(emotion, pose) {
        const poseSprite = this.getBodyLanguageSprite(pose);
        const emotionSprite = this.getEmotionSprite(emotion);

        // Return null if either sprite is missing
        if (!poseSprite || !emotionSprite) {
            return null;
        }

        const cacheKey = `${emotion}_${pose}`;

        if (this.spriteCache.has(cacheKey)) {
            return this.spriteCache.get(cacheKey);
        }

        // Create combined sprite (emotion overlay on pose)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw pose first
        ctx.drawImage(poseSprite, 0, 0);

        // Draw emotion overlay
        ctx.globalAlpha = 0.7;
        ctx.drawImage(emotionSprite, 0, 0);
        ctx.globalAlpha = 1.0;

        const img = new Image();
        img.src = canvas.toDataURL();
        this.spriteCache.set(cacheKey, img);

        return img;
    }

    /**
     * Get all available emotions
     */
    getAllEmotions() {
        return emotionSpriteMapper.getAllEmotions();
    }

    /**
     * Get all available poses
     */
    getAllPoses() {
        return bodyLanguageMapper.getAllPoses();
    }

    /**
     * Check if sprite is loaded
     */
    isSpriteLoaded(key) {
        return this.loadedSprites.has(key);
    }

    /**
     * Get load progress
     */
    getLoadProgress() {
        const total = emotionSpriteMapper.getAllEmotions().length +
            bodyLanguageMapper.getAllPoses().length;
        const loaded = this.loadedSprites.size;
        return (loaded / total) * 100;
    }
}

