import { describe, it, expect, vi } from 'vitest';
import { AsyncUtils } from '../../src/js/utils/AsyncUtils.js';
import { GraphValidator } from '../../src/js/dev/GraphValidator.js';

describe('AsyncUtils.retry with retries <= 0 (#2410)', () => {
    it('calls fn once and resolves', async () => {
        const fn = vi.fn().mockResolvedValue('ok');
        await expect(AsyncUtils.retry(fn, { retries: 0, delay: 0 })).resolves.toBe('ok');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('rejects with the real error instead of undefined', async () => {
        const err = new Error('boom');
        const fn = vi.fn().mockRejectedValue(err);
        await expect(AsyncUtils.retry(fn, { retries: -2, delay: 0 })).rejects.toBe(err);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('AsyncUtils.parallelLimit after a rejection (#2409)', () => {
    it('still starts every task and rejects with the first error', async () => {
        const started = [];
        const tasks = [0, 1, 2, 3, 4].map(i => () => {
            started.push(i);
            return i === 0
                ? Promise.reject(new Error('first failed'))
                : new Promise(r => setTimeout(() => r(i), 5));
        });
        await expect(AsyncUtils.parallelLimit(tasks, 2)).rejects.toThrow('first failed');
        await new Promise(r => setTimeout(r, 30));
        expect(started).toEqual([0, 1, 2, 3, 4]);
    });

    it('keeps the window bounded when tasks reject', async () => {
        let active = 0;
        let peak = 0;
        const tasks = Array.from({ length: 6 }, (_, i) => async () => {
            active++; peak = Math.max(peak, active);
            await new Promise(r => setTimeout(r, 2));
            active--;
            if (i % 2) throw new Error(`t${i}`);
            return i;
        });
        await expect(AsyncUtils.parallelLimit(tasks, 2)).rejects.toThrow('t1');
        expect(peak).toBeLessThanOrEqual(2);
    });

    it('a synchronously throwing task becomes a rejection, not a crash', async () => {
        const tasks = [() => { throw new Error('sync'); }, () => 2];
        await expect(AsyncUtils.parallelLimit(tasks, 1)).rejects.toThrow('sync');
    });
});

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
