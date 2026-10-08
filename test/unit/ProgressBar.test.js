import { describe, it, expect, afterEach } from 'vitest';
import '../../src/js/ui/components/ProgressBar.js';

async function render(props) {
    const el = document.createElement('progress-bar');
    Object.assign(el, props);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}
const width = (el) => el.shadowRoot.querySelector('.progress-fill').style.width;

describe('ProgressBar percentage clamping (#150)', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('renders the plain percentage', async () => {
        expect(width(await render({ value: 50, max: 100 }))).toBe('50%');
    });

    it('caps over-full values at 100%', async () => {
        expect(width(await render({ value: 150, max: 100 }))).toBe('100%');
    });

    it('renders 0% for zero', async () => {
        expect(width(await render({ value: 0, max: 100 }))).toBe('0%');
    });

    it('a zero max renders an empty bar instead of Infinity/NaN', async () => {
        expect(width(await render({ value: 10, max: 0 }))).toBe('0%');
        expect(width(await render({ value: 0, max: 0 }))).toBe('0%');
    });

    it('negative values clamp to 0%', async () => {
        expect(width(await render({ value: -20, max: 100 }))).toBe('0%');
    });

    it('hides the label row when there is no label and showValue is false', async () => {
        const el = await render({ value: 1, max: 2, label: '', showValue: false });
        expect(el.shadowRoot.querySelector('.progress-label')).toBeNull();
    });

    it('shows label and value text when requested', async () => {
        const el = await render({ value: 3, max: 4, label: 'XP', showValue: true });
        const label = el.shadowRoot.querySelector('.progress-label');
        expect(label.textContent).toContain('XP');
        expect(label.textContent.replace(/\s+/g, ' ')).toContain('3 / 4');
        const bar = el.shadowRoot.querySelector('[role="progressbar"]');
        expect(bar.getAttribute('aria-valuenow')).toBe('3');
        expect(bar.getAttribute('aria-label')).toBe('XP');
    });
});
