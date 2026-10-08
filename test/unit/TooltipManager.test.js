import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TooltipManager } from '../../src/js/ui/TooltipManager.js';

describe('TooltipManager fallback tooltips (#206)', () => {
    let tm;
    let target;
    beforeEach(() => {
        document.body.innerHTML = '';
        tm = new TooltipManager();
        target = document.createElement('button');
        document.body.appendChild(target);
    });

    it('creates a hidden .simple-tooltip with the content', () => {
        const t = tm.createSimpleTooltip(target, 'hello');
        expect(t.element.className).toBe('simple-tooltip');
        expect(t.element.textContent).toBe('hello');
        expect(t.element.style.display).toBe('none');
        expect(document.body.contains(t.element)).toBe(true);
    });

    it('shows near the cursor on mouseenter and hides on mouseleave', () => {
        const t = tm.createSimpleTooltip(target, 'hi');
        target.dispatchEvent(new MouseEvent('mouseenter', { clientX: 50, clientY: 60 }));
        expect(t.element.style.display).toBe('block');
        expect(t.element.style.left).toBe('60px');
        expect(t.element.style.top).toBe('70px');
        target.dispatchEvent(new MouseEvent('mouseleave'));
        expect(t.element.style.display).toBe('none');
    });

    it('clamps the tooltip inside the viewport', () => {
        const t = tm.createSimpleTooltip(target, 'edge');
        target.dispatchEvent(new MouseEvent('mouseenter', { clientX: window.innerWidth + 500, clientY: -100 }));
        expect(parseFloat(t.element.style.left)).toBeLessThanOrEqual(window.innerWidth);
        expect(parseFloat(t.element.style.top)).toBeGreaterThanOrEqual(8);
    });

    it('shows on keyboard focus and hides on blur', () => {
        const t = tm.createSimpleTooltip(target, 'kbd');
        target.dispatchEvent(new FocusEvent('focus'));
        expect(t.element.style.display).toBe('block');
        target.dispatchEvent(new FocusEvent('blur'));
        expect(t.element.style.display).toBe('none');
    });

    it('destroy removes the node and the listeners', () => {
        const t = tm.createSimpleTooltip(target, 'bye');
        t.destroy();
        expect(document.body.contains(t.element)).toBe(false);
        target.dispatchEvent(new MouseEvent('mouseenter', { clientX: 1, clientY: 1 }));
        expect(t.element.style.display).toBe('none');
        expect(tm.tooltips.has(target)).toBe(false);
    });

    it('removeTooltip and cleanup also tear down fallback tooltips', () => {
        const t1 = tm.createSimpleTooltip(target, 'a');
        const other = document.createElement('span');
        const t2 = tm.createSimpleTooltip(other, 'b');
        tm.removeTooltip(target);
        expect(document.body.contains(t1.element)).toBe(false);
        target.dispatchEvent(new MouseEvent('mouseenter'));
        expect(t1.element.style.display).toBe('none');
        tm.cleanup();
        expect(document.body.contains(t2.element)).toBe(false);
        expect(tm.tooltips.size).toBe(0);
        expect(document.querySelectorAll('.simple-tooltip')).toHaveLength(0);
    });

    it('creating a second tooltip for the same element replaces the first', () => {
        tm.createSimpleTooltip(target, 'one');
        tm.createSimpleTooltip(target, 'two');
        const tips = document.querySelectorAll('.simple-tooltip');
        expect(tips).toHaveLength(1);
        expect(tips[0].textContent).toBe('two');
    });

    it('removeTooltip on an unknown element is a no-op', () => {
        expect(() => tm.removeTooltip(document.createElement('div'))).not.toThrow();
    });

    it('createTooltip falls back to the simple tooltip when Floating UI is unavailable', async () => {
        vi.spyOn(tm, 'initialize').mockResolvedValue(false);
        const t = await tm.createTooltip(target, 'fallback');
        expect(t.element.className).toBe('simple-tooltip');
    });
});
