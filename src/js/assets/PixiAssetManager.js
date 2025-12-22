/**
 * PixiAssetManager.js
 * Replaces custom AssetManager with PixiJS Assets API
 * Phase 4: Code Reduction - Using PixiJS Assets instead of custom loading
 */

import { Assets } from 'pixi.js';

export class PixiAssetManager {
    constructor() {
        this.manifest = null;
        this.loaded = false;
        this.loadProgress = 0;
    }

    /**
     * Initialize asset manifest
     * Phase 4: Uses PixiJS Assets manifest system
     */
    async init(manifest) {
        // Check if Assets is already initialized
        if (Assets.cache) {
            // Assets already initialized, just return success
            return true;
        }

        this.manifest = {
            bundles: [
                {
                    name: 'characters',
                    assets: this.convertManifestToAssets(manifest.characters || {})
                },
                {
                    name: 'locations',
                    assets: this.convertManifestToAssets(manifest.locations || {})
                },
                {
                    name: 'ui',
                    assets: this.convertManifestToAssets(manifest.ui || {})
                }
            ]
        };

        try {
            await Assets.init({ manifest: this.manifest });
            return true;
        } catch (error) {
            // If error is about already being initialized, that's fine
            if (error.message && error.message.includes('already initialized')) {
                return true;
            }
            console.warn('Asset initialization failed:', error);
            return false;
        }
    }

    /**
     * Convert old manifest format to PixiJS Assets format
     */
    convertManifestToAssets(obj, path = '') {
        const assets = [];
        
        for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof obj[key] === 'string') {
                // It's an asset path
                assets.push({
                    alias: currentPath,
                    src: obj[key]
                });
            } else if (typeof obj[key] === 'object') {
                // It's a nested object - recurse
                assets.push(...this.convertManifestToAssets(obj[key], currentPath));
            }
        }
        
        return assets;
    }

    /**
     * Load all assets
     * Phase 4: Uses PixiJS Assets.loadBundle()
     */
    async loadAll() {
        if (!this.manifest) {
            console.error('Manifest not initialized');
            return false;
        }

        try {
            // Load all bundles
            for (const bundle of this.manifest.bundles) {
                await Assets.loadBundle(bundle.name);
            }
            
            this.loaded = true;
            return true;
        } catch (error) {
            console.warn('Asset loading failed:', error);
            this.loaded = true; // Mark as loaded anyway
            return false;
        }
    }

    /**
     * Load a single asset
     * Phase 4: Uses PixiJS Assets.load()
     */
    async loadAsset(src) {
        try {
            const texture = await Assets.load(src);
            return texture;
        } catch (error) {
            console.warn(`Failed to load asset: ${src}`, error);
            return null;
        }
    }

    /**
     * Load multiple assets
     */
    async loadAssets(sources) {
        try {
            const textures = await Assets.load(sources);
            return textures;
        } catch (error) {
            console.warn('Failed to load assets:', error);
            return {};
        }
    }

    /**
     * Get asset by alias
     */
    getAsset(alias) {
        try {
            return Assets.get(alias) || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get character emotion asset
     */
    getCharacterEmotion(emotion) {
        return this.getAsset(`characters.emotions.${emotion}`);
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
        return this.getAsset(`locations.${locationId}`);
    }

    /**
     * Background load assets (non-blocking)
     */
    backgroundLoad(bundleNames) {
        Assets.backgroundLoadBundle(bundleNames);
    }

    /**
     * Unload assets to free memory
     */
    async unload(bundleName) {
        try {
            await Assets.unloadBundle(bundleName);
        } catch (error) {
            console.warn(`Failed to unload bundle: ${bundleName}`, error);
        }
    }

    /**
     * Get loading progress
     */
    getProgress() {
        // PixiJS Assets doesn't expose progress directly
        // Can be enhanced with custom tracking if needed
        return this.loaded ? 100 : 0;
    }
}
