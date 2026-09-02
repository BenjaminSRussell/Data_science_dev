```javascript
import { TooltipManager } from '../../js/ui/TooltipManager';

describe('TooltipManager', () => {
    let tooltipManager;

    beforeEach(() => {
        tooltipManager = new TooltipManager();
        document.body.innerHTML = ''; // Reset body for each test
    });

    afterEach(() => {
        tooltipManager.cleanup();
    });

    test('createSimpleTooltip appends a simple tooltip div to document.body', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const destroy = tooltipManager.createSimpleTooltip(el, 'hello');

        const tooltip = document.querySelector('.simple-tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip.textContent).toBe('hello');
        expect(tooltip.style.display).toBe('none');
    });

    test('createSimpleTooltip sets display to block on mouseenter and positions using e.pageX/e.pageY', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const destroy = tooltipManager.createSimpleTooltip(el, 'hello');

        const tooltip = document.querySelector('.simple-tooltip');
        expect(tooltip).toBeInTheDocument();

        const event = new MouseEvent('mouseenter', {
            pageX: 100,
            pageY: 200
        });

        el.dispatchEvent(event);

        expect(tooltip.style.display).toBe('block');
        expect(tooltip.style.left).toBe('100px');
        expect(tooltip.style.top).toBe('200px');
    });

    test('createSimpleTooltip sets display to none on mouseleave', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const destroy = tooltipManager.createSimpleTooltip(el, 'hello');

        const tooltip = document.querySelector('.simple-tooltip');
        expect(tooltip).toBeInTheDocument();

        const enterEvent = new MouseEvent('mouseenter', {
            pageX: 100,
            pageY: 200
        });

        el.dispatchEvent(enterEvent);

        expect(tooltip.style.display).toBe('block');

        const leaveEvent = new MouseEvent('mouseleave');
        el.dispatchEvent(leaveEvent);

        expect(tooltip.style.display).toBe('none');
    });

    test('createSimpleTooltip destroy function removes listeners and tooltip from DOM', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const destroy = tooltipManager.createSimpleTooltip(el, 'hello');

        const tooltip = document.querySelector('.simple-tooltip');
        expect(tooltip).toBeInTheDocument();

        const enterEvent = new MouseEvent('mouseenter', {
            pageX: 100,
            pageY: 200
        });

        el.dispatchEvent(enterEvent);

        expect(tooltip.style.display).toBe('block');

        destroy();

        el.dispatchEvent(enterEvent);

        expect(tooltip.style.display).toBe('none');
        expect(document.querySelector('.simple-tooltip')).toBeNull();
    });

    test('removeTooltip removes tooltip from DOM and Map', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        const destroy = tooltipManager.createSimpleTooltip(el, 'hello');
        const tooltip = document.querySelector('.simple-tooltip');
        expect(tooltip).toBeInTheDocument();

        tooltipManager.removeTooltip(el);

        expect(document.querySelector('.simple-tooltip')).toBeNull();
        expect(tooltipManager.tooltips.size).toBe(0);
    });

    test('removeTooltip is a safe no-op on an untracked element', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        tooltipManager.removeTooltip(el);

        expect(document.querySelector('.simple-tooltip')).toBeNull();
        expect(tooltipManager.tooltips.size).toBe(0);
    });

    test('cleanup removes all tooltips from DOM and empties the Map', () => {
        const el1 = document.createElement('div');
        const el2 = document.createElement('div');
        const el3 = document.createElement('div');
        document.body.appendChild(el1);
        document.body.appendChild(el2);
        document.body.appendChild(el3);

        tooltipManager.createSimpleTooltip(el1, 'hello1');
        tooltipManager.createSimpleTooltip(el2, 'hello2');
        tooltipManager.createSimpleTooltip(el3, 'hello3');

        expect(document.querySelectorAll('.simple-tooltip').length).toBe(3);
        expect(tooltipManager.tooltips.size).toBe(3);

        tooltipManager.cleanup();

        expect(document.querySelectorAll('.simple-tooltip').length).toBe(0);
        expect(tooltipManager.tooltips.size).toBe(0);
    });
});