/**
 * ContractSystem cluster: completion precondition (#2112, #968), multiplier
 * validation (#1625), bonuses off basePay (#1622), id counter persisted
 * (#1623), deadline at acceptance (#972), copies from getters (#1627), no
 * duplicate contracts per category (#1626), perfect_quality reachable (#1624).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ContractSystem, ContractGenerator, CONTRACT_CATEGORIES } from '../../src/js/game/contracts/ContractSystem.js';

function makeSystem(state = {}) {
    const gs = { reputation: 1000, money: 0, characterStats: { getStat: () => 100 }, ...state };
    return { gs, cs: new ContractSystem(gs) };
}

function acceptOne(cs, overrides = {}) {
    const c = cs.availableContracts[0];
    Object.assign(c, overrides);
    cs.acceptContract(c.id);
    return cs.activeContracts.find(a => a.id === c.id);
}

afterEach(() => vi.useRealTimers());

describe('ContractSystem cluster', () => {
    it('refuses to pay for unfinished work (#2112, #968)', () => {
        const { gs, cs } = makeSystem();
        const active = acceptOne(cs);
        const res = cs.completeContract(active.id);
        expect(res.success).toBe(false);
        expect(gs.money).toBe(0);
        expect(cs.activeContracts).toHaveLength(1);
        active.progress = active.timeRequired;
        expect(cs.completeContract(active.id).success).toBe(true);
        expect(gs.money).toBeGreaterThan(0);
    });

    it('ignores malformed multipliers instead of producing NaN (#1625)', () => {
        const { gs, cs } = makeSystem();
        const active = acceptOne(cs, {
            basePay: 100,
            bonusConditions: [
                { type: 'reputation_threshold', value: 0, multiplier: 'lots' },
                { type: 'reputation_threshold', value: 0, multiplier: undefined },
                { type: 'reputation_threshold', value: 0, multiplier: 1e9 }
            ]
        });
        active.progress = active.timeRequired;
        active.deadlineDay = 0; // no early bonus
        const res = cs.completeContract(active.id);
        expect(res.pay).toBe(100);
        expect(Number.isFinite(gs.money)).toBe(true);
        expect(ContractSystem.validMultiplier(0.2)).toBe(0.2);
        expect(ContractSystem.validMultiplier(-1)).toBeNull();
    });

    it('bonuses are shares of basePay, not compounded (#1622)', () => {
        const { cs } = makeSystem();
        const active = acceptOne(cs, {
            basePay: 100,
            bonusConditions: [
                { type: 'reputation_threshold', value: 0, multiplier: 0.5 },
                { type: 'reputation_threshold', value: 0, multiplier: 0.5 }
            ]
        });
        active.progress = active.timeRequired;
        active.deadlineDay = 0;
        expect(cs.completeContract(active.id).pay).toBe(200);
    });

    it('persists the id counter and never reuses ids after load (#1623)', () => {
        const { cs } = makeSystem();
        const saved = JSON.parse(JSON.stringify(cs.toJSON()));
        expect(saved.contractIdCounter).toBe(cs.generator.contractIdCounter);
        const { cs: fresh } = makeSystem({ reputation: -1 });
        fresh.fromJSON(saved);
        const ids = new Set(saved.availableContracts.map(c => c.id));
        const next = fresh.generator.generateContract('DATA_ENTRY');
        expect(ids.has(next.id)).toBe(false);

        // Old saves without the counter: derived from the highest id
        const { cs: old } = makeSystem({ reputation: -1 });
        old.fromJSON({ activeContracts: [{ id: 'contract_DATA_ENTRY_41', bonusConditions: [] }] });
        expect(old.generator.contractIdCounter).toBe(41);
    });

    it('deadline starts at acceptance, in in-game days (#972, #2113)', () => {
        const { cs } = makeSystem();
        expect(cs.availableContracts[0].deadline).toBeNull();
        cs.gameState.timeManager = { totalDays: 10 };
        const active = acceptOne(cs);
        expect(active.acceptedDay).toBe(10);
        expect(active.deadlineDay).toBe(10 + active.timeRequired);
    });

    it('getters return copies (#1627)', () => {
        const { cs } = makeSystem();
        const list = cs.getAvailableContracts();
        list[0].basePay = -1;
        list.length = 0;
        expect(cs.availableContracts.length).toBeGreaterThan(0);
        expect(cs.availableContracts.every(c => c.basePay !== -1)).toBe(true);
    });

    it('no duplicate templates within a category (#1626)', () => {
        const gen = new ContractGenerator();
        for (const category of Object.keys(CONTRACT_CATEGORIES)) {
            const templates = gen.getContractTemplates(category);
            const offered = gen.generateContractsForCategory(category, 2);
            expect(offered.length).toBe(Math.min(2, templates.length));
            expect(new Set(offered.map(c => c.title)).size).toBe(offered.length);
        }
    });

    it('perfect_quality fires on perfect delivered quality (#1624)', () => {
        const { cs } = makeSystem();
        const cond = { type: 'perfect_quality', multiplier: 0.2 };
        expect(cs.checkBonusCondition(cond, { quality: 100 })).toBe(true);
        expect(cs.checkBonusCondition(cond, { quality: 92 })).toBe(false);
        expect(cs.checkBonusCondition(cond)).toBe(false);
        const active = acceptOne(cs, { basePay: 100, bonusConditions: [cond] });
        const res = cs.workOnContract(active.id, active.timeRequired, { quality: 100 });
        expect(res.bonuses.some(b => b.type === 'perfect_quality')).toBe(true);
    });
});
