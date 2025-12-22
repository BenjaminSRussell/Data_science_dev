/**
 * AssetIntegrationSystem.js
 * Integrates all downloaded assets into the game
 * Ensures proper sizing and positioning
 */

import { GameAssetLoader } from '../assets/GameAssetLoader.js';

export class AssetIntegrationSystem {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.gameAssetLoader = new GameAssetLoader();
        this.initialized = false;
    }

    /**
     * Initialize asset integration
     */
    async initialize() {
        if (this.initialized) return;
        
        await this.gameAssetLoader.loadManifest();
        this.initialized = true;
    }

    /**
     * Get character sprite with proper sizing
     */
    getCharacterSprite(characterId, container) {
        if (!this.initialized) return null;
        
        const spritePath = this.gameAssetLoader.getCharacter(characterId % 1000);
        if (!spritePath) return null;
        
        const img = document.createElement('img');
        img.src = spritePath;
        img.className = 'character-sprite';
        img.style.cssText = `
            width: 128px;
            height: 128px;
            object-fit: contain;
            object-position: center bottom;
            image-rendering: auto;
        `;
        
        return img;
    }

    /**
     * Get location backdrop with proper sizing
     */
    getLocationBackdrop(locationId, container) {
        if (!this.initialized) return null;
        
        const backdropPath = this.gameAssetLoader.getLocationBackdrop(locationId);
        if (!backdropPath) return null;
        
        const img = document.createElement('img');
        img.src = backdropPath;
        img.className = 'location-backdrop';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
        `;
        
        return img;
    }

    /**
     * Get icon with proper sizing
     */
    getIcon(iconType, index = null) {
        if (!this.initialized) return null;
        
        const iconPath = index !== null 
            ? this.gameAssetLoader.getIcon(index, iconType)
            : this.gameAssetLoader.getRandomIcon(iconType);
        
        if (!iconPath) return null;
        
        const img = document.createElement('img');
        img.src = iconPath;
        img.className = 'game-icon';
        img.style.cssText = `
            width: 64px;
            height: 64px;
            object-fit: contain;
            object-position: center center;
            image-rendering: auto;
        `;
        
        return img;
    }

    /**
     * Get UI element with proper sizing
     */
    getUIElement(index = null) {
        if (!this.initialized) return null;
        
        const elementPath = this.gameAssetLoader.getRandomUIElement();
        if (!elementPath) return null;
        
        const img = document.createElement('img');
        img.src = elementPath;
        img.className = 'ui-element';
        img.style.cssText = `
            width: 128px;
            height: 128px;
            object-fit: contain;
            object-position: center center;
            image-rendering: auto;
        `;
        
        return img;
    }

    /**
     * Get particle effect with proper sizing
     */
    getParticle() {
        if (!this.initialized) return null;
        
        const particlePath = this.gameAssetLoader.getRandomParticle();
        if (!particlePath) return null;
        
        const img = document.createElement('img');
        img.src = particlePath;
        img.className = 'particle-effect';
        img.style.cssText = `
            width: 32px;
            height: 32px;
            object-fit: contain;
            object-position: center center;
            image-rendering: auto;
        `;
        
        return img;
    }

    /**
     * Get map asset with proper sizing
     */
    getMapAsset(assetName) {
        if (!this.initialized) return null;
        
        const assetPath = this.gameAssetLoader.getMapAsset(assetName);
        if (!assetPath) return null;
        
        const img = document.createElement('img');
        img.src = assetPath;
        img.className = 'map-asset';
        img.style.cssText = `
            width: 128px;
            height: 128px;
            object-fit: cover;
            object-position: center center;
            image-rendering: auto;
        `;
        
        return img;
    }
}


