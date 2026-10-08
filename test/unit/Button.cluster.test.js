import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Button } from '../../src/js/ui/components/Button.js';

describe('Button cluster (#2222, #2223, #2224, #450)', () => {
    let el;
    beforeEach(async () => {
        el = document.createElement('game-button');
        document.body.appendChild(el);
        await el.updateComplete;
    });
    afterEach(() => el.remove());

    const inner = () => el.shadowRoot.querySelector('button');

    it('is the registered game-button element', () => {
        expect(el).toBeInstanceOf(Button);
    });

    it('#2222 does not shadow the native onclick accessor', () => {
        expect(Object.prototype.hasOwnProperty.call(Button.prototype, 'onclick')).toBe(false);
        expect('onclick' in Button.properties).toBe(false);
    });

    it('#2222 el.onclick runs for host clicks and inner clicks, once each', () => {
        let calls = 0;
        el.onclick = () => { calls++; };
        el.click();
        expect(calls).toBe(1);
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
        expect(calls).toBe(2);
        inner().click();
        expect(calls).toBe(3);
    });

    it('#2222 a disabled button blocks onclick and listeners', async () => {
        let calls = 0;
        el.onclick = () => { calls++; };
        el.addEventListener('click', () => { calls++; });
        el.disabled = true;
        await el.updateComplete;
        el.click();
        inner().click();
        expect(calls).toBe(0);
        expect(el.hasAttribute('disabled')).toBe(true);
        expect(inner().disabled).toBe(true);
    });

    it('#2223 renders type="button" by default and honours an explicit type', async () => {
        expect(inner().getAttribute('type')).toBe('button');
        el.type = 'submit';
        await el.updateComplete;
        expect(inner().getAttribute('type')).toBe('submit');
    });

    it('#450 renders label, icon and variant from properties', async () => {
        expect(inner().className).toBe('primary');
        expect(el.shadowRoot.querySelector('.icon')).toBeNull();
        el.label = 'Save';
        el.icon = '*';
        el.variant = 'danger';
        await el.updateComplete;
        expect(inner().className).toBe('danger');
        expect(el.shadowRoot.querySelector('.icon').textContent).toBe('*');
        expect(inner().textContent).toContain('Save');
    });

    it('#450 labels render as text, not HTML', async () => {
        el.label = '<img src=x onerror=alert(1)>';
        await el.updateComplete;
        expect(el.shadowRoot.querySelector('img')).toBeNull();
    });
});
