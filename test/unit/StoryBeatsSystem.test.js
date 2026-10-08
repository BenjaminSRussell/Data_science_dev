/**
 * StoryBeatsSystem triggers, pending beats and completion (#432 #1499 #1971
 * #1497 #1500 #857 #2148 #1106 #2266 #1761 #1501)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { StoryBeatsSystem } from '../../src/js/game/StoryBeatsSystem.js';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';

const beat = (type, extra = {}) => ({ id: 'x', trigger: { type, ...extra } });

describe('StoryBeatsSystem', () => {
    let gs, sbs;
    beforeEach(() => {
        gs = { storylineManager: { storylinePhase: 'early', majorDecisions: [], getDecision: () => null } };
        sbs = new StoryBeatsSystem(gs);
    });

    describe('checkBeatTrigger', () => {
        it('job_obtained needs a real job; condition:false means no job', () => {
            expect(sbs.checkBeatTrigger(beat('job_obtained', { condition: true }))).toBe(false);
            gs.currentJob = null;
            expect(sbs.checkBeatTrigger(beat('job_obtained', { condition: true }))).toBe(false);
            gs.currentJob = { id: 'analyst' };
            expect(sbs.checkBeatTrigger(beat('job_obtained', { condition: true }))).toBe(true);
            expect(sbs.checkBeatTrigger(beat('job_obtained', { condition: false }))).toBe(false);
        });

        it('task_completed counts', () => {
            expect(sbs.checkBeatTrigger(beat('task_completed', { count: 2 }))).toBe(false);
            gs.tasksCompleted = 2;
            expect(sbs.checkBeatTrigger(beat('task_completed', { count: 2 }))).toBe(true);
        });

        it('rank_increase applies from and to independently and together', () => {
            const from = beat('rank_increase', { from: 2 });
            const to = beat('rank_increase', { to: 6 });
            const both = beat('rank_increase', { from: 2, to: 4 });
            gs.rankIndex = 3;
            expect(sbs.checkBeatTrigger(from)).toBe(true);
            expect(sbs.checkBeatTrigger(to)).toBe(false);
            expect(sbs.checkBeatTrigger(both)).toBe(false); // 'to' is no longer ignored
            gs.rankIndex = 4;
            expect(sbs.checkBeatTrigger(both)).toBe(true);
            gs.rankIndex = 6;
            expect(sbs.checkBeatTrigger(to)).toBe(true);
            expect(sbs.checkBeatTrigger(beat('rank_increase'))).toBe(false);
        });

        it('rent_paid counts real payments, not elapsed weeks', () => {
            gs.timeManager = { totalDays: 30 };
            expect(sbs.checkBeatTrigger(beat('rent_paid', { week: 1 }))).toBe(false);
            gs.rentPaymentsMade = 1;
            expect(sbs.checkBeatTrigger(beat('rent_paid', { week: 1 }))).toBe(true);
        });

        it('npc_met counts recorded meetings even if an id no longer resolves', () => {
            expect(sbs.checkBeatTrigger(beat('npc_met', { count: 1 }))).toBe(false);
            gs.npcManager = { metNPCs: ['ghost_id'], getMetNPCs: () => [] };
            expect(sbs.checkBeatTrigger(beat('npc_met', { count: 1 }))).toBe(true);
        });

        it('major_decision matches the act recorded on the decision', () => {
            const t = beat('major_decision', { phase: 'late' });
            expect(sbs.checkBeatTrigger(t)).toBe(false);
            gs.storylineManager.majorDecisions.push({ decisionId: 'model_audit', phase: 'late' });
            expect(sbs.checkBeatTrigger(t)).toBe(true);
        });

        it('major_decision falls back to the catalog phase for old saves', () => {
            gs.storylineManager.majorDecisions.push({ decisionId: 'whistleblower' });
            gs.storylineManager.getDecision = (id) => (id === 'whistleblower' ? { phase: 'mid' } : null);
            expect(sbs.checkBeatTrigger(beat('major_decision', { phase: 'mid' }))).toBe(true);
            expect(sbs.checkBeatTrigger(beat('major_decision', { phase: 'late' }))).toBe(false);
        });

        it('money, reputation, ethics and days thresholds', () => {
            gs.money = 10000; gs.reputation = 499;
            expect(sbs.checkBeatTrigger(beat('money_threshold', { amount: 10000 }))).toBe(true);
            expect(sbs.checkBeatTrigger(beat('reputation_threshold', { amount: 500 }))).toBe(false);
            expect(sbs.checkBeatTrigger(beat('ethics_extreme', { threshold: 30 }))).toBe(false);
            gs.characterStats = { ethics: -30 };
            expect(sbs.checkBeatTrigger(beat('ethics_extreme', { threshold: 30 }))).toBe(true);
            gs.characterStats.ethics = 30;
            expect(sbs.checkBeatTrigger(beat('ethics_extreme', { threshold: 30 }))).toBe(true);
            gs.characterStats.ethics = 29;
            expect(sbs.checkBeatTrigger(beat('ethics_extreme', { threshold: 30 }))).toBe(false);
            expect(sbs.checkBeatTrigger(beat('days_threshold', { days: 180 }))).toBe(false);
            gs.timeManager = { totalDays: 180 };
            expect(sbs.checkBeatTrigger(beat('days_threshold', { days: 180 }))).toBe(true);
            expect(sbs.checkBeatTrigger(beat('nonsense'))).toBe(false);
        });
    });

    it('getStoryBeatsForPhase covers four phases and falls back to []', () => {
        for (const p of StoryBeatsSystem.PHASES) expect(sbs.getStoryBeatsForPhase(p).length).toBeGreaterThan(0);
        expect(sbs.getStoryBeatsForPhase('bogus')).toEqual([]);
    });

    it('getBeat searches every phase', () => {
        expect(sbs.getBeat('story_complete').trigger.type).toBe('days_threshold');
        expect(sbs.getBeat('nope')).toBeNull();
    });

    it('earlier-act beats stay pending after the phase advances', () => {
        gs.storylineManager.storylinePhase = 'mid';
        sbs.updatePendingBeats();
        const ids = sbs.pendingBeats.map(b => b.id);
        expect(ids).toContain('first_promotion');
        expect(ids).toContain('major_decision_mid');
        expect(ids).not.toContain('major_decision_late');
    });

    it('checkForTriggeredBeats returns beats whose triggers are met', () => {
        gs.currentJob = { id: 'a' };
        gs.tasksCompleted = 1;
        expect(sbs.checkForTriggeredBeats().map(b => b.id).sort()).toEqual(['first_job', 'first_task_complete']);
    });

    it('completeBeat does not duplicate and mirrors to gameState', () => {
        sbs.completeBeat('first_job');
        sbs.completeBeat('first_job');
        expect(sbs.completedBeats).toEqual(['first_job']);
        expect(gs.completedStoryBeats).toEqual(['first_job']);
    });

    it('getCompletionStatus progress is 0 (not NaN) with no required beats', () => {
        expect(sbs.getCompletionStatus('bogus').progress).toBe(0);
        sbs.completeBeat('first_job');
        const s = sbs.getCompletionStatus('early');
        expect(s.completedRequired).toBe(1);
        expect(s.progress).toBeCloseTo(100 / 3);
    });

    it('getNextBeat puts required beats of the current act first', () => {
        sbs.completeBeat('first_job');
        sbs.completeBeat('first_task_complete');
        // first_promotion (optional) comes before rent_due_first in array order
        expect(sbs.getNextBeat().id).toBe('rent_due_first');
        gs.storylineManager.storylinePhase = 'mid';
        expect(sbs.getNextBeat().id).toBe('major_decision_mid');
    });
});

describe('StorylineManager late-phase decision', () => {
    it('offers model_audit in the late phase and records the act when made', () => {
        const gs = { money: 0, reputation: 0, characterStats: { ethics: 0, modifyEthics(a) { this.ethics += a; } }, timeManager: { totalDays: 100 } };
        const sm = new StorylineManager(gs);
        sm.storylinePhase = 'late';
        expect(sm.getAvailableDecisions().map(d => d.id)).toContain('model_audit');
        sm.processDecision('model_audit', 'disclose');
        expect(sm.majorDecisions[0]).toMatchObject({ decisionId: 'model_audit', phase: 'late' });
        const sbs = new StoryBeatsSystem({ ...gs, storylineManager: sm });
        expect(sbs.checkBeatTrigger(sbs.getBeat('major_decision_late'))).toBe(true);
    });
});
