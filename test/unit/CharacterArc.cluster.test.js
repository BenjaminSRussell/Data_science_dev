import { describe, it, expect } from 'vitest';
import { CharacterArcSystem } from '../../src/js/game/CharacterArcSystem.js';

const make = (o = {}) => {
    const gs = { money: 0, reputation: 0, rankIndex: 0, characterStats: { ethics: 0 }, timeManager: { totalDays: 1 }, ...o };
    return { gs, arc: new CharacterArcSystem(gs) };
};
const shift = (arc, gs, { ethics = 0, rank = 0, rep = 0 }) => {
    gs.characterStats.ethics += ethics;
    gs.rankIndex += rank;
    gs.reputation += rep;
    arc.updateCurrentState();
};

describe('CharacterArcSystem cluster', () => {
    it('#1477 $0 and missing money use the same fallback', () => {
        const { arc } = make({ money: undefined });
        arc.initialize();
        expect(arc.startingState.money).toBe(0);
        expect(arc.currentState.money).toBe(0);
        const broke = make({ money: 0 }).arc;
        broke.initialize();
        expect(broke.startingState.money).toBe(0);
    });

    it('#1961 a new game starts from zero relationships even if an intro met someone', () => {
        const { arc, gs } = make({ npcManager: { getMetNPCs: () => ['mentor'] } });
        arc.initialize();
        expect(arc.startingState.relationships).toBe(0);
        expect(arc.currentState.relationships).toBe(1);
        // A baseline captured for an existing game still uses the live count
        const old = make({ npcManager: { getMetNPCs: () => ['a', 'b'] } }).arc;
        old.captureStartingState();
        expect(old.startingState.relationships).toBe(2);
        expect(gs).toBeTruthy();
    });

    it('#1959 milestone direction and transformation text agree on ethics cutoffs', () => {
        for (const delta of [10, 12, 15]) {
            const { arc, gs } = make();
            arc.initialize();
            shift(arc, gs, { ethics: delta });
            expect(arc.arcHistory.at(-1).direction).toBe('growth');
            expect(arc.getTransformationDescription()).toMatch(/convictions/);
        }
        for (const delta of [-10, -12, -20]) {
            const { arc, gs } = make();
            arc.initialize();
            shift(arc, gs, { ethics: delta });
            expect(arc.arcHistory.at(-1).direction).toBe('decline');
            expect(arc.getTransformationDescription()).toMatch(/consequences/);
        }
        const { arc, gs } = make();
        arc.initialize();
        shift(arc, gs, { ethics: 9 });
        expect(arc.arcHistory).toHaveLength(0);
        expect(arc.getTransformationDescription()).toMatch(/still finding your way/);
    });

    it('#1479 a promotion cannot hide an ethics decline', () => {
        const a = make();
        a.arc.initialize();
        shift(a.arc, a.gs, { ethics: -25 });
        const b = make();
        b.arc.initialize();
        shift(b.arc, b.gs, { ethics: -25, rank: 3 });
        expect(a.arc.getTransformationDescription()).toMatch(/consequences/);
        expect(b.arc.getTransformationDescription()).toMatch(/at a cost/);
        const clean = make();
        clean.arc.initialize();
        shift(clean.arc, clean.gs, { rank: 3 });
        expect(clean.arc.getTransformationDescription()).toMatch(/climbed the ladder/);
    });

    it('integrity needs a bigger ethics rise plus reputation', () => {
        const { arc, gs } = make();
        arc.initialize();
        shift(arc, gs, { ethics: 20, rep: 300 });
        expect(arc.getTransformationDescription()).toMatch(/integrity/);
    });
});
