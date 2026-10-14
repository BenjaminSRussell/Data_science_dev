import { describe, it, expect } from 'vitest';
import { GraphValidator } from '../../src/js/dev/GraphValidator.js';

describe('GraphValidator (#2444, #2445)', () => {
    const v = new GraphValidator({});

    it('checks expected values of 0 instead of skipping them', async () => {
        const res = await v.validateDataAccuracy([
            { name: 'zero avg wrong', data: [1, 2, 3], expectedSum: 6, expectedAverage: 0 },
            { name: 'zero min wrong', data: [1, 2], expectedSum: 3, expectedMin: 0 },
        ]);
        expect(res.failed).toBe(2);
        expect(res.errors[0].errors[0]).toMatch(/Average mismatch/);
        expect(res.errors[1].errors[0]).toMatch(/Min mismatch/);
    });

    it('built-in cases (including zero-valued expectations) all pass', async () => {
        const res = await v.validateDataAccuracy();
        expect(res.failed).toBe(0);
        expect(res.total).toBe(GraphValidator.DATA_ACCURACY_CASES.length);
    });

    it('flags datasets whose length does not match labels', () => {
        const short = v.validateChartDataIntegrity({ labels: ['a', 'b', 'c'], datasets: [{ data: [1, 2] }] });
        expect(short.valid).toBe(false);
        expect(short.issues[0]).toMatch(/2 values for 3 labels/);
        const ok = v.validateChartDataIntegrity({ labels: ['a', 'b'], datasets: [{ data: [1, 2] }] });
        expect(ok.valid).toBe(true);
    });
});
