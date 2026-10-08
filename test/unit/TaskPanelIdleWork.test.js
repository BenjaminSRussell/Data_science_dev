/**
 * #1133: one renderer owns the task/boss panel, so TaskSystem and UIUpdater
 * agree no matter which ran last.
 * #263: an idle freelance project gets a spaced-out reminder.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderTaskPanel, bossMoodText, DEFAULT_TASK_DESCRIPTION } from '../../src/js/ui/taskPanel.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';

const PANEL = `
  <div id="boss-dialogue"><p></p></div><div id="boss-name"></div><div><div id="boss-title"></div></div>
  <div id="boss-avatar"></div><div id="boss-mood"></div>
  <div id="task-content"><p class="task-description"></p><div class="task-requirements"></div></div>
  <span id="task-reward"></span><table id="data-table"><thead><tr></tr></thead><tbody></tbody></table>`;

function task(overrides = {}) {
    return {
        template: { description: '' },
        requirements: ['Bar chart'],
        potentialReward: 12345,
        boss: { id: 'b1', name: '', title: '', taskIntro: 'Get me numbers.', personality: 'traditional', mood: 'grumpy' },
        data: { columns: ['a', 'b'], rows: [[1, 2]] },
        ...overrides
    };
}

function snapshot() {
    return ['#boss-name', '#boss-title', '#boss-dialogue p', '#task-content .task-description', '#task-reward', '.task-requirements', '#boss-mood']
        .map(sel => document.querySelector(sel).textContent);
}

describe('task panel has one owner (#1133)', () => {
    beforeEach(() => { document.body.innerHTML = PANEL; });

    it('renders fallbacks and comma-formatted reward', () => {
        renderTaskPanel(task(), {});
        expect(document.querySelector('.task-description').textContent).toBe(DEFAULT_TASK_DESCRIPTION);
        expect(document.getElementById('boss-name').textContent).toBe('Mr. Anderson');
        expect(document.getElementById('task-reward').textContent).toContain('$12,345');
        expect(document.getElementById('boss-mood').textContent).toBe(bossMoodText(task().boss));
    });

    it('TaskSystem and UIUpdater produce the same panel in either order', () => {
        const gameState = { currentTask: task(), purchasedItems: [] };
        const ts = Object.create(TaskSystem.prototype);
        ts.gameState = gameState;
        const ui = Object.create(UIUpdater.prototype);
        Object.defineProperty(ui, 'gameState', { get: () => gameState });
        ui.game = { taskSystem: ts };

        ts.updateBossDialogue();
        const tsFirst = snapshot();
        document.body.innerHTML = PANEL;
        ts.currentTableData = null;
        ui.updateTaskDisplay();
        const uiOnly = snapshot();
        document.body.innerHTML = PANEL;
        ui.updateTaskDisplay();
        ts.updateBossDialogue();
        expect(snapshot()).toEqual(tsFirst);
        expect(uiOnly).toEqual(tsFirst);
    });

    it('TaskSystem.bossMoodText still works', () => {
        expect(TaskSystem.bossMoodText({ mood: 'happy', personality: 'data_driven' })).toBe('Mood: Happy · Style: Data driven');
    });
});

describe('idle project reminder (#263)', () => {
    function setup() {
        const gameState = { reputation: 1000, money: 0, timeManager: { totalDays: 10 }, characterStats: { getStat: () => 999 } };
        const ps = new ProjectSystem(gameState);
        const id = ps.availableContracts[0].id;
        expect(ps.startProject(id).success).toBe(true);
        return { ps, gameState };
    }

    it('stays quiet while the work is fresh', () => {
        const { ps } = setup();
        expect(ps.checkIdleWork(10)).toBeNull();
        expect(ps.checkIdleWork(12)).toBeNull();
    });

    it('reminds once the idle threshold is crossed, then spaces reminders out', () => {
        const { ps } = setup();
        const r = ps.checkIdleWork(13);
        expect(r).toMatchObject({ idleDays: 3 });
        expect(r.message).toMatch(/idle for 3 days/);
        expect(ps.checkIdleWork(14)).toBeNull();
        expect(ps.checkIdleWork(15)).toBeNull();
        expect(ps.checkIdleWork(16)).toMatchObject({ idleDays: 6 });
    });

    it('working on the project resets the idle clock', () => {
        const { ps, gameState } = setup();
        gameState.timeManager.totalDays = 12;
        ps.workOnProject(1);
        expect(ps.checkIdleWork(14)).toBeNull();
        expect(ps.checkIdleWork(15)).toMatchObject({ idleDays: 3 });
    });

    it('no project, no reminder; old saves start their idle clock on first check', () => {
        const gameState = { reputation: 0, timeManager: { totalDays: 50 } };
        const ps = new ProjectSystem(gameState);
        expect(ps.checkIdleWork()).toBeNull();
        ps.activeProject = { id: 'old', title: 'Old', stages: [{ name: 'S', maxProgress: 10 }], currentStageIndex: 0 };
        expect(ps.checkIdleWork(50)).toBeNull();
        expect(ps.checkIdleWork(53)).toMatchObject({ idleDays: 3 });
    });
});
