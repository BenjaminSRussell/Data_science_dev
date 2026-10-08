import { describe, it, expect, beforeEach } from 'vitest';
import { StatisticsAggregator } from '../../src/js/ui/StatisticsAggregator.js';
import { MenuLogoDisplay } from '../../src/js/ui/MenuLogoDisplay.js';
import { SaveManager } from '../../src/js/save/SaveManager.js';

function fakeManager(slots) {
    let reads = 0;
    return {
        revision: 0,
        get reads() { return reads; },
        getSaveData: (i) => { reads++; return slots[i] || null; }
    };
}

const save = (state, timestamp = 1000) => ({ timestamp, state });

describe('StatisticsAggregator cluster', () => {
    beforeEach(() => localStorage.clear());

    it('#1631 formatPlaytime never shows 24h or 60m', () => {
        const agg = new StatisticsAggregator(fakeManager([]));
        expect(agg.formatPlaytime(47.6)).toBe('2d');
        expect(agg.formatPlaytime(25.4)).toBe('1d 1h');
        expect(agg.formatPlaytime(1.995)).toBe('2h');
        expect(agg.formatPlaytime(23.995)).toBe('1d');
        expect(agg.formatPlaytime(167.8)).toBe('1w');
    });

    it('#1630 a duplicated slot counts once', () => {
        const run = { startTime: 1, money: 500, tasksCompleted: 10, rankIndex: 6, reputation: 10 };
        const other = { startTime: 2, money: 100, tasksCompleted: 1, rankIndex: 0, reputation: 1 };
        const agg = new StatisticsAggregator(fakeManager([save(run, 10), save({ ...run, money: 700 }, 20), save(other, 5)]));
        const stats = agg.calculate();
        expect(stats.totalMoney).toBe(800); // newest copy (700) + other run (100)
        expect(stats.gamesCompleted).toBe(1);
        expect(stats.sessions).toBe(2);
    });

    it('#140 getStats reuses the cache until the save slots change', () => {
        const mgr = fakeManager([save({ startTime: 1, money: 5 })]);
        const agg = new StatisticsAggregator(mgr);
        agg.getStats();
        const reads = mgr.reads;
        agg.getStats();
        expect(mgr.reads).toBe(reads);
        mgr.revision++;
        agg.getStats();
        expect(mgr.reads).toBeGreaterThan(reads);
    });

    it('#140 SaveManager bumps its revision on writes', () => {
        const sm = new SaveManager();
        const before = sm.revision;
        sm.saveGame({ toJSON: () => ({ money: 1 }) }, 0);
        sm.clearSave(0);
        expect(sm.revision).toBeGreaterThanOrEqual(before + 2);
    });

    it('#1629 the menu logo uses the dashboard numbers and playtime formula', () => {
        const mgr = fakeManager([save({ startTime: 1, money: 900, tasksCompleted: 30, rankIndex: 1, timeManager: { totalDays: 40 }, completedAchievements: ['a'] })]);
        const agg = new StatisticsAggregator(mgr);
        const logo = new MenuLogoDisplay(mgr, agg);
        logo.calculateStats();
        const byLabel = Object.fromEntries(logo.stats.map(s => [s.label, s.value]));
        const totals = agg.getStats();
        expect(byLabel['Total Playtime']).toBe(agg.formatPlaytime(totals.totalPlaytime));
        expect(byLabel['Total Playtime']).not.toMatch(/w/); // not 40 days * 24h
        expect(byLabel['Total Money Earned']).toBe('$900');
        expect(byLabel['Total Achievements']).toBe('1');
    });
});
