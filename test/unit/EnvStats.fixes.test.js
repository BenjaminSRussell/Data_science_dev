import { describe, it, expect, vi } from 'vitest';
import { CharacterStats, STATS } from '../../src/js/game/CharacterStats.js';
import { GameEndingSystem } from '../../src/js/game/GameEndingSystem.js';
import { ScreenThemeManager } from '../../src/js/game/ScreenThemeManager.js';
import { EnvironmentManager } from '../../src/js/game/EnvironmentManager.js';

describe('CharacterStats / ending stats fixes', () => {
    it('stamina starts trainable and gains levels (#992)', () => {
        const cs = new CharacterStats();
        expect(cs.getStat('stamina')).toBeLessThan(STATS.stamina.maxLevel);
        const before = cs.getStat('stamina');
        cs.addExperience('stamina', 10000);
        expect(cs.getStat('stamina')).toBeGreaterThan(before);
    });

    it('ending skill stats use real stat ids (#1140)', () => {
        const cs = new CharacterStats();
        cs.stats.analytics = 42;
        const ges = new GameEndingSystem({ characterStats: cs });
        const skills = ges.getSkillStats();
        expect(Object.keys(skills).sort()).toEqual(Object.keys(STATS).sort());
        expect(skills.analytics).toBe(42);
        expect(Object.values(skills).every(v => v > 0)).toBe(true);
    });
});

describe('ScreenThemeManager keeps the office background (#1731)', () => {
    it('layers the office background on the game screen only', () => {
        document.body.innerHTML = '<div id="game-container"></div><div id="screen-game"></div>';
        const env = new EnvironmentManager({ rankIndex: 0, tasksCompleted: 0 });
        env.updateLocation();
        const spy = vi.spyOn(env, 'getBackground');
        const stm = new ScreenThemeManager(env);
        spy.mockClear();
        stm.applyTheme('screen-game');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.results[0].value).toContain('home.png');
        stm.applyTheme('screen-menu');
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe('CharacterStats has one charisma (#1719)', () => {
    it('no parallel skills table', () => {
        const cs = new CharacterStats();
        expect(cs.skills).toBeUndefined();
        expect(cs.getStat('charisma')).toBe(10);
    });
});
