/**
 * taskPanel.js
 * The single owner of the task/boss info panel (#1133). TaskSystem (when a
 * task is generated) and UIUpdater (on every UI refresh) both call
 * renderTaskPanel(), so the panel looks the same whichever ran last.
 */
import { insightHint, EconomySystem } from '../game/EconomySystem.js';
import { renderTaskBrief } from '../game/taskBrief.js';

/**
 * One-line summary of a boss's personality and chart tastes for the task
 * panel, e.g. "Traditional · likes bar, line · dislikes radar" (#1854, #2226)
 */
export function bossPreferenceText(boss) {
    if (!boss) return '';
    const prefs = boss.preferences || {};
    const parts = [];
    if (boss.personality) parts.push(boss.personality.charAt(0).toUpperCase() + boss.personality.slice(1));
    if (prefs.likesChartTypes?.length) parts.push(`likes ${prefs.likesChartTypes.join(', ')}`);
    if (prefs.dislikesChartTypes?.length) parts.push(`dislikes ${prefs.dislikesChartTypes.join(', ')}`);
    if (prefs.valuesClarity) parts.push('values clarity');
    if (prefs.valuesCreativity) parts.push('values creativity');
    return parts.join(' · ');
}

/** Text-mode boss mood/style line, e.g. "Mood: Grumpy · Style: Traditional" (#2210) */
export function bossMoodText(boss) {
    const pretty = v => String(v).replace(/[-_]/g, ' ').replace(/^./, c => c.toUpperCase());
    const parts = [];
    if (boss?.mood) parts.push(`Mood: ${pretty(boss.mood)}`);
    if (boss?.personality) parts.push(`Style: ${pretty(boss.personality)}`);
    return parts.join(' · ');
}

export const DEFAULT_TASK_DESCRIPTION = 'Create a visualization for your boss.';
export const DEFAULT_BOSS_NAME = 'Mr. Anderson';
export const DEFAULT_BOSS_TITLE = 'Department Head';

/**
 * Render the task description, requirements, brief, reward and boss info.
 * @param {object} task - gameState.currentTask
 * @param {object} gameState
 * @param {Document|Element} [root]
 */
export function renderTaskPanel(task, gameState, root = (typeof document !== 'undefined' ? document : null)) {
    if (!task || !root) return;
    const $ = sel => root.querySelector(sel);

    const desc = $('#task-content .task-description') || $('.task-description');
    if (desc) desc.textContent = task.template?.description || DEFAULT_TASK_DESCRIPTION;

    const req = $('.task-requirements');
    if (req) {
        const hint = insightHint(gameState, task); // "Data Insight" perk
        req.innerHTML = (Array.isArray(task.requirements) ? task.requirements : [])
            .map(r => `<span class="requirement-tag">${r}</span>`)
            .join('') + (hint ? `<span class="requirement-tag insight-hint">${hint}</span>` : '');
    }

    // Domain, tools, skills, deliverable, context (#2430)
    renderTaskBrief(task, root);

    const reward = $('#task-reward');
    if (reward && task.potentialReward) reward.textContent = EconomySystem.rewardRangeText(task.potentialReward);

    const boss = task.boss;
    if (!boss) return;
    const nameEl = $('#boss-name');
    if (nameEl) nameEl.textContent = boss.name || DEFAULT_BOSS_NAME;
    const titleEl = $('#boss-title');
    if (titleEl) titleEl.textContent = boss.title || DEFAULT_BOSS_TITLE;

    // Personality and chart tastes, which affect the grade (#1854, #2226)
    let prefsEl = $('#boss-preferences');
    if (!prefsEl && titleEl?.parentElement) {
        prefsEl = titleEl.ownerDocument.createElement('div');
        prefsEl.id = 'boss-preferences';
        prefsEl.className = 'boss-preferences';
        titleEl.insertAdjacentElement('afterend', prefsEl);
    }
    if (prefsEl) {
        prefsEl.textContent = bossPreferenceText(boss);
        prefsEl.dataset.bossId = boss.id || '';
    }

    // bosses.js defines taskIntro (not greeting), #2615
    const p = $('#boss-dialogue p');
    const greeting = boss.greeting || boss.taskIntro || boss.intro || task.template?.description;
    if (p && greeting) p.textContent = greeting;

    // avatar is an image path: show it as an image, never as text (#2210)
    const avatarEl = $('#boss-avatar');
    if (avatarEl) {
        avatarEl.textContent = '';
        if (boss.avatar) {
            const img = avatarEl.ownerDocument.createElement('img');
            img.src = boss.avatar;
            img.alt = boss.name || '';
            img.addEventListener('error', () => img.remove());
            avatarEl.appendChild(img);
        }
    }
    const moodEl = $('#boss-mood');
    if (moodEl) moodEl.textContent = bossMoodText(boss);
}
