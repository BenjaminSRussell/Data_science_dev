/**
 * BaseComponent.js
 * Base Lit component with common functionality
 * Phase 2: Code Reduction - Using Lit instead of DOM manipulation
 */

import { LitElement, html, css } from 'lit';

export class BaseComponent extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `;

    /**
     * Format money
     */
    formatMoney(amount) {
        return `$${(amount ?? 0).toLocaleString()}`;
    }

    /**
     * Format number
     */
    formatNumber(num) {
        return (num ?? 0).toLocaleString();
    }

    /**
     * Dispatch custom event
     */
    dispatchGameEvent(eventName, detail) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true
        }));
    }
}
