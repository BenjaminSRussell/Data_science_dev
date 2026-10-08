/**
 * checkForCharacterEvolution() existed but was never called, so the
 * player's look never left level_1 (#1230)
 */
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';

const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');

describe('character evolution is wired (#1230)', () => {
    it('task rewards and the milestone tick both check for evolution', () => {
        const body = src.slice(src.indexOf('    applyTaskRewards(score) {'));
        const rewards = body.slice(0, body.indexOf('\n    }\n'));
        expect(rewards).toContain('this.checkForCharacterEvolution?.()');
        expect(src).toMatch(/checkMilestones\(\);\s*\n\s*\/\/[^\n]*\n\s*this\.checkForCharacterEvolution\?\.\(\);/);
    });

    it('a wealth-tier change evolves the stage once, with a toast', () => {
        const characterStats = new CharacterStats();
        const visualProgressionSystem = { currentTier: 'mid' };
        const fake = {
            gameState: { characterStats, money: 6000, visualProgressionSystem },
            showToast: vi.fn(),
            audioManager: { play: vi.fn() }
        };
        MainGame.prototype.checkForCharacterEvolution.call(fake);
        expect(characterStats.visualStage).toBe('level_2_neutral');
        expect(fake.showToast).toHaveBeenCalledTimes(1);
        MainGame.prototype.checkForCharacterEvolution.call(fake);
        expect(fake.showToast).toHaveBeenCalledTimes(1);
    });
});
