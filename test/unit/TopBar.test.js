import { describe, it, expect, beforeEach } from 'vitest';
import { TopBar } from '../../src/js/ui/components/TopBar.js';

describe('TopBar', () => {
    let topBar;

    beforeEach(() => {
        topBar = new TopBar();
    });

    it('populates money, reputation, and rank from a well-formed gameState', () => {
        topBar.updateFromGameState({
            money: 12345,
            reputation: 67,
            currentRank: { title: 'Senior Data Scientist' }
        });

        expect(topBar.money).toBe(12345);
        expect(topBar.reputation).toBe(67);
        expect(topBar.rank).toBe('Senior Data Scientist');
    });

    it('keeps money at 0 when gameState.money is 0 (?? does not fall back on 0)', () => {
        topBar.updateFromGameState({
            money: 0,
            reputation: 5,
            currentRank: { title: 'Intern' }
        });

        expect(topBar.money).toBe(0);
    });

    it('falls back reputation to 0 when gameState.reputation is missing', () => {
        topBar.updateFromGameState({
            money: 100,
            currentRank: { title: 'Analyst' }
        });

        expect(topBar.reputation).toBe(0);
    });

    it('falls back rank to empty string when currentRank is undefined, without crashing', () => {
        topBar.updateFromGameState({
            money: 100,
            reputation: 10,
            currentRank: undefined
        });

        expect(topBar.rank).toBe('');
    });

    it('falls back rank to empty string when currentRank is null, without crashing', () => {
        topBar.updateFromGameState({
            money: 100,
            reputation: 10,
            currentRank: null
        });

        expect(topBar.rank).toBe('');
    });

    it('returns immediately on null gameState without throwing or resetting values', () => {
        topBar.updateFromGameState({
            money: 999,
            reputation: 42,
            currentRank: { title: 'CTO' }
        });

        expect(() => topBar.updateFromGameState(null)).not.toThrow();

        expect(topBar.money).toBe(999);
        expect(topBar.reputation).toBe(42);
        expect(topBar.rank).toBe('CTO');
    });
});
