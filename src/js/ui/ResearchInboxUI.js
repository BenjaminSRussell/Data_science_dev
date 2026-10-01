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

        // Create detail modal. Built with DOM APIs and textContent so paper
        // fields can never inject markup.
        const el = (tag, className, text) => {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        };
        const section = (className, heading, child) => {
            const div = el('div', className);
            div.append(el('h3', null, heading), child);
            return div;
        };
        const metaItem = (label, value) => {
            const div = el('div', 'meta-item');
            div.append(el('strong', null, `${label}:`), ` ${value ?? ''}`);
            return div;
        };

        const modal = el('div', 'paper-detail-modal');
        const content = el('div', 'paper-detail-content');

        const header = el('div', 'paper-detail-header');
        const closeBtn = el('button', 'paper-detail-close', '×');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close');
        header.append(el('h2', null, paper.title ?? ''), closeBtn);

        const body = el('div', 'paper-detail-body');
        const meta = el('div', 'paper-detail-meta');
        meta.append(
            metaItem('Authors', paper.authors),
            metaItem('Year', paper.year),
            metaItem('Venue', paper.venue)
        );
        if (paper.isBreakthrough) {
            meta.append(el('div', 'breakthrough-banner', ' BREAKTHROUGH PAPER'));
        }

        const keywordsList = el('div', 'keywords-list');
        (paper.keywords || []).forEach(kw => keywordsList.append(el('span', 'keyword', kw)));

        body.append(
            meta,
            section('paper-detail-description', 'Description', el('p', null, paper.description ?? '')),
            section('paper-detail-impact', 'Impact', el('p', null, paper.impact ?? '')),
            section('paper-detail-keywords', 'Keywords', keywordsList)
        );

        const safeUrl = ResearchInboxUI.safeHttpUrl(paper.url);
        if (safeUrl) {
            const linkWrap = el('div', 'paper-detail-link');
            const link = el('a', 'paper-link-btn', ' Read Paper');
            link.href = safeUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            linkWrap.append(link);
            body.append(linkWrap);
        }

        content.append(header, body);
        modal.append(content);

        document.body.appendChild(modal);

        // Store the element that was focused before opening the modal
        const previouslyFocused = document.activeElement;

        // Get focusable elements within the modal content
        const contentDiv = modal.querySelector('.paper-detail-content');
        const getFocusableElements = () => {
            return Array.from(contentDiv.querySelectorAll(
                'a, button, [tabindex]:not([tabindex="-1"])'
            ));
        };

        // All listeners are tied to this controller; aborting removes them.
        const listeners = new AbortController();
        const { signal } = listeners;

        // Handler to close the modal
        const closeModal = () => {
            listeners.abort();

            // Remove modal
            modal.remove();

            // Restore focus to the previously focused element
            if (previouslyFocused && previouslyFocused !== document.body) {
                previouslyFocused.focus();
            }
        };

        // Handle Escape key
        const handleKeydown = (e) => {
            if (!modal.isConnected) {
                listeners.abort();
                return;
            }
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        // Handle Tab key to trap focus within modal
        const handleTabTrap = (e) => {
            if (e.key === 'Tab') {
                const focusableElements = getFocusableElements();
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    // Shift+Tab (reverse direction)
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab (forward direction)
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        // Close button
        closeBtn.addEventListener('click', () => {
            closeModal();
        }, { signal });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        }, { signal });

        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeydown, { signal });
        contentDiv.addEventListener('keydown', handleTabTrap, { signal });

        // If the modal is removed some other way (screen change, body
        // re-render), drop the document-level listeners too
        if (modal.parentNode) {
            const removalObserver = new MutationObserver(() => {
                if (!modal.isConnected) listeners.abort();
            });
            removalObserver.observe(modal.parentNode, { childList: true });
            signal.addEventListener('abort', () => removalObserver.disconnect());
        }

        // Focus on the first focusable element
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Update inbox display
        this.renderPapers(this.getActiveTab());
    }
    
    /**
     * Return the URL if it is an absolute http(s) URL, otherwise null
     * (blocks javascript:, data: and other schemes from paper data)
     */
    static safeHttpUrl(url) {
        if (typeof url !== 'string' || url.trim() === '') return null;
        try {
            const parsed = new URL(url.trim());
            return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
        } catch {
            return null;
        }
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
}

