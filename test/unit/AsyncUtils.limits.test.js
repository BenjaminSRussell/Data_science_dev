import { describe, it, expect, vi, afterEach } from 'vitest';
import { AsyncUtils } from '../../src/js/utils/AsyncUtils.js';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

describe('AsyncUtils parallelLimit / debounceAsync / throttleAsync (#474)', () => {
    afterEach(() => vi.useRealTimers());

    it('parallelLimit never exceeds the limit and keeps submission order', async () => {
        let running = 0;
        let peak = 0;
        const durations = [30, 5, 20, 1, 10, 2];
        const tasks = durations.map((ms, i) => async () => {
            running++;
            peak = Math.max(peak, running);
            await wait(ms);
            running--;
            return i;
        });
        const results = await AsyncUtils.parallelLimit(tasks, 2);
        expect(results).toEqual([0, 1, 2, 3, 4, 5]);
        expect(peak).toBeLessThanOrEqual(2);
    });

    it('debounceAsync runs once with the latest args and settles every caller', async () => {
        vi.useFakeTimers();
        const fn = vi.fn(async (x) => x * 10);
        const d = AsyncUtils.debounceAsync(fn, 50);
        const p1 = d(1);
        const p2 = d(2);
        const p3 = d(3);
        await vi.advanceTimersByTimeAsync(60);
        await expect(Promise.all([p1, p2, p3])).resolves.toEqual([30, 30, 30]);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
    });

    it('debounceAsync rejects every pending caller when func throws', async () => {
        vi.useFakeTimers();
        const d = AsyncUtils.debounceAsync(async () => { throw new Error('boom'); }, 10);
        const p1 = d();
        const p2 = d();
        const both = Promise.allSettled([p1, p2]);
        await vi.advanceTimersByTimeAsync(20);
        const res = await both;
        expect(res.map(r => r.status)).toEqual(['rejected', 'rejected']);
    });

    it('throttleAsync settles the leading call and callers that arrive while it is in flight', async () => {
        let release;
        const fn = vi.fn(() => new Promise(r => { release = r; }));
        const t = AsyncUtils.throttleAsync(fn, 20);
        const p1 = t('a');
        const p2 = t('b');
        await Promise.resolve();
        release('done');
        await expect(p1).resolves.toBe('done');
        await expect(p2).resolves.toBe('done');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('a');
    });

    it('throttleAsync returns the cached result inside the window and runs again after it', async () => {
        const fn = vi.fn(async (x) => x);
        const t = AsyncUtils.throttleAsync(fn, 20);
        await expect(t(1)).resolves.toBe(1);
        await expect(t(2)).resolves.toBe(1);
        expect(fn).toHaveBeenCalledTimes(1);
        await wait(30);
        await expect(t(3)).resolves.toBe(3);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throttleAsync propagates errors to in-flight callers', async () => {
        const t = AsyncUtils.throttleAsync(async () => { throw new Error('nope'); }, 10);
        const res = await Promise.allSettled([t(), t()]);
        expect(res.map(r => r.status)).toEqual(['rejected', 'rejected']);
    });
});
