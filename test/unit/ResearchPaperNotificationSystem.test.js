import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResearchPaperNotificationSystem } from '../../src/js/game/research/ResearchPaperNotificationSystem.js';

const make = (gs = {}) => new ResearchPaperNotificationSystem(gs);

describe('ResearchPaperNotificationSystem', () => {
    beforeEach(() => { delete window.game; });
    afterEach(() => { delete window.game; vi.restoreAllMocks(); });

    describe('checkForNewPapers gating (#372)', () => {
        it('day-only papers unlock at their day even without a storyline', () => {
            const s = make({ timeManager: { totalDays: 4 } });
            s.checkForNewPapers();
            expect(s.getPaper('imagenet_2012').unlocked).toBeFalsy();
            s.gameState.timeManager.totalDays = 5;
            s.checkForNewPapers();
            expect(s.getPaper('imagenet_2012').unlocked).toBe(true);
        });

        it('phase-gated papers need both the day and the phase', () => {
            const s = make({ timeManager: { totalDays: 50 }, aiTrainingStoryline: { currentPhase: 'pre_attention' } });
            s.checkForNewPapers();
            expect(s.getPaper('alphago_2016').unlocked).toBe(true);
            expect(s.getPaper('attention_is_all_you_need_2017').unlocked).toBeFalsy();
            s.gameState.aiTrainingStoryline.currentPhase = 'attention_era';
            s.checkForNewPapers();
            expect(s.getPaper('attention_is_all_you_need_2017').unlocked).toBe(true);
        });

        it('does nothing without a timeManager', () => {
            const s = make({});
            s.checkForNewPapers();
            expect(s.inbox).toHaveLength(0);
            expect(() => make(null).checkForNewPapers()).not.toThrow();
        });

        it('does not duplicate inbox entries on repeat checks', () => {
            const s = make({ timeManager: { totalDays: 12 } });
            s.checkForNewPapers();
            const n = s.inbox.length;
            expect(n).toBe(2);
            s.checkForNewPapers();
            expect(s.inbox).toHaveLength(n);
        });

        it('gives papers unlocked in the same tick distinct notification ids', () => {
            vi.spyOn(Date, 'now').mockReturnValue(1000);
            const s = make({ timeManager: { totalDays: 40 } });
            s.checkForNewPapers();
            const ids = s.inbox.map(i => i.id);
            expect(ids.length).toBeGreaterThan(1);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('unlockPaper (#373)', () => {
        it('unlocks a breakthrough paper and returns the inbox entry', () => {
            const s = make();
            const entry = s.unlockPaper('bert_2018');
            expect(s.getPaper('bert_2018').unlocked).toBe(true);
            expect(entry).toBe(s.inbox[0]);
            expect(entry).toMatchObject({ paperId: 'bert_2018', read: false, isBreakthrough: true });
            expect(entry.paper).toBe(s.getPaper('bert_2018'));
            expect(typeof entry.id).toBe('string');
            expect(typeof entry.receivedAt).toBe('number');
        });

        it('falls back to isBreakthrough false', () => {
            expect(make().unlockPaper('vgg_net_2014').isBreakthrough).toBe(false);
        });

        it('is a no-op for already-unlocked or unknown papers', () => {
            const s = make();
            s.unlockPaper('vgg_net_2014');
            expect(s.unlockPaper('vgg_net_2014')).toBeUndefined();
            expect(s.inbox).toHaveLength(1);
            expect(s.unlockPaper('not_a_real_paper')).toBeUndefined();
            expect(s.inbox).toHaveLength(1);
        });

        it('shows a BREAKTHROUGH toast when the game is available', () => {
            const s = make();
            expect(() => s.unlockPaper('vgg_net_2014')).not.toThrow();
            window.game = { showToast: vi.fn() };
            s.unlockPaper('bert_2018');
            expect(window.game.showToast).toHaveBeenCalledWith(expect.stringContaining('BREAKTHROUGH'), 'info');
        });
    });

    describe('inbox read state (#374)', () => {
        let s;
        beforeEach(() => {
            s = make();
            s.inbox = [
                { id: 'a', paperId: 'p1', read: true, receivedAt: 300 },
                { id: 'b', paperId: 'p2', read: false, receivedAt: 100 },
                { id: 'c', paperId: 'p3', read: false, receivedAt: 200 }
            ];
        });

        it('sorts unread first, then newest first, without mutating storage', () => {
            expect(s.getInbox().map(i => i.id)).toEqual(['c', 'b', 'a']);
            expect(s.inbox.map(i => i.id)).toEqual(['a', 'b', 'c']);
        });

        it('counts unread and marks read', () => {
            expect(s.getUnreadCount()).toBe(2);
            s.markAsRead('b');
            expect(s.inbox[1].read).toBe(true);
            expect(s.readPapers.has('p2')).toBe(true);
            expect(s.getUnreadCount()).toBe(1);
            s.markAsRead('not_a_real_id');
            expect(s.getUnreadCount()).toBe(1);
        });
    });

    describe('queries and serialization (#375)', () => {
        it('getPapersByPhase / getBreakthroughPapers only return unlocked papers', () => {
            const s = make();
            expect(s.getPapersByPhase('pre_attention')).toEqual([]);
            s.unlockPaper('vgg_net_2014');
            s.unlockPaper('bert_2018');
            expect(s.getPapersByPhase('pre_attention').map(p => p.id)).toEqual(['vgg_net_2014']);
            expect(s.getBreakthroughPapers().map(p => p.id)).toEqual(['bert_2018']);
        });

        it('toJSON keeps only unlocked flags and serializes readPapers', () => {
            const s = make();
            const e = s.unlockPaper('vgg_net_2014');
            s.markAsRead(e.id);
            const json = s.toJSON();
            expect(json.readPapers).toEqual(['vgg_net_2014']);
            expect(json.papers.vgg_net_2014).toEqual({ unlocked: true });
            for (const v of Object.values(json.papers)) expect(Object.keys(v)).toEqual(['unlocked']);
        });

        it('fromJSON restores state and ignores unknown ids', () => {
            const s = make();
            expect(() => s.fromJSON({ inbox: [{ id: 'x', paperId: 'gan_2014', read: false }], readPapers: ['gan_2014'], papers: { gan_2014: { unlocked: true }, ghost: { unlocked: true } } })).not.toThrow();
            expect(s.inbox).toHaveLength(1);
            expect(s.readPapers).toBeInstanceOf(Set);
            expect(s.readPapers.has('gan_2014')).toBe(true);
            expect(s.getPaper('gan_2014').unlocked).toBe(true);
            expect(s.papers.ghost).toBeUndefined();
        });

        it('round-trips through JSON across instances', () => {
            const a = make();
            const e = a.unlockPaper('resnet_2015');
            a.unlockPaper('bert_2018');
            a.markAsRead(e.id);
            const b = make();
            b.fromJSON(JSON.parse(JSON.stringify(a.toJSON())));
            expect(b.inbox.map(i => i.paperId)).toEqual(['resnet_2015', 'bert_2018']);
            expect([...b.readPapers]).toEqual(['resnet_2015']);
            expect(b.getUnreadCount()).toBe(1);
            expect(b.getBreakthroughPapers().map(p => p.id)).toEqual(['bert_2018']);
            const next = b.unlockPaper('gan_2014');
            expect(b.inbox.filter(i => i.id === next.id)).toHaveLength(1);
        });
    });
});
