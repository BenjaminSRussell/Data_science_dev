/**
 * Lightweight guard recommended by docs/reviews/css-architecture-review.md
 * (#272): a bare single-class selector (".foo") may only be defined in one
 * global stylesheet, so a later file can't silently restyle another
 * component. Known, intentional duplicates are allow-listed.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const sheets = [...html.matchAll(/href="\/(src\/styles\/[^"]+\.css)"/g)].map(m => m[1]);

// Identical utility rules or deliberate overrides (see the review)
const ALLOWED = new Set(['hidden', 'stat-card']);

function bareClasses(css) {
    const out = new Set();
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of clean.matchAll(/([^{}]+)\{/g)) {
        const selector = m[1].trim();
        if (selector.startsWith('@') || /^(from|to|\d+%)/.test(selector)) continue;
        for (const part of selector.split(',')) {
            const bare = part.trim().match(/^\.([A-Za-z0-9_-]+)$/);
            if (bare) out.add(bare[1]);
        }
    }
    return out;
}

describe('global stylesheet collisions (#272)', () => {
    it('loads the stylesheets from index.html', () => {
        expect(sheets.length).toBeGreaterThanOrEqual(7);
    });

    it('no bare class is defined in two global stylesheets', () => {
        const owners = new Map();
        const collisions = [];
        for (const sheet of sheets) {
            for (const cls of bareClasses(fs.readFileSync(sheet, 'utf8'))) {
                if (owners.has(cls) && !ALLOWED.has(cls)) collisions.push(`.${cls}: ${owners.get(cls)} and ${sheet}`);
                if (!owners.has(cls)) owners.set(cls, sheet);
            }
        }
        expect(collisions).toEqual([]);
    });
});
