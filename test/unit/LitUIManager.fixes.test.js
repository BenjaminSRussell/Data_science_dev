// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LitUIManager } from '../../src/js/ui/LitUIManager.js';

const liveState = () => ({
    money: 1234, reputation: 56,
    currentRank: { title: 'Data Analyst' }, nextRank: { title: 'Senior' }, progressToNextRank: 40
});

describe('LitUIManager read path (#134, #1616, #50, #147)', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        document.body.innerHTML = `
            <span id="money-value"></span><span id="reputation-value"></span><span id="rank-value"></span>
            <span id="current-rank"></span><div id="rank-progress"></div><span class="next-rank"></span>`;
    });

    it('mounted TopBar is fed the live GameState, never the frozen store', () => {
        const gameState = liveState();
        const frozenStore = { getState: () => ({ money: 0, reputation: 0, currentRank: { title: 'Data Entry Clerk' } }) };
        const m = new LitUIManager({ gameState, gameStore: frozenStore });
        const topBar = { updateFromGameState: vi.fn() };
        m.components.set('topBar', topBar);
        m.updateTopBar();
        expect(topBar.updateFromGameState).toHaveBeenCalledWith(gameState);
    });

    it('DOM fallback renders the same GameState for the top bar and the rank bar', () => {
        const m = new LitUIManager({ gameState: liveState() });
        m.updateTopBar();
        m.updateRankProgress();
        expect(document.getElementById('money-value').textContent).toBe('$1,234');
        expect(document.getElementById('reputation-value').textContent).toBe('56');
        expect(document.getElementById('rank-value').textContent).toBe('Data Analyst');
        expect(document.getElementById('current-rank').textContent).toBe('Data Analyst');
        expect(document.getElementById('rank-progress').style.width).toBe('40%');
        expect(document.querySelector('.next-rank').textContent).toBe('Next: Senior');
    });

    it('mounted progress bar reads GameState', () => {
        const m = new LitUIManager({ gameState: liveState() });
        const bar = {};
        m.components.set('rankProgress', bar);
        m.updateRankProgress();
        expect(bar.value).toBe(40);
        expect(bar.label).toBe('Rank: Data Analyst');
    });

    it('does not reference an unimported global store', async () => {
        const src = (await import('node:fs')).readFileSync('src/js/ui/LitUIManager.js', 'utf8');
        expect(src).not.toMatch(/useGameStore/);
        expect(src).not.toMatch(/import \{ (TopBar|ProgressBar|LocationViewComponent) \}/);
    });
});
