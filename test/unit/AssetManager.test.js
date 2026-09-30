/**
 * Unit tests for AssetManager
 */

import { describe, it, expect } from 'vitest';
import { AssetManager } from '../../src/js/assets/AssetManager.js';

describe('AssetManager', () => {
    let assetManager;

    beforeEach(() => {
        assetManager = new AssetManager();
    });

    describe('public API', () => {
        it('should have getAssetManifest method', () => {
            expect(typeof assetManager.getAssetManifest).toBe('function');
        });

        it('should have loadAll method', () => {
            expect(typeof assetManager.loadAll).toBe('function');
        });

        it('should have getAsset method', () => {
            expect(typeof assetManager.getAsset).toBe('function');
        });

        it('should have getLocationBackground method', () => {
            expect(typeof assetManager.getLocationBackground).toBe('function');
        });

        it('should not have getCharacterEmotion method', () => {
            expect(typeof assetManager.getCharacterEmotion).toBe('undefined');
        });

        it('should not have getCharacterBodyLanguage method', () => {
            expect(typeof assetManager.getCharacterBodyLanguage).toBe('undefined');
        });

        it('should not have getLocationIcon method', () => {
            expect(typeof assetManager.getLocationIcon).toBe('undefined');
        });

        it('should not have getNPCIcon method', () => {
            expect(typeof assetManager.getNPCIcon).toBe('undefined');
        });

        it('should not have getUIIcon method', () => {
            expect(typeof assetManager.getUIIcon).toBe('undefined');
        });

        it('should not have getVehicleIcon method', () => {
            expect(typeof assetManager.getVehicleIcon).toBe('undefined');
        });

        it('should not have getItemIcon method', () => {
            expect(typeof assetManager.getItemIcon).toBe('undefined');
        });

        it('should not have getFeatureIcon method', () => {
            expect(typeof assetManager.getFeatureIcon).toBe('undefined');
        });

        it('should not have getChartIcon method', () => {
            expect(typeof assetManager.getChartIcon).toBe('undefined');
        });

        it('should not have getMapIcon method', () => {
            expect(typeof assetManager.getMapIcon).toBe('undefined');
        });

        it('should not have isLoaded method', () => {
            expect(typeof assetManager.isLoaded).toBe('undefined');
        });

        it('should not have getLoadProgress method', () => {
            expect(typeof assetManager.getLoadProgress).toBe('undefined');
        });
    });

    describe('getAssetManifest', () => {
        it('should return a valid manifest object', () => {
            const manifest = assetManager.getAssetManifest();
            expect(manifest).toBeDefined();
            expect(typeof manifest).toBe('object');
        });

        it('should have characters section', () => {
            const manifest = assetManager.getAssetManifest();
            expect(manifest.characters).toBeDefined();
        });

        it('should have backgrounds section', () => {
            const manifest = assetManager.getAssetManifest();
            expect(manifest.backgrounds).toBeDefined();
        });

        it('should have icons section', () => {
            const manifest = assetManager.getAssetManifest();
            expect(manifest.icons).toBeDefined();
        });

        it('should have map section', () => {
            const manifest = assetManager.getAssetManifest();
            expect(manifest.map).toBeDefined();
        });
    });

    describe('getAsset', () => {
        it('should return null for non-existent asset', () => {
            const asset = assetManager.getAsset('non.existent.asset');
            expect(asset).toBeNull();
        });

        it('should return asset if it exists', () => {
            const mockImage = new Image();
            assetManager.assets.set('test.asset', mockImage);
            const asset = assetManager.getAsset('test.asset');
            expect(asset).toBe(mockImage);
        });
    });
});
