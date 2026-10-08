/**
 * One salary-multiplier derivation shared by EconomySystem and TaskSystem (#1314)
 */
import { describe, it, expect, vi } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';

describe('EconomySystem.salaryMultiplierFor', () => {
    it('reads the rank multiplier and defaults bad values to 1', () => {
        expect(EconomySystem.salaryMultiplierFor({ salaryMultiplier: 2.5 })).toBe(2.5);
        expect(EconomySystem.salaryMultiplierFor(null)).toBe(1);
        expect(EconomySystem.salaryMultiplierFor({})).toBe(1);
        expect(EconomySystem.salaryMultiplierFor({ salaryMultiplier: 0 })).toBe(1);
        expect(EconomySystem.salaryMultiplierFor({ salaryMultiplier: -3 })).toBe(1);
        expect(EconomySystem.salaryMultiplierFor({ salaryMultiplier: NaN })).toBe(1);
    });

    it('getSalaryMultiplier delegates to it', () => {
        const eco = new EconomySystem({ currentRank: { salaryMultiplier: 3 } });
        expect(eco.getSalaryMultiplier()).toBe(3);
    });

    it('TaskSystem task pay goes through the shared helper', () => {
        const spy = vi.spyOn(EconomySystem, 'salaryMultiplierFor');
        const rank = { salaryMultiplier: 2 };
        const ts = new TaskSystem({ rankIndex: 0, currentRank: rank, currentTask: null });
        ts.updateDataTable = () => {};
        const template = { id: 't', title: 'T', description: 'd', difficulty: 3, chartType: 'bar', dataType: 'sales' };
        const task = ts.createTaskFromTemplate(template, { name: 'Boss', title: 'Lead', taskIntro: 'Hi' });
        expect(spy).toHaveBeenCalledWith(rank);
        expect(task.potentialReward).toBe(Math.round(100 * 2 + 3 * 20));
        spy.mockRestore();
    });
});
