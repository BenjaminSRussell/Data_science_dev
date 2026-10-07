import { expect } from 'chai';
import { ResearchInboxUI } from '../../src/js/ui/ResearchInboxUI.js';

describe('ResearchInboxUI', () => {
    let researchInboxUI;
    let mockResearchPaperSystem;
    let container;

    beforeEach(() => {
        // Create a mock research paper system
        mockResearchPaperSystem = {
            inbox: [
                {
                    id: 'notification-1',
                    paper: {
                        title: 'Test Paper',
                        authors: 'Test Author',
                        year: 2024,
                        venue: 'Test Venue',
                        description: 'A test paper description',
                        impact: 'This paper has great impact',
                        keywords: ['test', 'paper'],
                        url: 'https://arxiv.org/abs/1234.56789',
                        isBreakthrough: false
                    },
                    read: false
                }
            ],
            readPapers: new Set(),
            markAsRead: function(notificationId) {
                this.readPapers.add(notificationId);
                const notification = this.inbox.find(item => item.id === notificationId);
                if (notification) {
                    notification.read = true;
                }
            },
            getInbox: function() {
                return this.inbox;
            }
        };

        researchInboxUI = new ResearchInboxUI(mockResearchPaperSystem);

        // Create a container with minimal structure to avoid null errors
        container = document.createElement('div');
        container.id = 'research-inbox-container';
        container.innerHTML = '<div id="inbox-content"></div>';
        document.body.appendChild(container);
        researchInboxUI.container = container;
    });

    afterEach(() => {
        // Clean up any modals from the DOM
        const modal = document.querySelector('.paper-detail-modal');
        if (modal) {
            modal.remove();
        }
        // Clean up container
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    it('should render paper details with proper security attributes on external links', () => {
        // Show paper details
        researchInboxUI.showPaperDetails('notification-1');

        // Find the anchor element
        const link = document.querySelector('.paper-link-btn');

        // Verify the link exists
        expect(link).to.exist;

        // Verify the link has target="_blank"
        expect(link.getAttribute('target')).to.equal('_blank');

        // Verify the link has rel="noopener noreferrer"
        expect(link.getAttribute('rel')).to.equal('noopener noreferrer');

        // Verify the link points to the correct URL
        expect(link.getAttribute('href')).to.equal('https://arxiv.org/abs/1234.56789');
    });

    it('should not render a link when paper has no URL', () => {
        // Modify the paper to have no URL
        mockResearchPaperSystem.inbox[0].paper.url = null;

        // Show paper details
        researchInboxUI.showPaperDetails('notification-1');

        // Verify the link element does not exist
        const link = document.querySelector('.paper-link-btn');
        expect(link).to.not.exist;
    });

    it('should mark paper as read when showing details', () => {
        // Verify the paper is not initially marked as read
        expect(mockResearchPaperSystem.readPapers.has('notification-1')).to.be.false;

        // Show paper details
        researchInboxUI.showPaperDetails('notification-1');

        // Verify the paper is marked as read
        expect(mockResearchPaperSystem.readPapers.has('notification-1')).to.be.true;
    });
});
