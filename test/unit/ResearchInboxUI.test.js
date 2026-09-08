import { ResearchInboxUI } from '../../src/js/ui/ResearchInboxUI';

describe('ResearchInboxUI', () => {
    let researchPaperSystem;
    let researchInboxUI;

    beforeEach(() => {
        researchPaperSystem = {
            getInbox: jest.fn(),
            getUnreadCount: jest.fn(),
            markAsRead: jest.fn()
        };

        researchInboxUI = new ResearchInboxUI(researchPaperSystem);
    });

    describe('renderPapers(filter)', () => {
        it('should render only unread papers when filter is "unread"', () => {
            const papers = [
                { id: 1, title: 'Paper 1', isBreakthrough: false, isRead: false },
                { id: 2, title: 'Paper 2', isBreakthrough: false, isRead: true }
            ];
            researchPaperSystem.getInbox.mockReturnValue(papers);

            researchInboxUI.renderPapers('unread');

            expect(researchInboxUI.paperCards.length).toBe(1);
            expect(researchInboxUI.paperCards[0].dataset.notificationId).toBe('1');
        });

        it('should render only breakthrough papers when filter is "breakthrough"', () => {
            const papers = [
                { id: 1, title: 'Paper 1', isBreakthrough: true, isRead: false },
                { id: 2, title: 'Paper 2', isBreakthrough: false, isRead: true }
            ];
            researchPaperSystem.getInbox.mockReturnValue(papers);

            researchInboxUI.renderPapers('breakthrough');

            expect(researchInboxUI.paperCards.length).toBe(1);
            expect(researchInboxUI.paperCards[0].dataset.notificationId).toBe('1');
        });

        it('should render all papers when filter is "all" or unrecognized', () => {
            const papers = [
                { id: 1, title: 'Paper 1', isBreakthrough: true, isRead: false },
                { id: 2, title: 'Paper 2', isBreakthrough: false, isRead: true }
            ];
            researchPaperSystem.getInbox.mockReturnValue(papers);

            researchInboxUI.renderPapers('all');
            expect(researchInboxUI.paperCards.length).toBe(2);

            researchInboxUI.renderPapers('unknown');
            expect(researchInboxUI.paperCards.length).toBe(2);
        });

        it('should render "No papers found" empty state when no papers match filter', () => {
            researchPaperSystem.getInbox.mockReturnValue([]);

            researchInboxUI.renderPapers('unread');

            expect(researchInboxUI.paperCards.length).toBe(0);
            expect(researchInboxUI.container.innerHTML).toContain('No papers found');
        });
    });

    describe('open()/close()/toggle()', () => {
        it('should open the inbox and render all papers', () => {
            researchPaperSystem.getInbox.mockReturnValue([
                { id: 1, title: 'Paper 1', isBreakthrough: true, isRead: false }
            ]);

            researchInboxUI.open();

            expect(researchInboxUI.isOpen).toBe(true);
            expect(researchInboxUI.paperCards.length).toBe(1);
        });

        it('should toggle the inbox state', () => {
            researchInboxUI.isOpen = true;

            researchInboxUI.toggle();

            expect(researchInboxUI.isOpen).toBe(false);

            researchInboxUI.toggle();

            expect(researchInboxUI.isOpen).toBe(true);
        });

        it('should update the unread count on a second call', () => {
            researchPaperSystem.getInbox.mockReturnValue([
                { id: 1, title: 'Paper 1', isBreakthrough: true, isRead: false }
            ]);
            researchPaperSystem.getUnreadCount.mockReturnValue(1);

            researchInboxUI.updateUnreadCount();
            expect(researchInboxUI.unreadCount).toBe(1);

            researchPaperSystem.getUnreadCount.mockReturnValue(2);
            researchInboxUI.updateUnreadCount();
            expect(researchInboxUI.unreadCount).toBe(2);
        });
    });
});