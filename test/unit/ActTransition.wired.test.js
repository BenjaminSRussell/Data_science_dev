/**
 * The act recap screen was imported by main.js but never constructed, so
 * StorylineManager.checkPhaseTransition() never had one to show (#256)
 */
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ActTransitionScreen } from '../../src/js/ui/ActTransitionScreen.js';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';

describe('act transition screen is wired (#256)', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('MainGame constructs an ActTransitionScreen', () => {
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        expect(src).toMatch(/this\.actTransitionScreen\s*=\s*new ActTransitionScreen\(this\)/);
    });

    it('a phase change shows the recap overlay through mainGame.actTransitionScreen', () => {
        const gameState = {
            money: 0, reputation: 0,
            characterStats: { ethics: 0 },
            timeManager: { totalDays: 0 },
            npcManager: { getMetNPCs: () => [] }
        };
        const sm = new StorylineManager(gameState);
        gameState.storylineManager = sm;
        sm.initialize();
        const game = { gameState };
        gameState.mainGame = { actTransitionScreen: new ActTransitionScreen(game) };

        gameState.timeManager.totalDays = 40;
        const result = sm.checkPhaseTransition();
        expect(result).toMatchObject({ phaseChanged: true, oldPhase: 'early', newPhase: 'mid' });
        expect(document.querySelector('.act-transition-overlay')).not.toBeNull();
    });
});
