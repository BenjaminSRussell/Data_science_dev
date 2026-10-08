import { describe, it, expect, beforeEach } from 'vitest';
import { StatisticsAggregator } from '../../src/js/ui/StatisticsAggregator.js';
import { RANKS } from '../../src/js/data/ranks.js';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const agg = (slots) => new StatisticsAggregator({ getSaveData: (i) => slots[i] ?? null });

describe('StatisticsAggregator.calculate (#195)', () => {
    beforeEach(() => localStorage.clear());

    it('all empty slots give zeroed stats without throwing', () => {
        const s = agg([]).calculate();
        expect(s).toMatchObject({
            totalPlaytime: 0, gamesCompleted: 0, highestRank: 0, highestRankName: RANKS[0].title,
            totalMoney: 0, totalTasks: 0, totalReputation: 0, sessions: 0, averageSessionLength: 0
        });
    });

    it('a slot without a timestamp uses the task estimate and adds no session', () => {
        const s = agg([{ state: { tasksCompleted: 10, money: 500, reputation: 3, rankIndex: 1 } }]).calculate();
        expect(s.totalPlaytime).toBeCloseTo(2);
        expect(s.sessions).toBe(0);
        expect(s.totalMoney).toBe(500);
        expect(s.totalReputation).toBe(3);
    });

    it('timestamp + startTime records a session with day count and caps playtime', () => {
        const start = 1_000_000;
        const s = agg([{ timestamp: start + 3 * DAY, state: { startTime: start, tasksCompleted: 5, rankIndex: 0 } }]).calculate();
        expect(s.sessions).toBe(1);
        expect(s.averageSessionLength).toBe(3);
        expect(s.totalPlaytime).toBeCloseTo(1); // min(5*0.2h, 72h)
    });

    it('falls back to state.day for the session length', () => {
        const s = agg([
            { timestamp: 5, state: { day: 10 } },
            { timestamp: 6, state: { day: 20 } }
        ]).calculate();
        expect(s.sessions).toBe(2);
        expect(s.averageSessionLength).toBe(15);
    });

    it('picks the highest rank across slots and its name', () => {
        const s = agg([
            { state: { rankIndex: 2 } },
            null,
            { state: { rankIndex: 4 } },
            { state: { rankIndex: 1 } }
        ]).calculate();
        expect(s.highestRank).toBe(4);
        expect(s.highestRankName).toBe(RANKS[4].title);
    });

    it('counts games that reached the top rank as completed', () => {
        const top = RANKS.length - 1;
        const s = agg([{ state: { rankIndex: top } }, { state: { rankIndex: top - 1 } }, { state: { rankIndex: top } }]).calculate();
        expect(s.gamesCompleted).toBe(2);
        expect(s.highestRankName).toBe(RANKS[top].title);
    });

    it('sums tasks across all five slots', () => {
        const slots = Array.from({ length: 5 }, () => ({ state: { tasksCompleted: 2 } }));
        expect(agg(slots).calculate().totalTasks).toBe(10);
    });
});
