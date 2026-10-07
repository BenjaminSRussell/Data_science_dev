/**
 * Unit tests for AISystem
 * Tests hardware installation and slot expansion
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AISystem } from '../../src/js/game/AISystem.js';
import { AI_HARDWARE } from '../../src/js/data/aiHardware.js';

describe('AISystem', () => {
    let aiSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {};
        aiSystem = new AISystem(mockGameState);
    });

    describe('processingPower', () => {
        it('should calculate base processing power from speed', () => {
            aiSystem.speed = 1;
            const expectedPower = (1 * 1.5); // speed * 1.5
            expect(aiSystem.processingPower).toBe(expectedPower);
        });

        it('should increase when hardware is installed', () => {
            const basePower = aiSystem.processingPower;
            const gpu = AI_HARDWARE.GPU[0];
            aiSystem.installHardware(gpu);
            const newPower = aiSystem.processingPower;
            expect(newPower).toBeGreaterThan(basePower);
        });

        it('should sum multipliers from all installed hardware', () => {
            aiSystem.speed = 1;
            const gpu1 = AI_HARDWARE.GPU[0];
            const gpu2 = AI_HARDWARE.GPU[1];

            aiSystem.installHardware(gpu1);
            aiSystem.expandSlots();
            aiSystem.installHardware(gpu2);

            const hardwareBonus = gpu1.multiplier + gpu2.multiplier;
            const expectedPower = (1 * 1.5) + (hardwareBonus * 2);
            expect(aiSystem.processingPower).toBe(expectedPower);
        });
    });

    describe('installHardware', () => {
        it('should add hardware to inventory', () => {
            const gpu = AI_HARDWARE.GPU[0];
            const result = aiSystem.installHardware(gpu);
            expect(result.success).toBe(true);
            expect(aiSystem.hardware).toContain(gpu);
        });

        it('should fail when no slots available', () => {
            // Start with 1 slot
            expect(aiSystem.slots).toBe(1);

            const gpu1 = AI_HARDWARE.GPU[0];
            const gpu2 = AI_HARDWARE.GPU[1];

            const result1 = aiSystem.installHardware(gpu1);
            expect(result1.success).toBe(true);

            const result2 = aiSystem.installHardware(gpu2);
            expect(result2.success).toBe(false);
            expect(result2.reason).toContain('No empty');
        });

        it('should succeed when slots are expanded', () => {
            const gpu1 = AI_HARDWARE.GPU[0];
            const gpu2 = AI_HARDWARE.GPU[1];

            aiSystem.installHardware(gpu1);
            aiSystem.expandSlots();

            const result = aiSystem.installHardware(gpu2);
            expect(result.success).toBe(true);
            expect(aiSystem.hardware.length).toBe(2);
        });
    });

    describe('expandSlots', () => {
        it('should increase slot count', () => {
            const initialSlots = aiSystem.slots;
            aiSystem.expandSlots();
            expect(aiSystem.slots).toBe(initialSlots + 1);
        });

        it('should allow more hardware to be installed', () => {
            const gpu1 = AI_HARDWARE.GPU[0];
            const gpu2 = AI_HARDWARE.GPU[1];
            const gpu3 = AI_HARDWARE.GPU[2];

            aiSystem.installHardware(gpu1);
            expect(aiSystem.slots).toBe(1);

            aiSystem.expandSlots();
            aiSystem.expandSlots();
            expect(aiSystem.slots).toBe(3);

            const result2 = aiSystem.installHardware(gpu2);
            const result3 = aiSystem.installHardware(gpu3);

            expect(result2.success).toBe(true);
            expect(result3.success).toBe(true);
            expect(aiSystem.hardware.length).toBe(3);
        });
    });

    describe('serialization', () => {
        it('should preserve hardware in toJSON', () => {
            const gpu = AI_HARDWARE.GPU[0];
            aiSystem.installHardware(gpu);
            aiSystem.expandSlots();

            const json = aiSystem.toJSON();
            expect(json.hardware).toContain(gpu);
            expect(json.slots).toBe(2);
        });

        it('should restore hardware from JSON', () => {
            const gpu = AI_HARDWARE.GPU[0];
            aiSystem.installHardware(gpu);
            aiSystem.expandSlots();

            const json = aiSystem.toJSON();
            const newSystem = new AISystem({});
            newSystem.fromJSON(json);

            expect(newSystem.hardware).toEqual(aiSystem.hardware);
            expect(newSystem.slots).toBe(aiSystem.slots);
            expect(newSystem.processingPower).toBe(aiSystem.processingPower);
        });
    });
});
