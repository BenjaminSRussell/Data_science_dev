// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { LitUIManager } from '../../src/js/ui/LitUIManager.js';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('src/styles/main.css', 'utf8');

function pageFragment() {
    const header = html.match(/<header id="top-bar"[\s\S]*?<\/header>/)?.[0];
    const rank = html.match(/<div class="rank-display">[\s\S]*?<\/span>\s*<\/div>/)?.[0];
    if (!header || !rank) throw new Error('index.html is missing the top bar or rank display');
    return header + rank;
}

describe('Lit TopBar and ProgressBar mount from index.html (#2131)', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('wraps the existing stat nodes in the containers initialize() looks up', () => {
        const moneyAt = html.indexOf('id="money-value"');
        const containerAt = html.lastIndexOf('<div id="top-bar-container">', moneyAt);
        expect(containerAt).toBeGreaterThan(-1);
        expect(html.indexOf('id="top-bar-container"')).toBeLessThan(moneyAt);
        expect(html.indexOf('</div>', html.indexOf('id="rank-value"'))).toBeGreaterThan(moneyAt);

        const progressAt = html.indexOf('id="rank-progress"');
        const rankContainerAt = html.lastIndexOf('<div id="rank-progress-container">', progressAt);
        expect(rankContainerAt).toBeGreaterThan(-1);
        expect(html.indexOf('class="next-rank"')).toBeGreaterThan(progressAt);
        expect(html).toContain('<span id="money-value">$0</span>');
    });

    it('mounts both components and renders the live GameState', async () => {
        document.body.innerHTML = pageFragment();
        const gameState = {
            money: 1250.5,
            reputation: 56,
            currentRank: { title: 'Data Analyst' },
            nextRank: { title: 'Senior' },
            progressToNextRank: 40
        };
        const manager = new LitUIManager({ gameState });
        manager.initialize();

        const topBar = document.querySelector('#top-bar-container > top-bar');
        const progressBar = document.querySelector('#rank-progress-container > progress-bar');
        expect(topBar).not.toBeNull();
        expect(progressBar).not.toBeNull();
        expect(topBar.getAttribute('aria-live')).toBe('polite');
        expect(document.querySelector('.top-bar-center').hasAttribute('aria-live')).toBe(false);
        expect(document.getElementById('top-bar-container').classList.contains('lit-mounted')).toBe(true);
        expect(document.querySelector('.rank-display').classList.contains('lit-rank-mounted')).toBe(true);
        expect(manager.components.get('topBar')).toBe(topBar);
        expect(manager.components.get('rankProgress')).toBe(progressBar);

        manager.updateTopBar();
        manager.updateRankProgress();
        await Promise.all([topBar.updateComplete, progressBar.updateComplete]);

        const topText = topBar.shadowRoot.textContent;
        expect(topText).toContain('$1,250.50');
        expect(topText).toContain('56');
        expect(topText).toContain('Data Analyst');
        expect(progressBar.value).toBe(40);
        expect(progressBar.label).toBe('Rank: Data Analyst');
        expect(progressBar.shadowRoot.querySelector('.progress-fill').style.width).toBe('40%');
        expect(document.querySelector('.next-rank').textContent).toBe('Next: Senior');
        expect(document.getElementById('money-value').textContent).toBe('$1,250.50');
        expect(document.getElementById('current-rank').textContent).toBe('Data Analyst');

        gameState.nextRank = null;
        manager.updateRankProgress();
        expect(document.querySelector('.next-rank').textContent).toBe('Max Rank Achieved!');
    });

    it('hides the legacy stats that the mounted components replace', () => {
        expect(css).toMatch(/#top-bar-container\.lit-mounted > :not\(top-bar\) \{\s*display: none;/);
        expect(css).toMatch(/\.rank-display\.lit-rank-mounted > \.current-rank \{\s*display: none;/);
        expect(css).toMatch(/#rank-progress-container\.lit-mounted > \.text-progress-bar,/);
    });
});
