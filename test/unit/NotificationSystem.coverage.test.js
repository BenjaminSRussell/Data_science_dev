/**
 * NotificationSystem scheduling, triggering and rendering (#438 #2235 #2423)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationSystem } from '../../src/js/game/NotificationSystem.js';

describe('NotificationSystem coverage', () => {
    let gs, ns;
    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        delete window.game;
        gs = { timeManager: { timeSlot: 2, totalDays: 1 }, dayNightCycle: { getTimeOfDay: () => 'morning' } };
        ns = new NotificationSystem(gs);
    });
    afterEach(() => { vi.useRealTimers(); delete window.game; });

    it('scheduleNotification applies defaults', () => {
        ns.scheduleNotification({ time: 'noon', message: 'hi' });
        expect(ns.scheduledNotifications[0]).toMatchObject({ time: 'noon', message: 'hi', type: 'info', action: null, repeat: false });
        expect(typeof ns.scheduledNotifications[0].id).toBe('string');
    });

    it('shouldTrigger matches time-of-day strings and numeric slots', () => {
        expect(ns.shouldTrigger({ time: 'morning' }, 'morning', 0)).toBe(true);
        expect(ns.shouldTrigger({ time: 3 }, 'noon', 3)).toBe(true);
        expect(ns.shouldTrigger({ time: 3 }, 'noon', 4)).toBe(false);
        expect(ns.shouldTrigger({ time: 'night' }, 'morning', 3)).toBe(false);
    });

    it('checkNotifications returns early without a timeManager', () => {
        ns.gameState = {};
        const spy = vi.spyOn(ns, 'triggerNotification');
        ns.scheduleNotification({ time: 'morning', message: 'x' });
        ns.checkNotifications();
        expect(spy).not.toHaveBeenCalled();
    });

    it('defaults to morning when there is no dayNightCycle, and one-shots are removed', () => {
        delete gs.dayNightCycle;
        window.game = { showToast: vi.fn() };
        ns.scheduleNotification({ id: 'a', time: 'morning', message: 'A' });
        ns.scheduleNotification({ id: 'b', time: 2, message: 'B' });
        ns.scheduleNotification({ id: 'c', time: 'night', message: 'C' });
        ns.checkNotifications();
        expect(window.game.showToast).toHaveBeenCalledTimes(2);
        expect(ns.scheduledNotifications.map(n => n.id)).toEqual(['c']);
    });

    it('default reminders repeat once per day', () => {
        window.game = { showToast: vi.fn() };
        ns.scheduleDefaultNotifications();
        expect(ns.scheduledNotifications.map(n => [n.id, n.time])).toEqual([
            ['morning_reminder', 'morning'], ['noon_reminder', 'noon'], ['night_reminder', 'night']
        ]);
        ns.checkNotifications();
        ns.checkNotifications();
        expect(window.game.showToast).toHaveBeenCalledTimes(1);
        gs.timeManager.totalDays = 2;
        ns.checkNotifications();
        expect(window.game.showToast).toHaveBeenCalledTimes(2);
        expect(ns.scheduledNotifications).toHaveLength(3);
    });

    it('fallback element: class, single stylesheet, auto-removal', () => {
        vi.useFakeTimers();
        ns.showNotification('one', 'warning');
        ns.showNotification('two', 'info');
        expect(document.querySelectorAll('.notification.notification-warning')).toHaveLength(1);
        expect(document.querySelectorAll('#notification-styles')).toHaveLength(1);
        vi.advanceTimersByTime(5300);
        expect(document.querySelectorAll('.notification')).toHaveLength(0);
    });

    it('notifications with an action keep their button even when toasts exist', () => {
        window.game = { showToast: vi.fn() };
        const handler = vi.fn();
        ns.showNotification('Do it', 'info', { text: 'Go', handler });
        expect(window.game.showToast).not.toHaveBeenCalled();
        const btn = document.querySelector('.notification-action');
        expect(btn.textContent).toBe('Go');
        btn.click();
        expect(handler).toHaveBeenCalled();
        expect(document.querySelector('.notification')).toBeNull();
    });
});
