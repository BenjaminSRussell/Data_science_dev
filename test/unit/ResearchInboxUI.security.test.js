/**
 * ResearchInboxUI.showPaperDetails must not interpret paper fields as HTML,
 * must only link http(s) URLs, and must drop its document keydown listener
 * however the modal is removed.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResearchInboxUI } from '../../src/js/ui/ResearchInboxUI.js';

const payload = '<img src=x onerror="window.__xss=1">';

describe('ResearchInboxUI paper details hardening', () => {
    let ui;
    let system;

    beforeEach(() => {
        document.body.innerHTML = '';
        delete window.__xss;
        system = {
            inbox: [{
                id: 'n1',
                read: false,
                paper: {
                    title: `Title ${payload}`,
                    authors: `Authors ${payload}`,
                    year: 2024,
                    venue: `Venue ${payload}`,
                    description: `Desc ${payload}`,
                    impact: `Impact ${payload}`,
                    keywords: [`kw ${payload}`],
                    url: 'https://example.org/paper',
                    isBreakthrough: false
                }
            }],
            markAsRead(id) { this.inbox.find(i => i.id === id).read = true; },
            getInbox() { return this.inbox; }
        };
        ui = new ResearchInboxUI(system);
        const container = document.createElement('div');
        container.innerHTML = '<div id="inbox-content"></div>';
        document.body.appendChild(container);
        ui.container = container;
        vi.spyOn(ui, 'renderPapers').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('renders every paper field as text, never as markup', () => {
        ui.showPaperDetails('n1');
        const modal = document.querySelector('.paper-detail-modal');

        expect(modal.querySelector('img')).toBeNull();
        expect(modal.querySelector('h2').textContent).toBe(`Title ${payload}`);
        expect(modal.querySelector('.paper-detail-description p').textContent).toBe(`Desc ${payload}`);
        expect(modal.querySelector('.paper-detail-impact p').textContent).toBe(`Impact ${payload}`);
        expect(modal.querySelector('.keyword').textContent).toBe(`kw ${payload}`);
        expect(modal.textContent).toContain(`Authors ${payload}`);
        expect(modal.textContent).toContain(`Venue ${payload}`);
    });

    it.each([
        'javascript:alert(1)',
        'JavaScript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'ftp://example.org/file',
        '/relative/path',
        'not a url'
    ])('does not link non-http(s) url %s', (url) => {
        system.inbox[0].paper.url = url;
        ui.showPaperDetails('n1');
        expect(document.querySelector('.paper-link-btn')).toBeNull();
    });

    it('links http(s) urls with target=_blank and rel="noopener noreferrer"', () => {
        system.inbox[0].paper.url = 'http://example.org/a';
        ui.showPaperDetails('n1');
        const link = document.querySelector('.paper-link-btn');
        expect(link.getAttribute('href')).toBe('http://example.org/a');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('aborts its listeners when closed with Escape', () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        ui.showPaperDetails('n1');
        const call = addSpy.mock.calls.find(([type]) => type === 'keydown');
        const signal = call[2].signal;
        expect(signal.aborted).toBe(false);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(signal.aborted).toBe(true);
    });

    it('aborts its listeners when the modal is removed externally', async () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        ui.showPaperDetails('n1');
        const signal = addSpy.mock.calls.find(([type]) => type === 'keydown')[2].signal;

        document.querySelector('.paper-detail-modal').remove();
        await new Promise(r => setTimeout(r, 0));

        expect(signal.aborted).toBe(true);
    });
});
