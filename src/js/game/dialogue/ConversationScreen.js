/**
 * ConversationScreen.js
 * Manages the conversation screen UI and dialogue flow
 */

import { dialogueTreeSystem } from './DialogueTreeSystem.js';
import { getNPCImage, getNPCFallback } from '../../utils/NPCImageMapper.js';

export class ConversationScreen {
    constructor(game) {
        this.game = game;
        this.currentNPC = null;
        this.currentNode = null;
        this.screenElement = null;
    }
    
    /**
     * Show conversation screen for NPC
     */
    showConversation(npcId) {
        const npc = this.game.npcManager.getNPC(npcId);
        if (!npc) return;
        
        this.currentNPC = npc;
        
        // Create or get conversation screen
        let screen = document.getElementById('conversation-screen');
        if (!screen) {
            screen = this.createConversationScreen();
            document.body.appendChild(screen);
        }
        
        this.screenElement = screen;
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
        const conversation = await this.game.npcManager.startConversation(this.currentNPC.id);
        if (!conversation) return;
        
        const npcImage = getNPCImage(this.currentNPC);
        const fallbackIcon = getNPCFallback(this.currentNPC);
        const relationship = this.game.npcManager.getRelationship(this.currentNPC.id);
        const tier = this.game.npcManager.getRelationshipTier(this.currentNPC.id);
        
        // Build conversation screen HTML
        this.screenElement.innerHTML = `
            <div class="conversation-header">
                <div class="conversation-npc-avatar">
                    <img src="${npcImage}" 
                         alt="${this.currentNPC.name}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="npc-avatar-fallback" style="display:none;">
                        <div style="font-size: 3rem;">${fallbackIcon}</div>
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
                        🎁 Gift
                    </button>
                    <button class="conversation-action-btn" onclick="game.conversationScreen.handleTopic()">
                        💬 Topic
                    </button>
                </div>
                <button class="conversation-close-btn" onclick="game.conversationScreen.close()">
                    Close
                </button>
            </div>
        `;
        
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
        
        return choices.map((choice, index) => {
            const disabled = choice.conditions && 
                choice.conditions.relationship && 
                this.game.npcManager.getRelationship(this.currentNPC.id) < choice.conditions.relationship;
            
            return `
                <button class="conversation-choice ${disabled ? 'disabled' : ''}" 
                        data-choice-index="${index}"
                        ${disabled ? 'disabled' : ''}>
                    ${choice.text}
                </button>
            `;
        }).join('');
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
        const result = this.game.npcManager.makeChoice(choiceIndex);
        if (!result) return;
        
        // Update dialogue text
        const dialogueText = this.screenElement.querySelector('#conversation-dialogue-text');
        if (dialogueText && result.text) {
            dialogueText.textContent = result.text;
        }
        
        // Get next node if using dialogue tree
        if (result.isTreeAction && this.currentNPC) {
            const relationship = this.game.npcManager.relationships[this.currentNPC.id] || 0;
            const dialogueTree = dialogueTreeSystem.getTree(this.currentNPC.id, relationship);
            if (dialogueTree) {
                const currentNode = this.game.npcManager.currentConversation?.currentNode || 'root';
                const node = dialogueTree.getNode(currentNode);
                if (node && node.choices) {
                    // Update choices
                    const choicesArea = this.screenElement.querySelector('#conversation-choices');
                    if (choicesArea) {
                        choicesArea.innerHTML = this.renderChoices(node.choices);
                        this.attachChoiceHandlers();
                    }
                }
            }
        }
        
        // Update relationship display
        const relationship = this.game.npcManager.getRelationship(this.currentNPC.id);
        const tier = this.game.npcManager.getRelationshipTier(this.currentNPC.id);
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
    }
    
    /**
     * Show effects of choice
     */
    showEffects(effects) {
        if (effects.relationship) {
            const change = effects.relationship > 0 ? '+' : '';
            this.game.showToast(`Relationship ${change}${effects.relationship}`, 'info');
        }
        if (effects.xp) {
            this.game.showToast(`Gained ${effects.xp} XP`, 'success');
        }
    }
    
    /**
     * Handle gift giving
     */
    handleGift() {
        // Show gift selection modal
        this.game.showToast('Gift feature coming soon', 'info');
    }
    
    /**
     * Handle topic discussion
     */
    handleTopic() {
        // Show topic selection
        this.game.showToast('Topic feature coming soon', 'info');
    }
    
    /**
     * Close conversation screen
     */
    close() {
        if (this.screenElement) {
            this.screenElement.classList.remove('active');
        }
        this.currentNPC = null;
        this.currentNode = null;
    }
}

