import { describe, it, expect } from 'vitest';
import { LegalSystem } from '../../src/js/game/LegalSystem.js';

describe('LegalSystem.hireLawyer (#241)', () => {
    const costs = { cheap: 500, average: 2500, expensive: 10000 };

    for (const [tier, cost] of Object.entries(costs)) {
        it(`${tier} deducts exactly $${cost} and retains that tier`, () => {
            const gs = { money: 20000 };
            const legal = new LegalSystem(gs);
            expect(legal.hireLawyer(tier).success).toBe(true);
            expect(gs.money).toBe(20000 - cost);
            expect(legal.lawyer).toBe(tier);
        });
    }

    it('unknown tiers never touch money (no NaN)', () => {
        const gs = { money: 20000 };
        const legal = new LegalSystem(gs);
        for (const bad of [undefined, '', 'chep', 'toString', '__proto__', null]) {
            expect(legal.hireLawyer(bad).success).toBe(false);
            expect(gs.money).toBe(20000);
            expect(Number.isNaN(gs.money)).toBe(false);
        }
        expect(legal.lawyer).toBeNull();
    });

    it('refuses when the player cannot afford the retainer', () => {
        const gs = { money: 499 };
        const legal = new LegalSystem(gs);
        expect(legal.hireLawyer('cheap')).toMatchObject({ success: false, message: 'Cannot afford retainer.' });
        expect(gs.money).toBe(499);
        expect(legal.lawyer).toBeNull();
    });
});
