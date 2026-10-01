/**
 * ModalAccessibilityManager.js
 * Manages accessibility features for modals (dialogs) including focus management
 * Ensures WCAG compliance for keyboard and screen reader users
 */

export class ModalAccessibilityManager {
    constructor() {
        this.focusStack = []; // Stack to track which element opened each modal
        this.activeModals = new Set(); // Track which modals are currently open
        this.escapeHandlers = new Map(); // Store escape key handlers by modal element for cleanup
    }

    /**
     * Open a modal and manage focus
     * @param {HTMLElement} modalElement - The modal dialog element
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.triggerElement - The element that triggered the modal (for focus restoration)
     * @param {HTMLElement} options.focusTarget - The element to focus when modal opens (default: first focusable)
     */
    openModal(modalElement, options = {}) {
        if (!modalElement) return;

        // Store the element that triggered this modal (for focus restoration on close)
        const triggerElement = options.triggerElement || document.activeElement;
        this.focusStack.push({
            modal: modalElement,
            triggerElement: triggerElement
        });

        this.activeModals.add(modalElement);

        // Mark modal as open
        modalElement.classList.remove('hidden');
        modalElement.classList.add('active');

        // Move focus into the modal
        this.setInitialFocus(modalElement, options.focusTarget);

        // Set up escape key handler if not already set up
        this.setupEscapeKeyHandler(modalElement);

        // Disable body scroll if needed
        this.disableBodyScroll();
    }

    /**
     * Close a modal and restore focus
     * @param {HTMLElement} modalElement - The modal dialog element to close
     */
    closeModal(modalElement) {
        if (!modalElement) return;

        // Remove from active modals
        this.activeModals.delete(modalElement);

        // Remove escape key handler to prevent memory leak
        if (this.escapeHandlers.has(modalElement)) {
            const handler = this.escapeHandlers.get(modalElement);
            document.removeEventListener('keydown', handler);
            this.escapeHandlers.delete(modalElement);
        }

        // Hide the modal
        modalElement.classList.add('hidden');
        modalElement.classList.remove('active');

        // Pop the focus stack and restore focus
        const focusData = this.focusStack.pop();
        if (focusData && focusData.triggerElement) {
            // Restore focus to the element that opened the modal
            setTimeout(() => {
                if (focusData.triggerElement && typeof focusData.triggerElement.focus === 'function') {
                    focusData.triggerElement.focus();
                }
            }, 0);
        }

        // Re-enable body scroll if no more modals are active
        if (this.focusStack.length === 0) {
            this.enableBodyScroll();
        }
    }

    /**
     * Set initial focus within the modal
     * @param {HTMLElement} modalElement - The modal element
     * @param {HTMLElement} focusTarget - Optional element to focus
     */
    setInitialFocus(modalElement, focusTarget) {
        if (!modalElement) return;

        // If a specific focus target is provided and it's focusable, use it
        if (focusTarget && this.isFocusable(focusTarget)) {
            focusTarget.focus();
            return;
        }

        // Otherwise, find the first focusable element in the modal
        const focusableElements = this.getFocusableElements(modalElement);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            // If no focusable elements, focus the modal itself if it's focusable
            if (modalElement.hasAttribute('tabindex') || ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(modalElement.tagName)) {
                modalElement.focus();
            }
        }
    }

    /**
     * Get all focusable elements within a container
     * @param {HTMLElement} container - The container to search
     * @returns {HTMLElement[]} Array of focusable elements
     */
    getFocusableElements(container) {
        if (!container) return [];

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input[type="text"]:not([disabled])',
            'input[type="radio"]:not([disabled])',
            'input[type="checkbox"]:not([disabled])',
            'input[type="number"]:not([disabled])',
            'input[type="password"]:not([disabled])',
            'input[type="email"]:not([disabled])',
            'input[type="url"]:not([disabled])',
            'input[type="date"]:not([disabled])',
            'input[type="time"]:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(container.querySelectorAll(focusableSelectors.join(',')));
    }

    /**
     * Check if an element is focusable
     * @param {HTMLElement} element - The element to check
     * @returns {boolean} True if the element is focusable
     */
    isFocusable(element) {
        if (!element) return false;

        const focusableTagNames = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
        if (focusableTagNames.includes(element.tagName)) {
            return !element.hasAttribute('disabled');
        }

        if (element.hasAttribute('tabindex')) {
            const tabindex = parseInt(element.getAttribute('tabindex'), 10);
            return tabindex > -1;
        }

        return false;
    }

    /**
     * Set up escape key handler for a modal
     * @param {HTMLElement} modalElement - The modal element
     */
    setupEscapeKeyHandler(modalElement) {
        if (!modalElement || this.escapeHandlers.has(modalElement)) return;

        const handler = (e) => {
            if (e.key === 'Escape') {
                // Only close if this is the topmost modal
                if (this.focusStack.length > 0 && this.focusStack[this.focusStack.length - 1].modal === modalElement) {
                    this.closeModal(modalElement);
                }
            }
        };

        // Store the handler so it can be removed later
        this.escapeHandlers.set(modalElement, handler);
        document.addEventListener('keydown', handler);
    }

    /**
     * Disable body scroll
     */
    disableBodyScroll() {
        document.body.style.overflow = 'hidden';
    }

    /**
     * Enable body scroll
     */
    enableBodyScroll() {
        document.body.style.overflow = '';
    }

    /**
     * Check if any modal is currently open
     * @returns {boolean} True if at least one modal is open
     */
    isAnyModalOpen() {
        return this.focusStack.length > 0;
    }

    /**
     * Get the currently active modal
     * @returns {HTMLElement|null} The active modal or null
     */
    getActiveModal() {
        if (this.focusStack.length === 0) return null;
        return this.focusStack[this.focusStack.length - 1].modal;
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        while (this.focusStack.length > 0) {
            const focusData = this.focusStack[this.focusStack.length - 1];
            this.closeModal(focusData.modal);
        }

        // Clean up any remaining escape handlers
        this.escapeHandlers.forEach((handler, modalElement) => {
            document.removeEventListener('keydown', handler);
        });
        this.escapeHandlers.clear();
    }
}

// Create a singleton instance
export const modalAccessibilityManager = new ModalAccessibilityManager();
