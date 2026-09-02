/**
 * TooltipManager.js
 * Handles the creation and removal of tooltips
 */

export class TooltipManager {
    constructor() {
        this.tooltips = new Map();
    }

    /**
     * Attach a tooltip to an element
     * @param {HTMLElement} element - The element to attach the tooltip to
     * @param {string} content - The content of the tooltip
     * @param {object} options - Additional options for the tooltip
     */
    attachTooltip(element, content, options = {}) {
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = content;

        // Position the tooltip
        const positionTooltip = () => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX + options.offsetX}px`;
            tooltip.style.top = `${rect.bottom + window.scrollY + options.offsetY}px`;
        };

        // Show the tooltip on mouse enter
        const showTooltip = () => {
            tooltip.style.display = 'block';
            positionTooltip();
        };

        // Update tooltip position on window resize
        const onResize = () => {
            if (tooltip.style.display === 'block') {
                positionTooltip();
            }
        };

        // Hide the tooltip
        const hideTooltip = () => {
            tooltip.style.display = 'none';
        };

        // Attach event listeners
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
        window.addEventListener('resize', onResize);

        // Store the tooltip and cleanup function
        this.tooltips.set(element, {
            tooltip,
            cleanup: () => {
                element.removeEventListener('mouseenter', showTooltip);
                element.removeEventListener('mouseleave', hideTooltip);
                element.removeEventListener('focus', showTooltip);
                element.removeEventListener('blur', hideTooltip);
                window.removeEventListener('resize', onResize);
                tooltip.remove();
            }
        });

        document.body.appendChild(tooltip);
    }

    /**
     * Remove the tooltip for a given element
     * @param {HTMLElement} element - The element to remove the tooltip from
     */
    removeTooltip(element) {
        const tooltipData = this.tooltips.get(element);
        if (tooltipData) {
            tooltipData.cleanup();
            this.tooltips.delete(element);
        }
    }

    /**
     * Remove all tooltips
     */
    removeAllTooltips() {
        for (const [element, tooltipData] of this.tooltips) {
            tooltipData.cleanup();
        }
        this.tooltips.clear();
    }
}