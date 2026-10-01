import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetValidator } from '../../src/js/dev/AssetValidator.js';

describe('AssetValidator', () => {
    let assetValidator;
    let mockGame;

    beforeEach(() => {
        mockGame = {
            assetManager: null,
            audioManager: null
        };
        assetValidator = new AssetValidator(mockGame);
    });

    describe('validateImage', () => {
        it('should skip validation for known-missing assets without making network requests', async () => {
            const result = await assetValidator.validateImage('/assets/characters/sprites/character_sheet.png');
            expect(result.isKnownMissing).toBe(true);
            expect(result.error).toBe('Known missing');
            expect(result.loaded).toBe(false);
        });

        it('should skip validation for emotion_sheet.png which is known to be missing', async () => {
            const result = await assetValidator.validateImage('/assets/characters/sprites/emotion_sheet.png');
            expect(result.isKnownMissing).toBe(true);
            expect(result.error).toBe('Known missing');
        });

        it('should handle path normalization for known-missing assets', async () => {
            // Without leading slash
            const result = await assetValidator.validateImage('assets/characters/sprites/character_sheet.png');
            expect(result.isKnownMissing).toBe(true);
        });
    });

    describe('validateSprites', () => {
        // #2542 removed the hard-coded character_sheet/emotion_sheet paths and
        // filters blocklisted manifest sheets out of getSpritePaths(), so
        // known-missing sprite sheets never reach the network at all.
        it('should not make network requests for known-missing sprite assets', async () => {
            mockGame.assetManager = {
                getAssetManifest: () => ({
                    characters: {
                        spriteSheets: {
                            legacy: { url: '/assets/characters/sprites/character_sheet.png' },
                            emotions: { url: '/assets/characters/sprites/emotion_sheet.png' }
                        }
                    }
                })
            };
            const validateImage = vi.spyOn(assetValidator, 'validateImage');

            const results = await assetValidator.validateSprites();

            expect(validateImage).not.toHaveBeenCalled();
            expect(results.total).toBe(0);
            expect(results.errors).toEqual([]);
        });

        it('should track known-missing assets separately from unexpected failures', async () => {
            const results = await assetValidator.validateSprites();

            expect(results).toHaveProperty('knownMissing');
            expect(results).toHaveProperty('failed');
            expect(results).toHaveProperty('loaded');
            expect(results.failed).toBe(0);
        });
    });

    describe('validateImages', () => {
        it('should include knownMissing in results', async () => {
            const results = await assetValidator.validateImages();

            expect(results).toHaveProperty('knownMissing');
            expect(typeof results.knownMissing).toBe('number');
        });
    });

    describe('validateAudio', () => {
        it('should skip validation for known-missing audio files', async () => {
            const results = await assetValidator.validateAudio();

            expect(results).toHaveProperty('knownMissing');
            expect(typeof results.knownMissing).toBe('number');
        });
    });

    describe('validateAll', () => {
        it('should aggregate knownMissing counts from all asset types', async () => {
            const results = await assetValidator.validateAll();

            expect(results).toHaveProperty('knownMissing');
            expect(results.knownMissing).toBeGreaterThanOrEqual(0);

            // knownMissing should be sum of sprites, images, and audio known-missing
            const expectedKnownMissing = (results.sprites?.knownMissing || 0) +
                                        (results.images?.knownMissing || 0) +
                                        (results.audio?.knownMissing || 0);
            expect(results.knownMissing).toBe(expectedKnownMissing);
        });

        it('should differentiate between loaded, failed, and known-missing assets', async () => {
            const results = await assetValidator.validateAll();

            // At minimum should track all three categories
            expect(results).toHaveProperty('loaded');
            expect(results).toHaveProperty('failed');
            expect(results).toHaveProperty('knownMissing');

            // Known-missing assets never count as failures
            expect(results.failed).toBe(0);
        });
    });
});
