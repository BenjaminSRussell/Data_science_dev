import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetValidator } from '../../src/js/dev/AssetValidator.js';

describe('AssetValidator', () => {
    let validator;
    let mockGame;
    let mockAssetManager;

    beforeEach(() => {
        // Create a mock asset manager with a manifest
        mockAssetManager = {
            getAssetManifest: vi.fn(() => ({
                characters: {
                    spriteSheets: {
                        main: {
                            url: '/assets/characters/sprites/player_sheet.png',
                            frameWidth: 64,
                            frameHeight: 64
                        },
                        emotions: {
                            url: '/assets/characters/sprites/emotion_sheet.png',
                            frameWidth: 64,
                            frameHeight: 64
                        }
                    },
                    // Low-poly character sprites (using available NPC assets as fallback)
                    base: '/assets/npcs/player_young.png',
                    walk: '/assets/npcs/alex_young.png',
                    idle: '/assets/npcs/mentor_0.png'
                }
            }))
        };

        // Create a mock game object
        mockGame = {
            assetManager: mockAssetManager
        };

        // Create validator instance
        validator = new AssetValidator(mockGame);
    });

    describe('getSpritePaths', () => {
        it('should include spriteSheet paths from manifest', () => {
            const paths = validator.getSpritePaths();
            expect(paths).toContain('/assets/characters/sprites/player_sheet.png');
        });

        it('should drop manifest sprite sheets listed in MissingAssetBlocklist (#2542)', () => {
            const paths = validator.getSpritePaths();
            expect(paths).not.toContain('/assets/characters/sprites/emotion_sheet.png');
        });

        it('should include base, walk, and idle sprite paths from manifest', () => {
            const paths = validator.getSpritePaths();
            expect(paths).toContain('/assets/npcs/player_young.png');
            expect(paths).toContain('/assets/npcs/alex_young.png');
            expect(paths).toContain('/assets/npcs/mentor_0.png');
        });

        it('should handle missing base, walk, or idle sprites gracefully', () => {
            // Override manifest to not have base/walk/idle
            mockAssetManager.getAssetManifest = vi.fn(() => ({
                characters: {
                    spriteSheets: {
                        main: {
                            url: '/assets/characters/sprites/player_sheet.png'
                        }
                    }
                    // No base, walk, idle
                }
            }));

            const paths = validator.getSpritePaths();
            expect(paths).toEqual(['/assets/characters/sprites/player_sheet.png']);
        });

        it('should not add the removed hard-coded sprite sheets (#2542)', () => {
            const paths = validator.getSpritePaths();
            expect(paths).not.toContain('/assets/characters/sprites/character_sheet.png');
            expect(paths).not.toContain('/assets/characters/sprites/emotion_sheet.png');
        });

        it('should not duplicate paths', () => {
            const paths = validator.getSpritePaths();
            const uniquePaths = new Set(paths);
            expect(paths.length).toBe(uniquePaths.size);
        });

        it('should handle non-string base/walk/idle values gracefully', () => {
            // Override manifest with non-string values
            mockAssetManager.getAssetManifest = vi.fn(() => ({
                characters: {
                    spriteSheets: {
                        main: {
                            url: '/assets/characters/sprites/player_sheet.png'
                        }
                    },
                    base: { url: '/some/path' }, // Object instead of string
                    walk: null, // null value
                    idle: undefined // undefined value
                }
            }));

            const paths = validator.getSpritePaths();
            // Should only include the spriteSheet paths, not the non-string base/walk/idle
            expect(paths).toEqual(['/assets/characters/sprites/player_sheet.png']);
            // Should not include the object/null/undefined values
            expect(paths).not.toContain(undefined);
            expect(paths).not.toContain(null);
        });

        it('should work when game or assetManager is null', () => {
            const nullValidator = new AssetValidator(null);
            const paths = nullValidator.getSpritePaths();
            // No manifest and no hard-coded fallbacks (#2542): nothing to validate
            expect(paths).toEqual([]);
        });
    });
});
