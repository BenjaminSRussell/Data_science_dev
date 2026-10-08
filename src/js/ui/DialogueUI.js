/**
 * DialogueUI.js
 * Clean dialogue interface using dialogue trees
 * Phase 2: Now uses Lit component (DialogueComponent) with fallback
 */

import { dialogueTreeSystem } from '../game/dialogue/DialogueTreeSystem.js';
import { STATS } from '../game/CharacterStats.js';
import { getNPCImage } from '../utils/NPCImageMapper.js';

// Items a dialogue node can hand over (effects.item) (#47)
export const DIALOGUE_ITEMS = {
    gift: { name: 'a small gift', money: 100 }
};

export class DialogueUI {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.litComponent = null;
        this.isOpen = false;
        this.currentNPC = null;
        this.currentTree = null;
        this.currentNode = null;
        this.onClose = null;

        this.createContainer();
    }

    /**
     * Create the dialogue container element
     * Phase 2: Uses Lit component if available
     */
    createContainer() {
        // Try to use Lit component first
        try {
            if (customElements.get('dialogue-component')) {
                let container = document.getElementById('dialogue-ui-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'dialogue-ui-container';
                    document.body.appendChild(container);
                }

                this.litComponent = document.createElement('dialogue-component');
                this.litComponent.game = this.game;
                this.litComponent.addEventListener('dialogue-choice', (e) => {
                    this.handleChoice(e.detail.choice.id);
                });
                this.litComponent.addEventListener('dialogue-close', () => {
                    this.close();
                });
                container.appendChild(this.litComponent);
                return;
            }
        } catch (err) {
            console.warn('Lit component not available, using fallback:', err);
        }

        // Fallback to DOM method
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
     * Phase 2: Uses Lit component if available
     */
    open(npc, relationshipLevel = 0) {
        if (!npc) return;

        this.currentNPC = npc;

        // Build dialogue tree for this NPC
        const relLevel = relationshipLevel || this.game?.gameState?.npcManager?.getRelationship?.(npc.id) || 0;
        const treeSystem = this.game?.gameState?.dialogueTreeSystem || this.game?.dialogueTreeSystem || dialogueTreeSystem;
        // getTree() returns null for NPCs without dialogue data; fall back to
        // a simple greeting tree in that case too.
        this.currentTree = treeSystem?.getTree?.(npc.id, relLevel) || null;
        if (!this.currentTree) {
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
        // Each node's effects apply once per conversation; the greeting's apply on open
        this._appliedNodes = new Set(['root']);
        if (this.currentNode?.effects) this.applyEffects(this.currentNode.effects);

        // Use Lit component if available
        if (this.litComponent) {
            this.litComponent.open(npc, this.currentNode);
            this.isOpen = true;
            return;
        }

        // Fallback to DOM method
        const avatar = this.container?.querySelector('#dialogue-avatar');
        const initial = this.container?.querySelector('#dialogue-avatar-initial');

        if (avatar && initial) {
            const personality = npc.personality || 'friendly';
            avatar.setAttribute('data-personality', personality);
            initial.textContent = npc.name?.[0]?.toUpperCase() || '?';
            // NPC portrait, with the initial as a fallback (#1158)
            let portrait = null;
            try { portrait = getNPCImage(npc); } catch { portrait = null; }
            avatar.querySelector('img.dialogue-portrait')?.remove();
            if (portrait) {
                const img = document.createElement('img');
                img.className = 'dialogue-portrait';
                img.src = portrait;
                img.alt = '';
                img.addEventListener('error', () => { img.remove(); initial.hidden = false; });
                initial.hidden = true;
                avatar.appendChild(img);
            } else {
                initial.hidden = false;
            }
        }

        // Update NPC info
        if (this.container) {
            const nameEl = this.container.querySelector('#dialogue-npc-name');
            const titleEl = this.container.querySelector('#dialogue-npc-title');
            if (nameEl) nameEl.textContent = npc.name || 'Unknown';
            if (titleEl) titleEl.textContent = npc.title || npc.type || '???';
        }

        // Show root node
        this.showNode(this.currentNode);

        // Show container
        if (this.container) {
            this.container.classList.add('active');
        }
        this.isOpen = true;
    }

    /**
     * Show a dialogue node
     * Phase 2: Uses Lit component if available
     */
    showNode(node) {
        if (!node) return;

        this.currentNode = node;

        // Use Lit component if available
        if (this.litComponent) {
            this.litComponent.showNode(node);
            return;
        }

        // Fallback to DOM method
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
        if (this._typeTimer) {
            clearTimeout(this._typeTimer);
            this._typeTimer = null;
        }
        const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            textEl.textContent = text;
            textEl.classList.remove('typing');
            return;
        }
        textEl.textContent = '';
        textEl.classList.add('typing');

        let i = 0;
        const type = () => {
            if (i < text.length) {
                textEl.textContent += text[i];
                i++;
                this._typeTimer = setTimeout(type, speed);
            } else {
                textEl.classList.remove('typing');
                this._typeTimer = null;
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

        choices?.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-choice';
            btn.type = 'button';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => this.handleChoice(choice.id));
            choicesEl.appendChild(btn);
            if (idx === 0) btn.focus();
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

        // Find next node (strict lookup so a bad id is handled, not masked) (#1157)
        const nextNodeId = choice.nextNode || choiceId;
        const tree = this.currentTree;
        const nextNode = typeof tree?.hasNode === 'function'
            ? (tree.hasNode(nextNodeId) ? tree.nodes.get(nextNodeId) : null)
            : (tree?.getNode?.(nextNodeId) || null);

        if (!nextNode) {
            console.warn(`[Dialogue] Choice "${choiceId}" has no node; returning to the start of the conversation`);
            this.showNode(this.currentTree.getRootNode());
            return;
        }

        // Apply the effects of the node being ENTERED, once per conversation, so
        // bouncing between nodes can't farm relationship points (#1156)
        if (nextNode.effects && !this._appliedNodes?.has(nextNode.id)) {
            this._appliedNodes = this._appliedNodes || new Set();
            this._appliedNodes.add(nextNode.id);
            this.applyEffects(nextNode.effects);
        }

        this.showNode(nextNode);
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
            // One level's worth of XP through CharacterStats' own API, so
            // xp bookkeeping and the max-level cap stay consistent (#1161)
            const stats = this.game.gameState.characterStats;
            const id = effects.statBoost;
            if (STATS[id] && typeof stats.addExperience === 'function') {
                const toNext = (stats.getXPForNextLevel?.(id) ?? 100) - (stats.xp?.[id] || 0);
                stats.addExperience(id, Math.max(1, toNext));
            }
        }

        if (effects.item && this.game?.gameState) {
            // Hand over the item (#47)
            const item = DIALOGUE_ITEMS[effects.item];
            const from = this.currentNPC?.name || 'Someone';
            if (item) {
                if (item.money) this.game.gameState.money = (this.game.gameState.money || 0) + item.money;
                this.game.showToast?.(`${from} gave you ${item.name}${item.money ? ` (+$${item.money})` : ''}!`, 'success');
            } else {
                console.warn(`[Dialogue] Unknown item "${effects.item}"`);
            }
        }
    }

    /**
     * Close dialogue
     * Phase 2: Uses Lit component if available
     */
    close() {
        if (this._typeTimer) { clearTimeout(this._typeTimer); this._typeTimer = null; }
        // Use Lit component if available
        if (this.litComponent) {
            this.litComponent.close();
        } else if (this.container) {
            this.container.classList.remove('active');
        }

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
