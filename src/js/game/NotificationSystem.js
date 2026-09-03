/**
 * NotificationSystem.js
 * Handles notifications at specific times
 * No emojis - clean text notifications
 */

export class NotificationSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.scheduledNotifications = [];
        this.notificationQueue = [];
    }
    
    /**
     * Schedule a notification for a specific time
     */
    scheduleNotification(config) {
        this.scheduledNotifications.push({
            time: config.time, // e.g., 'morning', 'noon', 'night', or specific slot
            message: config.message,
            type: config.type || 'info', // info, warning, success, error
            action: config.action || null,
            id: config.id || Date.now().toString()
        });
    }
    
    /**
     * Check and trigger notifications based on current time
     */
    checkNotifications() {
        if (!this.gameState.timeManager) return;
        
        const currentTime = this.gameState.dayNightCycle?.getTimeOfDay() || 'morning';
        const currentSlot = this.gameState.timeManager?.timeSlot;
        
        // Check scheduled notifications
        this.scheduledNotifications.forEach(notif => {
            if (this.shouldTrigger(notif, currentTime, currentSlot)) {
                this.triggerNotification(notif);
            }
        });
    }
    
    /**
     * Check if notification should trigger
     */
    shouldTrigger(notif, currentTime, currentSlot) {
        if (notif.time === currentTime) {
            return true;
        }
        
        // Check for specific slot
        if (typeof notif.time === 'number' && notif.time === currentSlot) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Trigger a notification
     */
    triggerNotification(notif) {
        // Remove from scheduled if one-time
        const index = this.scheduledNotifications.findIndex(n => n.id === notif.id);
        if (index > -1) {
            this.scheduledNotifications.splice(index, 1);
        }
        
        // Show notification
        this.showNotification(notif.message, notif.type, notif.action);
    }
    
    /**
     * Show notification to user
     */
    showNotification(message, type = 'info', action = null) {
        // Use game's toast system if available
        if (window.game && window.game.showToast) {
            window.game.showToast(message, type);
        } else {
            // Fallback: create notification element
            this.createNotificationElement(message, type, action);
        }
    }
    
    /**
     * Create notification element
     */
    createNotificationElement(message, type, action) {
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        notif.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                ${action ? `<button class="notification-action">${action.text}</button>` : ''}
            </div>
        `;
        
        // Add styles if not present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: rgba(15, 23, 42, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 1rem;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                .notification-info { border-left: 3px solid #8b5cf6; }
                .notification-success { border-left: 3px solid #10b981; }
                .notification-warning { border-left: 3px solid #f59e0b; }
                .notification-error { border-left: 3px solid #ef4444; }
                .notification-message {
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 0.5rem;
                }
                .notification-action {
                    background: #8b5cf6;
                    border: none;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notif);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 5000);
        
        // Add action handler
        if (action && action.handler) {
            notif.querySelector('.notification-action')?.addEventListener('click', () => {
                action.handler();
                notif.remove();
            });
        }
    }
    
    /**
     * Schedule default notifications
     */
    scheduleDefaultNotifications() {
        // Morning notifications
        this.scheduleNotification({
            id: 'morning_reminder',
            time: 'morning',
            message: 'Good morning. Time to start your day.',
            type: 'info'
        });
        
        // Noon notifications
        this.scheduleNotification({
            id: 'noon_reminder',
            time: 'noon',
            message: 'Midday check-in. How are your tasks progressing?',
            type: 'info'
        });
        
        // Night notifications
        this.scheduleNotification({
            id: 'night_reminder',
            time: 'night',
            message: 'Evening. Consider resting to restore energy.',
            type: 'info'
        });
    }
}

