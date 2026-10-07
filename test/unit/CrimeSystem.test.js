import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CrimeSystem } from '../../src/js/game/CrimeSystem.js';

function makeGameState(overrides = {}) {
    const stats = { luck: 0, focus: 0 };
    return {
        money: 10000,
        reputation: 0,
        characterStats: {
            getStat: vi.fn(id => stats[id] ?? 0),
            modifyEthics: vi.fn(),
            _stats: stats
        },
        stockMarket: { manipulateStock: vi.fn() },
        mainGame: { handleArrest: vi.fn() },
        ...overrides
    };
}

describe('CrimeSystem', () => {
    let gs;
    let crime;
    let randomSpy;

    beforeEach(() => {
        gs = makeGameState();
        crime = new CrimeSystem(gs);
        randomSpy = vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        randomSpy.mockRestore();
    });

    describe('save/load', () => {
        it('round-trips all tracked fields through toJSON/fromJSON', () => {
            crime.heat = 65;
            crime.crimesCommitted = 3;
            crime.jailTimeServed = 12;
            crime.isUnderInvestigation = true;
            crime.investigationDays = 2;

            const restored = new CrimeSystem(makeGameState());
            restored.fromJSON(JSON.parse(JSON.stringify(crime.toJSON())));

            expect(restored.heat).toBe(65);
            expect(restored.crimesCommitted).toBe(3);
            expect(restored.jailTimeServed).toBe(12);
            expect(restored.isUnderInvestigation).toBe(true);
            expect(restored.investigationDays).toBe(2);
        });

        it('falls back to defaults for missing fields', () => {
            crime.fromJSON({ heat: 10 });
            expect(crime.jailTimeServed).toBe(0);
            expect(crime.isUnderInvestigation).toBe(false);
        });
    });

    describe('commitCrime', () => {
        it('rejects unknown crime types without side effects', () => {
            const result = crime.commitCrime('jaywalking', {});
            expect(result.success).toBe(false);
            expect(crime.heat).toBe(0);
            expect(crime.crimesCommitted).toBe(0);
        });

        it('pump_dump success: pumps the stock, costs ethics, adds heat and a record', () => {
            randomSpy.mockReturnValue(0.99);
            const result = crime.commitCrime('pump_dump', 'TECH');
            expect(result.success).toBe(true);
            expect(gs.stockMarket.manipulateStock).toHaveBeenCalledWith('TECH', 'pump', 1.5);
            expect(gs.characterStats.modifyEthics).toHaveBeenCalledWith(-15);
            expect(crime.heat).toBe(20);
            expect(crime.crimesCommitted).toBe(1);
        });

        it('a failed attempt starts an investigation and still raises heat', () => {
            randomSpy.mockReturnValue(0);
            const result = crime.commitCrime('pump_dump', 'TECH');
            expect(result.success).toBe(false);
            expect(crime.isUnderInvestigation).toBe(true);
            expect(crime.heat).toBe(20);
            expect(result.heatGained).toBe(20);
            expect(gs.stockMarket.manipulateStock).not.toHaveBeenCalled();
        });

        it('getting caught doubles the heat and does not trigger the arrest itself', () => {
            randomSpy.mockReturnValue(0);
            const result = crime.commitCrime('fabricate_data', {});
            expect(result).toMatchObject({ success: false, caught: true });
            expect(crime.heat).toBe(60);
            // The caller (StockMarketHelpers.handleCrime) applies the arrest once
            expect(gs.mainGame.handleArrest).not.toHaveBeenCalled();
        });

        it('rathole validation failures do not add heat', () => {
            const result = crime.commitCrime('rathole', -5);
            expect(result.success).toBe(false);
            expect(crime.heat).toBe(0);
            expect(gs.money).toBe(10000);
        });

        it('rathole success hides money and returns a 20% saving', () => {
            randomSpy.mockReturnValue(0.99);
            const result = crime.commitCrime('rathole', 1000);
            expect(result.success).toBe(true);
            expect(gs.money).toBe(10000 - 1000 + 200);
        });

        it('luck and focus both reduce risk', () => {
            // pump_dump base risk 30. Roll of 25 fails with no stats...
            randomSpy.mockReturnValue(0.25);
            expect(crime.commitCrime('pump_dump', 'A').success).toBe(false);

            // ...but succeeds with max luck (50 -> -10) and max focus (100 -> -10)
            const lucky = makeGameState();
            lucky.characterStats._stats.luck = 50;
            lucky.characterStats._stats.focus = 100;
            const c2 = new CrimeSystem(lucky);
            expect(c2.commitCrime('pump_dump', 'A').success).toBe(true);
        });

        it('a criminal record and an open investigation raise risk', () => {
            expect(crime.getSituationalRisk()).toBe(0);
            crime.crimesCommitted = 3;
            crime.isUnderInvestigation = true;
            expect(crime.getSituationalRisk()).toBe(16);
            crime.crimesCommitted = 50;
            expect(crime.getSituationalRisk()).toBe(30);
        });
    });

    describe('investigations', () => {
        it('are dropped after 7 days when heat is low', () => {
            crime.triggerInvestigation();
            let outcome = {};
            for (let i = 0; i < 6; i++) outcome = crime.processDay();
            expect(crime.isUnderInvestigation).toBe(true);
            outcome = crime.processDay();
            expect(outcome.cleared).toBe(true);
            expect(crime.isUnderInvestigation).toBe(false);
        });

        it('escalate to an arrest when heat stays high', () => {
            crime.heat = 100;
            crime.triggerInvestigation();
            crime.processDay();
            crime.processDay();
            const outcome = crime.processDay();
            expect(outcome.arrested).toBe(true);
            expect(crime.isUnderInvestigation).toBe(false);
        });

        it('heat decays by 5 per day', () => {
            crime.heat = 12;
            crime.processDay();
            expect(crime.heat).toBe(7);
        });
    });

    it('serveJailDay accumulates jailTimeServed', () => {
        crime.serveJailDay();
        crime.serveJailDay();
        expect(crime.jailTimeServed).toBe(2);
    });
});
