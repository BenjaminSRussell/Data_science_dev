/**
 * AI intelligenceRating changes cleaning, modeling, and a complex contract (#1806).
 * Creativity on game-dev stages stays as wired in #2418.
 */
import { describe, it, expect } from 'vitest';
import { AISystem, INTELLIGENCE_ERROR_CUT, MODELING_INTELLIGENCE_FACTOR } from '../../src/js/game/AISystem.js';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';

function state(withAi = false) {
    const gameState = {
        money: 0,
        reputation: 0,
        unlockedLibraries: [],
        characterStats: { stats: { luck: 0 }, getStat: () => 0, addExperience: () => {}, modifyEthics: () => {} }
    };
    if (withAi) gameState.aiSystem = new AISystem(gameState);
    return gameState;
}

function stageProject(type) {
    return {
        stages: [{ type, name: type, maxProgress: 500 }],
        currentStageIndex: 0,
        stageProgress: 0,
        totalProgress: 0
    };
}

describe('AI intelligenceRating affects work (#1806)', () => {
    it('adds the rating on cleaning, half of it on modeling, and nothing on scraping', () => {
        const ai = new AISystem({});
        expect(ai.intelligenceRating).toBe(1.5);
        expect(ai.modifiersForStage({ type: 'cleaning' })).toEqual({
            work: 1.5,
            errorCut: 1.5 * INTELLIGENCE_ERROR_CUT
        });
        expect(ai.modifiersForStage({ type: 'modeling' }).work).toBeCloseTo(1.5 * MODELING_INTELLIGENCE_FACTOR, 5);
        expect(ai.modifiersForStage({ type: 'scraping' })).toEqual({ work: 0, errorCut: 0 });
        expect(ai.modifiersForStage({ type: 'game_dev' })).toEqual({ work: 0, errorCut: 0 });

        const gs = state(true);
        const ps = new ProjectSystem(gs);

        ps.activeProject = stageProject('cleaning');
        ps.workOnProject(10);
        // 10 work + processingPower 1.5 + rating 1.5
        expect(ps.activeProject.stageProgress).toBeCloseTo(13, 5);

        ps.activeProject = stageProject('modeling');
        ps.workOnProject(10);
        // 10 + 1.5 + 0.75
        expect(ps.activeProject.stageProgress).toBeCloseTo(12.25, 5);

        ps.activeProject = stageProject('scraping');
        ps.workOnProject(10);
        expect(ps.activeProject.stageProgress).toBeCloseTo(11.5, 5);
    });

    it('a sharper companion avoids a cleaning bug a fresh one still hits', () => {
        const freshState = state(true);
        const fresh = new ProjectSystem(freshState);
        fresh.activeProject = stageProject('cleaning');
        // chance 0.20 - 1.5 * 0.02 = 0.17; 0.15 still bugs and wastes half the tick
        fresh.workOnProject(10, () => 0.15);
        expect(fresh.activeProject.cleaningBugs).toBe(1);
        expect(fresh.activeProject.stageProgress).toBeCloseTo(6.5, 5);

        const sharpState = state(true);
        sharpState.aiSystem.intelligence = 10; // rating 10.5, cut > 0.20
        const sharp = new ProjectSystem(sharpState);
        sharp.activeProject = stageProject('cleaning');
        sharp.workOnProject(10, () => 0.15);
        expect(sharp.activeProject.cleaningBugs).toBeUndefined();
        // 10 + processingPower 1.5 + rating 10.5
        expect(sharp.activeProject.stageProgress).toBeCloseTo(22, 5);
    });

    it('leaves the published bug chance alone when there is no companion', () => {
        const ps = new ProjectSystem(state(false));
        ps.activeProject = stageProject('cleaning');
        ps.workOnProject(10, () => 0);
        expect(ps.activeProject.stageProgress).toBe(5);
        expect(ps.activeProject.cleaningBugs).toBe(1);
    });

    it('hides the complex audit until intelligenceRating reaches 4', () => {
        const locked = new ProjectSystem(state(false));
        expect(locked.availableContracts.map(c => c.id)).not.toContain('complex_model_audit');
        expect(locked.startProject('complex_model_audit').success).toBe(false);

        const gs = state(true);
        const ps = new ProjectSystem(gs);
        expect(ps.availableContracts.map(c => c.id)).not.toContain('complex_model_audit');
        expect(ps.startProject('complex_model_audit').success).toBe(false);

        gs.aiSystem.intelligence = 3; // rating 3.5
        ps.refreshContracts();
        expect(ps.availableContracts.map(c => c.id)).not.toContain('complex_model_audit');

        gs.aiSystem.intelligence = 4; // rating 4.5
        ps.refreshContracts();
        expect(ps.availableContracts.map(c => c.id)).toContain('complex_model_audit');
        expect(ps.startProject('complex_model_audit').success).toBe(true);
        expect(ps.activeProject.stages[0].type).toBe('cleaning');
        expect(ps.activeProject.stages[1].type).toBe('modeling');
    });
});
