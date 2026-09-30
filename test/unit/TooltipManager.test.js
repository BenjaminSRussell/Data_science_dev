import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TooltipManager } from '../../src/js/ui/TooltipManager.js';

describe('TooltipManager', () => {
    let tooltipManager;
    let testElement;

    beforeEach(() => {
        tooltipManager = new TooltipManager();
        testElement = document.createElement('div');
        document.body.appendChild(testElement);
    });

    afterEach(() => {
        if (testElement && testElement.parentNode) {
            testElement.parentNode.removeChild(testElement);
        }
        tooltipManager.cleanup();
    });

    it('should create a tooltip and store listeners', async () => {
        await tooltipManager.initialize();
        const result = await tooltipManager.createTooltip(testElement, 'Test tooltip');

        expect(result).toBeDefined();
        expect(result.element).toBeDefined();
        expect(tooltipManager.tooltipListeners.has(testElement)).toBe(true);
        expect(tooltipManager.tooltips.has(testElement)).toBe(true);
    });

    it('should properly remove tooltip and event listeners via removeTooltip', async () => {
        await tooltipManager.initialize();

        // Create a tooltip
        const result = await tooltipManager.createTooltip(testElement, 'Test tooltip');
        expect(tooltipManager.tooltips.has(testElement)).toBe(true);
        expect(tooltipManager.tooltipListeners.has(testElement)).toBe(true);

        // Verify listeners were added
        const listeners = tooltipManager.tooltipListeners.get(testElement);
        expect(listeners).toBeDefined();
        expect(listeners.showTooltip).toBeDefined();
        expect(listeners.hideTooltip).toBeDefined();

        // Spy on removeEventListener to verify it was called
        const removeEventListenerSpy = vi.spyOn(testElement, 'removeEventListener');

        // Remove the tooltip using removeTooltip
        tooltipManager.removeTooltip(testElement);

        // Verify cleanup happened
        expect(tooltipManager.tooltips.has(testElement)).toBe(false);
        expect(tooltipManager.tooltipListeners.has(testElement)).toBe(false);

        // Verify all listeners were removed
        expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', listeners.showTooltip);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', listeners.hideTooltip);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', listeners.showTooltip);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', listeners.hideTooltip);

        removeEventListenerSpy.mockRestore();
    });

    it('should properly remove tooltip via destroy method', async () => {
        await tooltipManager.initialize();

        // Create a tooltip
        const result = await tooltipManager.createTooltip(testElement, 'Test tooltip');
        expect(tooltipManager.tooltips.has(testElement)).toBe(true);
        expect(tooltipManager.tooltipListeners.has(testElement)).toBe(true);

        // Call destroy
        result.destroy();

        // Verify cleanup happened
        expect(tooltipManager.tooltips.has(testElement)).toBe(false);
        expect(tooltipManager.tooltipListeners.has(testElement)).toBe(false);
    });

    it('should use removeTooltip as the single source of truth for cleanup', async () => {
        await tooltipManager.initialize();

        // Create a tooltip
        const result = await tooltipManager.createTooltip(testElement, 'Test tooltip');

        // Spy on removeTooltip
        const removeTooltipSpy = vi.spyOn(tooltipManager, 'removeTooltip');

        // Call destroy
        result.destroy();

        // Verify removeTooltip was called
        expect(removeTooltipSpy).toHaveBeenCalledWith(testElement);

        removeTooltipSpy.mockRestore();
    });

    it('should handle cleanup of all tooltips', async () => {
        await tooltipManager.initialize();

        // Create multiple tooltips
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');
        document.body.appendChild(element1);
        document.body.appendChild(element2);

        await tooltipManager.createTooltip(element1, 'Tooltip 1');
        await tooltipManager.createTooltip(element2, 'Tooltip 2');

        expect(tooltipManager.tooltips.size).toBe(2);
        expect(tooltipManager.tooltipListeners.size).toBe(2);

        // Cleanup all
        tooltipManager.cleanup();

        expect(tooltipManager.tooltips.size).toBe(0);
        expect(tooltipManager.tooltipListeners.size).toBe(0);

        element1.parentNode.removeChild(element1);
        element2.parentNode.removeChild(element2);
    });
});
