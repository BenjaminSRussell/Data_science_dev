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

        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (i < retries - 1) {
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

        for (const task of tasks) {
            const promise = Promise.resolve(task()).then(result => {
                executing.splice(executing.indexOf(promise), 1);
                return result;
            });

            results.push(promise);
            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }

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
        let inThrottle;
        let lastResult;
        let lastArgs;
        let lastResolve;
        let lastReject;

        return function executedFunction(...args) {
            return new Promise((resolve, reject) => {
                lastArgs = args;
                lastResolve = resolve;
                lastReject = reject;

                if (!inThrottle) {
                    inThrottle = true;
                    func(...lastArgs)
                        .then(result => {
                            lastResult = result;
                            lastResolve(result);
                        })
                        .catch(error => {
                            lastReject(error);
                        })
                        .finally(() => {
                            setTimeout(() => {
                                inThrottle = false;
                            }, limit);
                        });
                } else {
                    // Return last result if available
                    if (lastResult !== undefined) {
                        lastResolve(lastResult);
                    }
                }
            });
        };
    }
}



