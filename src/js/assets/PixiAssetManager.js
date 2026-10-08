/**
 * PixiAssetManager.js
 * Replaces custom AssetManager with PixiJS Assets API
 * Phase 4: Code Reduction - Using PixiJS Assets instead of custom loading
 */

import { Assets } from 'pixi.js';

// Keys inside a manifest descriptor that describe an asset rather than point at one (#2299)
const METADATA_KEYS = new Set(['type', 'frameWidth', 'frameHeight', 'columns', 'rows', 'meta']);

/**
 * Bundle layout for an AssetManager.getAssetManifest()-shaped manifest (#2297):
 * [bundle name, alias prefix, function that picks the section from the manifest]
 */
const BUNDLES = [
    ['characters', 'characters', m => m.characters],
    ['locations', 'locations', m => m.backgrounds?.locations ?? m.locations],
    ['backgrounds', 'backgrounds', m => {
        const { locations, ...rest } = m.backgrounds || {};
        return rest;
    }],
    ['map', 'map', m => m.map],
    ['ui', 'icons', m => m.icons ?? m.ui]
];

// Pixi's Assets.init() may only run once per page, so the flag is shared by every instance (#68)
let sharedManifest = null;

export class PixiAssetManager {
    constructor(assets = Assets) {
        this.assets = assets;
        this.manifest = null;
        this.loaded = false;
        this.loadProgress = 0;
        this.failed = [];
    }

    /**
     * Register the manifest with PixiJS Assets. It used to check `Assets.cache`,
     * which Pixi always sets, so init() returned before calling Assets.init (#68).
     */
    async init(manifest = {}) {
        if (sharedManifest && this.assets === Assets) {
            this.manifest = sharedManifest;
            return true;
        }
        if (this.manifest) return true;

        const bundles = PixiAssetManager.buildBundles(manifest, this);
        try {
            await this.assets.init({ manifest: { bundles } });
        } catch (error) {
            if (!error?.message?.includes('already initialized')) {
                console.warn('Asset initialization failed:', error);
                return false;
            }
        }
        this.manifest = { bundles };
        if (this.assets === Assets) sharedManifest = this.manifest;
        return true;
    }

    /** Build Pixi bundles whose aliases match the getters (#1054, #2297, #2298) */
    static buildBundles(manifest = {}, converter = PixiAssetManager.prototype) {
        return BUNDLES
            .map(([name, prefix, pick]) => ({
                name,
                assets: converter.convertManifestToAssets(pick(manifest || {}) || {}, prefix)
            }))
            .filter(bundle => bundle.assets.length > 0);
    }

    /**
     * Turn a nested manifest into Pixi asset entries. A descriptor object with a
     * `url`/`src` is ONE asset, and metadata fields such as `type: 'spriteSheet'`
     * are not loadable paths (#2299). `path` seeds the alias prefix (#2298).
     */
    convertManifestToAssets(obj, path = '') {
        const assets = [];
        if (!obj || typeof obj !== 'object') return assets;

        for (const key of Object.keys(obj)) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string') {
                if (METADATA_KEYS.has(key)) continue;
                assets.push({ alias: currentPath, src: value });
            } else if (value && typeof value === 'object') {
                const src = typeof value.url === 'string' ? value.url
                    : typeof value.src === 'string' ? value.src : null;
                if (src) {
                    const data = { ...value };
                    delete data.url;
                    delete data.src;
                    assets.push({ alias: currentPath, src, data });
                } else {
                    assets.push(...this.convertManifestToAssets(value, currentPath));
                }
            }
        }

        return assets;
    }

    /**
     * Load every registered asset. A missing file is recorded and skipped
     * instead of failing the whole bundle.
     */
    async loadAll() {
        if (!this.manifest) {
            console.error('Manifest not initialized');
            return false;
        }

        const entries = this.manifest.bundles.flatMap(bundle => bundle.assets);
        let done = 0;
        this.failed = [];
        await Promise.all(entries.map(async (entry) => {
            try {
                await this.assets.load(entry.alias);
            } catch {
                this.failed.push(entry.alias);
            }
            done++;
            this.loadProgress = entries.length ? Math.round((done / entries.length) * 100) : 100;
        }));

        this.loadProgress = 100;
        this.loaded = true;
        return this.failed.length < entries.length || entries.length === 0;
    }

    /**
     * Load a single asset
     * Phase 4: Uses PixiJS Assets.load()
     */
    async loadAsset(src) {
        try {
            const texture = await this.assets.load(src);
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
            const textures = await this.assets.load(sources);
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
            return this.assets.get(alias) || null;
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
        this.assets.backgroundLoadBundle?.(bundleNames);
    }

    /**
     * Unload assets to free memory
     */
    async unload(bundleName) {
        try {
            await this.assets.unloadBundle(bundleName);
        } catch (error) {
            console.warn(`Failed to unload bundle: ${bundleName}`, error);
        }
    }

    /**
     * Get loading progress
     */
    getProgress() {
        return this.loaded ? 100 : this.loadProgress;
    }

    /** Test hook: forget the shared Assets.init() state */
    static resetForTests() {
        sharedManifest = null;
    }
}
