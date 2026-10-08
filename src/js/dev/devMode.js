/**
 * Single source of truth for "is developer tooling enabled?".
 * Used by main.js (to decide whether to load dev tools), DevTools and DevMenu
 * so the three gates can never disagree (#1744).
 */
const OFF_VALUES = ['0', 'off', 'false', 'no'];

function devParam(win) {
    try {
        const params = new URLSearchParams(win.location?.search || '');
        return params.has('dev') ? (params.get('dev') || '').toLowerCase() : null;
    } catch (_) {
        return null;
    }
}

/**
 * Turn dev tooling off for this browser (clears the stored flag)
 */
export function disableDevMode(win = (typeof window !== 'undefined' ? window : undefined)) {
    try { win?.localStorage?.removeItem('dev_mode'); } catch (_) { /* storage disabled */ }
}

/**
 * ?dev only applies to the page it's on; it no longer writes a flag that
 * keeps the cheat menu on forever. ?dev=off clears an old stored flag (#1743).
 */
export function isDevModeEnabled(win = (typeof window !== 'undefined' ? window : undefined)) {
    if (!win) return false;
    const param = devParam(win);
    if (param !== null && OFF_VALUES.includes(param)) {
        disableDevMode(win);
        return false;
    }
    const host = win.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (param !== null) return true;
    try {
        if (win.localStorage?.getItem('dev_mode') === 'true') return true;
    } catch (_) { /* storage disabled */ }
    return false;
}
