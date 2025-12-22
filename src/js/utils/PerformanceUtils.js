/**
 * PerformanceUtils.js
 * Performance optimization utilities
 */

export class PerformanceUtils {
    /**
     * Memoize function results
     */
    static memoize(fn, keyGenerator = null) {
        const cache = new Map();
        return function memoizedFunction(...args) {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    /**
     * Create object pool for reuse
     */
    static createPool(factory, reset = null, maxSize = 100) {
        const pool = [];
        let created = 0;

        return {
            acquire() {
                if (pool.length > 0) {
                    return pool.pop();
                }
                created++;
                return factory();
            },
            release(obj) {
                if (pool.length < maxSize) {
                    if (reset) reset(obj);
                    pool.push(obj);
                }
            },
            get size() {
                return pool.length;
            },
            get created() {
                return created;
            }
        };
    }

    /**
     * Batch operations
     */
    static batch(operations, batchSize = 100) {
        const batches = [];
        for (let i = 0; i < operations.length; i += batchSize) {
            batches.push(operations.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Request animation frame wrapper
     */
    static raf(callback) {
        return requestAnimationFrame(callback);
    }

    /**
     * Cancel animation frame wrapper
     */
    static cancelRaf(id) {
        cancelAnimationFrame(id);
    }

    /**
     * Measure execution time
     */
    static measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Async measure execution time
     */
    static async measureAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Lazy load module
     */
    static lazyLoad(modulePath) {
        let module = null;
        return async () => {
            if (!module) {
                module = await import(modulePath);
            }
            return module;
        };
    }

    /**
     * Create weak map cache
     */
    static createWeakCache() {
        return new WeakMap();
    }

    /**
     * Debounce with requestAnimationFrame
     */
    static rafDebounce(func) {
        let rafId = null;
        return function executedFunction(...args) {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                func.apply(this, args);
                rafId = null;
            });
        };
    }
}


