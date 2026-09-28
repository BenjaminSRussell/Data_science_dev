import { describe, it, expect, beforeEach } from 'vitest';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { JobSystem } from '../../src/js/game/JobSystem.js';

describe('WorkInteractionSystem.askForPromotion', () => {
    let gameState;
    let work;

    // Everything a promotion needs; each test then takes one thing away
    beforeEach(() => {
        gameState = new GameState();
        gameState.jobSystem = new JobSystem(gameState);
        gameState.reputation = 501;
        for (let i = 0; i < 21; i++) {
            gameState.jobSystem.completedTasks.push({ taskId: 'data_entry' });
        }
        work = new WorkInteractionSystem(gameState);
        work.boss.promotionReadiness = 81;
        work.boss.relationship = 61;
    });

    it('promotes when every requirement is met', () => {
        const result = work.askForPromotion();

        expect(result.success).toBe(true);
        expect(gameState.reputation).toBe(601);
        expect(work.boss.promotionReadiness).toBe(0);
    });

    it('blames the relationship when only the relationship is short', () => {
        work.boss.relationship = 60;

        const result = work.askForPromotion();

        expect(result.success).toBe(false);
        expect(result.message).toBe("Your boss doesn't trust you enough yet. Build a stronger relationship before asking again.");
    });

    it('blames reputation when only reputation is short', () => {
        gameState.reputation = 500;

        const result = work.askForPromotion();

        expect(result.success).toBe(false);
        expect(result.message).toBe("You need a stronger reputation in the field before you're ready for this role.");
    });

    it('blames the number of projects when only completed tasks are short', () => {
        gameState.jobSystem.completedTasks.pop();

        const result = work.askForPromotion();

        expect(result.success).toBe(false);
        expect(result.message).toBe("You haven't completed enough projects yet. Finish more tasks to prove you're ready.");
    });

    it('says the player is close when only readiness is short and above 60', () => {
        work.boss.promotionReadiness = 70;

        const result = work.askForPromotion();

        expect(result.success).toBe(false);
        expect(result.message).toBe("Not quite yet, but you're close. Keep up the good work and check back in a few weeks.");
        expect(work.boss.promotionReadiness).toBe(80);
    });

    it('asks for more experience when several things are short and readiness is low', () => {
        work.boss.promotionReadiness = 10;
        gameState.reputation = 0;

        const result = work.askForPromotion();

        expect(result.success).toBe(false);
        expect(result.message).toBe("I appreciate your ambition, but you need more experience. Focus on your current role first.");
        expect(work.boss.promotionReadiness).toBe(15);
    });
});
