import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResearchInboxComponent } from '../../src/js/ui/components/ResearchInboxComponent.js';

function makePaper(overrides = {}) {
    return {
        title: 'Test Paper',
        authors: 'Jane Doe',
        year: 2024,
        venue: 'Test Journal',
        description: 'A test paper description.',
        keywords: ['alpha', 'beta'],
        ...overrides
    };
}

describe('ResearchInboxComponent rendering', () => {
    let element;

    beforeEach(async () => {
        element = document.createElement('research-inbox-component');
        document.body.appendChild(element);
        await element.updateComplete;
    });

    afterEach(() => {
        element.remove();
    });

    it('renders nothing when isOpen is false (default)', async () => {
        expect(element.isOpen).toBe(false);
        expect(element.shadowRoot.querySelector('.inbox-container')).toBeNull();
    });

    it('shows empty state and all tabs when open with no papers', async () => {
        element.isOpen = true;
        element.papers = [];
        await element.updateComplete;

        const content = element.shadowRoot.querySelector('.inbox-content');
        expect(content).not.toBeNull();

        const empty = content.querySelector('.inbox-empty');
        expect(empty).not.toBeNull();
        expect(empty.textContent.trim()).toBe('No papers found');

        const tabs = element.shadowRoot.querySelectorAll('.inbox-tab');
        expect(tabs.length).toBe(3);
    });

    it('filters to unread papers when activeTab is unread', async () => {
        element.isOpen = true;
        element.papers = [
            { paper: makePaper({ title: 'Unread One' }), read: false, isBreakthrough: false },
            { paper: makePaper({ title: 'Read One' }), read: true, isBreakthrough: false },
            { paper: makePaper({ title: 'Unread Two' }), read: false, isBreakthrough: true }
        ];
        await element.updateComplete;

        // Default tab is 'all': everything renders, first tab is active
        expect(element.activeTab).toBe('all');
        let cards = element.shadowRoot.querySelectorAll('.paper-card');
        expect(cards.length).toBe(3);
        const firstTab = element.shadowRoot.querySelector('.inbox-tab');
        expect(firstTab.classList.contains('active')).toBe(true);

        element.setActiveTab('unread');
        await element.updateComplete;

        cards = element.shadowRoot.querySelectorAll('.paper-card');
        expect(cards.length).toBe(2);
        const titles = [...cards].map(c => c.querySelector('.paper-title').textContent.trim());
        expect(titles).toEqual(['Unread One', 'Unread Two']);
        expect(element.getFilteredPapers().length).toBe(2);
    });

    it('filters to breakthrough papers when activeTab is breakthrough', async () => {
        element.isOpen = true;
        element.papers = [
            { paper: makePaper({ title: 'Normal' }), read: false, isBreakthrough: false },
            { paper: makePaper({ title: 'Breakthrough' }), read: true, isBreakthrough: true }
        ];
        element.activeTab = 'breakthrough';
        await element.updateComplete;

        const cards = element.shadowRoot.querySelectorAll('.paper-card');
        expect(cards.length).toBe(1);
        expect(cards[0].querySelector('.paper-title').textContent.trim()).toBe('Breakthrough');
    });

    it('renders a single unread breakthrough paper card with all details', async () => {
        element.isOpen = true;
        element.papers = [
            {
                paper: makePaper({
                    title: 'Deep Learning Breakthrough',
                    authors: 'Alice Smith, Bob Jones',
                    year: 2023,
                    venue: 'NeurIPS',
                    description: 'Revolutionary findings.',
                    keywords: ['ml', 'neural', 'vision']
                }),
                read: false,
                isBreakthrough: true
            }
        ];
        await element.updateComplete;

        const card = element.shadowRoot.querySelector('.paper-card');
        expect(card).not.toBeNull();
        expect(card.classList.contains('unread')).toBe(true);
        expect(card.classList.contains('breakthrough')).toBe(true);

        const title = card.querySelector('.paper-title');
        expect(title.textContent.trim()).toBe('Deep Learning Breakthrough');

        const metaSpans = card.querySelectorAll('.paper-meta span');
        expect(metaSpans.length).toBe(3);
        expect(metaSpans[0].textContent.trim()).toBe('Alice Smith, Bob Jones');
        expect(metaSpans[1].textContent.trim()).toBe('2023');
        expect(metaSpans[2].textContent.trim()).toBe('NeurIPS');

        const description = card.querySelector('.paper-description');
        expect(description.textContent.trim()).toBe('Revolutionary findings.');

        const keywords = card.querySelectorAll('.keyword');
        expect(keywords.length).toBe(3);
        expect([...keywords].map(k => k.textContent.trim())).toEqual(['ml', 'neural', 'vision']);
    });
});
