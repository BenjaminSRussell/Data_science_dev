import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

let DialogueComponent;
beforeAll(async () => {
    ({ DialogueComponent } = await import('../../src/js/ui/components/DialogueComponent.js'));
});

function mount() {
    const el = document.createElement('dialogue-component');
    document.body.appendChild(el);
    return el;
}

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

describe('DialogueComponent rendering (#452)', () => {
    it('renders nothing while closed or without an npc', async () => {
        const el = mount();
        await el.updateComplete;
        expect(el.shadowRoot.querySelector('.dialogue-container')).toBeNull();
        el.isOpen = true;
        await el.updateComplete;
        expect(el.shadowRoot.querySelector('.dialogue-container')).toBeNull();
    });

    it('renders the npc header and a Goodbye button when the node has no choices', async () => {
        vi.useFakeTimers();
        const el = mount();
        el.open({ name: 'sam', title: 'Barista' }, { text: 'Hi' });
        await el.updateComplete;
        const root = el.shadowRoot;
        expect(root.querySelector('.char-avatar').textContent.trim()).toBe('S');
        expect(root.querySelector('.dialogue-npc-name').textContent).toBe('sam');
        expect(root.querySelector('.dialogue-npc-title').textContent).toBe('Barista');
        const buttons = [...root.querySelectorAll('.dialogue-choice')];
        expect(buttons.map(b => b.textContent.trim())).toEqual(['Goodbye']);
        const closed = vi.fn();
        el.addEventListener('dialogue-close', closed);
        buttons[0].click();
        expect(closed).toHaveBeenCalled();
    });

    it('renders one button per choice and dispatches the picked choice', async () => {
        vi.useFakeTimers();
        const el = mount();
        const node = { text: 'Pick', choices: [{ text: 'A' }, { text: 'B' }] };
        el.open({ name: 'Kim' }, node);
        await el.updateComplete;
        const picked = vi.fn();
        el.addEventListener('dialogue-choice', picked);
        const buttons = el.shadowRoot.querySelectorAll('.dialogue-choice');
        expect(buttons.length).toBe(2);
        buttons[1].click();
        expect(picked.mock.calls[0][0].detail.choice.text).toBe('B');
        expect(el.shadowRoot.querySelector('.dialogue-npc-title').textContent).toBe('???');
    });
});

describe('DialogueComponent open state (#976, #2239)', () => {
    it('reflects isOpen to the is-open attribute used by :host styles', async () => {
        vi.useFakeTimers();
        const el = mount();
        el.open({ name: 'Kim' }, { text: 'x' });
        await el.updateComplete;
        expect(el.hasAttribute('is-open')).toBe(true);
        el.close();
        await el.updateComplete;
        expect(el.hasAttribute('is-open')).toBe(false);
        expect(DialogueComponent.styles.cssText).toContain(':host([is-open])');
    });

    it('research inbox component reflects is-open too', async () => {
        const { ResearchInboxComponent } = await import('../../src/js/ui/components/ResearchInboxComponent.js');
        const el = document.createElement('research-inbox-component');
        document.body.appendChild(el);
        el.isOpen = true;
        await el.updateComplete;
        expect(el.hasAttribute('is-open')).toBe(true);
        expect(ResearchInboxComponent.styles.cssText).toContain(':host([is-open])');
    });
});

describe('DialogueComponent typewriter (#2133, #49)', () => {
    it('a new line cancels the old one instead of interleaving', () => {
        vi.useFakeTimers();
        const el = mount();
        el.open({ name: 'Kim' }, { text: 'AAAAAAAA' });
        vi.advanceTimersByTime(60);
        el.showNode({ text: 'BBBB' });
        vi.advanceTimersByTime(1000);
        expect(el.typingText).toBe('BBBB');
        expect(el.isTyping).toBe(false);
    });

    it('close stops typing and skipTyping shows the full line', () => {
        vi.useFakeTimers();
        const el = mount();
        el.open({ name: 'Kim' }, { text: 'Hello there' });
        vi.advanceTimersByTime(30);
        el.skipTyping();
        expect(el.typingText).toBe('Hello there');
        expect(el.isTyping).toBe(false);
        el.showNode({ text: 'Next line' });
        el.close();
        vi.advanceTimersByTime(1000);
        expect(el.typingText).toBe('');
    });

    it('tolerates a node without text', () => {
        const el = mount();
        expect(() => el.open({ name: 'Kim' }, null)).not.toThrow();
        expect(el.isTyping).toBe(false);
    });
});
