/**
 * Shared ethics thresholds. Every system that branches on
 * characterStats.ethics (storyline arc, weekly newspaper, act transitions,
 * narrative themes) uses these so they agree on the player's path (#1190).
 */
export const ETHICS_ARC_THRESHOLD = 30;

/** 'dark' below -30, 'righteous' above +30, otherwise 'balanced' */
export function ethicsBand(ethics) {
    const value = Number(ethics) || 0;
    if (value < -ETHICS_ARC_THRESHOLD) return 'dark';
    if (value > ETHICS_ARC_THRESHOLD) return 'righteous';
    return 'balanced';
}
