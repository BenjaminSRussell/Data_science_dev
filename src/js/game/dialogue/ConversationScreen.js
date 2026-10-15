/**
 * ConversationScreen.js
 * Manages the conversation screen UI and dialogue flow
 */

import { STATS } from '../CharacterStats.js';
import { getNPCImage, getNPCFallback } from '../../utils/NPCImageMapper.js';
import { ThreeCharacterRenderer } from '../../characters/ThreeCharacterRenderer.js';
import { GIFT_COSTS } from '../NPCManager.js';
import { loadGiftReaction } from '../../helpers/NPCHelpers.js';

// Spoken reactions in dialogue files that aren't gifts (#2318)
const SOCIAL_ACTIONS = [
    ['compliment', 'Give a compliment'],
    ['ask_help', 'Ask for help']
];

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

    dialogueSystem() {
        return this.game.relationshipDialogueSystem || this.game.gameState?.relationshipDialogueSystem || null;
    }

    npcManager() {
        return this.game.npcManager || this.game.gameState?.npcManager || null;
    }

    setDialogueText(text) {
        const dialogueText = this.screenElement?.querySelector('#conversation-dialogue-text');
        if (dialogueText && text) dialogueText.textContent = text;
    }

    restoreChoices() {
        const area = this.screenElement?.querySelector('#conversation-choices');
        if (!area) return;
        const choices = this.npcManager()?.currentConversation?.choices || [];
        area.innerHTML = this.renderChoices(choices);
        this.attachChoiceHandlers();
    }

    /**
     * Gift and other authored action replies (actions.gift_* / compliment / ask_help).
     */
    async handleGift() {
        const npc = this.currentNPC;
        const area = this.screenElement?.querySelector('#conversation-choices');
        if (!npc || !area) return;

        const buttons = Object.entries(GIFT_COSTS).map(([id, cost]) => {
            const label = id.replace(/_/g, ' ');
            return `<button type="button" class="conversation-choice" data-gift-id="${ConversationScreen.escape(id)}">Give ${ConversationScreen.escape(label)} ($${cost})</button>`;
        });

        const rds = this.dialogueSystem();
        for (const [id, label] of SOCIAL_ACTIONS) {
            let line;
            try {
                line = await rds?.getActionResponse?.(npc.id, id);
            } catch {
                // A bad dialogue file just hides this action.
            }
            if (typeof line === 'string' && line.trim()) {
                buttons.push(`<button type="button" class="conversation-choice" data-action-id="${ConversationScreen.escape(id)}">${ConversationScreen.escape(label)}</button>`);
            }
        }
        buttons.push('<button type="button" class="conversation-choice" data-action-id="back">Back</button>');

        area.innerHTML = buttons.join('');
        area.querySelectorAll('[data-gift-id]').forEach(btn => {
            btn.addEventListener('click', () => { this.giveSelectedGift(btn.dataset.giftId); });
        });
        area.querySelectorAll('[data-action-id]').forEach(btn => {
            btn.addEventListener('click', () => { this.playAction(btn.dataset.actionId); });
        });
    }

    async giveSelectedGift(giftId) {
        const npc = this.currentNPC;
        if (!npc || !giftId) return;
        const result = this.npcManager()?.giveGift?.(npc.id, giftId);
        if (!result?.success) {
            const message = result?.message || 'Unable to give gift right now.';
            this.setDialogueText(message);
            this.game.showToast?.(message, 'warning');
            return;
        }
        let line;
        try {
            line = await loadGiftReaction(this.game, npc.id, giftId);
        } catch {
            // Fall through to the generic liked/generic reaction.
        }
        const fallback = result.liked ? 'Wow! I love this! Thanks!' : 'Oh... thanks, I guess.';
        this.setDialogueText(line || fallback);
        const gain = Math.round((result.relationshipGain || 0) * 10) / 10;
        this.game.showToast?.(
            `Gift given (-$${result.cost}): Relationship ${gain >= 0 ? '+' : ''}${gain}`,
            result.liked ? 'success' : 'info'
        );
        this.restoreChoices();
    }

    async playAction(action) {
        if (action === 'back') {
            this.restoreChoices();
            return;
        }
        const npc = this.currentNPC;
        if (!npc || !action) return;
        let line;
        try {
            line = await this.dialogueSystem()?.getActionResponse?.(npc.id, action);
        } catch {
            // No authored line for this action.
        }
        if (typeof line === 'string' && line.trim()) this.setDialogueText(line);
    }

    /**
     * Speak the next authored topic for this relationship stage.
     */
    async handleTopic() {
        const npc = this.currentNPC;
        if (!npc || this._topicBusy) return;
        const rds = this.dialogueSystem();
        if (!rds?.getAvailableTopics) {
            this.game.showToast?.('No topics to discuss yet.', 'info');
            return;
        }
        this._topicBusy = true;
        try {
            const relationship = this.npcManager()?.getRelationship?.(npc.id) || 0;
            const topics = await rds.getAvailableTopics(npc.id, relationship) || [];
            if (!topics.length) {
                this.game.showToast?.(`${npc.name} doesn't have anything else to share yet.`, 'info');
                return;
            }
            if (!this._topicCursor) this._topicCursor = new Map();
            const n = this._topicCursor.get(npc.id) || 0;
            this._topicCursor.set(npc.id, n + 1);
            const topic = topics[n % topics.length];
            const line = await rds.getDialogue?.(npc.id, relationship, topic);
            this.setDialogueText(line || "They don't want to talk about that.");
        } catch {
            this.game.showToast?.('No topics to discuss yet.', 'info');
        } finally {
            this._topicBusy = false;
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

