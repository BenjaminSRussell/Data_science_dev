/**
 * ProgressBar.js
 * Reusable progress bar component using Lit
 * Phase 2: Replaces document.createElement('div') calls
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
            width: 100%;
            height: 24px;
            background: #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        }

        .progress-fill {
            height: 100%;
            background: #3b82f6;
            width: 0%;
            transition: width 0.2s;
        }

        .progress-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            color: white;
            pointer-events: none;
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
        const percentage = this.calculatePercentage();
        return html`
            <div class="progress-fill" style="width: ${percentage}%"></div>
            ${this.showValue ? html`<div class="progress-label">${this.label ? this.label : `${this.value} / ${this.max}`}</div>` : ''}
        `;
    }

    calculatePercentage() {
        if (this.max === 0) return 100; // Handle division by zero
        return Math.min((this.value / this.max) * 100, 100);
    }
}

customElements.define('progress-bar', ProgressBar);