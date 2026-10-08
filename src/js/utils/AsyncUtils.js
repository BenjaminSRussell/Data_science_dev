/**
 * AsyncUtils.js
 * Async/await utility functions
 */

export class AsyncUtils {
    /**
     * Delay execution
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Timeout promise
     */
    static timeout(promise, ms, errorMessage = 'Operation timed out') {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(errorMessage)), ms)
            )
        ]);
    }

    /**
     * Retry with exponential backoff
     */
    static async retry(fn, options = {}) {
        const {
            retries = 3,
            delay = 1000,
            backoff = 2,
            onRetry = null
        } = options;

        let lastError;
        let currentDelay = delay;
        // `retries` is the total number of attempts; 0 (or less) still makes
        // one attempt rather than throwing undefined without calling fn (#2410)
        const attempts = Math.max(1, Math.floor(Number(retries)) || 0);

        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < attempts - 1) {
                    if (onRetry) onRetry(i + 1, error);
                    await this.delay(currentDelay);
                    currentDelay *= backoff;
                }
            }
        }

        throw lastError;
    }

    /**
     * Parallel execution with limit
     */
    static async parallelLimit(tasks, limit = 5) {
        const results = [];
        const executing = [];

        const max = Math.max(1, Math.floor(Number(limit)) || 1);

        for (const task of tasks) {
            const promise = Promise.resolve().then(() => task());
            // Free the slot whether the task resolves or rejects, so one failure
            // can't stop the remaining tasks from starting (#2409)
            const slot = promise.then(() => {}, () => {}).then(() => {
                executing.splice(executing.indexOf(slot), 1);
            });

            results.push(promise);
            executing.push(slot);

            if (executing.length >= max) {
                await Promise.race(executing);
            }
        }

        // Every task has been started; reject with the first failure (if any)
        return Promise.all(results);
    }

    /**
     * Sequential execution
     */
    static async sequential(tasks) {
        const results = [];
        for (const task of tasks) {
            results.push(await task());
        }
        return results;
    }

    /**
     * All settled (doesn't fail on first error)
     */
    static async allSettled(promises) {
        return Promise.allSettled(promises);
    }

    /**
     * Race with timeout
     */
    static async raceWithTimeout(promises, timeoutMs) {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        );
        return Promise.race([...promises, timeoutPromise]);
    }

    /**
     * Debounce async function
     */
    static debounceAsync(func, wait) {
        let timeout;
        let latestArgs;
        let pendingResolvers = [];

        return function executedFunction(...args) {
            return new Promise((resolve, reject) => {
                latestArgs = args;
                pendingResolvers.push({ resolve, reject });

                clearTimeout(timeout);
                timeout = setTimeout(async () => {
                    const resolvers = pendingResolvers;
                    pendingResolvers = [];
                    try {
                        const result = await func(...latestArgs);
                        resolvers.forEach(({ resolve: r }) => r(result));
                    } catch (error) {
                        resolvers.forEach(({ reject: r }) => r(error));
                    }
                }, wait);
            });
        };
    }

    /**
     * Throttle async function
     */
    static throttleAsync(func, limit) {
        let inThrottle = false;
        let settled = false;
        let failed = false;
        let lastResult;
        let lastError;
        let pending = [];

        return function executedFunction(...args) {
            return new Promise((resolve, reject) => {
                if (!inThrottle) {
                    // Leading call: run func and settle this call's own promise
                    // plus every call that arrived while it was in flight.
                    inThrottle = true;
                    settled = false;
                    Promise.resolve()
                        .then(() => func(...args))
                        .then(result => {
                            lastResult = result;
                            lastError = undefined;
                            failed = false;
                            settled = true;
                            resolve(result);
                            pending.forEach(({ resolve: r }) => r(result));
                        }, error => {
                            lastError = error;
                            failed = true;
                            settled = true;
                            reject(error);
                            pending.forEach(({ reject: r }) => r(error));
                        })
                        .finally(() => {
                            pending = [];
                            setTimeout(() => {
                                inThrottle = false;
                            }, limit);
                        });
                } else if (settled) {
                    // Inside the throttle window after the call settled
                    if (failed) reject(lastError);
                    else resolve(lastResult);
                } else {
                    // In flight: wait for the leading call to settle
                    pending.push({ resolve, reject });
                }
            });
        };
    }
}



