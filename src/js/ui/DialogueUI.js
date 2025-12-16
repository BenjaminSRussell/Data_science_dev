/**
 * DialogueUI.js
 * Clean dialogue interface using dialogue trees
 * No emojis - text only
 */

import { dialogueTreeSystem } from '../game/dialogue/DialogueTreeSystem.js';

export class DialogueUI {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.isOpen = false;
        this.currentNPC = null;
        this.currentTree = null;
        this.currentNode = null;
        this.onClose = null;
        
        this.createContainer();
    }
    
    /**
     * Create the dialogue container element
     */
    createContainer() {
        if (document.getElementById('dialogue-ui')) {
            this.container = document.getElementById('dialogue-ui');
            return;
        }
        
        this.container = document.createElement('div');
        this.container.id = 'dialogue-ui';
        this.container.className = 'dialogue-container';
        this.container.innerHTML = `
            <div class="dialogue-box">
                <div class="dialogue-header">
                    <div class="char-avatar" id="dialogue-avatar">
                        <span class="char-avatar-initial" id="dialogue-avatar-initial">?</span>
                    </div>
                    <div class="dialogue-npc-info">
                        <div class="dialogue-npc-name" id="dialogue-npc-name">Unknown</div>
                        <div class="dialogue-npc-title" id="dialogue-npc-title">???</div>
                    </div>
                    <button class="dialogue-close" id="dialogue-close" aria-label="Close">×</button>
                </div>
                <div class="dialogue-body">
                    <div class="dialogue-text" id="dialogue-text">...</div>
                </div>
                <div class="dialogue-choices" id="dialogue-choices"></div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .dialogue-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .dialogue-close:hover {
                background: rgba(239, 68, 68, 0.3);
                color: #ef4444;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.container);
        
        this.container.querySelector('#dialogue-close').addEventListener('click', () => {
            this.close();
        });
    }
    
    /**
     * Open dialogue with an NPC
     */
    open(npc, relationshipLevel = 0) {
        if (!npc) return;
        
        this.currentNPC = npc;
        
        // Build dialogue tree for this NPC
        // Use relationshipLevel parameter or get from game state
        const relLevel = relationshipLevel || this.game?.gameState?.npcManager?.getRelationship?.(npc.id) || 0;
        const dialogueTreeSystem = this.game?.gameState?.dialogueTreeSystem || this.game?.dialogueTreeSystem;
        if (dialogueTreeSystem) {
            this.currentTree = dialogueTreeSystem.getTree(npc.id, relLevel);
        } else {
            // Fallback: create simple tree
            this.currentTree = {
                getRootNode: () => ({
                    id: 'root',
                    text: `Hello, I'm ${npc.name}. How can I help you?`,
                    choices: [{ id: 'close', text: 'Goodbye' }]
                }),
                getNode: (id) => this.currentTree.getRootNode()
            };
        }
        this.currentNode = this.currentTree.getRootNode();
        
        // Update avatar
        const avatar = this.container.querySelector('#dialogue-avatar');
        const initial = this.container.querySelector('#dialogue-avatar-initial');
        
        const personality = npc.personality || 'friendly';
        avatar.setAttribute('data-personality', personality);
        initial.textContent = npc.name?.[0]?.toUpperCase() || '?';
        
        // Update NPC info
        this.container.querySelector('#dialogue-npc-name').textContent = npc.name || 'Unknown';
        this.container.querySelector('#dialogue-npc-title').textContent = npc.title || npc.type || '???';
        
        // Show root node
        this.showNode(this.currentNode);
        
        // Show container
        this.container.classList.add('active');
        this.isOpen = true;
    }
    
    /**
     * Show a dialogue node
     */
    showNode(node) {
        if (!node) return;
        
        this.currentNode = node;
        
        // Type out text
        this.typeText(node.text);
        
        // Show choices
        if (node.choices && node.choices.length > 0) {
            this.showChoices(node.choices);
        } else {
            // No choices - show continue or close
            this.showChoices([
                { id: 'continue', text: 'Continue' },
                { id: 'close', text: 'Goodbye' }
            ]);
        }
    }
    
    /**
     * Type out text with animation
     */
    typeText(text, speed = 30) {
        const textEl = this.container.querySelector('#dialogue-text');
        textEl.textContent = '';
        textEl.classList.add('typing');
        
        let i = 0;
        const type = () => {
            if (i < text.length) {
                textEl.textContent += text[i];
                i++;
                setTimeout(type, speed);
            } else {
                textEl.classList.remove('typing');
            }
        };
        type();
    }
    
    /**
     * Show dialogue choices
     */
    showChoices(choices) {
        const choicesEl = this.container.querySelector('#dialogue-choices');
        choicesEl.innerHTML = '';
        
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-choice';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => this.handleChoice(choice.id));
            choicesEl.appendChild(btn);
        });
    }
    
    /**
     * Handle player choice
     */
    handleChoice(choiceId) {
        if (choiceId === 'close' || choiceId === 'goodbye') {
            this.close();
            return;
        }
        
        if (choiceId === 'continue') {
            // Try to find next node
            if (this.currentNode.nextNode) {
                const nextNode = this.currentTree.getNode(this.currentNode.nextNode);
                this.showNode(nextNode);
            } else {
                this.close();
            }
            return;
        }
        
        // Find choice in current node
        const choice = this.currentNode.choices?.find(c => c.id === choiceId);
        if (!choice) return;
        
        // Apply effects
        if (this.currentNode.effects) {
            this.applyEffects(this.currentNode.effects);
        }
        
        // Find next node
        const nextNodeId = choice.nextNode || choiceId;
        const nextNode = this.currentTree.getNode(nextNodeId);
        
        if (nextNode) {
            this.showNode(nextNode);
        } else {
            // No next node - close or return to root
            setTimeout(() => {
                this.showNode(this.currentTree.getRootNode());
            }, 1000);
        }
    }
    
    /**
     * Apply dialogue effects
     */
    applyEffects(effects) {
        if (effects.relationship && this.game?.gameState?.npcManager) {
            const currentRel = this.game.gameState.npcManager.getRelationship?.(this.currentNPC.id) || 0;
            this.game.gameState.npcManager.setRelationship?.(
                this.currentNPC.id, 
                currentRel + effects.relationship
            );
        }
        
        if (effects.statBoost && this.game?.gameState?.characterStats) {
            // Boost stat
            const current = this.game.gameState.characterStats[effects.statBoost] || 0;
            this.game.gameState.characterStats[effects.statBoost] = current + 1;
        }
        
        if (effects.item && this.game?.gameState) {
            // Give item
            console.log('Received item:', effects.item);
        }
    }
    
    /**
     * Close dialogue
     */
    close() {
        this.container.classList.remove('active');
        this.isOpen = false;
        this.currentNPC = null;
        this.currentTree = null;
        this.currentNode = null;
        
        if (this.onClose) {
            this.onClose();
        }
    }
    
    setOnClose(callback) {
        this.onClose = callback;
    }
}
