/**
 * TooltipManager.js
 * Handles creation and management of tooltips
 * Phase 1: Replaces old tooltip logic with more dynamic options
 */

export class TooltipManager {
    constructor(autoUpdateFn = null) {
        this.tooltips = new WeakMap();
        this.autoUpdate = autoUpdateFn;
    }

    /**
     * Create a tooltip for an element
     */
    createTooltip(element, content, options = {}) {
        const existingTooltip = this.tooltips.get(element);
        if (existingTooltip) {
            existingTooltip.destroy();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = content;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            pointer-events: none;
            z-index: 10000;
            display: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(tooltip);

        const showTooltip = async () => {
            tooltip.style.display = 'block';
            await this.updatePosition(element, tooltip, options);
            tooltip.style.opacity = '1';
        };

        const hideTooltip = () => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 200);
        };

        // Auto-update position
        if (this.autoUpdate) {
            this.autoUpdate(element, tooltip, this.updatePosition.bind(this, element, tooltip, options));
        }

        // Event listeners
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);

        this.tooltips.set(element, {
            element: tooltip,
            update: () => this.updatePosition(element, tooltip, options),
            destroy: () => {
                element.removeEventListener('mouseenter', showTooltip);
                element.removeEventListener('mouseleave', hideTooltip);
                element.removeEventListener('focus', showTooltip);
                element.removeEventListener('blur', hideTooltip);
                tooltip.remove();
                this.tooltips.delete(element);
            }
        });

        return this.tooltips.get(element);
    }

    /**
     * Update tooltip position
     */
    updatePosition(element, tooltip, options = {}) {
        const rect = element.getBoundingClientRect();
        const offset = options.offset || { x: 0, y: 10 };

        let x = rect.left + offset.x;
        let y = rect.bottom + offset.y;

        if (options.position === 'right') {
            x = rect.right + offset.x;
            y = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
        }

        if (options.position === 'left') {
            x = rect.left - tooltip.offsetWidth - offset.x;
            y = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }

    /**
     * Fallback simple tooltip
     */
    createSimpleTooltip(element, content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'simple-tooltip';
        tooltip.textContent = content;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            pointer-events: none;
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(tooltip);

        const show = (e) => {
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        };

        const hide = () => {
            tooltip.style.display = 'none';
        };

        element.addEventListener('mouseenter', show);
        element.addEventListener('mouseleave', hide);

        return {
            element: tooltip,
            destroy: () => {
                element.removeEventListener('mouseenter', show);
                element.removeEventListener('mouseleave', hide);
                tooltip.remove();
            }
        };
    }

    /**
     * Remove tooltip
     */
    removeTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            tooltip.destroy();
            this.tooltips.delete(element);
        }
    }

    /**
     * Cleanup all tooltips
     */
    cleanup() {
        this.tooltips.forEach(tooltip => tooltip.destroy());
        this.tooltips.clear();
    }
}