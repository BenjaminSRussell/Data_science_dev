import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { ResearchPaperNotificationSystem as RPNS } from '../../src/js/game/research/ResearchPaperNotificationSystem.js';
import { ResearchInboxUI } from '../../src/js/ui/ResearchInboxUI.js';

const gs = (day, phase) => ({
    timeManager: { totalDays: day },
    aiTrainingStoryline: phase ? { currentPhase: phase } : undefined,
    characterStats: { addExperience: vi.fn() }
});

beforeEach(() => { document.body.innerHTML = ''; });

describe('Research papers (#2274, #1670, #1323, #929, #1325, #1669)', () => {
    it('later papers unlock by day when the storyline is not running (#2274, #1670)', () => {
        const s = new RPNS(gs(80));
        s.checkForNewPapers();
        expect(s.papers.attention_is_all_you_need_2017.unlocked).toBe(true);
        expect(s.papers.gpt2_2019.unlocked).toBe(true);
    });

    it('phase gate is reached-or-passed, not exact (#1323, #929)', () => {
        const s = new RPNS(gs(80, 'post_attention'));
        s.checkForNewPapers();
        expect(s.papers.attention_is_all_you_need_2017.unlocked).toBe(true);
        const early = new RPNS(gs(80, 'pre_attention'));
        early.checkForNewPapers();
        expect(early.papers.attention_is_all_you_need_2017.unlocked).toBe(false);
        expect(RPNS.phaseReached('attention_era', 'attention_era')).toBe(true);
        expect(RPNS.phaseReached('pre_attention', 'post_attention')).toBe(false);
    });

    it('saves a paper reference, not a frozen copy, and relinks on load (#1325)', () => {
        const s = new RPNS(gs(10));
        s.checkForNewPapers();
        const json = JSON.parse(JSON.stringify(s.toJSON()));
        expect(json.inbox.length).toBeGreaterThan(0);
        expect(json.inbox.every(i => !('paper' in i))).toBe(true);
        const s2 = new RPNS(gs(10));
        s2.fromJSON({ ...json, inbox: [...json.inbox, { id: 'x', paperId: 'gone' }] });
        expect(s2.inbox.length).toBe(json.inbox.length);
        expect(s2.inbox[0].paper).toBe(s2.papers[s2.inbox[0].paperId]);
    });

    it('first read of a paper grants XP once (#1669)', () => {
        const state = gs(10);
        const s = new RPNS(state);
        s.checkForNewPapers();
        const n = s.inbox.find(i => i.paperId === 'imagenet_2012');
        expect(s.markAsRead(n.id)).toEqual({ paperId: 'imagenet_2012', xp: RPNS.BREAKTHROUGH_READ_XP, stat: 'intelligence' });
        expect(s.markAsRead(n.id)).toBeNull();
        expect(state.characterStats.addExperience).toHaveBeenCalledTimes(1);
        expect(s.getReadCount()).toBe(1);
    });
});

describe('Research inbox UI (#2454, #1880, #131, #179, #1829, #2208)', () => {
    const makeUI = () => {
        const s = new RPNS(gs(10));
        s.checkForNewPapers();
        const ui = new ResearchInboxUI(s);
        // force the DOM fallback
        const orig = customElements.get;
        customElements.get = () => undefined;
        ui.createInboxUI();
        customElements.get = orig;
        ui.open();
        return { s, ui };
    };

    it('cards are keyboard operable and say "Unread" in text (#1880, #131, #179)', () => {
        const { ui } = makeUI();
        const spy = vi.spyOn(ui, 'showPaperDetails');
        const card = document.querySelector('.paper-card');
        expect(card.getAttribute('tabindex')).toBe('0');
        expect(card.getAttribute('role')).toBe('button');
        expect(card.querySelector('.unread-label').textContent).toBe('Unread');
        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(spy).toHaveBeenCalledWith(card.dataset.notificationId);
        document.querySelector('.paper-detail-close')?.click();
    });

    it('opening a paper refreshes the Unread (N) label (#2454)', () => {
        const { s, ui } = makeUI();
        const before = s.getUnreadCount();
        ui.showPaperDetails(s.inbox[0].id);
        const label = document.querySelector('.inbox-tab[data-tab="unread"]').textContent;
        expect(label).toBe(`Unread (${before - 1})`);
        document.querySelector('.paper-detail-close')?.click();
    });

    it('CSS covers the card body, unread label and focus ring (#1829, #179)', () => {
        const css = fs.readFileSync('src/styles/research-inbox.css', 'utf8');
        expect(css).toMatch(/\.paper-card-body\s*\{/);
        expect(css).toMatch(/\.unread-label\s*\{/);
        expect(css).toMatch(/\.paper-card:focus-visible/);
    });

    it('Lit inbox closes on backdrop click and opens cards from the keyboard (#2208, #1880)', async () => {
        await import('../../src/js/ui/components/ResearchInboxComponent.js');
        const el = document.createElement('research-inbox-component');
        document.body.appendChild(el);
        const s = new RPNS(gs(10));
        s.checkForNewPapers();
        el.open(s.getInbox(), s.getUnreadCount());
        await el.updateComplete;
        const closed = vi.fn();
        const clicked = vi.fn();
        el.addEventListener('inbox-close', closed);
        el.addEventListener('paper-click', clicked);
        el.shadowRoot.querySelector('.inbox-backdrop').click();
        expect(closed).toHaveBeenCalled();
        const card = el.shadowRoot.querySelector('.paper-card');
        expect(card.getAttribute('tabindex')).toBe('0');
        card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        expect(clicked).toHaveBeenCalled();
    });
});
