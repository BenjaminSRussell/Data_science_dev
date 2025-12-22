/**
 * ResearchInboxComponent.js
 * Research inbox UI component using Lit
 * Phase 2: Replaces DOM manipulation in ResearchInboxUI
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class ResearchInboxComponent extends BaseComponent {
    static properties = {
        papers: { type: Array },
        activeTab: { type: String },
        isOpen: { type: Boolean },
        unreadCount: { type: Number }
    };

    static styles = css`
        :host {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            pointer-events: none;
        }

        :host([hidden]) {
            display: none;
        }

        .inbox-container {
            position: absolute;
            inset: 5%;
            background: #1a1a2e;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            pointer-events: all;
            max-width: 900px;
            max-height: 80vh;
            margin: 0 auto;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
        }

        :host([isOpen]) .inbox-container {
            transform: scale(1);
            opacity: 1;
        }

        .inbox-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .inbox-header h2 {
            margin: 0;
            color: white;
            font-size: 24px;
        }

        .inbox-close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            font-size: 32px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
        }

        .inbox-close-btn:hover {
            background: rgba(239, 68, 68, 0.3);
            color: #ef4444;
        }

        .inbox-tabs {
            display: flex;
            gap: 8px;
            padding: 16px 24px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .inbox-tab {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.2s;
        }

        .inbox-tab.active {
            background: #3b82f6;
            color: white;
        }

        .inbox-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .paper-card {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .paper-card:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .paper-card.unread {
            border-color: #3b82f6;
        }

        .paper-card.breakthrough {
            border-color: #f59e0b;
        }

        .paper-title {
            margin: 0 0 8px 0;
            color: white;
            font-size: 18px;
            font-weight: 700;
        }

        .paper-meta {
            display: flex;
            gap: 16px;
            margin-bottom: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }

        .paper-description {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 12px;
        }

        .paper-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .keyword {
            background: rgba(59, 130, 246, 0.2);
            color: #93c5fd;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        .inbox-empty {
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            padding: 48px;
        }
    `;

    constructor() {
        super();
        this.papers = [];
        this.activeTab = 'all';
        this.isOpen = false;
        this.unreadCount = 0;
    }

    render() {
        if (!this.isOpen) {
            return html``;
        }

        const filteredPapers = this.getFilteredPapers();

        return html`
            <div class="inbox-container">
                <div class="inbox-header">
                    <h2> Research Papers Inbox</h2>
                    <button class="inbox-close-btn" @click=${this.handleClose}>×</button>
                </div>
                <div class="inbox-tabs">
                    <button class="inbox-tab ${this.activeTab === 'all' ? 'active' : ''}" 
                            @click=${() => this.setActiveTab('all')}>
                        All Papers
                    </button>
                    <button class="inbox-tab ${this.activeTab === 'unread' ? 'active' : ''}" 
                            @click=${() => this.setActiveTab('unread')}>
                        Unread (${this.unreadCount})
                    </button>
                    <button class="inbox-tab ${this.activeTab === 'breakthrough' ? 'active' : ''}" 
                            @click=${() => this.setActiveTab('breakthrough')}>
                        Breakthroughs
                    </button>
                </div>
                <div class="inbox-content">
                    ${filteredPapers.length === 0
                        ? html`<div class="inbox-empty">No papers found</div>`
                        : filteredPapers.map(paper => this.renderPaperCard(paper))
                    }
                </div>
            </div>
        `;
    }

    renderPaperCard(notification) {
        const paper = notification.paper;
        const isUnread = !notification.read;
        const isBreakthrough = notification.isBreakthrough;

        return html`
            <div class="paper-card ${isUnread ? 'unread' : ''} ${isBreakthrough ? 'breakthrough' : ''}"
                 @click=${() => this.handlePaperClick(notification)}>
                <h3 class="paper-title">${paper.title}</h3>
                <div class="paper-meta">
                    <span>${paper.authors}</span>
                    <span>${paper.year}</span>
                    <span>${paper.venue}</span>
                </div>
                <p class="paper-description">${paper.description}</p>
                <div class="paper-keywords">
                    ${paper.keywords.map(kw => html`<span class="keyword">${kw}</span>`)}
                </div>
            </div>
        `;
    }

    getFilteredPapers() {
        switch (this.activeTab) {
            case 'unread':
                return this.papers.filter(p => !p.read);
            case 'breakthrough':
                return this.papers.filter(p => p.isBreakthrough);
            default:
                return this.papers;
        }
    }

    setActiveTab(tab) {
        this.activeTab = tab;
    }

    handlePaperClick(notification) {
        this.dispatchGameEvent('paper-click', { notification });
    }

    handleClose() {
        this.dispatchGameEvent('inbox-close', {});
    }

    /**
     * Open inbox
     */
    open(papers, unreadCount) {
        this.papers = papers || [];
        this.unreadCount = unreadCount || 0;
        this.isOpen = true;
        this.activeTab = 'all';
    }

    /**
     * Close inbox
     */
    close() {
        this.isOpen = false;
    }

    /**
     * Update papers
     */
    updatePapers(papers, unreadCount) {
        this.papers = papers || [];
        this.unreadCount = unreadCount || 0;
    }
}

customElements.define('research-inbox-component', ResearchInboxComponent);
