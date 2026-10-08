/**
 * Relationships cards (#1466), stock market + Quotron ticker (#2464) and the
 * shop grid's narrow-viewport floor (#883)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const allCss = fs.readdirSync(path.join(root, 'src/styles'))
    .filter(f => f.endsWith('.css'))
    .map(f => read(`src/styles/${f}`))
    .join('\n');
const defined = (cls) => new RegExp(`\\.${cls.replace(/-/g, '\\-')}(?![\\w-])`).test(allCss);

// Every class a module writes via className = '...', className: '...', or class="..."
function classesIn(file) {
    const src = read(file);
    const out = new Set();
    const patterns = [/className\s*[:=]\s*'([^']+)'/g, /class="([^"$]+)"/g];
    for (const re of patterns) {
        for (const m of src.matchAll(re)) m[1].split(/\s+/).filter(Boolean).forEach(c => out.add(c));
    }
    return [...out];
}

describe('unstyled live panels batch 3', () => {
    it('every relationships-card class is styled (#1466)', () => {
        const classes = classesIn('src/js/helpers/NPCHelpers.js')
            .filter(c => c.startsWith('npc-') || c.startsWith('relationship-'));
        expect(classes.length).toBeGreaterThan(8);
        for (const c of [...classes, 'npc-grid']) expect(defined(c), c).toBe(true);
    });

    it.each(['src/js/helpers/StockMarketHelpers.js', 'src/js/game/QuotronTicker.js'])(
        'every class %s generates is styled (#2464)', (file) => {
            const classes = classesIn(file);
            expect(classes.length).toBeGreaterThan(3);
            for (const c of classes) expect(defined(c), `${file}: ${c}`).toBe(true);
        });

    it('change colours are scoped to the stock screen', () => {
        expect(allCss).toMatch(/#screen-stock-market \.positive\s*\{/);
        expect(allCss).toMatch(/#screen-stock-market \.negative\s*\{/);
    });

    it('shop grid columns can shrink below 250px (#883)', () => {
        const rule = read('src/styles/main.css').match(/\.shop-grid\s*\{[^}]*\}/)[0];
        expect(rule).toMatch(/minmax\(min\(250px,\s*100%\),\s*1fr\)/);
    });
});
