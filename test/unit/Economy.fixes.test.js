import { describe, it, expect, vi, afterEach } from 'vitest';
import { EconomySystem, insightHint } from '../../src/js/game/EconomySystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { ContractSystem } from '../../src/js/game/contracts/ContractSystem.js';
import { SHOP_ITEMS } from '../../src/js/data/shopItems.js';
import { RANKS } from '../../src/js/data/ranks.js';

function econ(over = {}) {
    const gs = { unlockedPerks: [], purchasedItems: [], getSoftwareQualityMultiplier: () => ({ speedBonus: 0 }), ...over };
    return { gs, e: new EconomySystem(gs) };
}

afterEach(() => vi.restoreAllMocks());

describe('calculateTax progressive brackets (#230)', () => {
    const { e } = econ();
    it.each([
        [0, 0], [-50, 0], [192, 0], [193, 0], [500, 30], [962, 77],
        [1000, 84], [1923, 269], [3000, 592]
    ])('weekly income %d -> tax %d', (income, tax) => {
        expect(e.calculateTax(income)).toBe(tax);
    });
});

describe('reward pipeline (#231)', () => {
    const { e } = econ();
    it('scoreToStars thresholds', () => {
        expect([95, 90, 89, 75, 74, 55, 54, 40, 39, 0].map(s => e.scoreToStars(s)))
            .toEqual([5, 5, 4, 4, 3, 3, 2, 2, 1, 1]);
    });
    it('calculateMoneyReward scales by stars', () => {
        const task = { potentialReward: 100 };
        expect([1, 2, 3, 4, 5].map(s => e.calculateMoneyReward(task, s))).toEqual([20, 40, 70, 100, 130]);
    });
    it('time bonus applies when finished within half the limit', () => {
        const task = { potentialReward: 100, timeLimit: 300, startTime: Date.now() - 60_000 };
        expect(e.calculateMoneyReward(task, 4)).toBe(120);
        expect(e.calculateMoneyReward({ ...task, startTime: Date.now() - 200_000 }, 4)).toBe(100);
    });
    it('calculateRepReward table', () => {
        expect([1, 2, 3, 4, 5].map(s => e.calculateRepReward(s))).toEqual([2, 5, 10, 18, 30]);
    });
});

describe('software speed bonus and shop perks (#1310, #2011, #244)', () => {
    it('AutoML/Cloud speed bonus and Time Extension stretch the time limit', () => {
        const { e } = econ({ getSoftwareQualityMultiplier: () => ({ speedBonus: 0.15 }), unlockedPerks: ['time_bonus'] });
        expect(e.getEffectiveTimeLimit({ timeLimit: 300 })).toBe(Math.round(330 * 1.15));
        expect(e.getEffectiveTimeLimit({})).toBe(0);
    });
    it('real GameState software multipliers feed the limit', () => {
        const gs = new GameState();
        gs.purchasedItems.push('soft_automl', 'soft_cloud_basic');
        expect(new EconomySystem(gs).getEffectiveTimeLimit({ timeLimit: 200 })).toBe(230);
    });
    it('speed bonus can turn a slow finish into a fast one', () => {
        const task = { potentialReward: 100, timeLimit: 100, startTime: Date.now() - 55_000 };
        expect(econ().e.calculateMoneyReward(task, 4)).toBe(100);
        expect(econ({ getSoftwareQualityMultiplier: () => ({ speedBonus: 0.15 }) }).e.calculateMoneyReward(task, 4)).toBe(120);
    });
    it('Negotiation Skills and Networking boost rewards', () => {
        const { e } = econ({ unlockedPerks: ['bonus_multiplier', 'rep_boost'] });
        expect(e.calculateMoneyReward({ potentialReward: 100 }, 4)).toBe(115);
        expect(e.calculateRepReward(5)).toBe(36);
    });
    it('Office Coffee makes bosses more lenient', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const task = { boss: { strictness: 1.3 }, optimalChartTypes: ['bar'], potentialReward: 100 };
        const chart = { type: 'bar', showLegend: true, title: 'x' };
        const mk = perks => { const { gs, e } = econ({ unlockedPerks: perks, totalRatings: 0, ratingSum: 0, perfectScores: 0,
            getSoftwareQualityMultiplier: () => ({ chartAppropriateness: 1, visualClarity: 1, dataAccuracy: 1, speedBonus: 0 }) }); return e; };
        expect(mk(['boss_favor']).evaluateChart(task, chart).rawScore).toBeGreaterThan(mk([]).evaluateChart(task, chart).rawScore);
    });
    it('Data Insight shows the optimal chart type', () => {
        expect(insightHint({ unlockedPerks: ['insight'] }, { optimalChartTypes: ['line'] })).toContain('line');
        expect(insightHint({ unlockedPerks: [] }, { optimalChartTypes: ['line'] })).toBeNull();
    });
});

describe('shop discount is reachable and applied (#1988, #1309)', () => {
    it('Coupon Clipper is a purchasable perk that discounts other items', () => {
        const coupon = SHOP_ITEMS.find(i => i.perkId === 'bargain_hunter');
        expect(coupon).toBeTruthy();
        const gs = new GameState();
        gs.money = 10_000;
        const e = new EconomySystem(gs);
        expect(gs.purchaseItem(coupon, e.getItemPrice(coupon))).toBe(true);
        const ide = SHOP_ITEMS.find(i => i.id === 'soft_ide_pro');
        expect(e.getItemPrice(ide)).toBe(Math.round(ide.price * 0.9));
        const before = gs.money;
        gs.purchaseItem(ide, e.getItemPrice(ide));
        expect(before - gs.money).toBe(Math.round(ide.price * 0.9));
    });
});

describe('promotion (#856, #1312)', () => {
    it('climbs every rank the reputation covers in one call', () => {
        const gs = new GameState();
        gs.reputation = RANKS[3].repRequired;
        const spy = vi.fn();
        globalThis.window = globalThis.window || { dispatchEvent: spy };
        const e = new EconomySystem(gs);
        vi.spyOn(e, 'showPromotionNotification').mockImplementation(() => {});
        expect(e.checkPromotion()).toBe(true);
        expect(gs.rankIndex).toBe(3);
        expect(e.showPromotionNotification).toHaveBeenCalledTimes(1);
        expect(e.checkPromotion()).toBe(false);
    });
});

describe('contract and project pay are taxable income (#1989)', () => {
    it('completeContract adds to weeklyIncome and totalEarned', () => {
        const gs = { money: 0, reputation: 0, weeklyIncome: 50, totalEarned: 0 };
        const cs = new ContractSystem(gs);
        cs.activeContracts.push({ id: 'c1', basePay: 1000, difficulty: 2, bonusConditions: [], deadline: 0, timeRequired: 5, progress: 5 });
        const r = cs.completeContract('c1');
        expect(r.success).toBe(true);
        expect(gs.weeklyIncome).toBe(50 + r.pay);
        expect(gs.totalEarned).toBe(r.pay);
    });
});
