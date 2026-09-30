import { expect } from 'chai';
import { TooltipManager } from '../../src/js/ui/TooltipManager.js';

describe('TooltipManager', () => {
    let manager;
    let element;

    beforeEach(() => {
        manager = new TooltipManager();
        element = document.createElement('div');
        element.id = 'test-element';
        document.body.appendChild(element);
    });

    afterEach(() => {
        // Clean up any remaining tooltips
        document.querySelectorAll('.simple-tooltip').forEach(el => el.remove());
        document.querySelectorAll('.floating-tooltip').forEach(el => el.remove());
        if (element && element.parentNode) {
            document.body.removeChild(element);
        }
    });

    describe('createSimpleTooltip', () => {
        it('should create a simple tooltip with correct class and content', () => {
            const tooltip = manager.createSimpleTooltip(element, 'hello');

            const tooltipDiv = document.querySelector('.simple-tooltip');
            expect(tooltipDiv).to.exist;
            expect(tooltipDiv.textContent).to.equal('hello');
        });

        it('should have display none initially', () => {
            const tooltip = manager.createSimpleTooltip(element, 'hello');
            const tooltipDiv = document.querySelector('.simple-tooltip');

            expect(tooltipDiv.style.display).to.equal('none');
        });

        it('should show tooltip on mouseenter and position using pageX/pageY', () => {
            const tooltip = manager.createSimpleTooltip(element, 'hello');
            const tooltipDiv = document.querySelector('.simple-tooltip');

            // Create and dispatch mouseenter event with pageX/pageY
            const mouseenterEvent = new MouseEvent('mouseenter', {
                bubbles: true
            });
            // Manually set pageX and pageY as they may not work in MouseEvent constructor
            Object.defineProperty(mouseenterEvent, 'pageX', { value: 100, enumerable: true });
            Object.defineProperty(mouseenterEvent, 'pageY', { value: 150, enumerable: true });
            element.dispatchEvent(mouseenterEvent);

            expect(tooltipDiv.style.display).to.equal('block');
            expect(tooltipDiv.style.left).to.equal('110px'); // pageX + 10
            expect(tooltipDiv.style.top).to.equal('160px');  // pageY + 10
        });

        it('should hide tooltip on mouseleave', () => {
            const tooltip = manager.createSimpleTooltip(element, 'hello');
            const tooltipDiv = document.querySelector('.simple-tooltip');

            // Show tooltip first
            const mouseenterEvent = new MouseEvent('mouseenter', {
                bubbles: true,
                pageX: 100,
                pageY: 150
            });
            element.dispatchEvent(mouseenterEvent);
            expect(tooltipDiv.style.display).to.equal('block');

            // Hide tooltip
            const mouseleaveEvent = new MouseEvent('mouseleave', {
                bubbles: true
            });
            element.dispatchEvent(mouseleaveEvent);

            expect(tooltipDiv.style.display).to.equal('none');
        });

        it('should return destroy function that removes listeners', () => {
            const tooltip = manager.createSimpleTooltip(element, 'hello');
            const tooltipDiv = document.querySelector('.simple-tooltip');

            // Show tooltip
            const mouseenterEvent = new MouseEvent('mouseenter', {
                bubbles: true
            });
            Object.defineProperty(mouseenterEvent, 'pageX', { value: 100, enumerable: true });
            Object.defineProperty(mouseenterEvent, 'pageY', { value: 150, enumerable: true });
            element.dispatchEvent(mouseenterEvent);
            expect(tooltipDiv.style.display).to.equal('block');

            // Destroy and verify listeners are removed
            tooltip.destroy();

            // Verify tooltip was removed from DOM
            const tooltipAfterDestroy = document.querySelector('.simple-tooltip');
            expect(tooltipAfterDestroy).to.not.exist;

            // Try to dispatch another mouseenter - it should not affect anything
            const mouseenterEvent2 = new MouseEvent('mouseenter', {
                bubbles: true
            });
            Object.defineProperty(mouseenterEvent2, 'pageX', { value: 100, enumerable: true });
            Object.defineProperty(mouseenterEvent2, 'pageY', { value: 150, enumerable: true });

            // Should not throw
            expect(() => {
                element.dispatchEvent(mouseenterEvent2);
            }).to.not.throw();
        });

        it('should remove tooltip from DOM on destroy', () => {
            const tooltip = manager.createSimpleTooltip(element, 'hello');
            let tooltipDiv = document.querySelector('.simple-tooltip');
            expect(tooltipDiv).to.exist;

            tooltip.destroy();

            tooltipDiv = document.querySelector('.simple-tooltip');
            expect(tooltipDiv).to.not.exist;
        });
    });

    describe('removeTooltip', () => {
        it('should remove tooltip from DOM and Map when element is tracked', () => {
            const element1 = document.createElement('div');
            document.body.appendChild(element1);

            const tooltip1 = document.createElement('div');
            tooltip1.className = 'simple-tooltip';
            document.body.appendChild(tooltip1);

            // Manually seed the Map
            manager.tooltips.set(element1, tooltip1);

            // Verify it's in the Map and DOM
            expect(manager.tooltips.get(element1)).to.exist;
            expect(document.body.contains(tooltip1)).to.be.true;

            // Remove it
            manager.removeTooltip(element1);

            // Verify it's removed from both
            expect(manager.tooltips.get(element1)).to.not.exist;
            expect(document.body.contains(tooltip1)).to.be.false;

            document.body.removeChild(element1);
        });

        it('should be safe no-op when element is not tracked', () => {
            const untracked = document.createElement('div');
            document.body.appendChild(untracked);

            // Should not throw
            expect(() => {
                manager.removeTooltip(untracked);
            }).to.not.throw();

            // Map should still be empty
            expect(manager.tooltips.size).to.equal(0);

            document.body.removeChild(untracked);
        });
    });

    describe('cleanup', () => {
        it('should remove all tracked tooltips from DOM and clear Map', () => {
            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            const element3 = document.createElement('div');
            document.body.appendChild(element1);
            document.body.appendChild(element2);
            document.body.appendChild(element3);

            const tooltip1 = document.createElement('div');
            const tooltip2 = document.createElement('div');
            const tooltip3 = document.createElement('div');
            tooltip1.className = 'simple-tooltip';
            tooltip2.className = 'simple-tooltip';
            tooltip3.className = 'simple-tooltip';
            document.body.appendChild(tooltip1);
            document.body.appendChild(tooltip2);
            document.body.appendChild(tooltip3);

            // Seed the Map with 3 tooltips
            manager.tooltips.set(element1, tooltip1);
            manager.tooltips.set(element2, tooltip2);
            manager.tooltips.set(element3, tooltip3);

            // Verify they're all tracked
            expect(manager.tooltips.size).to.equal(3);
            expect(document.body.contains(tooltip1)).to.be.true;
            expect(document.body.contains(tooltip2)).to.be.true;
            expect(document.body.contains(tooltip3)).to.be.true;

            // Cleanup
            manager.cleanup();

            // Verify all removed
            expect(manager.tooltips.size).to.equal(0);
            expect(document.body.contains(tooltip1)).to.be.false;
            expect(document.body.contains(tooltip2)).to.be.false;
            expect(document.body.contains(tooltip3)).to.be.false;

            document.body.removeChild(element1);
            document.body.removeChild(element2);
            document.body.removeChild(element3);
        });

        it('should handle empty Map gracefully', () => {
            // Should not throw when Map is empty
            expect(() => {
                manager.cleanup();
            }).to.not.throw();

            expect(manager.tooltips.size).to.equal(0);
        });
    });
});
