/**
 * ProgressBar.js
 * Progress bar component using Lit
 * Phase 2: Replaces manual progress bar DOM manipulation
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class ProgressBar extends BaseComponent {
    static properties = {
        value: { type: Number },
        max: { type: Number },
        label: { type: String },
        showValue: { type: Boolean }
    };

    static styles = css`
        :host {
            display: block;
        }

        .progress-container {
            width: 100%;
        }

        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #10b981);
            transition: width 0.3s ease;
            border-radius: 4px;
        }
    `;

    constructor() {
        super();
        this.value = 0;
        this.max = 100;
        this.label = '';
        this.showValue = false;
    }

    render() {
        const percentage = Math.min((this.value / this.max) * 100, 100);

        return html`
            <div class="progress-container">
                ${this.label || this.showValue ? html`
                    <div class="progress-label">
                        <span>${this.label}</span>
                        ${this.showValue ? html`<span>${this.value} / ${this.max}</span>` : ''}
                    </div>
                ` : ''}
                <div class="progress-bar" role="progressbar" aria-valuenow="${this.value}" aria-valuemin="0" aria-valuemax="${this.max}" aria-label="${this.label || 'Progress'}">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('progress-bar', ProgressBar);
