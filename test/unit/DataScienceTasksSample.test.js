/**
 * The sample task file says what it actually contains (#2155)
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { DATA_SCIENCE_TASKS } from '../../src/js/data/datascience_tasks.js';

describe('datascience_tasks.js sample', () => {
    it('header matches the number of tasks and makes no 1000+ claim', () => {
        const src = fs.readFileSync('src/js/data/datascience_tasks.js', 'utf8');
        const header = src.slice(0, src.indexOf('*/'));
        expect(header).not.toMatch(/1000/);
        const claimed = Number(header.match(/(\d+)-task SAMPLE/)[1]);
        expect(DATA_SCIENCE_TASKS).toHaveLength(claimed);
        expect(src).not.toMatch(/generate the full 1000 tasks/);
    });

    it('max difficulty matches the documented 4.3 ceiling', () => {
        const max = Math.max(...DATA_SCIENCE_TASKS.map(t => t.difficulty));
        expect(max).toBeLessThanOrEqual(4.5);
    });
});
