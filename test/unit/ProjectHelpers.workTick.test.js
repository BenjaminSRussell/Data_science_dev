import { describe, it, expect, beforeEach } from 'vitest';
import { simulateWorkTick } from '../../src/js/helpers/ProjectHelpers.js';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';
import { GameState } from '../../src/js/game/GameState.js';
import { CONTRACTS } from '../../src/js/game/ProjectDatabase.js';

describe('simulateWorkTick', () => {
    let game;

    beforeEach(() => {
        const gameState = new GameState();
        game = {
            gameState,
            characterStats: new CharacterStats(),
            projectSystem: new ProjectSystem(gameState)
        };
        game.characterStats.stats.intelligence = 10;
        game.characterStats.stats.focus = 0;
        game.characterStats.stats.stamina = 0;
        game.projectSystem.startProject(CONTRACTS[0].id);
    });

    it('adds one point of progress at intelligence 10 with no speed bonus', () => {
        simulateWorkTick(game);

        expect(game.projectSystem.activeProject.stageProgress).toBeCloseTo(1, 10);
    });

    it('works 0.8% faster per point of focus', () => {
        game.characterStats.stats.focus = 50;

        simulateWorkTick(game);

        expect(game.projectSystem.activeProject.stageProgress).toBeCloseTo(1.4, 10);
    });

    it('works 0.2% faster per point of stamina', () => {
        game.characterStats.stats.stamina = 100;

        simulateWorkTick(game);

        expect(game.projectSystem.activeProject.stageProgress).toBeCloseTo(1.2, 10);
    });
});
