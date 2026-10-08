import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const styles = path.resolve(__dirname, '../../src/styles');
const read = (f) => fs.readFileSync(path.join(styles, f), 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const rootTokens = () => {
    const main = read('main.css');
    const root = main.slice(main.indexOf(':root'), main.indexOf('}', main.indexOf(':root')));
    return new Set([...root.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(m => m[1]));
};

// #1832 research-inbox + emotional-breakdown, #1796 story-ui, #1787 text-ui
const FILES = ['research-inbox.css', 'emotional-breakdown.css', 'story-ui.css', 'text-ui.css'];

describe('stylesheets follow the theme tokens (#1832, #1796, #1787)', () => {
    it.each(FILES)('%s has no hardcoded hex colours', (file) => {
        expect(stripComments(read(file))).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    });

    it.each(FILES)('%s only uses colour tokens defined in :root', (file) => {
        const tokens = rootTokens();
        const used = [...stripComments(read(file)).matchAll(/var\((--color-[a-z0-9-]+)/g)].map(m => m[1]);
        expect(used.length).toBeGreaterThan(0);
        expect(used.filter(t => !tokens.has(t))).toEqual([]);
    });

    it('filled accent buttons use the inverse text token, so they stay readable in light mode', () => {
        const css = stripComments(read('research-inbox.css'));
        for (const sel of ['.unread-label', '.paper-link-btn']) {
            const block = css.slice(css.indexOf(sel + ' {'), css.indexOf('}', css.indexOf(sel + ' {')));
            expect(block).toMatch(/background[^;]*accent-primary/);
            expect(block).toMatch(/\n\s*color:\s*var\(--color-bg-primary\)/);
        }
    });

    it('the status-fill text token is not overridden by the light theme', () => {
        const main = read('main.css');
        const light = main.slice(main.indexOf('[data-theme="light"]'));
        expect(rootTokens().has('--color-on-status')).toBe(true);
        expect(light.slice(0, light.indexOf('}'))).not.toContain('--color-on-status');
    });
});
