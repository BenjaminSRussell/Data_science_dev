/**
 * Unit tests for AssetValidator
 *
 * Issue #2542: Tests verify that AssetValidator properly filters out known missing
 * sprite sheet paths (character_sheet.png, emotion_sheet.png, and tier-based sheets)
 * when validating assets.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AssetValidator } from '../../src/js/dev/AssetValidator.js';
import { isAssetMissing } from '../../src/js/assets/MissingAssetBlocklist.js';

describe('AssetValidator', () => {
    let assetValidator;
    let mockGame;

    beforeEach(() => {
        mockGame = {
            assetManager: {
                getAssetManifest: () => ({
                    characters: {
                        spriteSheets: {}
                    }
                })
            }
        };
        assetValidator = new AssetValidator(mockGame);
    });

    describe('getSpritePaths - filtering out missing assets', () => {
        it('should filter out known missing sprite sheet paths from validation', () => {
            // DEFECT ON MAIN: getSpritePaths() includes paths that don't exist:
            // - /assets/characters/sprites/character_sheet.png
            // - /assets/characters/sprites/emotion_sheet.png
            // FIX: Use isAssetMissing() to filter them out

            const paths = assetValidator.getSpritePaths();

            // Verify that known missing paths are not in the returned list
            const knownMissingPaths = [
                'assets/characters/sprites/character_sheet.png',
                'assets/characters/sprites/emotion_sheet.png',
                'assets/characters/sprites/basic_character_sheet.png',
                'assets/characters/sprites/mid_character_sheet.png',
                'assets/characters/sprites/premium_character_sheet.png'
            ];

            knownMissingPaths.forEach(missingPath => {
                // The missing paths should NOT be in the validated paths list
                // because getSpritePaths filters using isAssetMissing()
                expect(paths).not.toContain(`/${missingPath}`);
                expect(paths).not.toContain(missingPath);
            });
        });

        it('should correctly identify all known missing sprite sheet assets', () => {
            // Verify isAssetMissing correctly identifies the problematic paths
            expect(isAssetMissing('assets/characters/sprites/character_sheet.png')).toBe(true);
            expect(isAssetMissing('assets/characters/sprites/emotion_sheet.png')).toBe(true);
            expect(isAssetMissing('assets/characters/sprites/basic_character_sheet.png')).toBe(true);
            expect(isAssetMissing('assets/characters/sprites/mid_character_sheet.png')).toBe(true);
            expect(isAssetMissing('assets/characters/sprites/premium_character_sheet.png')).toBe(true);
        });

        it('should handle paths with leading slash correctly', () => {
            // AssetValidator may provide paths with or without leading slashes
            // isAssetMissing should handle both
            expect(isAssetMissing('/assets/characters/sprites/character_sheet.png')).toBe(true);
            expect(isAssetMissing('assets/characters/sprites/character_sheet.png')).toBe(true);
        });
    });

    describe('DevMenu asset validation', () => {
        it('should skip validation of known missing assets', () => {
            // DevMenu.validateAssets() uses isAssetMissing to skip known missing paths
            // This prevents spurious 404 errors in the dev console when validating
            const spriteSheets = [
                '/assets/characters/sprites/character_sheet.png',
                '/assets/characters/sprites/emotion_sheet.png'
            ];

            spriteSheets.forEach(url => {
                // Verify the asset is marked as missing so DevMenu can skip it
                expect(isAssetMissing(url)).toBe(true);
            });
        });
    });
});
