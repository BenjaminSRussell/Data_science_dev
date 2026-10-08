/**
 * ComprehensiveSpriteSystem.js
 * Complete sprite system with all emotions and body language
 * Handles sprite loading, mapping, and rendering
 */

import { emotionSpriteMapper } from '../characters/EmotionSpriteMapper.js';
import { bodyLanguageMapper } from '../characters/BodyLanguageMapper.js';
import { isAssetMissing } from './MissingAssetBlocklist.js';

/** Size of a combined sprite when the pose image has no natural size */
const DEFAULT_SPRITE_SIZE = 64;

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
                    // The mapper's accessor is getBodyLanguage(); getPose() never existed (#2301, #1839)
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
        // Reuse an image the AssetManager already holds under this key (#2136)
        const cached = this.assetManager?.getAsset?.(key);
        if (cached) {
            this.loadedSprites.set(key, cached);
            return cached;
        }
        // Known-missing files: don't request them at all
        if (isAssetMissing(url)) return null;
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

                // Per-pose/emotion animations come from the sheet configuration;
                // SpriteSheetManager has no registerAnimation() (#2136)
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
     * Get combined sprite (emotion + body language) as a canvas, which can be
     * passed straight to drawImage(). Returns null if either sprite is missing
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

        // Size the canvas from the pose image and scale both layers to it, so
        // non-64px art isn't cropped or misaligned (#2135)
        const width = poseSprite.naturalWidth || poseSprite.width || DEFAULT_SPRITE_SIZE;
        const height = poseSprite.naturalHeight || poseSprite.height || DEFAULT_SPRITE_SIZE;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Draw pose first
        ctx.drawImage(poseSprite, 0, 0, width, height);

        // Draw emotion overlay
        ctx.globalAlpha = 0.7;
        ctx.drawImage(emotionSprite, 0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Cache the canvas itself: it is drawable right away, unlike an Image
        // built from a data URL that hasn't decoded yet (#1052)
        this.spriteCache.set(cacheKey, canvas);

        return canvas;
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
        return total > 0 ? Math.min(100, (loaded / total) * 100) : 100;
    }
}