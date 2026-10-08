/**
 * ConversationScreen.js
 * Manages the conversation screen UI and dialogue flow
 */

import { STATS } from '../CharacterStats.js';
import { getNPCImage, getNPCFallback } from '../../utils/NPCImageMapper.js';
import { ThreeCharacterRenderer } from '../../characters/ThreeCharacterRenderer.js';

export class ConversationScreen {
    constructor(game) {
        this.game = game;
        this.currentNPC = null;
        this.currentNode = null;
        this.screenElement = null;
        this.threeRenderer = new ThreeCharacterRenderer();
    }

    /**
     * Show conversation screen for NPC
     */
    showConversation(npcId) {
        const npc = this.game.npcManager?.getNPC(npcId);
        if (!npc) return;

        this.currentNPC = npc;

        // Create or get conversation screen
        let screen = document.getElementById('conversation-screen');
        if (!screen) {
            screen = this.createConversationScreen();
            document.body.appendChild(screen);
        }

        this.screenElement = screen;
        // Clear the previous NPC's conversation before the screen becomes
        // visible, so it can't flash while the new one loads (#1695)
        screen.innerHTML = '<div class="conversation-loading">…</div>';
        screen.classList.add('active');

        // Start conversation
        this.startConversation();
    }

    /**
     * Create conversation screen HTML
     */
    createConversationScreen() {
        const screen = document.createElement('div');
        screen.id = 'conversation-screen';
        screen.className = 'conversation-screen';
        return screen;
    }

    /**
     * Start conversation
     */
    async startConversation() {
        // Each call gets a token; if another showConversation() starts while
        // we await, this (stale) call must not render (#1696)
        const token = (this._conversationToken = (this._conversationToken || 0) + 1);
        const npc = this.currentNPC;
        const conversation = await this.game.npcManager?.startConversation(npc.id);
        if (!conversation || token !== this._conversationToken || this.currentNPC !== npc) return;

        const npcImage = getNPCImage(this.currentNPC);
        const fallbackIcon = getNPCFallback(this.currentNPC);
        const relationship = this.game.npcManager?.getRelationship(this.currentNPC.id) || 0;
        // A missing tier must still have a label/color to render (#1694)
        const tier = this.game.npcManager?.getRelationshipTier(this.currentNPC.id) || { label: 'Stranger', color: '#888' };

        // Build conversation screen HTML
        this.screenElement.innerHTML = `
            <div class="conversation-header">
                <div class="conversation-npc-avatar">
                    <div id="npc-avatar-container" style="width: 200px; height: 300px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <!-- 3D Model or Image will be injected here -->
                    </div>
                </div>
                <div class="conversation-npc-info">
                    <div class="conversation-npc-name">${this.currentNPC.name}</div>
                    <div class="conversation-npc-title">${this.currentNPC.title}</div>
                </div>
                <div class="conversation-relationship" style="color: ${tier.color}">
                    <span>${tier.label}</span>
                    <span>(${relationship})</span>
                </div>
            </div>
            
            <div class="conversation-body">
                <div class="conversation-dialogue-area">
                    <div class="conversation-dialogue-bubble ${this.currentNPC.personality}">
                        <div class="conversation-dialogue-text" id="conversation-dialogue-text">
                            ${conversation.greeting}
                        </div>
                    </div>
                </div>
                
                <div class="conversation-choices-area" id="conversation-choices">
                    ${this.renderChoices(conversation.choices)}
                </div>
            </div>
            
            <div class="conversation-footer">
                <div class="conversation-actions">
                    <button class="conversation-action-btn" onclick="game.conversationScreen.handleGift()">
                        Gift
                    </button>
                    <button class="conversation-action-btn" onclick="game.conversationScreen.handleTopic()">
                        Topic
                    </button>
                </div>
                <button class="conversation-close-btn" onclick="game.conversationScreen.close()">
                    Close
                </button>
            </div>
        `;

        // Render Avatar (3D or 2D)
        const container = this.screenElement.querySelector('#npc-avatar-container');
        if (this.currentNPC.modelPath) {
            // Try rendering 3D model
            const element = this.threeRenderer.create3DCharacter(this.currentNPC.id, {
                path: this.currentNPC.modelPath,
                width: 200,
                height: 300
            });
            container.innerHTML = '';
            container.appendChild(element);
        } else {
            // Fallback to 2D Image
            container.innerHTML = `
                <img src="${npcImage}" 
                        alt="${this.currentNPC.name}"
                        style="width: 100%; height: 100%; object-fit: cover;"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="npc-avatar-fallback" style="display:none; font-size: 3rem;">
                    ${fallbackIcon}
                </div>
            `;
        }

        // Attach choice handlers
        this.attachChoiceHandlers();
    }

    /**
     * Render choices
     */
    renderChoices(choices) {
        if (!choices || choices.length === 0) {
            return '<div class="conversation-choice disabled">No options available</div>';
        }

        const relationship = this.game.npcManager?.getRelationship?.(this.currentNPC?.id) || 0;
        return choices.map((choice, index) => {
            const need = Number(choice.conditions?.relationship) || 0;
            const disabled = !!choice.locked || (need > 0 && relationship < need);
            const hint = disabled && need ? ` <span class="conversation-choice-lock">(relationship ${need})</span>` : '';

            return `
                <button class="conversation-choice ${disabled ? 'disabled' : ''}"
                        data-choice-index="${index}"
                        ${disabled ? 'disabled aria-disabled="true"' : ''}>
                    ${ConversationScreen.escape(choice.text)}${hint}
                </button>
            `;
        }).join('');
    }

    static escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    /**
     * Attach choice event handlers
     */
    attachChoiceHandlers() {
        const choices = this.screenElement.querySelectorAll('.conversation-choice:not(.disabled)');
        choices.forEach(choice => {
            choice.addEventListener('click', () => {
                const index = parseInt(choice.dataset.choiceIndex);
                this.handleChoice(index);
            });
        });
    }

    /**
     * Handle player choice
     */
    handleChoice(choiceIndex) {
        // Ignore repeat clicks while a choice is being resolved
        if (this.choiceLocked) return;
        this.choiceLocked = true;
        try {
            this.screenElement?.querySelectorAll('.conversation-choice').forEach(btn => { btn.disabled = true; });

            const result = this.game.npcManager?.makeChoice(choiceIndex);
            if (!result) return;

            // Show the NPC's reply (not the player's own line)
            const dialogueText = this.screenElement.querySelector('#conversation-dialogue-text');
            if (dialogueText && result.text) {
                dialogueText.textContent = result.text;
            }

            // Re-render choices for the new conversation position. The old
            // buttons are replaced, so a choice can't be applied twice.
            const choicesArea = this.screenElement.querySelector('#conversation-choices');
            if (choicesArea && Array.isArray(result.choices)) {
                choicesArea.innerHTML = result.ended
                    ? '<div class="conversation-choice disabled">The conversation is over.</div>'
                    : this.renderChoices(result.choices);
                this.attachChoiceHandlers();
            }

            // Update relationship display
            const relationship = this.game.npcManager?.getRelationship(this.currentNPC.id) || 0;
            // A missing tier must still have a label/color to render (#1694)
        const tier = this.game.npcManager?.getRelationshipTier(this.currentNPC.id) || { label: 'Stranger', color: '#888' };
            const relationshipEl = this.screenElement.querySelector('.conversation-relationship');
            if (relationshipEl) {
                relationshipEl.innerHTML = `
                    <span style="color: ${tier.color}">${tier.label}</span>
                    <span>(${relationship})</span>
                `;
            }

            // Show effects
            if (result.effects) {
                this.showEffects(result.effects);
            }
        } finally {
            this.choiceLocked = false;
        }
    }

    /**
     * Show effects of choice
     */
    showEffects(effects) {
        if (effects.relationship) {
            const change = effects.relationship > 0 ? '+' : '';
            this.game.showToast?.(`Relationship ${change}${effects.relationship}`, 'info');
        }
        if (effects.xp) {
            const amount = effects.xpAmount || 20;
            const statName = STATS[effects.xp]?.name || effects.xp;
            this.game.showToast?.(`Gained ${amount} ${statName} XP`, 'success');
        }
        if (effects.energy) {
            this.game.showToast?.(`Energy ${effects.energy > 0 ? '+' : ''}${effects.energy}`, 'info');
        }
        if (effects.money) {
            this.game.showToast?.(`${effects.money > 0 ? '+' : '-'}$${Math.abs(effects.money)}`, effects.money > 0 ? 'success' : 'warning');
        }
    }

    /**
     * Handle gift giving
     */
    handleGift() {
        // Disable gift button for now - feature not implemented
        const giftBtn = this.screenElement?.querySelector('.conversation-action-btn');
        if (giftBtn) {
            giftBtn.disabled = true;
            giftBtn.style.opacity = '0.5';
            giftBtn.style.cursor = 'not-allowed';
        }
    }

    /**
     * Handle topic discussion
     */
    handleTopic() {
        // Disable topic button for now - feature not implemented
        const topicBtn = this.screenElement?.querySelectorAll('.conversation-action-btn')[1];
        if (topicBtn) {
            topicBtn.disabled = true;
            topicBtn.style.opacity = '0.5';
            topicBtn.style.cursor = 'not-allowed';
        }
    }

    /**
     * Close conversation screen
     */
    close() {
        if (this.currentNPC) {
            this.threeRenderer.dispose(this.currentNPC.id);
        }
        if (this.screenElement) {
            this.screenElement.classList.remove('active');
        }
        this.currentNPC = null;
        this.currentNode = null;
    }
}

