import { describe, it, expect, vi } from 'vitest';
import { StorylineManager, decisionMadeInPhase } from '../../src/js/game/StorylineManager.js';
import { StoryBeatsSystem } from '../../src/js/game/StoryBeatsSystem.js';

// #515: a ReferenceError after the first major decision. The defect was in
// StorylineManager.checkPhaseTransition (undeclared `phase`/`decisions`,
// fixed in #2721), reached from processDecision and the main loop.
function makeGameState(totalDays = 0) {
    return {
        money: 0,
        reputation: 0,
        rankIndex: 0,
        characterStats: { ethics: 0, modifyEthics(a) { this.ethics += a; } },
        timeManager: { totalDays }
    };
}

describe('story progression after the first major decision (#515)', () => {
    it('checkPhaseTransition never throws, with or without an act change', () => {
        for (const days of [0, 45, 120, 400]) {
            const sm = new StorylineManager(makeGameState(days));
            sm.initialize();
            expect(() => sm.checkPhaseTransition()).not.toThrow();
            expect(sm.checkPhaseTransition()).toEqual({ phaseChanged: false });
        }
    });

    it('the first decision returns its result and satisfies an early major_decision trigger', () => {
        const gs = makeGameState(5);
        const sm = new StorylineManager(gs);
        sm.initialize();
        const first = sm.getAvailableDecisions()[0];
        expect(first.id).toBe('first_job_offer');
        const choice = Object.keys(first.choices)[0];

        const result = sm.processDecision(first.id, choice);
        expect(result).toMatchObject({ success: true });
        expect(sm.majorDecisions[0]).toMatchObject({ decisionId: 'first_job_offer', phase: 'early' });

        const sbs = new StoryBeatsSystem({ ...gs, storylineManager: sm });
        expect(sbs.checkBeatTrigger({ trigger: { type: 'major_decision', phase: 'early' } })).toBe(true);
        expect(sbs.checkBeatTrigger(sbs.getBeat('major_decision_mid'))).toBe(false);
        expect(sm.hasDecisionInPhase('early')).toBe(true);
        expect(sm.hasDecisionInPhase('mid')).toBe(false);
        // Every tick path that runs after a decision stays throw-free
        expect(() => sm.triggerDecisionIfAvailable()).not.toThrow();
        expect(() => sbs.checkForTriggeredBeats()).not.toThrow();
        expect(() => sm.checkPhaseTransition()).not.toThrow();
    });

    it('sell_company is reachable in the endgame', () => {
        const sm = new StorylineManager(makeGameState(400));
        sm.initialize();
        expect(sm.storylinePhase).toBe('endgame');
        expect(sm.getAvailableDecisions().map(d => d.id)).toContain('sell_company');
    });

    it('StoryBeatsSystem asks StorylineManager instead of re-deriving the act', () => {
        const gs = makeGameState(100);
        const sm = new StorylineManager(gs);
        sm.initialize();
        const spy = vi.spyOn(sm, 'hasDecisionInPhase');
        const getDecision = vi.spyOn(sm, 'getDecision');
        const sbs = new StoryBeatsSystem({ ...gs, storylineManager: sm });
        sbs.checkBeatTrigger({ trigger: { type: 'major_decision', phase: 'late' } });
        expect(spy).toHaveBeenCalledWith('late');
        // No records yet, so no per-record catalog rebuilds either
        expect(getDecision).not.toHaveBeenCalled();
    });

    it('an old-save criminal_opportunity record does not claim the current act', () => {
        const sm = new StorylineManager(makeGameState(120));
        sm.initialize();
        expect(sm.storylinePhase).toBe('late');
        // Offered in whichever act the player is in, so it has no catalog act
        expect(sm.getDecision('criminal_opportunity').phase).toBeUndefined();
        sm.majorDecisions.push({ decisionId: 'criminal_opportunity', choice: 'accept' });
        expect(sm.hasDecisionInPhase('late')).toBe(false);
        // Fixed-act decisions still resolve from the catalog for old saves
        sm.majorDecisions.push({ decisionId: 'whistleblower', choice: 'expose' });
        expect(sm.hasDecisionInPhase('mid')).toBe(true);
    });

    it('a criminal_opportunity made now records the act it was made in', () => {
        const gs = makeGameState(45);
        gs.characterStats.ethics = -50;
        const sm = new StorylineManager(gs);
        sm.initialize();
        const offer = sm.getAvailableDecisions().find(d => d.id === 'criminal_opportunity');
        expect(offer.phase).toBe('mid');
        sm.processDecision('criminal_opportunity', 'decline' in offer.choices ? 'decline' : Object.keys(offer.choices).pop());
        expect(sm.majorDecisions.at(-1)).toMatchObject({ decisionId: 'criminal_opportunity', phase: 'mid' });
    });

    it('decisionMadeInPhase tolerates missing managers and records', () => {
        expect(decisionMadeInPhase(null, 'early')).toBe(false);
        expect(decisionMadeInPhase({}, 'early')).toBe(false);
        expect(decisionMadeInPhase({ majorDecisions: [null, { decisionId: 'x' }] }, 'early')).toBe(false);
        expect(decisionMadeInPhase({ majorDecisions: [{ decisionId: 'x', phase: 'early' }] }, 'early')).toBe(true);
    });
});
