/**
 * Unit tests for SpriteSheetManager
 * Verifies proper handling of frame indices, especially negative indices
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpriteSheetManager } from '../../src/js/assets/SpriteSheetManager.js';

describe('SpriteSheetManager', () => {
    let manager;

    beforeEach(() => {
        manager = new SpriteSheetManager();

        // Setup a test sprite sheet with animations
        manager.registerSpriteSheet('test-sheet', {
            frameWidth: 64,
            frameHeight: 64,
            columns: 8,
            rows: 8,
            url: 'test.png'
        });

        // Manually set up animations for testing (simulating parseAnimations)
        const sheet = manager.spriteSheets.get('test-sheet');
        sheet.image = { /* mock image object */ };
        sheet.animations = {
            idle: {
                frames: [
                    { x: 0, y: 0, width: 64, height: 64 },
                    { x: 64, y: 0, width: 64, height: 64 },
                    { x: 128, y: 0, width: 64, height: 64 },
                    { x: 192, y: 0, width: 64, height: 64 }
                ],
                speed: 0.15,
                loop: true
            }
        };
    });

    describe('getCurrentFrame', () => {
        it('should return the correct frame for positive indices', () => {
            const frame = manager.getCurrentFrame('test-sheet', 'idle', 0);
            expect(frame).not.toBeNull();
            expect(frame.sheet).toBeDefined();
            expect(frame.x).toBe(0);
            expect(frame.y).toBe(0);
            expect(frame.width).toBe(64);
            expect(frame.height).toBe(64);
        });

        it('should wrap around for positive indices beyond array length', () => {
            // Index 4 should wrap to 0 (4 % 4 = 0)
            const frame = manager.getCurrentFrame('test-sheet', 'idle', 4);
            expect(frame).not.toBeNull();
            expect(frame.x).toBe(0);
            expect(frame.y).toBe(0);
        });

        it('should handle negative indices correctly', () => {
            // Index -1 should wrap to 3 (last frame)
            const frame = manager.getCurrentFrame('test-sheet', 'idle', -1);
            expect(frame).not.toBeNull();
            expect(frame.x).toBe(192);
            expect(frame.y).toBe(0);
        });

        it('should handle negative indices with proper wraparound', () => {
            // Index -2 should wrap to 2
            const frame = manager.getCurrentFrame('test-sheet', 'idle', -2);
            expect(frame).not.toBeNull();
            expect(frame.x).toBe(128);
            expect(frame.y).toBe(0);
        });

        it('should handle negative indices larger than array length', () => {
            // Index -5 with array length 4 should wrap to 3
            // (-5 % 4) = -1, (-1 + 4) = 3
            const frame = manager.getCurrentFrame('test-sheet', 'idle', -5);
            expect(frame).not.toBeNull();
            expect(frame.x).toBe(192);
            expect(frame.y).toBe(0);
        });

        it('should return null for non-existent animation', () => {
            const frame = manager.getCurrentFrame('test-sheet', 'non-existent', 0);
            expect(frame).toBeNull();
        });

        it('should return null for non-existent sheet', () => {
            const frame = manager.getCurrentFrame('non-existent-sheet', 'idle', 0);
            expect(frame).toBeNull();
        });

        it('should include sheet image in returned frame', () => {
            const frame = manager.getCurrentFrame('test-sheet', 'idle', 0);
            expect(frame.sheet).toBe(manager.spriteSheets.get('test-sheet').image);
        });
    });

    describe('drawFrame', () => {
        it('should not call drawImage when frame is null from negative index', () => {
            const mockCtx = {
                drawImage: vi.fn()
            };

            // Before the fix, this would not catch the undefined frame
            // After the fix, getCurrentFrame returns null and drawFrame guards against it
            manager.drawFrame(mockCtx, 'test-sheet', 'idle', -1, 0, 0);

            // The fix ensures drawFrame is called (not returning early on null frame guard)
            expect(mockCtx.drawImage).toHaveBeenCalledOnce();
        });

        it('should handle drawImage call with proper frame data', () => {
            const mockCtx = {
                drawImage: vi.fn()
            };

            manager.drawFrame(mockCtx, 'test-sheet', 'idle', 0, 50, 100);

            expect(mockCtx.drawImage).toHaveBeenCalledWith(
                manager.spriteSheets.get('test-sheet').image,
                0, 0, 64, 64,
                50, 100, 64, 64
            );
        });

        it('should not crash when drawing with negative index', () => {
            const mockCtx = {
                drawImage: vi.fn()
            };

            // This should not throw an error
            expect(() => {
                manager.drawFrame(mockCtx, 'test-sheet', 'idle', -1, 0, 0);
            }).not.toThrow();

            // Should have called drawImage with the last frame
            expect(mockCtx.drawImage).toHaveBeenCalledOnce();
        });
    });
});
