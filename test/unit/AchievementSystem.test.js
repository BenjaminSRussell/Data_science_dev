/**
 * Achievements from milestones the game already tracks (#258)
 */
import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { AchievementSystem, ACHIEVEMENTS } from '../../src/js/game/AchievementSystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { MainGame } from '../../src/js/main.js';

describe('AchievementSystem (#258)', () => {
    it('awards an achievement once even while its condition stays true', () => {
        const gs = { tasksCompleted: 1, timeManager: { totalDays: 4 } };
        const first = AchievementSystem.check(gs);
        expect(first.map(a => a.id)).toEqual(['first_task']);
        expect(gs.completedAchievements[0]).toMatchObject({ id: 'first_task', day: 4 });
        expect(AchievementSystem.check(gs)).toEqual([]);
        expect(AchievementSystem.check(gs)).toEqual([]);
        expect(gs.completedAchievements).toHaveLength(1);
    });

    it('detects each milestone from existing state', () => {
        const gs = {
            tasksCompleted: 5, rankIndex: 6, perfectScores: 1, totalEarned: 12000,
            projectSystem: { completedProjects: ['crypto_scraper'] },
            npcManager: { relationships: { a: 10, b: 85 } },
            crimeSystem: { crimesCommitted: 1 },
            timeManager: { totalDays: 400 }
        };
        const ids = AchievementSystem.check(gs).map(a => a.id).sort();
        expect(ids).toEqual(ACHIEVEMENTS.map(a => a.id).sort());
    });

    it('nothing is earned on a fresh game', () => {
        expect(AchievementSystem.check({ timeManager: { totalDays: 0 } })).toEqual([]);
    });

    it('completedAchievements round-trips through GameState save/load', () => {
        const gs = new GameState();
        gs.tasksCompleted = 1;
        gs.perfectScores = 1;
        AchievementSystem.check(gs);
        const restored = new GameState();
        restored.fromJSON(JSON.parse(JSON.stringify(gs.toJSON())));
        expect(restored.completedAchievements.map(a => a.id).sort()).toEqual(['first_task', 'perfect_chart']);
        // Restored achievements are not re-awarded
        expect(AchievementSystem.check(restored)).toEqual([]);
    });

    it('normalize drops junk and duplicates and accepts bare ids', () => {
        expect(AchievementSystem.normalize(null)).toEqual([]);
        const out = AchievementSystem.normalize(['first_task', { id: 'first_task' }, 7, { id: 'earned_10k', day: 3 }]);
        expect(out.map(a => a.id)).toEqual(['first_task', 'earned_10k']);
    });

    it('renders locked and unlocked badges for the components.css classes (#1668)', () => {
        const list = document.createElement('div');
        AchievementSystem.renderBadges(list, [{ id: 'first_task' }, 'earned_10k', { id: 'first_task' }, 7]);
        const badges = [...list.querySelectorAll('.achievement')];
        expect(badges).toHaveLength(ACHIEVEMENTS.length);
        expect(badges.map(b => b.dataset.achievement)).toEqual(ACHIEVEMENTS.map(a => a.id));
        const unlocked = badges.filter(b => b.classList.contains('unlocked')).map(b => b.dataset.achievement).sort();
        expect(unlocked).toEqual(['earned_10k', 'first_task']);
        const hello = list.querySelector('[data-achievement="first_task"]');
        expect(hello.querySelector('.achievement-icon').textContent).toBe('★');
        expect(hello.querySelector('.achievement-icon').getAttribute('aria-hidden')).toBe('true');
        expect(hello.querySelector('.achievement-info .achievement-name').textContent).toBe('Hello, World');
        expect(hello.querySelector('.achievement-desc').textContent).toBe('Complete your first chart request');
        const locked = list.querySelector('[data-achievement="first_year"]');
        expect(locked.classList.contains('unlocked')).toBe(false);
        expect(locked.querySelector('.achievement-icon').textContent).toBe('○');
        AchievementSystem.renderBadges(null, []);
        AchievementSystem.renderBadges(list, null);
        expect(list.querySelectorAll('.achievement')).toHaveLength(ACHIEVEMENTS.length);
        expect(list.querySelectorAll('.achievement.unlocked')).toHaveLength(0);
    });

    it('MainGame.checkAchievements toasts each newly earned achievement', () => {
        const fake = { gameState: { tasksCompleted: 1, timeManager: { totalDays: 1 } }, showToast: vi.fn() };
        const earned = MainGame.prototype.checkAchievements.call(fake);
        expect(earned).toHaveLength(1);
        expect(fake.showToast).toHaveBeenCalledWith(expect.stringContaining('Achievement unlocked: Hello, World'), 'success');
        MainGame.prototype.checkAchievements.call(fake);
        expect(fake.showToast).toHaveBeenCalledTimes(1);
    });
});
