/**
 * Unit tests for AsyncUtils core primitives
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AsyncUtils } from '../../src/js/utils/AsyncUtils.js';

describe('AsyncUtils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('delay', () => {
        it('should resolve after advancing by ms, not before', async () => {
            let resolved = false;
            const p = AsyncUtils.delay(100).then(() => { resolved = true; });

            await vi.advanceTimersByTimeAsync(99);
            expect(resolved).toBe(false);

            await vi.advanceTimersByTimeAsync(1);
            expect(resolved).toBe(true);
            await p;
        });
    });

    describe('timeout', () => {
        it('should reject with default message when not settled by ms', async () => {
            const never = new Promise(() => {});
            const p = AsyncUtils.timeout(never, 100);
            p.catch(() => {}); // avoid unhandled rejection

            await expect(
                vi.advanceTimersByTimeAsync(100).then(() => p)
            ).rejects.toThrow('Operation timed out');
        });

        it('should reject with custom message when not settled by ms', async () => {
            const never = new Promise(() => {});
            const p = AsyncUtils.timeout(never, 50, 'Custom timeout');
            p.catch(() => {});

            await expect(
                vi.advanceTimersByTimeAsync(50).then(() => p)
            ).rejects.toThrow('Custom timeout');
        });

        it('should resolve with value when settled first', async () => {
            const p = AsyncUtils.timeout(Promise.resolve(42), 100);
            await expect(p).resolves.toBe(42);
        });
    });

    describe('retry', () => {
        it('should call fn exactly 3 times, invoke onRetry at attempts 1 and 2, and back off delays 100 then 200', async () => {
            let calls = 0;
            const onRetryCalls = [];
            const fn = () => {
                calls++;
                if (calls < 3) {
                    return Promise.reject(new Error(`fail ${calls}`));
                }
                return Promise.resolve('success');
            };

            const p = AsyncUtils.retry(fn, {
                retries: 3,
                delay: 100,
                backoff: 2,
                onRetry: (attempt, error) => onRetryCalls.push({ attempt, message: error.message })
            });

            // First failure: onRetry(1), sleep 100
            await vi.advanceTimersByTimeAsync(100);
            // Second failure: onRetry(2), sleep 200
            await vi.advanceTimersByTimeAsync(200);

            await expect(p).resolves.toBe('success');
            expect(calls).toBe(3);
            expect(onRetryCalls).toEqual([
                { attempt: 1, message: 'fail 1' },
                { attempt: 2, message: 'fail 2' }
            ]);
        });

        it('should reject with last error after exactly retries calls when all fail', async () => {
            let calls = 0;
            const fn = () => {
                calls++;
                return Promise.reject(new Error(`error ${calls}`));
            };

            const p = AsyncUtils.retry(fn, { retries: 3, delay: 100, backoff: 2 });
            p.catch(() => {});

            // Sleeps after attempts 1 and 2 (100 + 200), no sleep after last attempt
            await vi.advanceTimersByTimeAsync(300);

            await expect(p).rejects.toThrow('error 3');
            expect(calls).toBe(3);
        });
    });

    describe('sequential', () => {
        it('should execute tasks strictly in order, preserving result order', async () => {
            const order = [];
            const t1 = () => { order.push(1); return Promise.resolve('a'); };
            const t2 = () => { order.push(2); return Promise.resolve('b'); };
            const t3 = () => { order.push(3); return Promise.resolve('c'); };

            const results = await AsyncUtils.sequential([t1, t2, t3]);

            expect(results).toEqual(['a', 'b', 'c']);
            expect(order).toEqual([1, 2, 3]);
        });
    });

    describe('allSettled', () => {
        it('should return correct shape entries for mixed resolved/rejected promises', async () => {
            const p1 = Promise.resolve('ok');
            const p2 = Promise.reject(new Error('boom'));

            const results = await AsyncUtils.allSettled([p1, p2]);

            expect(results).toHaveLength(2);
            expect(results[0]).toEqual({ status: 'fulfilled', value: 'ok' });
            expect(results[1].status).toBe('rejected');
            expect(results[1].reason.message).toBe('boom');
        });
    });

    describe('raceWithTimeout', () => {
        it('should reject with Error("Timeout") when nothing resolves within timeoutMs', async () => {
            const slow = new Promise(() => {});
            const p = AsyncUtils.raceWithTimeout([slow], 50);
            p.catch(() => {});

            await expect(
                vi.advanceTimersByTimeAsync(50).then(() => p)
            ).rejects.toThrow('Timeout');
        });

        it('should resolve with the fastest value otherwise', async () => {
            const fast = Promise.resolve('fast');
            const slow = new Promise(() => {});

            const p = AsyncUtils.raceWithTimeout([slow, fast], 50);
            await expect(p).resolves.toBe('fast');
        });
    });
});
