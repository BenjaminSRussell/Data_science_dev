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
        disabled: { type: Boolean },
        onclick: { type: Function, attribute: false }
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
        this.onclick = null;
    }

    render() {
        return html`
            <button 
                class="${this.variant}"
                ?disabled=${this.disabled}
                @click=${this.handleClick}>
                ${this.icon ? html`<span class="icon">${this.icon}</span>` : ''}
                <span>${this.label}</span>
            </button>
        `;
    }

    handleClick(e) {
        if (this.disabled) return;
        if (this.onclick) {
            this.onclick(e);
        }
        this.dispatchGameEvent('button-click', { label: this.label });
    }
}

customElements.define('game-button', Button);
