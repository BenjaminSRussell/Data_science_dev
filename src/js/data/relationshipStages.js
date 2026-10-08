/**
 * The one relationship-stage scale for every 0-100 relationship number
 * (#916, #566). Stage names, order and floors follow the character design
 * docs' "Standard Dialogue Progression" (Stranger / Friendly / Acquaintance /
 * Friend / Close Friend) and the NPC dialogue files, whose `stages` objects
 * are keyed by these tiers. There is no "best friend" stage in any doc.
 */
export const RELATIONSHIP_STAGES = Object.freeze([
    Object.freeze({ tier: 'stranger', label: 'Stranger', min: 0, color: '#888' }),
    Object.freeze({ tier: 'friendly', label: 'Friendly', min: 20, color: '#4ecdc4' }),
    Object.freeze({ tier: 'acquaintance', label: 'Acquaintance', min: 40, color: '#6bcb77' }),
    Object.freeze({ tier: 'friend', label: 'Friend', min: 60, color: '#a855f7' }),
    Object.freeze({ tier: 'close_friend', label: 'Close Friend', min: 80, color: '#ffd93d' })
]);

/**
 * Stage for a relationship value; non-numbers count as 0.
 * @param {number} level 0-100
 * @returns {{tier: string, label: string, min: number, color: string}}
 */
export function relationshipStage(level) {
    const value = Number(level);
    const v = Number.isFinite(value) ? value : 0;
    let stage = RELATIONSHIP_STAGES[0];
    for (const s of RELATIONSHIP_STAGES) {
        if (v >= s.min) stage = s;
    }
    return stage;
}
