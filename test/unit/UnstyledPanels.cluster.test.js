/**
 * Live panels that had no CSS, plus token/markup fixes
 * (#1750, #2515, #2498, #2495, #1319, #1828, #1758, #1471)
 */
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';

const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const panels = read('src/styles/game-panels.css');
const html = read('index.html');

describe('game-panels.css', () => {
    it('is linked from index.html', () => {
        expect(html).toContain('href="/src/styles/game-panels.css"');
    });

    it.each([
        ['stat cards (#1750)', ['.stat-card', '.stat-info', '.stat-name', '.stat-bar', '.stat-bar-fill', '.stat-xp']],
        ['training (#2515)', ['.training-grid', '.training-card', '.training-name', '.training-effects', '.training-cost']],
        ['marketing (#2498)', ['.marketing-grid', '.marketing-card', '.marketing-card.active', '.marketing-card.locked', '.marketing-cost', '.marketing-leads']],
        ['software (#2495)', ['.software-item', '.software-icon', '.software-info', '.software-name', '.software-bonuses', '.software-none']],
        ['how to play (#1319)', ['.howto-modal', '.howto-steps', '.howto-step', '.howto-step-number', '.howto-step-content']]
    ])('styles %s', (_, selectors) => {
        for (const sel of selectors) {
            expect(panels, sel).toMatch(new RegExp(sel.replace(/[.]/g, '\\.') + '[\\s,{:]'));
        }
    });

    it('gives the stat bar a visible height', () => {
        const rule = panels.match(/\.stat-bar\s*\{([^}]*)\}/)[1];
        expect(rule).toMatch(/height:\s*8px/);
    });

    it('uses theme tokens, not literal colours', () => {
        const code = panels.replace(/\/\*[\s\S]*?\*\//g, '');
        expect(code).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    });
});

describe('how to play modal (#1319)', () => {
    it('uses its own class names so the coach-mark .tutorial-step rule does not apply', () => {
        let content = '';
        MainGame.prototype.showTutorial.call({ showModal: (c) => { content = c; } });
        expect(content).toContain('class="howto-modal"');
        expect(content).toContain('class="howto-step-number"');
        expect(content).not.toMatch(/class="tutorial-step"|class="step-number"/);
    });
});

describe('inbox badge (#1828)', () => {
    it('markup carries the classes research-inbox.css styles', () => {
        expect(html).toMatch(/class="btn-grey inbox-button" id="btn-research-inbox"/);
        expect(html).toMatch(/id="inbox-unread-badge" class="inbox-unread-badge hidden"/);
    });
});

describe('equipment bonus pill (#1758)', () => {
    it('uses the success colour token', () => {
        const css = read('src/styles/components.css');
        const rule = css.match(/\.equipment-bonus\s*\{([^}]*)\}/)[1];
        expect(rule).toContain('rgba(var(--color-accent-success-rgb), 0.1)');
        expect(rule).not.toContain('var(#');
        expect(read('src/styles/main.css')).toMatch(/--color-accent-success-rgb:\s*34, 197, 94;/);
    });
});

describe('menu statistics dashboard icons (#1471)', () => {
    it('renders glyphs instead of repeating the label as a word', () => {
        document.body.innerHTML = '<div id="menu-stats-dashboard"></div>';
        MainGame.prototype.renderStatisticsDashboard.call({
            statisticsAggregator: {
                // The dashboard reads through the cache (#140)
                getStats: () => ({ totalPlaytime: 60, gamesCompleted: 1, highestRankName: 'Intern', totalMoney: 5 }),
                formatPlaytime: () => '1m',
                formatMoney: () => '$5'
            }
        });
        const icons = [...document.querySelectorAll('.stat-icon')];
        expect(icons).toHaveLength(4);
        for (const icon of icons) {
            expect(icon.getAttribute('aria-hidden')).toBe('true');
            expect(icon.textContent).not.toMatch(/^(Time|Trophy|Chart|Money)$/);
        }
    });
});
