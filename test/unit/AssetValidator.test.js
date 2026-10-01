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
        it('should not make network requests for known-missing sprite assets', async () => {
            const results = await assetValidator.validateSprites();

            // Should have at least 2 known-missing assets (the common sprites)
            expect(results.knownMissing).toBeGreaterThanOrEqual(2);

            // Should not have attempted network requests for known-missing assets
            expect(results.errors.length).toBeLessThan(results.total);
        });

        it('should track known-missing assets separately from unexpected failures', async () => {
            const results = await assetValidator.validateSprites();

            expect(results).toHaveProperty('knownMissing');
            expect(results).toHaveProperty('failed');
            expect(results).toHaveProperty('loaded');

            // known-missing should be >= 2 (character_sheet.png and emotion_sheet.png)
            expect(results.knownMissing).toBeGreaterThanOrEqual(2);
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

            // The two known sprite sheets should be in knownMissing
            expect(results.knownMissing).toBeGreaterThanOrEqual(2);
        });
    });
});
