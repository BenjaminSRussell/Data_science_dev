import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AISystem } from '../../src/js/game/AISystem.js';

const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(root, 'src/styles/game-panels.css'), 'utf8');
const block = (sel) => {
    const i = css.indexOf(`${sel} {`);
    return i === -1 ? '' : css.slice(i, css.indexOf('}', i));
};

describe('work-session overlay is styled as a blocking panel (#2291)', () => {
    it('is fixed, full-screen, on the modal layer, with a backdrop', () => {
        const b = block('.working-overlay');
        expect(b).toMatch(/position:\s*fixed/);
        expect(b).toMatch(/inset:\s*0/);
        expect(b).toMatch(/z-index:\s*var\(--z-modal\)/);
        expect(b).toMatch(/background:/);
        expect(block('.working-overlay.hidden')).toMatch(/display:\s*none/);
    });

    it('styles the overlay parts index.html actually renders', () => {
        const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        expect(html).toContain('id="working-overlay" class="working-overlay hidden"');
        for (const sel of ['.working-container', '.working-visuals .code-stream', '.working-stats .stat-row', '.working-container .progress-fill']) {
            expect(block(sel)).not.toBe('');
        }
    });
});

describe('AISystem has no dead isTraining flag (#1808)', () => {
    it('is not created, saved or restored', () => {
        const ai = new AISystem({});
        expect(ai).not.toHaveProperty('isTraining');
        expect(ai.toJSON()).not.toHaveProperty('isTraining');
        ai.fromJSON({ level: 2, isTraining: true });
        expect(ai).not.toHaveProperty('isTraining');
        expect(ai.level).toBe(2);
    });
});
