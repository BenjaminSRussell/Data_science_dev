import { describe, it, expect } from 'vitest';
import { ContractSystem } from '../../src/js/game/contracts/ContractSystem.js';
import { GameEndingSystem } from '../../src/js/game/GameEndingSystem.js';
import { RANKS } from '../../src/js/data/ranks.js';

describe('contract early bonus uses in-game days (#2113)', () => {
    const setup = () => {
        const gs = { reputation: 1000, money: 0, characterStats: { getStat: () => 100 }, timeManager: { totalDays: 5 } };
        const cs = new ContractSystem(gs);
        const c = cs.availableContracts[0];
        Object.assign(c, { basePay: 1000, timeRequired: 10, bonusConditions: [] });
        cs.acceptContract(c.id);
        const active = cs.activeContracts.find(a => a.id === c.id);
        active.progress = active.timeRequired;
        return { gs, cs, active };
    };

    it('finishing on the acceptance day earns the full early bonus regardless of real time', () => {
        const { cs, active } = setup();
        const res = cs.completeContract(active.id);
        expect(res.bonuses?.some?.(b => b.type === 'early_completion') ?? res.pay > 1000).toBe(true);
        expect(res.pay).toBeCloseTo(1100);
    });

    it('finishing after the in-game deadline earns no early bonus', () => {
        const { gs, cs, active } = setup();
        gs.timeManager.totalDays = 20;
        expect(cs.completeContract(active.id).pay).toBeCloseTo(1000);
    });

    it('half the time left earns half the early bonus', () => {
        const { gs, cs, active } = setup();
        gs.timeManager.totalDays = 10; // 5 of 10 days used
        expect(cs.completeContract(active.id).pay).toBeCloseTo(1050);
    });

    it('old saves with only a wall-clock deadline get no early bonus', () => {
        const { cs, active } = setup();
        delete active.deadlineDay;
        active.deadline = Date.now() + 1e12;
        expect(cs.completeContract(active.id).pay).toBeCloseTo(1000);
    });
});

describe('endings use high/low-water marks between weekly checks (#1134)', () => {
    const top = RANKS.length - 1;
    const make = (state) => new GameEndingSystem({ money: 0, rankIndex: 0, characterStats: { getStat: () => 0 }, ...state });

    it('crossing $1M mid-week and spending it still earns Millionaire', () => {
        const ges = make({});
        ges.gameState.money = 1_200_000;
        ges.trackMarks(); // a new_day mid-week
        ges.gameState.money = 10_000;
        expect(ges.checkMillionaire()?.type).toBe('millionaire');
    });

    it('ethics extremes reached at the top rank count after drifting back', () => {
        let ethics = 85;
        const ges = make({ rankIndex: top, characterStats: { getStat: () => ethics } });
        ges.getEthics = () => ethics;
        ges.trackMarks();
        ethics = 40;
        expect(ges.checkEthicsEnding()?.type).toBe('ethical_leader');

        let e2 = -60;
        const ruthless = make({ rankIndex: top });
        ruthless.getEthics = () => e2;
        ruthless.trackMarks();
        e2 = -10;
        expect(ruthless.checkEthicsEnding()?.type).toBe('ruthless_climber');
    });

    it('ethics before reaching the top rank do not count', () => {
        let ethics = 90;
        const ges = make({ rankIndex: 0 });
        ges.getEthics = () => ethics;
        ges.trackMarks();
        ges.gameState.rankIndex = top;
        ethics = 10;
        expect(ges.checkEthicsEnding()).toBeNull();
    });

    it('marks survive save/load and main.js tracks them daily', async () => {
        const ges = make({ money: 2_000_000 });
        ges.trackMarks();
        const loaded = make({});
        loaded.fromJSON(JSON.parse(JSON.stringify(ges.toJSON())));
        expect(loaded.marks.peakMoney).toBe(2_000_000);
        loaded.fromJSON({});
        expect(loaded.marks.peakMoney).toBe(0);
        const src = (await import('node:fs')).readFileSync('src/js/main.js', 'utf8');
        expect(src).toMatch(/new_day[\s\S]{0,300}gameEndingSystem\?\.trackMarks\?\.\(\)/);
    });
});
