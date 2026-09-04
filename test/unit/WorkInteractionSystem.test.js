/**
 * Unit tests for WorkInteractionSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';

describe('WorkInteractionSystem', () => {
    let system;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            reputation: 0,
            jobSystem: { completedTasks: [] }
        };
        system = new WorkInteractionSystem(mockGameState);
    });

    describe('askForPromotion', () => {
        it('should clamp promotionReadiness at 100 when repeatedly asking past the natural cap', () => {
            // Put the boss in the "readiness > 60" branch but not promotable
            system.boss.promotionReadiness = 95;
            system.boss.relationship = 30; // below 60, so promotion never succeeds

            for (let i = 0; i < 50; i++) {
                const result = system.askForPromotion();
                expect(result.newPromotionReadiness).toBeLessThanOrEqual(100);
                expect(system.boss.promotionReadiness).toBeLessThanOrEqual(100);
            }

            expect(system.boss.promotionReadiness).toBe(100);
        });

        it('should clamp promotionReadiness at 100 in the low-readiness branch too', () => {
            system.boss.promotionReadiness = 96;
            system.boss.relationship = 30;

            // readiness > 60 branch adds 10 -> would be 106 without clamp
            const result = system.askForPromotion();
            expect(result.newPromotionReadiness).toBe(100);
        });

        it('should reset promotionReadiness to 0 on a successful promotion', () => {
            system.boss.promotionReadiness = 90;
            system.boss.relationship = 70;
            mockGameState.reputation = 600;
            mockGameState.jobSystem.completedTasks = new Array(25).fill('task');

            const result = system.askForPromotion();
            expect(result.success).toBe(true);
            expect(result.newPromotionReadiness).toBe(0);
        });
    });

    describe('increasePromotionReadiness', () => {
        it('should clamp at 100', () => {
            system.boss.promotionReadiness = 95;
            system.increasePromotionReadiness(10);
            expect(system.boss.promotionReadiness).toBe(100);
        });
    });
});
