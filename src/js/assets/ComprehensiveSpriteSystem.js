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
     * Initialize sprite system
     */
    async initialize() {
        console.log('🎨 Initializing comprehensive sprite system...');
        
        // Load all emotion sprites
        await this.loadEmotionSprites();
        
        // Load all body language sprites
        await this.loadBodyLanguageSprites();
        
        // Register sprite sheets
        await this.registerSpriteSheets();
        
        console.log('✅ Sprite system initialized');
    }
    
    /**
     * Load all emotion sprites
     */
    async loadEmotionSprites() {
        const emotions = emotionSpriteMapper.getAllEmotions();
        const promises = emotions.map(emotion => {
            const config = emotionSpriteMapper.getEmotion(emotion);
            return this.loadSprite(config.sprite, `emotion_${emotion}`);
        });
        
        await Promise.allSettled(promises);
        console.log(`✅ Loaded ${emotions.length} emotion sprites`);
    }
    
    /**
     * Load all body language sprites
     */
    async loadBodyLanguageSprites() {
        const poses = bodyLanguageMapper.getAllPoses();
        const promises = poses.map(pose => {
            const config = bodyLanguageMapper.getBodyLanguage(pose);
            return this.loadSprite(config.sprite, `pose_${pose}`);
        });
        
        await Promise.allSettled(promises);
        console.log(`✅ Loaded ${poses.length} body language sprites`);
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
                console.warn(`Failed to load sprite: ${url}, using fallback`);
                const fallback = this.createFallbackSprite(key);
                this.loadedSprites.set(key, fallback);
                resolve(fallback);
            };
            
            img.src = url;
        });
    }
    
    /**
     * Create fallback sprite
     */
    createFallbackSprite(key) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Determine color based on key
        let color = '#8b5cf6';
        if (key.includes('emotion')) {
            const emotion = key.replace('emotion_', '');
            const emotionConfig = emotionSpriteMapper.getEmotion(emotion);
            color = emotionConfig.color;
        } else if (key.includes('pose')) {
            color = '#10b981';
        }
        
        // Draw colored rectangle
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key.split('_').pop().substring(0, 6), 32, 32);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
    
    /**
     * Register sprite sheets
     */
    async registerSpriteSheets() {
        // Main character sprite sheet
        if (this.spriteSheetManager) {
            try {
                await this.spriteSheetManager.registerSpriteSheet('main_character', {
                    url: '/assets/characters/sprites/character_sheet.png',
                    frameWidth: 64,
                    frameHeight: 64,
                    columns: 8,
                    rows: 8
                });
                
                // Register emotion animations
                const emotions = emotionSpriteMapper.getAllEmotions();
                emotions.forEach(emotion => {
                    const coords = emotionSpriteMapper.getSpriteSheetCoords(emotion);
                    const animation = emotionSpriteMapper.getEmotionAnimation(emotion);
                    
                    this.spriteSheetManager.registerAnimation('main_character', animation, {
                        frames: [
                            { row: coords.row, col: coords.col },
                            { row: coords.row, col: coords.col + 1 }
                        ],
                        speed: 8,
                        loop: true
                    });
                });
                
                // Register body language animations
                const poses = bodyLanguageMapper.getAllPoses();
                poses.forEach(pose => {
                    const coords = bodyLanguageMapper.getSpriteSheetCoords(pose);
                    const animation = bodyLanguageMapper.getPoseAnimation(pose);
                    
                    this.spriteSheetManager.registerAnimation('main_character', animation, {
                        frames: [
                            { row: coords.row, col: coords.col },
                            { row: coords.row, col: coords.col + 1 }
                        ],
                        speed: 8,
                        loop: animation.includes('_loop') || animation.includes('_once')
                    });
                });
                
                console.log('✅ Registered sprite sheets');
            } catch (error) {
                console.warn('Could not register sprite sheets:', error);
            }
        }
    }
    
    /**
     * Get sprite for emotion
     */
    getEmotionSprite(emotion) {
        const key = `emotion_${emotion}`;
        return this.loadedSprites.get(key) || this.createFallbackSprite(key);
    }
    
    /**
     * Get sprite for body language
     */
    getBodyLanguageSprite(pose) {
        const key = `pose_${pose}`;
        return this.loadedSprites.get(key) || this.createFallbackSprite(key);
    }
    
    /**
     * Get combined sprite (emotion + body language)
     */
    getCombinedSprite(emotion, pose) {
        const cacheKey = `${emotion}_${pose}`;
        
        if (this.spriteCache.has(cacheKey)) {
            return this.spriteCache.get(cacheKey);
        }
        
        // Create combined sprite (emotion overlay on pose)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const poseSprite = this.getBodyLanguageSprite(pose);
        const emotionSprite = this.getEmotionSprite(emotion);
        
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

