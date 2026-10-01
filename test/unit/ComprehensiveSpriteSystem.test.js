/**
 * Unit tests for ComprehensiveSpriteSystem
 *
 * Issue #2542: Tests verify that ComprehensiveSpriteSystem can be imported and
 * initialized without errors, despite the fact that EmotionSpriteMapper and
 * BodyLanguageMapper do not exist in the repository.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComprehensiveSpriteSystem } from '../../src/js/assets/ComprehensiveSpriteSystem.js';

describe('ComprehensiveSpriteSystem', () => {
    let spriteSystem;
    let mockAssetManager;
    let mockSpriteSheetManager;

    beforeEach(() => {
        mockAssetManager = {
            loadAsset: vi.fn()
        };
        mockSpriteSheetManager = {
            registerSpriteSheet: vi.fn()
        };
        spriteSystem = new ComprehensiveSpriteSystem(mockAssetManager, mockSpriteSheetManager);
    });

    describe('initialization', () => {
        it('should instantiate without import errors', () => {
            // DEFECT ON MAIN: ComprehensiveSpriteSystem imports non-existent modules
            // (EmotionSpriteMapper, BodyLanguageMapper) which causes build-time errors
            // FIX: Removed these imports so the class can be instantiated
            expect(spriteSystem).toBeDefined();
            expect(spriteSystem.assetManager).toBe(mockAssetManager);
            expect(spriteSystem.spriteSheetManager).toBe(mockSpriteSheetManager);
        });

        it('should initialize async method without throwing', async () => {
            // This confirms the initialize() method exists and doesn't throw
            // even though emotion/body-language sprite loading is no longer functional
            await expect(spriteSystem.initialize()).resolves.toBeUndefined();
        });
    });

    describe('emotion and pose handling (stubbed due to missing mappers)', () => {
        it('should return empty emotions array', () => {
            // EmotionSpriteMapper doesn't exist, so getAllEmotions returns empty
            const emotions = spriteSystem.getAllEmotions();
            expect(emotions).toEqual([]);
            expect(emotions).toHaveLength(0);
        });

        it('should return empty poses array', () => {
            // BodyLanguageMapper doesn't exist, so getAllPoses returns empty
            const poses = spriteSystem.getAllPoses();
            expect(poses).toEqual([]);
            expect(poses).toHaveLength(0);
        });

        it('should report 100% load progress when no sprites to load', () => {
            // Since mappers don't exist and nothing loads sprites, progress is 100%
            expect(spriteSystem.getLoadProgress()).toBe(100);
        });
    });

    describe('sprite methods', () => {
        it('should get sprite from cache or null if not loaded', () => {
            expect(spriteSystem.getSprite('test_key')).toBeNull();
        });

        it('should check if sprite is loaded', () => {
            expect(spriteSystem.isSpriteLoaded('test_key')).toBe(false);
        });

        it('should return null for emotion sprites when none are loaded', () => {
            expect(spriteSystem.getEmotionSprite('happy')).toBeNull();
        });

        it('should return null for body language sprites when none are loaded', () => {
            expect(spriteSystem.getBodyLanguageSprite('standing')).toBeNull();
        });

        it('should return null for combined sprites when either component is missing', () => {
            expect(spriteSystem.getCombinedSprite('happy', 'standing')).toBeNull();
        });
    });
});
