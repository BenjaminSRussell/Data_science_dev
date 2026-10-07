/**
 * StateSerializer - small helpers for giving subsystems a toJSON()/fromJSON()
 * pair that only captures plain, player-visible state (never gameState links).
 */

function cloneValue(value) {
    if (value === undefined) return undefined;
    if (value === null || typeof value !== 'object') return value;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch (_) {
        return value;
    }
}

/**
 * Pick the given fields off a subsystem as a JSON-safe snapshot.
 * @param {Object} source
 * @param {string[]} fields
 * @returns {Object}
 */
export function pickState(source, fields) {
    const out = {};
    if (!source) return out;
    for (const field of fields) {
        if (source[field] !== undefined) out[field] = cloneValue(source[field]);
    }
    return out;
}

/**
 * Apply saved fields back onto a subsystem. Missing fields keep their defaults.
 * @param {Object} target
 * @param {Object} data
 * @param {string[]} fields
 */
export function applyState(target, data, fields) {
    if (!target || !data || typeof data !== 'object') return;
    for (const field of fields) {
        if (data[field] !== undefined) target[field] = cloneValue(data[field]);
    }
}
