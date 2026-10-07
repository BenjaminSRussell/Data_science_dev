/**
 * Single source of truth for "is developer tooling enabled?".
 * Used by main.js (to decide whether to load dev tools), DevTools and DevMenu
 * so the three gates can never disagree (#1744).
 */
export function isDevModeEnabled(win = (typeof window !== 'undefined' ? window : undefined)) {
    if (!win) return false;
    const host = win.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    try {
        if (win.localStorage?.getItem('dev_mode') === 'true') return true;
    } catch (_) { /* storage disabled */ }
    try {
        return new URLSearchParams(win.location?.search || '').has('dev');
    } catch (_) {
        return false;
    }
}
