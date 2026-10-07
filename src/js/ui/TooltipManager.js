/**
 * TooltipManager.js
 * Manages tooltips using Floating UI for smart positioning
 * Priority 2: Visual Enhancement
 */

export class TooltipManager {
    constructor() {
        this.tooltips = new Map();
        this.initialized = false;
    }

    /**
     * Initialize Floating UI
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const { computePosition, autoUpdate, flip, shift, offset, arrow } = await import('@floating-ui/dom');
            this.computePosition = computePosition;
            this.autoUpdate = autoUpdate;
            this.flip = flip;
            this.shift = shift;
            this.offset = offset;
            this.arrow = arrow;
            this.initialized = true;
            return true;
        } catch (error) {
            console.warn('Floating UI not available:', error);
            return false;
        }
    }

    /**
     * Create tooltip for element
     */
    async createTooltip(element, content, options = {}) {
        if (!this.initialized) {
            await this.initialize();
            if (!this.initialized) {
                // Fallback to simple tooltip
                return this.createSimpleTooltip(element, content);
            }
        }

        const {
            placement = 'top',
            offset: offsetValue = 8,
            showArrow = true,
            className = 'floating-tooltip'
        } = options;

        // Create tooltip element
        let tooltip = this.tooltips.get(element);
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = className;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(17, 24, 39, 0.95);
                color: #f9fafb;
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                pointer-events: none;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s;
                max-width: 300px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            document.body.appendChild(tooltip);
            this.tooltips.set(element, tooltip);
        }

        tooltip.textContent = content;

        // Position tooltip
        const updatePosition = async () => {
            if (!this.computePosition) return;

            try {
                const { x, y, placement: finalPlacement } = await this.computePosition(element, tooltip, {
                    placement,
                    middleware: [
                        this.offset(offsetValue),
                        this.flip(),
                        this.shift({ padding: 5 })
                    ]
                });

                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
            } catch (error) {
                console.warn('Tooltip positioning error:', error);
            }
        };

        // Show tooltip on hover
        const showTooltip = async () => {
            tooltip.style.display = 'block';
            await updatePosition();
            tooltip.style.opacity = '1';
        };

        const hideTooltip = () => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 200);
        };

        // Bind listeners / autoUpdate once per element (#39/#40)
        if (!tooltip._tipBound) {
            let stopAutoUpdate = null;
            if (this.autoUpdate) {
                stopAutoUpdate = this.autoUpdate(element, tooltip, updatePosition) || null;
            }
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', showTooltip);
            element.addEventListener('blur', hideTooltip);
            tooltip._tipBound = { showTooltip, hideTooltip, stopAutoUpdate };
        }

        const bound = tooltip._tipBound;
        return {
            element: tooltip,
            update: updatePosition,
            destroy: () => {
                if (bound) {
                    element.removeEventListener('mouseenter', bound.showTooltip);
                    element.removeEventListener('mouseleave', bound.hideTooltip);
                    element.removeEventListener('focus', bound.showTooltip);
                    element.removeEventListener('blur', bound.hideTooltip);
                    if (typeof bound.stopAutoUpdate === 'function') bound.stopAutoUpdate();
                }
                tooltip.remove();
                this.tooltips.delete(element);
            }
        };
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
            // Measure after show for correct box; clamp to viewport (#2644)
            let left = e.clientX + 10;
            let top = e.clientY + 10;
            const pad = 8;
            const tw = tooltip.offsetWidth || 160;
            const th = tooltip.offsetHeight || 40;
            const maxL = window.innerWidth - tw - pad;
            const maxT = window.innerHeight - th - pad;
            left = Math.max(pad, Math.min(left, maxL));
            top = Math.max(pad, Math.min(top, maxT));
            tooltip.style.position = 'fixed';
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
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
            tooltip.remove();
            this.tooltips.delete(element);
        }
    }

    /**
     * Cleanup all tooltips
     */
    cleanup() {
        this.tooltips.forEach(tooltip => tooltip.remove());
        this.tooltips.clear();
    }
}
