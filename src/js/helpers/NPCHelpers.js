/**
 * NPCHelpers.js
 * Helper functions for NPC interactions, dialogues, and relationships
 * Cleanup: Uses centralized utilities
 */

import { getTextIcon } from '../utils/IconMapper.js';
import { getNPCImage, getNPCFallback } from '../utils/NPCImageMapper.js';
import { DialogueUI } from '../ui/DialogueUI.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { logger } from '../utils/Logger.js';

/**
 * Handle visiting an NPC (opens clean dialogue interface)
 */
export function handleVisitNPC(game, npcId) {
    const npc = game.gameState.npcManager.getNPC(npcId);
    if (!npc) return;

    // Use new DialogueUI for clean, responsive dialogue
    if (!game.dialogueUI) {
        game.dialogueUI = new DialogueUI(game);
    }

    const relationshipLevel = game.gameState.npcManager.getRelationship?.(npcId) || 0;
    game.dialogueUI.open(npc, relationshipLevel);
    return;

    // Fallback to modal if conversation screen not available
    const tier = game.gameState.npcManager.getRelationshipTier(npc.id);
    const npcImage = getNPCImage(npc);
    const fallbackIcon = getNPCFallback(npc);

    let modal = DOMUtils.getOrCreate('#npc-modal', 'div', {
        className: 'npc-modal-overlay',
        parent: document.body
    });

    modal.className = 'npc-modal-overlay active';

    // Content with AAA quality design
    modal.innerHTML = `
        <div class="npc-modal-container">
            <button class="npc-modal-close" onclick="document.getElementById('npc-modal').classList.remove('active')">
                <span></span>
            </button>
            
            <div class="npc-modal-header">
                <div class="npc-modal-title-section">
                    <h2 class="npc-modal-name">${npc.name}</h2>
                    <div class="npc-modal-subtitle">${npc.title}</div>
                    <div class="npc-modal-tier" style="color: ${tier.color}">${tier.label}</div>
                </div>
            </div>
            
            <div class="npc-modal-character-section">
                <div class="character-display-container">
                    <div class="character-glow-effect"></div>
                    <img src="${npcImage}" 
                         class="npc-character-image char-alive ${npc.id === game.currentTalkingNPC ? 'char-talking' : ''}" 
                         alt="${npc.name}"
                         style="object-position: center bottom;"
                         onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="npc-avatar-fallback" style="display:none;">
                        <div class="npc-avatar-text-large">${getTextIcon(fallbackIcon)}</div>
                    </div>
                </div>
                ${npc.description ? `<div class="npc-description">${npc.description}</div>` : ''}
            </div>
            
            <div class="npc-modal-dialogue-area">
                <div class="npc-dialogue-text" id="npc-dialogue-area">
                    "Hey there! What's new?"
                </div>
            </div>
            
            <div class="npc-modal-actions">
                 <button class="npc-action-btn" onclick="game.handleNPCTalk('${npc.id}')">
                     <span></span> Chat
                 </button>
                 <button class="npc-action-btn secondary" onclick="game.handleNPCGift('${npc.id}')">
                     <span></span> Gift
                 </button>
                 <button class="npc-action-btn secondary" onclick="document.getElementById('npc-modal').classList.remove('active')">
                     Leave
                 </button>
            </div>
        </div>
     `;

    game.currentTalkingNPC = npc.id;
}

/**
 * Handle talking to an NPC
 */
export async function handleNPCTalk(game, npcId) {
    const convo = await game.gameState.npcManager.startConversation(npcId);
    if (!convo) return;

    // Add talking animation
    const charSprite = document.querySelector('#npc-modal .char-sprite, #npc-modal .npc-avatar-emoji-large');
    if (charSprite) {
        charSprite.classList.add('char-talking');
        setTimeout(() => charSprite.classList.remove('char-talking'), 500);
    }

    const dialogArea = document.getElementById('npc-dialogue-area');
    if (dialogArea && convo.greeting) {
        dialogArea.innerHTML = `"${convo.greeting}"`;
    }

    // Update actions to choices
    const actionsDiv = document.querySelector('#npc-modal .npc-actions');
    actionsDiv.textContent = '';

    convo.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-cartoon btn-sm';
        btn.textContent = choice.text;
        btn.onclick = () => {
            const result = game.gameState.npcManager.makeChoice(index);
            handleNPCResponse(game, result);
        };
        actionsDiv.appendChild(btn);
    });
}

/**
 * Handle NPC response after player choice
 */
export function handleNPCResponse(game, result) {
    if (!result) return;
    DOMUtils.updateElement('#npc-dialogue-area', {
        innerHTML: "Interesting... (Relationship Changed)"
    });

    setTimeout(() => {
        const modal = DOMUtils.query('#npc-modal');
        if (modal) {
            modal.className = 'modal hidden';
        }
        game.showToast('Conversation finished.', 'success');
    }, 1500);
}

/**
 * Handle giving a gift to an NPC
 */
export function handleNPCGift(game, npcId) {
    const result = game.gameState.npcManager?.giveGift(npcId, 'coffee');
    if (!result) return;
    DOMUtils.updateElement('#npc-dialogue-area', {
        innerHTML: result.liked ? "Wow! I love this! Thanks!" : "Oh... thanks, I guess."
    });
}

/**
 * Update the relationships screen
 */
export function updateRelationshipsScreen(game) {
    const npcManager = game.npcManager || game.gameState?.npcManager;


    if (!npcManager) {
        console.warn('No NPC manager found for relationships screen');
        return;
    }

    const npcs = npcManager?.getMetNPCs() || [];

    const grid = document.getElementById('npc-grid');


    if (!grid) {
        console.error('NPC grid element not found!');
        return;
    }

    grid.textContent = '';

    npcs.forEach(npc => {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.dataset.npc = npc.id;

        const textIcon = getTextIcon(npc.icon);
        // Ensure NPC has image
        const npcImage = getNPCImage(npc);
        const fallbackIcon = getNPCFallback(npc);

        const avatarImg = DOMUtils.createElement('img', {
            attributes: {
                src: npcImage,
                alt: npc.name
            },
            className: 'npc-avatar-image',
            style: { objectPosition: 'center center' },
            listeners: {
                error: function () {
                    this.style.display = 'none';
                    if (this.nextElementSibling) {
                        this.nextElementSibling.style.display = 'flex';
                    }
                }
            }
        });

        const avatarText = DOMUtils.createElement('div', {
            className: 'npc-avatar-text',
            innerHTML: getTextIcon(fallbackIcon),
            style: { display: 'none' }
        });

        const avatar = DOMUtils.createContainer({ className: 'npc-avatar' }, avatarImg, avatarText);
        const info = DOMUtils.createContainer(
            { className: 'npc-info' },
            DOMUtils.createContainer({ className: 'npc-name' }, npc.name),
            DOMUtils.createContainer({ className: 'npc-title' }, npc.title)
        );
        const relationshipBar = DOMUtils.createContainer(
            { className: 'relationship-bar' },
            DOMUtils.createElement('div', {
                className: 'relationship-fill',
                style: { width: `${npc.relationship}%` }
            })
        );
        const tier = DOMUtils.createContainer({ className: 'relationship-tier' }, npc.tier.label);

        card.appendChild(avatar);
        card.appendChild(info);
        card.appendChild(relationshipBar);
        card.appendChild(tier);

        card.addEventListener('click', () => {
            handleVisitNPC(game, npc.id);
        });

        return card;
    });

    grid.appendChild(DOMUtils.batch(cards));
}

/**
 * Interact with an NPC (alias for handleVisitNPC)
 */
export function interactWithNPC(game, npcId) {
    handleVisitNPC(game, npcId);
}



