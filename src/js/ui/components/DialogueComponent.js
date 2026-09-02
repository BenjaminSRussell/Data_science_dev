/**
 * DialogueComponent.js
 * Dialogue component using Lit
 * Phase 2: Replaces DOM manipulation in DialogueUI
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class DialogueComponent extends BaseComponent {
    static properties = {
        dialogue: { type: Object },
        currentLine: { type: Number },
        typingText: { type: String },
        isTyping: { type: Boolean }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .dialogue-box {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 16px;
            border-radius: 8px;
            font-size: 16px;
        }

        .dialogue-text {
            margin: 0;
        }

        .dialogue-options {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
        }

        .dialogue-option {
            cursor: pointer;
            padding: 8px 16px;
            border: 1px solid white;
            border-radius: 8px;
            transition: background 0.2s;
        }

        .dialogue-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `;

    constructor() {
        super();
        this.dialogue = null;
        this.currentLine = 0;
        this.typingText = '';
        this.isTyping = false;
        this.typeTimeout = null;
    }

    render() {
        if (!this.dialogue) {
            return html``;
        }

        const currentLine = this.dialogue.lines[this.currentLine];
        const options = this.dialogue.options?.[this.currentLine] || [];

        return html`
            <div class="dialogue-box">
                <p class="dialogue-text">${this.typingText}</p>
                <div class="dialogue-options">
                    ${options.map((option, index) => html`
                        <div class="dialogue-option" @click=${() => this.handleOptionClick(option)}>${option.text}</div>
                    `)}
                </div>
            </div>
        `;
    }

    typeText(text, speed = 30) {
        if (this.typeTimeout) {
            clearTimeout(this.typeTimeout);
            this.typingText = '';
            this.isTyping = true;
        }

        let i = 0;
        const type = () => {
            if (i < text.length) {
                this.typingText += text[i];
                i++;
                this.typeTimeout = setTimeout(type, speed);
            } else {
                this.isTyping = false;
            }
        };
        type();
    }

    handleOptionClick(option) {
        if (this.isTyping) return;
        this.currentLine = option.nextLine;
        this.typeText(this.dialogue.lines[this.currentLine]);
    }

    /**
     * Update dialogue
     */
    updateDialogue(dialogue, startLine = 0) {
        this.dialogue = dialogue;
        this.currentLine = startLine;
        this.typeText(this.dialogue.lines[this.currentLine]);
    }
}

customElements.define('dialogue-component', DialogueComponent);