/**
 * ActTransitionScreen summary and arc text (#146)
 */
import { describe, it, expect } from 'vitest';
import { ActTransitionScreen } from '../../src/js/ui/ActTransitionScreen.js';

const FALLBACK = '<p>Your journey continues...</p>';

describe('ActTransitionScreen.formatSummary', () => {
    const s = new ActTransitionScreen({});
    it('falls back for null, undefined and empty summaries', () => {
        expect(s.formatSummary(null)).toBe(FALLBACK);
        expect(s.formatSummary(undefined)).toBe(FALLBACK);
        expect(s.formatSummary({})).toBe(FALLBACK);
    });
    it('describes ethics: positive ethical, negative questionable, 0 balanced', () => {
        expect(s.formatSummary({ ethics: 15 })).toContain('ethical');
        expect(s.formatSummary({ ethics: -15 })).toContain('questionable');
        expect(s.formatSummary({ ethics: 0 })).toContain('balanced');
    });
    it('lists decisions, progress and relationships', () => {
        const html = s.formatSummary({ decisions: 3, progress: 'Reached Analyst', relationships: 4 });
        expect(html.match(/class="summary-item"/g)).toHaveLength(3);
        expect(html).toContain('Reached Analyst');
    });
});

describe('ActTransitionScreen.getCharacterArcPreview', () => {
    const arc = (ethics, sm = { getCurrentArc: () => 'x' }) =>
        new ActTransitionScreen({ gameState: { storylineManager: sm, characterStats: { ethics } } }).getCharacterArcPreview('mid');
    it('empty without a storylineManager', () => {
        expect(new ActTransitionScreen({ gameState: {} }).getCharacterArcPreview('mid')).toBe('');
    });
    it('dark below -30, light above 30, balanced at the boundaries', () => {
        expect(arc(-31)).toContain('arc-preview dark');
        expect(arc(-30)).toContain('arc-preview balanced');
        expect(arc(31)).toContain('arc-preview light');
        expect(arc(30)).toContain('arc-preview balanced');
    });
    it('does not need getCurrentArc', () => {
        expect(arc(0, {})).toContain('balanced');
    });
});

describe('ActTransitionScreen.generateSummary', () => {
    it('null without gameState', () => {
        expect(new ActTransitionScreen({}).generateSummary('early')).toBeNull();
    });
    it('counts decisions, met NPCs and copies rank and ethics', () => {
        const gs = {
            storylineManager: { majorDecisions: [1, 2, 3] },
            currentRank: { title: 'Analyst' },
            npcManager: { getMetNPCs: () => ['a', 'b'] },
            characterStats: { ethics: -12 }
        };
        expect(new ActTransitionScreen({ gameState: gs }).generateSummary('early')).toEqual({
            decisions: 3, progress: 'Reached Analyst', relationships: 2, ethics: -12
        });
    });
    it('missing getMetNPCs falls back to 0 relationships', () => {
        const r = new ActTransitionScreen({ gameState: { npcManager: {} } }).generateSummary('early');
        expect(r.relationships).toBe(0);
    });
});
