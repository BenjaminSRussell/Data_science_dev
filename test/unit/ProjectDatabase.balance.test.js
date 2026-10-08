/**
 * No contract is strictly dominated by another (#2172)
 */
import { describe, it, expect } from 'vitest';
import { CONTRACTS } from '../../src/js/game/ProjectDatabase.js';

const xp = c => Object.values(c.xpReward || {}).reduce((a, b) => a + b, 0);
const grind = c => c.stages.reduce((a, s) => a + (s.maxProgress || 0), 0);
const gated = c => (c.requirements ? 1 : 0) + c.stages.filter(s => s.hardwareReq).length;
const ethicsCost = c => Math.max(0, -(c.ethics || 0));

// a is dominated by b when b is at least as good on every axis and better on one
function dominated(a, b) {
    const axes = [
        [b.reward, a.reward],           // more money is better
        [xp(b), xp(a)],                 // more XP is better
        [grind(a), grind(b)],           // less grind is better
        [gated(a), gated(b)],           // fewer gates is better
        [ethicsCost(a), ethicsCost(b)]  // less ethics cost is better
    ];
    return axes.every(([better, worse]) => better >= worse) && axes.some(([better, worse]) => better > worse);
}

describe('contract balance', () => {
    it('fashion_trends is no longer strictly worse than loan_risk_model', () => {
        const fashion = CONTRACTS.find(c => c.id === 'fashion_trends');
        const loan = CONTRACTS.find(c => c.id === 'loan_risk_model');
        expect(dominated(fashion, loan)).toBe(false);
        expect(xp(fashion)).toBeGreaterThan(xp(loan));
        expect(fashion.reward).toBeGreaterThanOrEqual(3500);
    });

    it('no contract dominates another', () => {
        for (const a of CONTRACTS) {
            for (const b of CONTRACTS) {
                if (a !== b) expect(dominated(a, b), `${a.id} dominated by ${b.id}`).toBe(false);
            }
        }
    });
});
