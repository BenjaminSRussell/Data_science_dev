/**
 * AssetManager.js
 * Manages loading and organization of all game assets
 * Handles sprites, backgrounds, icons, and animations
 */

import { basicPlaceholderAssets } from './BasicPlaceholderAssets.js';

export class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loaded = false;
        this.loadProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    /**
     * Asset manifest - all assets to load
     * Updated to support sprite sheets with animations
     */
    getAssetManifest() {
        return {
            characters: {
                // Sprite sheets (preferred - has animations)
                spriteSheets: {
                    main: {
                        url: '/assets/characters/sprites/character_sheet.png',
                        frameWidth: 64,
                        frameHeight: 64,
                        columns: 8,
                        rows: 8,
                        type: 'spriteSheet'
                    },
                    emotions: {
                        url: '/assets/characters/sprites/emotion_sheet.png',
                        frameWidth: 64,
                        frameHeight: 64,
                        columns: 6,
                        rows: 1,
                        type: 'spriteSheet'
                    }
                },
                // Fallback single images (if sprite sheets not available)
                base: '/assets/characters/sprites/character_base.png',
                walk: '/assets/characters/sprites/character_walk.png',
                idle: '/assets/characters/sprites/character_idle.png',
                emotions: {
                    // Basic emotions
                    happy: '/assets/characters/emotions/happy.png',
                    sad: '/assets/characters/emotions/sad.png',
                    angry: '/assets/characters/emotions/angry.png',
                    neutral: '/assets/characters/emotions/neutral.png',
                    excited: '/assets/characters/emotions/excited.png',
                    thinking: '/assets/characters/emotions/thinking.png',
                    // Breakdown emotions
                    crying: '/assets/characters/emotions/crying.png',
                    yelling: '/assets/characters/emotions/yelling.png',
                    fighting: '/assets/characters/emotions/fighting.png',
                    // Relationship emotions
                    grateful: '/assets/characters/emotions/grateful.png',
                    jealous: '/assets/characters/emotions/jealous.png',
                    hurt: '/assets/characters/emotions/hurt.png',
                    embarrassed: '/assets/characters/emotions/embarrassed.png',
                    proud: '/assets/characters/emotions/proud.png',
                    worried: '/assets/characters/emotions/worried.png',
                    relieved: '/assets/characters/emotions/relieved.png',
                    surprised: '/assets/characters/emotions/surprised.png',
                    disappointed: '/assets/characters/emotions/disappointed.png',
                    hopeful: '/assets/characters/emotions/hopeful.png',
                    confused: '/assets/characters/emotions/confused.png',
                    determined: '/assets/characters/emotions/determined.png',
                    tired: '/assets/characters/emotions/tired.png',
                    content: '/assets/characters/emotions/content.png'
                },
                bodyLanguage: {
                    // Basic poses
                    standing: '/assets/characters/body_language/standing.png',
                    sitting: '/assets/characters/body_language/sitting.png',
                    walking: '/assets/characters/body_language/walking.png',
                    // Communication poses
                    talking: '/assets/characters/body_language/talking.png',
                    listening: '/assets/characters/body_language/listening.png',
                    thinking: '/assets/characters/body_language/thinking.png',
                    explaining: '/assets/characters/body_language/explaining.png',
                    // Work poses
                    working: '/assets/characters/body_language/working.png',
                    typing: '/assets/characters/body_language/typing.png',
                    reading: '/assets/characters/body_language/reading.png',
                    presenting: '/assets/characters/body_language/presenting.png',
                    // Emotional poses
                    happy_pose: '/assets/characters/body_language/happy_pose.png',
                    sad_pose: '/assets/characters/body_language/sad_pose.png',
                    angry_pose: '/assets/characters/body_language/angry_pose.png',
                    defensive: '/assets/characters/body_language/defensive.png',
                    open: '/assets/characters/body_language/open.png',
                    // Breakdown poses
                    crying_pose: '/assets/characters/body_language/crying_pose.png',
                    yelling_pose: '/assets/characters/body_language/yelling_pose.png',
                    fighting_pose: '/assets/characters/body_language/fighting_pose.png',
                    // Social poses
                    greeting: '/assets/characters/body_language/greeting.png',
                    handshake: '/assets/characters/body_language/handshake.png',
                    hugging: '/assets/characters/body_language/hugging.png',
                    pointing: '/assets/characters/body_language/pointing.png',
                    nodding: '/assets/characters/body_language/nodding.png',
                    shaking_head: '/assets/characters/body_language/shaking_head.png',
                    // Rest poses
                    resting: '/assets/characters/body_language/resting.png',
                    sleeping: '/assets/characters/body_language/sleeping.png',
                    stretching: '/assets/characters/body_language/stretching.png'
                }
            },
            backgrounds: {
                locations: {
                    home: '/assets/backgrounds/locations/home.png',
                    office: '/assets/backgrounds/locations/office.png',
                    coffee_shop: '/assets/backgrounds/locations/coffee_shop.png',
                    university: '/assets/backgrounds/locations/university.png',
                    bank: '/assets/backgrounds/locations/bank.png',
                    park: '/assets/backgrounds/locations/park.png',
                    apartment: '/assets/backgrounds/locations/apartment.png'
                },
                maps: {
                    city: '/assets/backgrounds/maps/city_map.png',
                    district: '/assets/backgrounds/maps/district_map.png'
                }
            },
            icons: {
                locations: {
                    home: '/assets/icons/locations/home_icon.png',
                    office: '/assets/icons/locations/office_icon.png',
                    coffee_shop: '/assets/icons/locations/coffee_icon.png',
                    university: '/assets/icons/locations/university_icon.png',
                    bank: '/assets/icons/locations/bank_icon.png',
                    park: '/assets/icons/locations/park_icon.png'
                },
                map: {
                    marker: '/assets/icons/map/marker.png',
                    location_pin: '/assets/icons/map/location_pin.png',
                    player: '/assets/icons/map/player.png'
                }
            },
            ui: {
                buttons: '/assets/ui/buttons.png',
                panels: '/assets/ui/panels.png',
                frames: '/assets/ui/frames.png'
            }
        };
    }
    
    /**
     * Load all assets
     */
    async loadAll() {
        const manifest = this.getAssetManifest();
        this.totalAssets = this.countAssets(manifest);
        this.loadedAssets = 0;
        
        try {
            await this.loadAssets(manifest);
            this.loaded = true;
            return true;
        } catch (error) {
            console.error('Asset loading failed:', error);
            return false;
        }
    }
    
    /**
     * Count total assets
     */
    countAssets(obj, count = 0) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                count++;
            } else if (typeof obj[key] === 'object') {
                count = this.countAssets(obj[key], count);
            }
        }
        return count;
    }
    
    /**
     * Load assets recursively
     */
    async loadAssets(manifest, path = '') {
        for (const key in manifest) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof manifest[key] === 'string') {
                // It's an asset path
                await this.loadImage(manifest[key], currentPath);
            } else if (typeof manifest[key] === 'object') {
                // It's a nested object
                await this.loadAssets(manifest[key], currentPath);
            }
        }
    }
    
    /**
     * Load a single image
     */
    loadImage(src, key) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.assets.set(key, img);
                this.loadedAssets++;
                this.loadProgress = (this.loadedAssets / this.totalAssets) * 100;
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn(`Failed to load asset: ${src}, using fallback`);
                // Create fallback colored rectangle
                const fallback = this.createFallbackImage(key);
                this.assets.set(key, fallback);
                this.loadedAssets++;
                this.loadProgress = (this.loadedAssets / this.totalAssets) * 100;
                resolve(fallback);
            };
            
            img.src = src;
        });
    }
    
    /**
     * Create fallback image
     */
    createFallbackImage(key) {
        // Use basic placeholder assets for characters and houses
        if (key.includes('emotion') || key.includes('character')) {
            const emotion = key.split('_').pop() || 'neutral';
            return this.getStickFigurePlaceholder(emotion);
        }
        
        if (key.includes('house') || key.includes('background')) {
            return this.getHousePlaceholder();
        }
        
        // Default colored rectangle for other assets
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        let color = '#8b5cf6';
        if (key.includes('icon')) color = '#f59e0b';
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key.split('.').pop(), 32, 32);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
    
    /**
     * Get stick figure placeholder
     */
    getStickFigurePlaceholder(emotion = 'neutral') {
        return basicPlaceholderAssets.getEmotionPlaceholder(emotion);
    }
    
    /**
     * Get house placeholder
     */
    getHousePlaceholder() {
        return basicPlaceholderAssets.getHousePlaceholder();
    }
    
    /**
     * Create simple stick figure (fallback)
     */
    createSimpleStickFigure(emotion) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Head
        ctx.fillStyle = this.getEmotionColor(emotion);
        ctx.beginPath();
        ctx.arc(32, 12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Body
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(32, 18);
        ctx.lineTo(32, 40);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(32, 25);
        ctx.lineTo(22, 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(32, 25);
        ctx.lineTo(42, 30);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(32, 40);
        ctx.lineTo(25, 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(32, 40);
        ctx.lineTo(39, 50);
        ctx.stroke();
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
    
    /**
     * Create simple house (fallback)
     */
    createSimpleHouse() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Roof
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(100, 20);
        ctx.lineTo(160, 60);
        ctx.lineTo(40, 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // House body
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(50, 60, 100, 100);
        ctx.strokeRect(50, 60, 100, 100);
        
        // Door
        ctx.fillStyle = '#654321';
        ctx.fillRect(85, 120, 30, 40);
        ctx.strokeRect(85, 120, 30, 40);
        
        // Windows
        ctx.fillStyle = '#4B5563';
        ctx.fillRect(60, 80, 20, 20);
        ctx.strokeRect(60, 80, 20, 20);
        ctx.fillRect(120, 80, 20, 20);
        ctx.strokeRect(120, 80, 20, 20);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
    
    /**
     * Get emotion color
     */
    getEmotionColor(emotion) {
        const colors = {
            happy: '#FFD700',
            sad: '#4169E1',
            angry: '#FF4500',
            neutral: '#808080',
            crying: '#1E90FF',
            yelling: '#DC143C'
        };
        return colors[emotion] || '#808080';
    }
    
    /**
     * Get asset by key
     */
    getAsset(key) {
        return this.assets.get(key) || null;
    }
    
    /**
     * Get character emotion asset
     */
    getCharacterEmotion(emotion) {
        const asset = this.getAsset(`characters.emotions.${emotion}`);
        if (asset) return asset;
        
        // Use stick figure placeholder
        return basicPlaceholderAssets.getEmotionPlaceholder(emotion);
    }
    
    /**
     * Get character body language asset
     */
    getCharacterBodyLanguage(pose) {
        return this.getAsset(`characters.bodyLanguage.${pose}`) || 
               this.getAsset('characters.base');
    }
    
    /**
     * Get location background
     */
    getLocationBackground(locationId) {
        const asset = this.getAsset(`backgrounds.locations.${locationId}`);
        if (asset) return asset;
        
        // Use house placeholder for now
        return basicPlaceholderAssets.getHousePlaceholder();
    }
    
    /**
     * Get location icon
     */
    getLocationIcon(locationId) {
        return this.getAsset(`icons.locations.${locationId}`) || null;
    }
    
    /**
     * Get map icon
     */
    getMapIcon(type) {
        return this.getAsset(`icons.map.${type}`) || null;
    }
    
    /**
     * Check if assets are loaded
     */
    isLoaded() {
        return this.loaded;
    }
    
    /**
     * Get load progress (0-100)
     */
    getLoadProgress() {
        return this.loadProgress;
    }
}
