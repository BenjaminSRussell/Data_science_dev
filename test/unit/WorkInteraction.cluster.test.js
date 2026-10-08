import { describe, it, expect, vi, afterEach } from 'vitest';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';

afterEach(() => vi.restoreAllMocks());

const make = (gs = {}) => new WorkInteractionSystem({ reputation: 0, tasksCompleted: 0, currentJob: 'analyst', ...gs });

describe('WorkInteractionSystem cluster (#1545, #434)', () => {
    it('#1545 no write-only bound dialogue functions on boss or coworkers', () => {
        const w = make();
        expect(w.boss.dialogue).toBeUndefined();
        for (const c of w.coworkers) expect(c.dialogue).toBeUndefined();
    });

    it('#1545 talkToBoss goes through getBossDialogue with live relationship/readiness', () => {
        const w = make();
        const spy = vi.spyOn(w, 'getBossDialogue');
        w.boss.relationship = 55;
        w.boss.promotionReadiness = 75;
        const r = w.talkToBoss();
        expect(spy).toHaveBeenCalledWith(55, 75);
        expect(r.lines).toContain(r.dialogue);
        expect(r.lines[0]).toMatch(/ready for more responsibility/);
    });

    it('talking still works after a save/load round trip', () => {
        const w = make();
        w.talkToCoworker('coworker_sarah');
        const saved = JSON.parse(JSON.stringify(w.toJSON()));
        const w2 = make();
        w2.fromJSON(saved);
        expect(w2.coworkers.find(c => c.id === 'coworker_sarah').relationship).toBe(1);
        const r = w2.talkToCoworker('coworker_sarah');
        expect(typeof r.dialogue).toBe('string');
        expect(r.relationship).toBe(2);
        expect(w2.boss.name).toBe(w.boss.name);
    });

    it('#434 getCoworkerDialogue: three personalities x three tiers, all distinct', () => {
        const w = make();
        const sets = [];
        for (const p of ['friendly', 'competitive', 'gossipy']) {
            for (const rel of [0, 30, 80]) {
                const lines = w.getCoworkerDialogue(p, rel);
                expect(lines).toHaveLength(3);
                sets.push(lines.join('|'));
            }
        }
        expect(new Set(sets).size).toBe(9);
        expect(w.getCoworkerDialogue('friendly', 19)).toEqual(w.getCoworkerDialogue('friendly', 0));
        expect(w.getCoworkerDialogue('friendly', 20)).not.toEqual(w.getCoworkerDialogue('friendly', 0));
    });

    it('#434 getBossDialogue tiers split on readiness > 70 at the top', () => {
        const w = make();
        const t = (r, p) => w.getBossDialogue(r, p).join('|');
        expect(t(10, 100)).not.toBe(t(30, 100));
        expect(t(60, 70)).not.toBe(t(60, 71));
        expect(t(30, 0)).toBe(t(49, 100));
    });

    it('#434 talkToCoworker: unknown id is null; relationship +1 capped at 100', () => {
        const w = make();
        expect(w.talkToCoworker('nobody')).toBeNull();
        const mike = w.coworkers.find(c => c.id === 'coworker_mike');
        mike.relationship = 100;
        expect(w.talkToCoworker('coworker_mike').relationship).toBe(100);
    });

    it('#434 askForPromotion success needs all four gates', () => {
        const w = make({ reputation: 600, tasksCompleted: 25 });
        w.boss.promotionReadiness = 90;
        w.boss.relationship = 70;
        const r = w.askForPromotion();
        expect(r.success).toBe(true);
        expect(w.boss.promotionReadiness).toBe(0);
        expect(w.gameState.reputation).toBe(700);
        expect(w.boss.relationship).toBe(80);
    });

    it('#434 askForPromotion partial and low branches', () => {
        const close = make({ reputation: 0 });
        close.boss.promotionReadiness = 65;
        close.boss.relationship = 30;
        expect(close.askForPromotion().success).toBe(false);
        expect(close.boss.promotionReadiness).toBe(75);
        expect(close.boss.relationship).toBe(30);

        const early = make();
        early.boss.promotionReadiness = 10;
        early.boss.relationship = 30;
        early.askForPromotion();
        expect(early.boss.promotionReadiness).toBe(15);
        expect(early.boss.relationship).toBe(28);

        const onlyRep = make({ reputation: 100, tasksCompleted: 30 });
        onlyRep.boss.promotionReadiness = 90;
        onlyRep.boss.relationship = 70;
        expect(onlyRep.askForPromotion().message).toMatch(/reputation/);
    });

    it('#434 quitJob message tiers and reset', () => {
        const msgs = [80, 50, 10].map(rel => {
            const w = make();
            w.boss.relationship = rel;
            w.boss.promotionReadiness = 40;
            const r = w.quitJob();
            expect(r.success).toBe(true);
            expect(w.gameState.currentJob).toBeNull();
            expect(w.boss.relationship).toBe(0);
            expect(w.boss.promotionReadiness).toBe(0);
            return r.message;
        });
        expect(new Set(msgs).size).toBe(3);
    });
});
