/**
 * Unit tests for PerformanceUtils
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceUtils } from '../../src/js/utils/PerformanceUtils.js';

describe('PerformanceUtils', () => {
    describe('memoize', () => {
        it('should call underlying fn once for repeated same argument', () => {
            const fn = vi.fn((x) => x * 2);
            const memoized = PerformanceUtils.memoize(fn);

            const first = memoized(5);
            const second = memoized(5);

            expect(first).toBe(10);
            expect(second).toBe(10);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should invoke fn again for a different argument', () => {
            const fn = vi.fn((x) => x * 2);
            const memoized = PerformanceUtils.memoize(fn);

            memoized(5);
            memoized(7);

            expect(fn).toHaveBeenCalledTimes(2);
            expect(memoized(7)).toBe(14);
        });

        it('should reuse cached result when custom keyGenerator collapses different args', () => {
            const fn = vi.fn((a, b) => a + b);
            // Collapse all calls to the same key
            const keyGenerator = vi.fn(() => 'same-key');
            const memoized = PerformanceUtils.memoize(fn, keyGenerator);

            const first = memoized(1, 2);
            const second = memoized(3, 4);

            expect(first).toBe(3);
            expect(second).toBe(3);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(keyGenerator).toHaveBeenCalledTimes(2);
        });
    });

    describe('createPool', () => {
        it('should call factory for each acquire on an empty pool', () => {
            const factory = vi.fn(() => ({ id: Math.random() }));
            const pool = PerformanceUtils.createPool(factory);

            const a = pool.acquire();
            const b = pool.acquire();

            expect(factory).toHaveBeenCalledTimes(2);
            expect(pool.created).toBe(2);
            expect(a).not.toBe(b);
        });

        it('should call reset on release and reuse released object without calling factory', () => {
            const factory = vi.fn(() => ({ value: 1 }));
            const reset = vi.fn();
            const pool = PerformanceUtils.createPool(factory, reset);

            const obj = pool.acquire();
            expect(factory).toHaveBeenCalledTimes(1);

            pool.release(obj);
            expect(reset).toHaveBeenCalledTimes(1);
            expect(reset).toHaveBeenCalledWith(obj);
            expect(pool.size).toBe(1);

            const reacquired = pool.acquire();
            expect(reacquired).toBe(obj);
            expect(factory).toHaveBeenCalledTimes(1);
        });

        it('should never exceed maxSize when releasing', () => {
            const factory = vi.fn(() => ({}));
            const pool = PerformanceUtils.createPool(factory, null, 2);

            const a = pool.acquire();
            const b = pool.acquire();
            const c = pool.acquire();

            pool.release(a);
            pool.release(b);
            pool.release(c);

            expect(pool.size).toBe(2);
        });
    });

    describe('batch', () => {
        it('should split 25 items with batchSize 10 into chunks of [10, 10, 5]', () => {
            const items = Array.from({ length: 25 }, (_, i) => i);
            const batches = PerformanceUtils.batch(items, 10);

            expect(batches).toHaveLength(3);
            expect(batches[0]).toHaveLength(10);
            expect(batches[1]).toHaveLength(10);
            expect(batches[2]).toHaveLength(5);
            expect(batches[0]).toEqual(items.slice(0, 10));
            expect(batches[1]).toEqual(items.slice(10, 20));
            expect(batches[2]).toEqual(items.slice(20, 25));
        });
    });

    describe('measure', () => {
        it('should pass through the sync return value unchanged', () => {
            const fn = vi.fn(() => 42);
            const result = PerformanceUtils.measure('test', fn);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(result).toBe(42);
        });

        it('should pass through object return values unchanged', () => {
            const value = { a: 1 };
            const result = PerformanceUtils.measure('test', () => value);
            expect(result).toBe(value);
        });
    });

    describe('measureAsync', () => {
        it('should pass through the async return value unchanged', async () => {
            const fn = vi.fn(async () => 'done');
            const result = await PerformanceUtils.measureAsync('test', fn);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(result).toBe('done');
        });
    });

    describe('rafDebounce', () => {
        let rafStub;
        let cancelStub;

        beforeEach(() => {
            rafStub = vi.fn((cb) => {
                rafStub.lastCallback = cb;
                return rafStub.mock.invocationCallOrder.length;
            });
            cancelStub = vi.fn();
            global.requestAnimationFrame = rafStub;
            global.cancelAnimationFrame = cancelStub;
        });

        afterEach(() => {
            delete global.requestAnimationFrame;
            delete global.cancelAnimationFrame;
        });

        it('should cancel previously scheduled frame and only run last call args', () => {
            const func = vi.fn();
            const debounced = PerformanceUtils.rafDebounce(func);

            debounced(1);
            debounced(2);
            debounced(3);

            // Each call after the first cancels the previous frame
            expect(cancelStub).toHaveBeenCalledTimes(2);
            expect(rafStub).toHaveBeenCalledTimes(3);

            // Only the last scheduled callback should run
            rafStub.lastCallback();

            expect(func).toHaveBeenCalledTimes(1);
            expect(func).toHaveBeenCalledWith(3);
        });
    });
});
