/**
 * AsyncUtils.js
 * Utility functions for asynchronous operations
 */

/**
 * Parallel Limit
 * Run a set of tasks in parallel, with a limit on the number of concurrent tasks
 * @param {Function[]} tasks - Array of task functions that return promises
 * @param {number} limit - Maximum number of concurrent tasks
 * @returns {Promise} - Resolves to an array of results in the same order as tasks
 */
export async function parallelLimit(tasks, limit) {
    const results = [];
    let running = 0;
    let index = 0;

    async function runTask() {
        if (index >= tasks.length) return;
        const task = tasks[index++];
        running++;
        try {
            const result = await task();
            results.push(result);
        } finally {
            running--;
            if (index < tasks.length) {
                await runTask();
            }
        }
    }

    while (running < limit && index < tasks.length) {
        await runTask();
    }

    return results;
}

/**
 * Debounce Async
 * Debounce an asynchronous function, ensuring it's only called after a specified wait time
 * @param {Function} func - The function to debounce
 * @param {number} wait - Time to wait in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounceAsync(func, wait) {
    let timeout;
    let latestResolve;
    let latestReject;

    return function(...args) {
        return new Promise((resolve, reject) => {
            latestResolve = resolve;
            latestReject = reject;

            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    latestResolve(result);
                } catch (error) {
                    latestReject(error);
                }
            }, wait);
        });
    };
}

/**
 * Throttle Async
 * Throttle an asynchronous function, ensuring it's only called once within a specified limit time
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export function throttleAsync(func, limit) {
    let lastCallTime = 0;
    let lastResolve;
    let lastReject;

    return function(...args) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const timeSinceLastCall = now - lastCallTime;

            if (timeSinceLastCall >= limit) {
                lastCallTime = now;
                func(...args)
                    .then(resolve)
                    .catch(reject);
            } else {
                lastResolve = resolve;
                lastReject = reject;
            }
        });
    };
}