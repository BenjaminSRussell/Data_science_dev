/**
 * StorylineNavigator beat lookup, phase validation, state aggregation (#492)
 */
import { describe, it, expect, vi } from 'vitest';
import { StorylineNavigator } from '../../src/js/dev/StorylineNavigator.js';

function beatsSystem(byPhase, extra = {}) {
    return { completedBeats: [], pendingBeats: [], getStoryBeatsForPhase: (p) => byPhase[p] || [], ...extra };
}

describe('StorylineNavigator', () => {
    it('finds a beat in a later phase and hands it to game.handleStoryBeat', () => {
        const beat = { id: 'b9', title: 'Late Beat' };
        const handleStoryBeat = vi.fn();
        const nav = new StorylineNavigator({ handleStoryBeat, gameState: { storyBeatsSystem: beatsSystem({ early: [{ id: 'x' }], late: [beat] }) } });
        expect(nav.triggerStoryBeat('b9')).toEqual({ success: true, message: 'Triggered story beat: Late Beat' });
        expect(handleStoryBeat).toHaveBeenCalledWith(beat);
    });

    it('manual fallback uses completeBeat when available', () => {
        const completeBeat = vi.fn();
        const sbs = beatsSystem({ mid: [{ id: 'm1', title: 'M' }] }, { completeBeat });
        const nav = new StorylineNavigator({ gameState: { storyBeatsSystem: sbs } });
        expect(nav.triggerStoryBeat('m1').success).toBe(true);
        expect(completeBeat).toHaveBeenCalledWith('m1');
    });

    it('manual fallback without completeBeat does not double-push', () => {
        const sbs = beatsSystem({ early: [{ id: 'e1', title: 'E' }] });
        sbs.completedBeats = ['e1'];
        const nav = new StorylineNavigator({ gameState: { storyBeatsSystem: sbs } });
        expect(nav.triggerStoryBeat('e1')).toEqual({ success: true, message: 'Marked story beat as completed: E' });
        expect(sbs.completedBeats).toEqual(['e1']);
    });

    it('unknown beat or missing system returns success:false instead of throwing', () => {
        const nav = new StorylineNavigator({ gameState: { storyBeatsSystem: beatsSystem({}) } });
        expect(nav.triggerStoryBeat('ghost')).toEqual({ success: false, error: 'Story beat "ghost" not found' });
        expect(new StorylineNavigator({ gameState: {} }).triggerStoryBeat('x')).toEqual({ success: false, error: 'StoryBeatsSystem not initialized' });
    });

    it('setStorylinePhase validates against the whitelist and refreshes the arc', () => {
        const sm = { storylinePhase: 'early', getCurrentArc: () => 'arc-for-' + sm.storylinePhase };
        const nav = new StorylineNavigator({ gameState: { storylineManager: sm } });
        expect(nav.setStorylinePhase('nonsense')).toEqual({ success: false, error: 'Invalid phase: nonsense. Must be one of: early, mid, late, endgame' });
        expect(sm.storylinePhase).toBe('early');
        expect(nav.setStorylinePhase('late')).toEqual({ success: true, message: 'Storyline phase set to: late' });
        expect(sm.currentArc).toBe('arc-for-late');
        expect(new StorylineNavigator({ gameState: {} }).setStorylinePhase('mid')).toEqual({ success: false, error: 'StorylineManager not initialized' });
    });

    it('getStorylineState has a full fallback shape and an aggregated shape', () => {
        expect(new StorylineNavigator({ gameState: {} }).getStorylineState()).toEqual({
            error: 'StorylineManager not initialized', phase: 'unknown', progress: 0, currentArc: null,
            completedDecisions: [], completedBeats: [], pendingBeats: []
        });
        const sbs = beatsSystem({}, { completedBeats: ['a'], pendingBeats: [{ id: 'b' }] });
        const sm = { storylinePhase: 'mid', storylineProgress: 40, majorDecisions: [{ id: 'd' }], getCurrentArc: () => 'arc' };
        expect(new StorylineNavigator({ gameState: { storylineManager: sm, storyBeatsSystem: sbs } }).getStorylineState()).toEqual({
            phase: 'mid', progress: 40, currentArc: 'arc', completedDecisions: [{ id: 'd' }],
            completedBeats: ['a'], pendingBeats: [{ id: 'b' }]
        });
    });
});
