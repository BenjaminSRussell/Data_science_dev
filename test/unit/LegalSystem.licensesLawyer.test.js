/**
 * Lawyers, extra licenses and legal-trouble audits (#1281 #1535 #1536 #1538)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LegalSystem, LAWYER_TIERS, getLawyerReduction } from '../../src/js/game/LegalSystem.js';
import { WorldMap } from '../../src/js/game/WorldMap.js';
import { handleArrest } from '../../src/js/helpers/StockMarketHelpers.js';
import { handleHireLawyer } from '../../src/js/helpers/EducationHelpers.js';
import { STAFF_ROLES } from '../../src/js/main.js';

describe('lawyer retainers', () => {
    it('getLawyerReduction maps tiers', () => {
        expect(getLawyerReduction(null)).toBe(0);
        expect(getLawyerReduction('cheap')).toBe(0.2);
        expect(getLawyerReduction('expensive')).toBe(0.6);
        expect(LAWYER_TIERS.map(t => t.id)).toEqual(['cheap', 'average', 'expensive']);
    });

    it('allows upgrades but not re-buying the same or a worse tier', () => {
        const gs = { money: 20000 };
        const legal = new LegalSystem(gs);
        expect(legal.hireLawyer('average').success).toBe(true);
        expect(legal.hireLawyer('average').success).toBe(false);
        expect(legal.hireLawyer('cheap').success).toBe(false);
        expect(gs.money).toBe(17500);
        expect(legal.hireLawyer('expensive').success).toBe(true);
        expect(legal.lawyer).toBe('expensive');
        expect(gs.money).toBe(7500);
    });

    it('handleHireLawyer reports and refreshes', () => {
        const game = { gameState: { money: 1000 }, showToast: vi.fn(), audioManager: { play: vi.fn() } };
        game.gameState.legalSystem = new LegalSystem(game.gameState);
        handleHireLawyer(game, 'cheap');
        expect(game.gameState.legalSystem.lawyer).toBe('cheap');
        expect(game.showToast).toHaveBeenLastCalledWith(expect.stringContaining('reduced'), 'success');
        handleHireLawyer(game, 'expensive');
        expect(game.showToast).toHaveBeenLastCalledWith('Cannot afford retainer.', 'error');
    });
});

describe('handleArrest reputation', () => {
    let game;
    beforeEach(() => {
        document.body.innerHTML = '<span id="jail-time-left"></span>';
        game = {
            gameState: { money: 10000, reputation: 100 },
            screenManager: { showScreen: vi.fn() },
            showToast: vi.fn(),
            audioManager: { play: vi.fn() }
        };
    });

    it('halves reputation without a lawyer', () => {
        handleArrest(game, 'Fraud.');
        expect(game.gameState.reputation).toBe(50);
        expect(game.gameState.jailSentence).toBe(30);
        expect(game.gameState.money).toBe(5000);
    });

    it('a lawyer softens the reputation hit instead of causing one', () => {
        game.gameState.legalSystem = { lawyer: 'expensive' };
        handleArrest(game, 'Fraud.');
        // loss = 50% * (1 - 0.6) = 20%
        expect(game.gameState.reputation).toBe(80);
        expect(game.gameState.jailSentence).toBe(12);
        expect(game.gameState.money).toBe(8000);
    });
});

describe('LegalSystem.processWeek', () => {
    it('does nothing with no trouble', () => {
        const legal = new LegalSystem({ money: 100 });
        expect(legal.processWeek(() => 0)).toEqual({ audited: false, fine: 0, legalTrouble: 0 });
    });

    it('trouble can trigger an audit fine and then halves', () => {
        const gs = { money: 10000 };
        const legal = new LegalSystem(gs);
        legal.addLegalIssue({ type: 'data_violation', severity: 40 });
        const r = legal.processWeek(() => 0.1); // 0.1 < 40/200
        expect(r).toEqual({ audited: true, fine: 4000, legalTrouble: 20 });
        expect(gs.money).toBe(6000);
    });

    it('a lawyer reduces the audit fine and the fine is capped at cash on hand', () => {
        const gs = { money: 1000 };
        const legal = new LegalSystem(gs);
        legal.lawyer = 'average';
        legal.legalTrouble = 40;
        const r = legal.processWeek(() => 0);
        expect(r.fine).toBe(1000); // 2400 after lawyer, capped at $1000
        expect(gs.money).toBe(0);
    });

    it('trouble cools off when no audit happens, faster with a lawyer', () => {
        const legal = new LegalSystem({ money: 0 });
        legal.legalTrouble = 30;
        expect(legal.processWeek(() => 0.99).legalTrouble).toBe(25);
        legal.lawyer = 'expensive';
        expect(legal.processWeek(() => 0.99).legalTrouble).toBe(14);
    });
});

describe('extra licenses', () => {
    it("cars require a Driver's License when a legal system exists", () => {
        const gs = { money: 100000, reputation: 0 };
        gs.legalSystem = new LegalSystem(gs);
        const wm = new WorldMap(gs);
        const r = wm.buyVehicle('used_car');
        expect(r.success).toBe(false);
        expect(r.reason).toMatch(/Driver's License/);
        expect(gs.money).toBe(100000);
        expect(wm.buyVehicle('bus_pass').success).toBe(true);
        expect(gs.legalSystem.acquireLicense('drivers_license').success).toBe(true);
        expect(wm.buyVehicle('used_car').success).toBe(true);
    });

    it('Data Scientist hires require a Business License', () => {
        expect(STAFF_ROLES.data_scientist.requiresLicense).toBe('business_license');
        expect(new LegalSystem({}).getLicenseById('business_license').name).toBe('Business License');
    });
});
