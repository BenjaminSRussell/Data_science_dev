/**
 * ResearchInboxUI.js
 * UI for viewing research paper notifications
 * Phase 2: Now uses Lit component (ResearchInboxComponent) with fallback
 */

export class ResearchInboxUI {
    constructor(researchPaperSystem) {
        this.researchPaperSystem = researchPaperSystem;
        this.container = null;
        this.litComponent = null;
        this.isOpen = false;
    }
    
    /**
     * Create inbox UI
     * Phase 2: Uses Lit component if available
     */
    createInboxUI() {
        // Try to use Lit component first
        try {
            if (customElements.get('research-inbox-component')) {
                let container = document.getElementById('research-inbox-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'research-inbox-container';
                    document.body.appendChild(container);
                }
                
                this.litComponent = document.createElement('research-inbox-component');
                this.litComponent.addEventListener('paper-click', (e) => {
                    this.showPaperDetails(e.detail.notification.id);
                });
                this.litComponent.addEventListener('inbox-close', () => {
                    this.close();
                });
                container.appendChild(this.litComponent);
                return container;
            }
        } catch (err) {
            console.warn('Lit component not available, using fallback:', err);
        }
        
        // Fallback to DOM method
        const container = document.createElement('div');
        container.id = 'research-inbox-container';
        container.className = 'research-inbox-container';
        container.style.display = 'none';
        
        container.innerHTML = `
            <div class="research-inbox-header">
                <h2> Research Papers Inbox</h2>
                <button class="inbox-close-btn" id="inbox-close-btn">×</button>
            </div>
            <div class="research-inbox-tabs">
                <button class="inbox-tab active" data-tab="all">All Papers</button>
                <button class="inbox-tab" data-tab="unread">Unread (${this.researchPaperSystem.getUnreadCount()})</button>
                <button class="inbox-tab" data-tab="breakthrough">Breakthroughs</button>
            </div>
            <div class="research-inbox-content" id="inbox-content">
                <!-- Papers will be rendered here -->
            </div>
        `;
        
        document.body.appendChild(container);
        this.container = container;
        
        // Setup event listeners
        this.setupEventListeners();
        
        return container;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = this.container.querySelector('#inbox-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Tabs
        const tabs = this.container.querySelectorAll('.inbox-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderPapers(tab.dataset.tab);
            });
        });
        
        // Close on outside click
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
    }
    
    /**
     * Render papers
     */
    renderPapers(filter = 'all') {
        const content = this.container.querySelector('#inbox-content');
        if (!content) return;
        
        let papers = [];
        
        switch (filter) {
            case 'unread':
                papers = this.researchPaperSystem.getInbox().filter(item => !item.read);
                break;
            case 'breakthrough':
                papers = this.researchPaperSystem.getInbox().filter(item => item.isBreakthrough);
                break;
            default:
                papers = this.researchPaperSystem.getInbox();
        }
        
        if (papers.length === 0) {
            content.innerHTML = '<div class="inbox-empty">No papers found</div>';
            return;
        }
        
        content.innerHTML = papers.map(item => this.createPaperCard(item)).join('');
        
        // Add click listeners
        content.querySelectorAll('.paper-card').forEach(card => {
            card.addEventListener('click', () => {
                const notificationId = card.dataset.notificationId;
                this.showPaperDetails(notificationId);
            });
        });
    }
    
    /**
     * Create paper card
     */
    createPaperCard(notification) {
        const paper = notification.paper;
        const isUnread = !notification.read;
        const isBreakthrough = notification.isBreakthrough;
        
        return `
            <div class="paper-card ${isUnread ? 'unread' : ''} ${isBreakthrough ? 'breakthrough' : ''}" 
                 data-notification-id="${notification.id}">
                <div class="paper-card-header">
                    <div class="paper-badge ${isBreakthrough ? 'breakthrough-badge' : ''}">
                        ${isBreakthrough ? ' BREAKTHROUGH' : ''}
                    </div>
                    ${isUnread ? '<div class="unread-indicator"></div>' : ''}
                </div>
                <div class="paper-card-body">
                    <h3 class="paper-title">${paper.title}</h3>
                    <div class="paper-meta">
                        <span class="paper-authors">${paper.authors}</span>
                        <span class="paper-year">${paper.year}</span>
                        <span class="paper-venue">${paper.venue}</span>
                    </div>
                    <p class="paper-description">${paper.description}</p>
                    <div class="paper-keywords">
                        ${paper.keywords.map(kw => `<span class="keyword">${kw}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Show paper details
     */
    showPaperDetails(notificationId) {
        const notification = this.researchPaperSystem.inbox.find(item => item.id === notificationId);
        if (!notification) return;
        
        const paper = notification.paper;
        
        // Mark as read
        this.researchPaperSystem.markAsRead(notificationId);
        
        // Create detail modal
        const modal = document.createElement('div');
        modal.className = 'paper-detail-modal';
        modal.innerHTML = `
            <div class="paper-detail-content">
                <div class="paper-detail-header">
                    <h2>${paper.title}</h2>
                    <button class="paper-detail-close">×</button>
                </div>
                <div class="paper-detail-body">
                    <div class="paper-detail-meta">
                        <div class="meta-item">
                            <strong>Authors:</strong> ${paper.authors}
                        </div>
                        <div class="meta-item">
                            <strong>Year:</strong> ${paper.year}
                        </div>
                        <div class="meta-item">
                            <strong>Venue:</strong> ${paper.venue}
                        </div>
                        ${paper.isBreakthrough ? '<div class="breakthrough-banner"> BREAKTHROUGH PAPER</div>' : ''}
                    </div>
                    <div class="paper-detail-description">
                        <h3>Description</h3>
                        <p>${paper.description}</p>
                    </div>
                    <div class="paper-detail-impact">
                        <h3>Impact</h3>
                        <p>${paper.impact}</p>
                    </div>
                    <div class="paper-detail-keywords">
                        <h3>Keywords</h3>
                        <div class="keywords-list">
                            ${paper.keywords.map(kw => `<span class="keyword">${kw}</span>`).join('')}
                        </div>
                    </div>
                    ${paper.url ? `
                        <div class="paper-detail-link">
                            <a href="${paper.url}" target="_blank" class="paper-link-btn">
                                 Read Paper
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('.paper-detail-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Update inbox display
        this.renderPapers(this.getActiveTab());
    }
    
    /**
     * Get active tab
     */
    getActiveTab() {
        const activeTab = this.container?.querySelector('.inbox-tab.active');
        return activeTab?.dataset.tab || 'all';
    }
    
    /**
     * Open inbox
     * Phase 2: Uses Lit component if available
     */
    open() {
        if (!this.researchPaperSystem) {
            console.error('Research paper system not initialized');
            return;
        }
        
        if (!this.litComponent && !this.container) {
            this.createInboxUI();
        }
        
        // Use Lit component if available
        if (this.litComponent) {
            const papers = this.researchPaperSystem.getInbox();
            const unreadCount = this.researchPaperSystem.getUnreadCount();
            this.litComponent.open(papers, unreadCount);
            this.isOpen = true;
            return;
        }
        
        // Fallback to DOM method
        if (!this.container) {
            console.error('Failed to create inbox UI');
            return;
        }
        
        this.container.style.display = 'flex';
        this.isOpen = true;
        this.renderPapers('all');
        
        // Update unread count
        this.updateUnreadCount();
    }
    
    /**
     * Close inbox
     * Phase 2: Uses Lit component if available
     */
    close() {
        // Use Lit component if available
        if (this.litComponent) {
            this.litComponent.close();
            this.isOpen = false;
            return;
        }
        
        // Fallback to DOM method
        if (this.container) {
            this.container.style.display = 'none';
            this.isOpen = false;
        }
    }
    
    /**
     * Toggle inbox
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Update unread count
     */
    updateUnreadCount() {
        const unreadTab = this.container?.querySelector('.inbox-tab[data-tab="unread"]');
        if (unreadTab) {
            const count = this.researchPaperSystem.getUnreadCount();
            unreadTab.textContent = `Unread (${count})`;
        }
    }
    
    /**
     * Refresh the open inbox with the latest papers and unread count
     */
    refresh() {
        if (!this.isOpen || !this.researchPaperSystem) return;
        
        const papers = this.researchPaperSystem.getInbox();
        const unreadCount = this.researchPaperSystem.getUnreadCount();
        
        if (this.litComponent) {
            this.litComponent.updatePapers(papers, unreadCount);
        } else if (this.container) {
            this.renderPapers(this.getActiveTab());
            this.updateUnreadCount();
        }
    }
}

