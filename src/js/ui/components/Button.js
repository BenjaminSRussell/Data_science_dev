/**
 * Button.js
 * Reusable button component using Lit
 * Phase 2: Replaces document.createElement('button') calls
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class Button extends BaseComponent {
    static properties = {
        label: { type: String },
        icon: { type: String },
        variant: { type: String },
        disabled: { type: Boolean, reflect: true },
        type: { type: String }
    };

    static styles = css`
        :host {
            display: inline-block;
        }

        button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            background: #3b82f6;
            color: white;
        }

        button:hover:not(:disabled) {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        button.primary {
            background: #3b82f6;
        }

        button.secondary {
            background: #64748b;
        }

        button.success {
            background: #10b981;
        }

        button.danger {
            background: #ef4444;
        }

        .icon {
            font-size: 16px;
        }
    `;

    constructor() {
        super();
        this.label = '';
        this.icon = '';
        this.variant = 'primary';
        this.disabled = false;
        this.type = 'button';
        // `onclick` is deliberately NOT a reactive property: declaring it would
        // replace the native GlobalEventHandlers accessor, so `el.onclick = fn`
        // would ignore clicks on the host. The inner button's click is composed
        // and bubbles to the host, so the native handler runs. While disabled,
        // block host clicks before any handler on the element sees them.
        this.addEventListener('click', (e) => {
            if (this.disabled) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, { capture: true });
    }

    render() {
        return html`
            <button
                type="${this.type || 'button'}"
                class="${this.variant}"
                ?disabled=${this.disabled}>
                ${this.icon ? html`<span class="icon">${this.icon}</span>` : ''}
                <span>${this.label}</span>
            </button>
        `;
    }
}

if (!customElements.get('game-button')) {
    customElements.define('game-button', Button);
}
