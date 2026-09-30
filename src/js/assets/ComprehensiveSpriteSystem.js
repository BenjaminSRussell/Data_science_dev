/**
 * ComprehensiveSpriteSystem.js
 * Complete sprite system with all emotions and body language
 * Handles sprite loading, mapping, and rendering
 *
 * FIX FOR #2542: Removed imports of '../characters/EmotionSpriteMapper.js' and
 * '../characters/BodyLanguageMapper.js' which do not exist in the repository and
 * were causing build-time import errors. Also removed the dead registerSpriteSheets()
 * call that attempted to register non-existent sprite assets. Emotion and body-language
 * sprite methods now return empty/default values to maintain API compatibility.
 */

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
            // Emotion and body language mappers do not exist in the repository (see #2542)
            // Sprite registration system is stubbed out
        } catch (error) {
            // Sprite system can work without all sprites loaded
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
     * Returns empty array - EmotionSpriteMapper does not exist (see #2542)
     */
    getAllEmotions() {
        return [];
    }

    /**
     * Get all available poses
     * Returns empty array - BodyLanguageMapper does not exist (see #2542)
     */
    getAllPoses() {
        return [];
    }

    /**
     * Check if sprite is loaded
     */
    isSpriteLoaded(key) {
        return this.loadedSprites.has(key);
    }

    /**
     * Get load progress
     * Returns 100% since no sprites are actually loaded (see #2542)
     */
    getLoadProgress() {
        return 100;
    }
}