import { ResearchPaperNotificationSystem } from '../../src/js/game/research/ResearchPaperNotificationSystem.js';

describe('ResearchPaperNotificationSystem inbox read-state management', () => {
    let system;

    beforeEach(() => {
        system = new ResearchPaperNotificationSystem(null);
        system.inbox = [];
        system.readPapers = new Set();
    });

    function addNotification(paperId, receivedAt, read = false) {
        system.inbox.push({
            id: `notification_${paperId}_${receivedAt}`,
            paperId,
            paper: { id: paperId, title: paperId },
            receivedAt,
            read,
            isBreakthrough: false
        });
        return system.inbox[system.inbox.length - 1];
    }

    describe('getInbox', () => {
        it('sorts unread before read regardless of receivedAt order', () => {
            const oldUnread = addNotification('old_unread', 1000, false);
            const newRead = addNotification('new_read', 2000, true);
            const newestUnread = addNotification('newest_unread', 3000, false);

            const inbox = system.getInbox();

            expect(inbox.map(item => item.id)).toEqual([
                newestUnread.id,
                oldUnread.id,
                newRead.id
            ]);
        });

        it('sorts same-read-status items by receivedAt descending', () => {
            const oldest = addNotification('oldest', 1000, false);
            const newest = addNotification('newest', 3000, false);
            const middle = addNotification('middle', 2000, false);
            const readOld = addNotification('read_old', 1500, true);
            const readNew = addNotification('read_new', 2500, true);

            const inbox = system.getInbox();

            expect(inbox.map(item => item.id)).toEqual([
                newest.id,
                middle.id,
                oldest.id,
                readNew.id,
                readOld.id
            ]);
        });
    });

    describe('getUnreadCount', () => {
        it('returns count of read===false only', () => {
            addNotification('a', 1000, false);
            addNotification('b', 2000, true);
            addNotification('c', 3000, false);
            addNotification('d', 4000, true);

            expect(system.getUnreadCount()).toBe(2);
        });

        it('returns 0 for an empty inbox', () => {
            expect(system.getUnreadCount()).toBe(0);
        });
    });

    describe('markAsRead', () => {
        it('sets read=true and adds paperId to readPapers for an existing id', () => {
            const notification = addNotification('resnet_2015', 1000, false);

            system.markAsRead(notification.id);

            expect(notification.read).toBe(true);
            expect(system.readPapers.has('resnet_2015')).toBe(true);
        });

        it('is a silent no-op for a non-existent id', () => {
            const notification = addNotification('resnet_2015', 1000, false);
            const before = system.getUnreadCount();

            expect(() => system.markAsRead('not_a_real_id')).not.toThrow();

            expect(notification.read).toBe(false);
            expect(system.readPapers.size).toBe(0);
            expect(system.getUnreadCount()).toBe(before);
        });

        it('decreases getUnreadCount by 1 after a matching markAsRead', () => {
            const notification = addNotification('gan_2014', 1000, false);
            addNotification('vgg_net_2014', 2000, false);
            expect(system.getUnreadCount()).toBe(2);

            system.markAsRead(notification.id);

            expect(system.getUnreadCount()).toBe(1);
        });
    });
});
