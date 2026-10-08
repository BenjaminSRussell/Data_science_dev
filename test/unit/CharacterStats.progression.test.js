/**
 * CharacterStats leveling, evolution and ethics (#394)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';

describe('CharacterStats progression', () => {
    let cs;
    beforeEach(() => { cs = new CharacterStats(); });

    describe('checkEvolution (net-worth fallback)', () => {
        it('stays at level 1 below $5,000', () => {
            expect(cs.checkEvolution(4999)).toEqual({ evolved: false });
        });
        it('good path at ethics >= 50, evil below', () => {
            cs.ethics = 50;
            expect(cs.checkEvolution(5000)).toEqual({ evolved: true, stage: 'level_2_good' });
            const evil = new CharacterStats();
            evil.ethics = 49;
            expect(evil.checkEvolution(5000).stage).toBe('level_2_evil');
        });
        it('level 2 -> level 3 at $50,000, and a repeat call does not re-evolve', () => {
            cs.ethics = 60;
            cs.checkEvolution(5000);
            expect(cs.checkEvolution(50000)).toEqual({ evolved: true, stage: 'level_3_good' });
            expect(cs.checkEvolution(50000)).toEqual({ evolved: false });
        });
        it('follows VisualProgressionSystem tiers when given', () => {
            cs.ethics = 80;
            expect(cs.checkEvolution(0, { currentTier: 'premium' }).stage).toBe('level_3_good');
            expect(cs.checkEvolution(0, { currentTier: 'basic' }).stage).toBe('level_1');
        });
    });

    describe('modifyEthics', () => {
        it('clamps to [-100, 100]', () => {
            cs.ethics = 90; cs.modifyEthics(50);
            expect(cs.ethics).toBe(100);
            cs.ethics = -90; cs.modifyEthics(-50);
            expect(cs.ethics).toBe(-100);
        });
        it('dropping below -50 switches to the expensive suit', () => {
            cs.ethics = -40; cs.modifyEthics(-20);
            expect(cs.ethics).toBe(-60);
            expect(cs.visuals.clothes).toBe('expensive_suit');
        });
        it('ignores non-numeric amounts instead of producing NaN', () => {
            cs.ethics = 10;
            cs.modifyEthics(undefined);
            cs.modifyEthics('abc');
            expect(cs.ethics).toBe(10);
        });
    });

    describe('addExperience / getXPForNextLevel', () => {
        it('getXPForNextLevel = floor(100 * 1.1^level)', () => {
            expect(cs.getXPForNextLevel('intelligence')).toBe(Math.floor(100 * Math.pow(1.1, 10)));
            cs.stats.intelligence = 20;
            expect(cs.getXPForNextLevel('intelligence')).toBe(Math.floor(100 * Math.pow(1.1, 20)));
        });
        it('unknown stat does nothing', () => {
            expect(cs.addExperience('juggling', 100)).toEqual({ leveled: false });
        });
        it('small amounts accumulate without leveling', () => {
            expect(cs.addExperience('intelligence', 10)).toMatchObject({ leveled: false, levelsGained: 0, newLevel: 10 });
            expect(cs.xp.intelligence).toBe(10);
        });
        it('large amounts gain several levels', () => {
            const r = cs.addExperience('intelligence', 2000);
            expect(r.leveled).toBe(true);
            expect(r.levelsGained).toBeGreaterThan(1);
            expect(cs.stats.intelligence).toBe(10 + r.levelsGained);
        });
        it('luck stops at its max level of 50 with xp pinned', () => {
            cs.stats.luck = 49;
            const r = cs.addExperience('luck', 1e9);
            expect(cs.stats.luck).toBe(50);
            expect(r.levelsGained).toBe(1);
            expect(cs.xp.luck).toBe(cs.getXPForNextLevel('luck'));
        });
        it('negative or NaN amounts are ignored', () => {
            cs.addExperience('focus', 30);
            cs.addExperience('focus', -100);
            cs.addExperience('focus', NaN);
            expect(cs.xp.focus).toBe(30);
            expect(cs.stats.focus).toBe(10);
        });
    });
});
