/**
 * GameAssetLoader.js
 * Loads assets from game_asset_manifest.json
 * Integrates all downloaded Low-poly assets into the game
 */

export class GameAssetLoader {
    constructor() {
        this.manifest = null;
        this.assets = new Map();
        this.loaded = false;
        this.loadProgress = 0;
    }

    /**
     * Load game asset manifest
     */
    async loadManifest() {
        try {
            const response = await fetch('/game_asset_manifest.json');
            this.manifest = await response.json();
            return true;
        } catch (error) {
            // Manifest not found, will use fallback assets
            return false;
        }
    }

    /**
     * Get random character sprite
     */
    getRandomCharacter() {
        if (!this.manifest?.characters) return null;
        
        const characters = Object.keys(this.manifest.characters);
        if (characters.length === 0) return null;
        
        const randomKey = characters[Math.floor(Math.random() * characters.length)];
        const character = this.manifest.characters[randomKey];
        
        return character?.path || null;
    }

    /**
     * Get character by index
     */
    getCharacter(index) {
        if (!this.manifest?.characters) return null;
        
        const characters = Object.keys(this.manifest.characters);
        if (index >= characters.length) return null;
        
        const key = characters[index];
        const character = this.manifest.characters[key];
        
        return character?.path || null;
    }

    /**
     * Get backdrop for location
     */
    getLocationBackdrop(locationId) {
        if (!this.manifest?.backdrops) return null;
        
        const location = this.manifest.backdrops[locationId];
        if (!location || location.length === 0) return null;
        
        // Return random backdrop for this location
        const randomIndex = Math.floor(Math.random() * location.length);
        return location[randomIndex]?.path || null;
    }

    /**
     * Get random icon (item or feature)
     */
    getRandomIcon(type = 'items') {
        if (!this.manifest?.icons) return null;
        
        const icons = this.manifest.icons[type === 'items' ? 'items' : 'features'];
        if (!icons) return null;
        
        const iconKeys = Object.keys(icons);
        if (iconKeys.length === 0) return null;
        
        const randomKey = iconKeys[Math.floor(Math.random() * iconKeys.length)];
        const icon = icons[randomKey];
        
        return icon?.path || null;
    }

    /**
     * Get icon by index
     */
    getIcon(index, type = 'items') {
        if (!this.manifest?.icons) return null;
        
        const icons = this.manifest.icons[type === 'items' ? 'items' : 'features'];
        if (!icons) return null;
        
        const iconKeys = Object.keys(icons);
        if (index >= iconKeys.length) return null;
        
        const key = iconKeys[index];
        const icon = icons[key];
        
        return icon?.path || null;
    }

    /**
     * Get random UI element
     */
    getRandomUIElement() {
        if (!this.manifest?.ui_elements) return null;
        
        const elements = Object.keys(this.manifest.ui_elements);
        if (elements.length === 0) return null;
        
        const randomKey = elements[Math.floor(Math.random() * elements.length)];
        const element = this.manifest.ui_elements[randomKey];
        
        return element?.path || null;
    }

    /**
     * Get random particle
     */
    getRandomParticle() {
        if (!this.manifest?.particles) return null;
        
        const particles = Object.keys(this.manifest.particles);
        if (particles.length === 0) return null;
        
        const randomKey = particles[Math.floor(Math.random() * particles.length)];
        const particle = this.manifest.particles[randomKey];
        
        return particle?.path || null;
    }

    /**
     * Get map asset
     */
    getMapAsset(assetName) {
        if (!this.manifest?.map_assets) return null;
        
        const asset = this.manifest.map_assets[assetName];
        return asset?.path || null;
    }

    /**
     * Get vehicle
     */
    getVehicle(index) {
        if (!this.manifest?.vehicles) return null;
        
        const vehicles = Object.keys(this.manifest.vehicles);
        if (index >= vehicles.length) return null;
        
        const key = vehicles[index];
        const vehicle = this.manifest.vehicles[key];
        
        return vehicle?.path || null;
    }

    /**
     * Load image asset
     */
    async loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    /**
     * Preload assets (optional - for better performance)
     */
    async preloadAssets(count = 50) {
        const loaded = [];
        
        // Preload some characters
        for (let i = 0; i < Math.min(count, 20); i++) {
            const path = this.getCharacter(i);
            if (path) {
                const img = await this.loadImage(path);
                if (img) loaded.push(img);
            }
        }
        
        // Preload some icons
        for (let i = 0; i < Math.min(count, 10); i++) {
            const path = this.getIcon(i, 'items');
            if (path) {
                const img = await this.loadImage(path);
                if (img) loaded.push(img);
            }
        }
        
        return loaded;
    }
}

