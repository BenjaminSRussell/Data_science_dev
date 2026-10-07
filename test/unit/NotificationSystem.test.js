import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationSystem } from '../../src/js/game/NotificationSystem.js';

describe('NotificationSystem', () => {
  let notificationSystem;
  let mockGameState;

  beforeEach(() => {
    mockGameState = {
      timeManager: null,
      dayNightCycle: null
    };
    notificationSystem = new NotificationSystem(mockGameState);

    // Clean up any existing notification styles
    const existingStyle = document.getElementById('notification-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.body.innerHTML = '';
  });

  it('should define slideOut keyframe in the injected stylesheet', () => {
    notificationSystem.createNotificationElement('Test message', 'info');

    const styleElement = document.getElementById('notification-styles');
    expect(styleElement).toBeTruthy();

    // Verify that slideOut keyframe is defined in the CSS
    const styleContent = styleElement.textContent;
    expect(styleContent).toContain('@keyframes slideOut');
    expect(styleContent).toContain('transform: translateX(100%)');
    expect(styleContent).toContain('opacity: 0');
  });

  it('should create a notification element', () => {
    notificationSystem.createNotificationElement('Test message', 'info');

    const notification = document.querySelector('.notification');
    expect(notification).toBeTruthy();
    expect(notification.textContent).toContain('Test message');
  });

  it('should apply slideOut animation reference in code', () => {
    // This test verifies that the code attempts to set slideOut animation
    // by checking that the NotificationSystem source contains the animation reference
    const NotificationSystemSource = notificationSystem.constructor.toString();
    expect(NotificationSystemSource).toContain('slideOut');
  });

  it('should schedule a notification', () => {
    notificationSystem.scheduleNotification({
      time: 'morning',
      message: 'Good morning',
      type: 'info'
    });

    expect(notificationSystem.scheduledNotifications).toHaveLength(1);
    expect(notificationSystem.scheduledNotifications[0].message).toBe('Good morning');
    expect(notificationSystem.scheduledNotifications[0].type).toBe('info');
  });

  it('should create correct notification element with warning type', () => {
    notificationSystem.createNotificationElement('Warning message', 'warning');

    const notification = document.querySelector('.notification-warning');
    expect(notification).toBeTruthy();
    expect(notification.querySelector('.notification-message').textContent).toBe('Warning message');
  });

  it('should remove notification from DOM after slideOut animation completes', () => {
    vi.useFakeTimers();

    notificationSystem.createNotificationElement('Test message', 'info');
    let notification = document.querySelector('.notification');
    expect(notification).toBeTruthy();

    // Fast forward to 5 seconds (when slideOut animation starts)
    vi.advanceTimersByTime(5000);

    // Fast forward another 300ms (animation duration)
    vi.advanceTimersByTime(300);

    // Notification should be removed
    notification = document.querySelector('.notification');
    expect(notification).toBeFalsy();

    vi.useRealTimers();
  });
});
