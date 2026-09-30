/**
 * Unit tests for UIUpdater
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { HARDWARE_PARTS, HARDWARE_TYPES } from '../../src/js/game/HardwareSystems.js';

describe('UIUpdater', () => {
    let uiUpdater;
    let mockGame;

    beforeEach(() => {
        mockGame = {
            gameState: {
                hardwareManager: null,
                currentRank: null
            },
            gameStore: null
        };

        // Mock LitUIManager to avoid DOM dependencies
        vi.mock('../../src/js/ui/LitUIManager.js', () => ({
            LitUIManager: vi.fn(() => ({
                initialize: vi.fn()
            }))
        }));

        uiUpdater = new UIUpdater(mockGame);
    });

    describe('renderPartStats', () => {
        it('should render Case stat keys (aesthetics, airflow, noise_dampening)', () => {
            // Get a real Case part from HardwareSystems.js
            const beigeCasepart = HARDWARE_PARTS[HARDWARE_TYPES.CASE][0]; // beige_box
            const result = uiUpdater.renderPartStats(beigeCasepart);

            // Should contain the stats formatted properly
            expect(result).toContain('Aesthetics:');
            expect(result).toContain('0');
            expect(result).toContain('Noise Dampening:');
        });

        it('should render noise_dampening stat from Case', () => {
            const beigeCasePart = HARDWARE_PARTS[HARDWARE_TYPES.CASE][0]; // beige_box with noise_dampening: 2
            const result = uiUpdater.renderPartStats(beigeCasePart);

            expect(result).toContain('Noise Dampening:');
            expect(result).toContain('2');
        });

        it('should render airflow stat from Case', () => {
            const blackTowerPart = HARDWARE_PARTS[HARDWARE_TYPES.CASE][1]; // black_tower with airflow: 3
            const result = uiUpdater.renderPartStats(blackTowerPart);

            expect(result).toContain('Airflow:');
            expect(result).toContain('3');
        });

        it('should not render empty div for Case parts', () => {
            const beigeCasePart = HARDWARE_PARTS[HARDWARE_TYPES.CASE][0];
            const result = uiUpdater.renderPartStats(beigeCasePart);

            // Should not be an empty equipment-bonus div
            expect(result).not.toBe('<div class="equipment-bonus"></div>');
            // Should have content
            expect(result.trim().length).toBeGreaterThan('<div class="equipment-bonus"></div>'.length);
        });

        it('should render vram: 0 for integrated GPU', () => {
            // Get the integrated GPU part which has vram: 0
            const integratedGPU = HARDWARE_PARTS[HARDWARE_TYPES.GPU][0]; // gpu_integrated with vram: 0
            const result = uiUpdater.renderPartStats(integratedGPU);

            // Should include VRAM line even though vram is 0
            expect(result).toContain('VRAM:');
            expect(result).toContain('0');
            expect(result).toContain('VRAM: 0GB');
        });

        it('should render vram: 2 for basic GPU upgrade', () => {
            const basicGPU = HARDWARE_PARTS[HARDWARE_TYPES.GPU][1]; // gpu_gt1030 with vram: 2
            const result = uiUpdater.renderPartStats(basicGPU);

            expect(result).toContain('VRAM: 2GB');
        });

        it('should render multiple stats together', () => {
            const gpuPart = HARDWARE_PARTS[HARDWARE_TYPES.GPU][0]; // gpu_integrated
            const result = uiUpdater.renderPartStats(gpuPart);

            // Should have both compute and vram
            expect(result).toContain('Compute:');
            expect(result).toContain('VRAM:');
        });

        it('should only render stats that are defined (not undefined)', () => {
            // Create a part with selective stats
            const testPart = {
                stats: {
                    cooling: 2,
                    vram: 0,
                    undefined_stat: undefined
                }
            };
            const result = uiUpdater.renderPartStats(testPart);

            // Should render cooling and vram
            expect(result).toContain('Cooling:');
            expect(result).toContain('VRAM:');
            // Should not try to render undefined_stat
            expect(result).not.toContain('undefined_stat');
        });
    });
});
