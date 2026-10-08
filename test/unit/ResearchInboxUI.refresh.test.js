/**
 * Papers that arrive while the inbox is open show up without reopening (#189)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResearchInboxUI } from '../../src/js/ui/ResearchInboxUI.js';

const paper = (id) => ({
    id, read: false, isBreakthrough: false,
    paper: { title: `Paper ${id}`, authors: 'A', year: 2024, venue: 'V', description: 'd', impact: 'i', keywords: [], url: 'https://arxiv.org' }
});

describe('ResearchInboxUI.refresh', () => {
    let sys;
    let ui;
    beforeEach(() => {
        document.body.innerHTML = '';
        sys = {
            inbox: [paper('n1')],
            getInbox() { return this.inbox; },
            getUnreadCount() { return this.inbox.filter(p => !p.read).length; },
            markAsRead: vi.fn()
        };
        ui = new ResearchInboxUI(sys);
    });

    const cards = () => ui.container.querySelectorAll('.paper-card').length;

    it('adds a newly arrived paper to the open DOM list and the unread tab', () => {
        ui.open();
        expect(cards()).toBe(1);
        sys.inbox.unshift(paper('n2'));
        expect(ui.refresh()).toBe(true);
        expect(cards()).toBe(2);
        const unreadTab = ui.container.querySelector('.inbox-tab[data-tab="unread"]');
        expect(unreadTab.textContent).toBe('Unread (2)');
    });

    it('does not re-render when nothing new arrived', () => {
        ui.open();
        const spy = vi.spyOn(ui, 'renderPapers');
        expect(ui.refresh()).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('is a no-op while closed', () => {
        expect(ui.refresh()).toBe(false);
    });

    it('pushes papers into the Lit component when one is mounted', () => {
        ui.litComponent = { open: vi.fn(), close: vi.fn(), updatePapers: vi.fn() };
        ui.open();
        sys.inbox.push(paper('n3'));
        expect(ui.refresh()).toBe(true);
        expect(ui.litComponent.updatePapers).toHaveBeenCalledWith(sys.inbox, 2);
    });
});
