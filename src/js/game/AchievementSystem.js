/**
 * AchievementSystem.js
 * Milestone achievements built from state the game already tracks (#258).
 * Earned achievements live in gameState.completedAchievements (saved with
 * GameState), each as { id, day, earnedAt }, and are never awarded twice.
 */

const relationshipValues = gs => Object.values(gs?.npcManager?.relationships || {}).map(Number);

export const ACHIEVEMENTS = [
    { id: 'first_task', name: 'Hello, World', description: 'Complete your first chart request',
        test: gs => (Number(gs.tasksCompleted) || 0) >= 1 },
    { id: 'first_promotion', name: 'Moving Up', description: 'Earn your first promotion',
        test: gs => (Number(gs.rankIndex) || 0) >= 1 },
    { id: 'perfect_chart', name: 'Pixel Perfect', description: 'Deliver a perfect-score chart',
        test: gs => (Number(gs.perfectScores) || 0) >= 1 },
    { id: 'earned_10k', name: 'Five Figures', description: 'Earn $10,000 in total',
        test: gs => (Number(gs.totalEarned) || 0) >= 10000 },
    { id: 'first_project', name: 'Freelancer', description: 'Finish a freelance project',
        test: gs => (gs.projectSystem?.completedProjects || []).length >= 1 },
    { id: 'close_friend', name: 'Inner Circle', description: 'Become close friends with someone (relationship 80+)',
        test: gs => relationshipValues(gs).some(v => v >= 80) },
    { id: 'first_crime', name: 'Off the Books', description: 'Commit your first crime',
        test: gs => (Number(gs.crimeSystem?.crimesCommitted) || 0) >= 1 },
    { id: 'first_year', name: 'One Year In', description: 'Survive a full year in the city',
        test: gs => (Number(gs.timeManager?.totalDays) || 0) >= 365 },
    { id: 'chief_data_officer', name: 'The Top', description: 'Reach Chief Data Officer',
        test: gs => (Number(gs.rankIndex) || 0) >= 6 }
];

export class AchievementSystem {
    /**
     * Award every achievement whose condition now holds and that hasn't been
     * earned yet.
     * @param {object} gameState
     * @returns {Array<{id: string, name: string, description: string}>} newly earned
     */
    static check(gameState) {
        if (!gameState) return [];
        if (!Array.isArray(gameState.completedAchievements)) gameState.completedAchievements = [];
        const have = new Set(gameState.completedAchievements.map(a => (typeof a === 'string' ? a : a?.id)));
        const earned = [];
        for (const a of ACHIEVEMENTS) {
            if (have.has(a.id)) continue;
            let ok = false;
            try { ok = Boolean(a.test(gameState)); } catch { ok = false; }
            if (!ok) continue;
            gameState.completedAchievements.push({
                id: a.id,
                day: Number(gameState.timeManager?.totalDays) || 0,
                earnedAt: Date.now()
            });
            have.add(a.id);
            earned.push({ id: a.id, name: a.name, description: a.description });
        }
        return earned;
    }

    /** Saved achievement list, cleaned of junk and duplicates */
    static normalize(list) {
        if (!Array.isArray(list)) return [];
        const seen = new Set();
        const out = [];
        for (const entry of list) {
            const id = typeof entry === 'string' ? entry : entry?.id;
            if (typeof id !== 'string' || seen.has(id)) continue;
            seen.add(id);
            out.push(typeof entry === 'string' ? { id, day: 0, earnedAt: 0 } : { ...entry, id });
        }
        return out;
    }
}
