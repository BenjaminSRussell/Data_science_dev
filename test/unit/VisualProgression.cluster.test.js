/**
 * VisualProgressionSystem tier notifications, save shape, initial class and
 * tier styles (#2273, #1576, #1578, #1577, #1352)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { VisualProgressionSystem } from '../../src/js/game/visual/VisualProgressionSystem.js';

describe('VisualProgressionSystem', () => {
    beforeEach(() => {
        document.body.className = '';
        document.body.innerHTML = '';
    });

    it('new games get the visual-basic class', () => {
        new VisualProgressionSystem({ money: 0 });
        expect(document.body.classList.contains('visual-basic')).toBe(true);
    });

    it('announces only actual tier changes', () => {
        const state = { money: 0 };
        const vps = new VisualProgressionSystem(state);
        const notify = vi.spyOn(vps, 'showVisualUpgradeNotification').mockImplementation(() => {});

        state.money = 10000;
        expect(vps.checkMilestones()).toBe(true);
        expect(notify).toHaveBeenCalledTimes(1);
        expect(notify).toHaveBeenLastCalledWith('mid', 'money_10k');

        // Another mid milestone: no new tier, no notification
        state.money = 50000;
        expect(vps.checkMilestones()).toBe(false);
        expect(vps.milestones.money_50k.unlocked).toBe(true);
        expect(notify).toHaveBeenCalledTimes(1);

        state.money = 100000;
        expect(vps.checkMilestones()).toBe(true);
        expect(notify).toHaveBeenCalledTimes(2);
        expect(notify).toHaveBeenLastCalledWith('premium', 'money_100k');
    });

    it('several milestones crossed at once give one notification', () => {
        const vps = new VisualProgressionSystem({ money: 600000 });
        const notify = vi.spyOn(vps, 'showVisualUpgradeNotification').mockImplementation(() => {});
        vps.checkMilestones();
        expect(notify).toHaveBeenCalledTimes(1);
        expect(vps.currentTier).toBe('premium');
    });

    it('saves only milestone progress, and round-trips', () => {
        const vps = new VisualProgressionSystem({ money: 20000 });
        vi.spyOn(vps, 'showVisualUpgradeNotification').mockImplementation(() => {});
        vps.checkMilestones();
        const saved = JSON.parse(JSON.stringify(vps.toJSON()));
        expect(saved.milestones.money_10k).toEqual({ unlocked: true });
        expect(saved.milestones.money_100k).toEqual({ unlocked: false });
        expect(saved.milestones.money_10k.threshold).toBeUndefined();

        const restored = new VisualProgressionSystem({ money: 0 });
        restored.fromJSON(saved);
        expect(restored.currentTier).toBe('mid');
        expect(restored.milestones.money_10k.unlocked).toBe(true);
        expect(restored.milestones.money_10k.threshold).toBe(10000);
    });

    it('every tier class it applies has styles, and the stylesheet is linked', () => {
        const css = readFileSync('src/styles/visual-progression.css', 'utf8');
        for (const cls of ['visual-basic', 'visual-mid', 'visual-premium']) expect(css).toContain(`.${cls}`);
        expect(css).toContain('@keyframes visualUpgradeFlash');
        expect(readFileSync('index.html', 'utf8')).toContain('/src/styles/visual-progression.css');
    });
});
