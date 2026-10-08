/**
 * Second batch of unstyled live panels and stylesheet collisions
 * (#2513, #2514, #2499, #2500, #2502, #2503, #1757, #2496, #2492, #2491,
 *  #1756, #2528, #1782, #2340, #1781, #1059, #2497, #1732)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SCREEN_THEMES } from '../../src/js/data/themes.js';

const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const panels = read('src/styles/game-panels.css');
const has = (css, sel) => new RegExp('(^|[\\s,}])' + sel.replace(/[.]/g, '\\.') + '[\\s,{:]', 'm').test(css);

describe('game-panels.css batch 2', () => {
    it.each([
        ['btn-cartoon (#2513)', ['.btn-cartoon', '.btn-cartoon-success', '.btn-cartoon-danger']],
        ['energy bar (#2514)', ['.energy-bar', '.energy-fill', '.energy-display']],
        ['capacity bar (#2499)', ['.cartoon-progress', '.cartoon-progress-fill']],
        ['expenses (#2500)', ['.expense-row', '.expense-row.total', '.money-display']],
        ['vehicles (#2502)', ['.vehicle-options', '.vehicle-option', '.vehicle-option.active', '.vehicle-option.locked', '.vehicle-price']],
        ['overview/avatar (#2503, #1757)', ['.character-overview', '.character-avatar', '.character-avatar.large', '.character-info', '.level-number']],
        ['text input (#2496)', ['.text-ui-input']],
        ['contracts (#2492)', ['.contracts-grid', '.contract-card', '.contract-header', '.contract-rewards', '.no-contracts']],
        ['AI rack (#2491)', ['.ai-console-layout', '.ai-visual', '.ai-avatar-large', '.ai-status-light', '.ai-xp-bar', '.ai-xp-fill', '.ai-stat-row']],
        ['empty states (#1756)', ['.empty-state .empty-icon', '.empty-state .empty-hint']],
        ['jail bars (#2528)', ['.jail-bars']]
    ])('styles %s', (_, selectors) => {
        for (const sel of selectors) expect(has(panels, sel), sel).toBe(true);
    });

    it('bars have a visible height', () => {
        const rule = panels.match(/\.energy-bar,\s*\.cartoon-progress,\s*\.ai-xp-bar\s*\{([^}]*)\}/)[1];
        expect(rule).toMatch(/height:\s*10px/);
    });

    it('still uses only theme tokens', () => {
        const code = panels.replace(/\/\*[\s\S]*?\*\//g, '');
        expect(code).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    });
});

describe('jail screen (#2528, #1732)', () => {
    it('the bars have content again', () => {
        expect(read('index.html')).toMatch(/<div class="jail-bars" aria-hidden="true">\|+<\/div>/);
    });

    it('has its own screen theme so its slate background survives showScreen', () => {
        expect(SCREEN_THEMES['screen-jail'].gradient).toContain('#2c3e50');
        // one source: the inline background that the theme wiped is gone
        expect(read('index.html')).toMatch(/<section id="screen-jail" class="screen hidden" style="text-align: center;">/);
    });
});

describe('text progress bars paint a fill (#1782)', () => {
    it('.text-progress-filled has a background and the track is visible', () => {
        const css = read('src/styles/text-ui.css');
        expect(css.match(/\.text-progress-filled\s*\{([^}]*)\}/)[1]).toMatch(/background:/);
        expect(css.match(/\.text-progress-bar\s*\{([^}]*)\}/)[1]).toMatch(/min-height:/);
    });
});

describe('stylesheet collisions', () => {
    it('story-ui.css progress bar is scoped to the Story screen (#2340)', () => {
        const css = read('src/styles/story-ui.css');
        expect(css).not.toMatch(/^\.progress-(bar|fill)\s*\{/m);
        expect(css).toMatch(/\.screen-story \.progress-bar\s*\{/);
    });

    it('text-ui.css no longer overrides .phase-name (#1781, #1059)', () => {
        expect(read('src/styles/text-ui.css')).not.toMatch(/^\.phase-name\s*\{/m);
        expect(read('src/styles/story-ui.css')).toMatch(/^\.phase-name\s*\{/m);
    });

    it('research inbox .paper-title is scoped to paper cards (#2497)', () => {
        const css = read('src/styles/research-inbox.css');
        expect(css).not.toMatch(/^\.paper-title\s*\{/m);
        expect(css).toMatch(/\.paper-card \.paper-title\s*\{/);
    });
});
