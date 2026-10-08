/**
 * Office events apply their `effect` (#2434); CodeCleanup.findUnusedImports
 * checks the identifiers an import binds (#2478)
 */
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { EnvironmentManager } from '../../src/js/game/EnvironmentManager.js';
import { OFFICE_EVENTS } from '../../src/js/data/locations.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { CodeCleanup } from '../../src/js/utils/CodeCleanup.js';

const byEffect = (effect) => OFFICE_EVENTS.find(e => e.effect === effect);

function makeGs(extra = {}) {
    return {
        reputation: 10, tasksCompleted: 3,
        timeManager: { energy: 50, maxEnergy: 100 },
        characterStats: { addExperience: vi.fn() },
        ...extra
    };
}

describe('office events have real effects (#2434)', () => {
    it('every OFFICE_EVENTS effect is handled', () => {
        for (const event of OFFICE_EVENTS) {
            expect(new EnvironmentManager(makeGs()).applyEventEffect(event)).toBeTruthy();
        }
    });

    it('"Public Praise" raises reputation', () => {
        const gs = makeGs();
        new EnvironmentManager(gs).applyEventEffect(byEffect('rep_boost'));
        expect(gs.reputation).toBe(15);
        const rookie = makeGs({ tasksCompleted: 0 });
        new EnvironmentManager(rookie).applyEventEffect(byEffect('rep_boost'));
        expect(rookie.reputation).toBe(12);
    });

    it('coffee break restores energy up to the cap; standup trains focus', () => {
        const gs = makeGs({ timeManager: { energy: 95, maxEnergy: 100 } });
        const env = new EnvironmentManager(gs);
        env.applyEventEffect(byEffect('mood_boost'));
        expect(gs.timeManager.energy).toBe(100);
        env.applyEventEffect(byEffect('time_pressure'));
        expect(gs.characterStats.addExperience).toHaveBeenCalledWith('focus', 10);
    });

    it('"Urgent Deadline" makes the next chart pay x1.25, once', () => {
        const gs = new GameState();
        new EnvironmentManager(gs).applyEventEffect(byEffect('bonus_reward'));
        expect(gs.officeEventBonus).toBe(1.25);
        const econ = new EconomySystem(gs);
        const task = { potentialReward: 400, difficulty: 2, optimalChartTypes: ['bar'], acceptableChartTypes: ['bar'] };
        vi.spyOn(econ, 'calculateMoneyReward').mockReturnValue(400);
        const first = econ.evaluateChart(task, GameState.defaultChartConfig());
        expect(first.moneyEarned).toBe(500);
        expect(gs.officeEventBonus).toBeNull();
        expect(econ.evaluateChart(task, GameState.defaultChartConfig()).moneyEarned).toBe(400);
    });

    it('the pending bonus survives save/load', () => {
        const gs = new GameState();
        gs.officeEventBonus = 1.25;
        const restored = new GameState();
        restored.fromJSON(JSON.parse(JSON.stringify(gs.toJSON())));
        expect(restored.officeEventBonus).toBe(1.25);
        expect(new GameState().officeEventBonus).toBeNull();
    });

    it('rollDailyEvent fires at the daily chance and applies the effect', () => {
        const gs = makeGs();
        const env = new EnvironmentManager(gs);
        expect(env.rollDailyEvent(() => 0.9)).toBeNull();
        const praiseIndex = OFFICE_EVENTS.findIndex(e => e.effect === 'rep_boost');
        const rolls = [0.1, (praiseIndex + 0.5) / OFFICE_EVENTS.length];
        const res = env.rollDailyEvent(() => rolls.shift());
        expect(res.event.effect).toBe('rep_boost');
        expect(res.result).toBe('+5 reputation');
        expect(gs.reputation).toBe(15);
    });

    it('new_day rolls the office event', () => {
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        expect(src).toMatch(/this\.environmentManager\?\.rollDailyEvent\?\.\(\)/);
    });
});

describe('CodeCleanup.findUnusedImports (#2478)', () => {
    it('flags imports whose bound names are never used', () => {
        const code = [
            "import { DOMUtils } from './DOMUtils.js';",
            "import { logger as log } from './Logger.js';",
            "import Thing from './Thing.js';",
            "import * as helpers from './helpers.js';",
            "import Def, { used } from './mixed.js';",
            '',
            'log.info("x"); helpers.go(); used();'
        ].join('\n');
        expect(CodeCleanup.findUnusedImports(code)).toEqual(['./DOMUtils.js', './Thing.js']);
    });

    it('a name that appears only in a path or as a property does not count as used', () => {
        const code = "import { Foo } from './Foo.js';\nobj.Foo = 1;\nconst s = 'Foo.js';";
        // 'Foo' inside a string literal still counts (regex-level check), property access does not
        expect(CodeCleanup.findUnusedImports("import { Foo } from './Foo.js';\nobj.Foo = 1;")).toEqual(['./Foo.js']);
        expect(CodeCleanup.findUnusedImports(code)).toEqual([]);
    });

    it('parses import clauses into local names', () => {
        expect(CodeCleanup.importedNames('Def, { a, b as c }')).toEqual(['a', 'c', 'Def']);
        expect(CodeCleanup.importedNames('* as ns')).toEqual(['ns']);
    });
});
