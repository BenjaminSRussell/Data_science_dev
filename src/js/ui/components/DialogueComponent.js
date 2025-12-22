/**
 * DialogueComponent.js
 * Dialogue UI component using Lit
 * Phase 2: Replaces DOM manipulation in DialogueUI
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class DialogueComponent extends BaseComponent {
    static properties = {
        npc: { type: Object },
        currentNode: { type: Object },
        isOpen: { type: Boolean },
        typingText: { type: String },
        isTyping: { type: Boolean }
    };

    static styles = css`
        :host {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1000;
            pointer-events: none;
        }

        :host([hidden]) {
            display: none;
        }

        .dialogue-container {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: 800px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 16px 16px 0 0;
            padding: 24px;
            pointer-events: all;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }

        :host([isOpen]) .dialogue-container {
            transform: translateY(0);
        }

        .dialogue-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
        }

        .char-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
        }

        .dialogue-npc-info {
            flex: 1;
        }

        .dialogue-npc-name {
            font-size: 20px;
            font-weight: 700;
            color: white;
            margin-bottom: 4px;
        }

        .dialogue-npc-title {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        }

        .dialogue-close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 24px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
        }

        .dialogue-close:hover {
            background: rgba(239, 68, 68, 0.3);
            color: #ef4444;
        }

        .dialogue-body {
            margin-bottom: 16px;
        }

        .dialogue-text {
            font-size: 16px;
            line-height: 1.6;
            color: white;
            min-height: 60px;
        }

        .dialogue-text.typing::after {
            content: '|';
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }

        .dialogue-choices {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .dialogue-choice {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 12px 16px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
        }

        .dialogue-choice:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }
    `;

    constructor() {
        super();
        this.npc = null;
        this.currentNode = null;
        this.isOpen = false;
        this.typingText = '';
        this.isTyping = false;
    }

    render() {
        if (!this.isOpen || !this.npc) {
            return html``;
        }

        return html`
            <div class="dialogue-container">
                <div class="dialogue-header">
                    <div class="char-avatar">
                        ${this.npc.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div class="dialogue-npc-info">
                        <div class="dialogue-npc-name">${this.npc.name || 'Unknown'}</div>
                        <div class="dialogue-npc-title">${this.npc.title || this.npc.type || '???'}</div>
                    </div>
                    <button class="dialogue-close" @click=${this.handleClose}>×</button>
                </div>
                <div class="dialogue-body">
                    <div class="dialogue-text ${this.isTyping ? 'typing' : ''}">
                        ${this.typingText}
                    </div>
                </div>
                <div class="dialogue-choices">
                    ${this.renderChoices()}
                </div>
            </div>
        `;
    }

    renderChoices() {
        if (!this.currentNode?.choices) {
            return html`
                <button class="dialogue-choice" @click=${this.handleClose}>
                    Goodbye
                </button>
            `;
        }

        return this.currentNode.choices.map(choice => html`
            <button class="dialogue-choice" @click=${() => this.handleChoice(choice)}>
                ${choice.text}
            </button>
        `);
    }

    handleChoice(choice) {
        this.dispatchGameEvent('dialogue-choice', { choice, node: this.currentNode });
    }

    handleClose() {
        this.dispatchGameEvent('dialogue-close', {});
    }

    /**
     * Open dialogue with NPC
     */
    open(npc, currentNode) {
        this.npc = npc;
        this.currentNode = currentNode;
        this.isOpen = true;
        this.typingText = '';
        this.isTyping = true;
        this.typeText(currentNode.text);
    }

    /**
     * Type text animation
     * Phase 3: Can be enhanced with GSAP if needed
     */
    typeText(text, speed = 30) {
        this.typingText = '';
        this.isTyping = true;
        let i = 0;
        const type = () => {
            if (i < text.length) {
                this.typingText += text[i];
                i++;
                setTimeout(type, speed);
            } else {
                this.isTyping = false;
            }
        };
        type();
    }

    /**
     * Show node
     */
    showNode(node) {
        this.currentNode = node;
        this.typeText(node.text);
    }

    /**
     * Close dialogue
     */
    close() {
        this.isOpen = false;
        this.npc = null;
        this.currentNode = null;
        this.typingText = '';
    }
}

customElements.define('dialogue-component', DialogueComponent);
