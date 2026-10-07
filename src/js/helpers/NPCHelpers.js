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
    // Refresh the relationships screen when the conversation closes so the
    // bars/tiers reflect what just happened (#1122)
    game.dialogueUI.setOnClose?.(() => {
        if (game.screenManager?.isScreenActive?.('screen-relationships')) {
            updateRelationshipsScreen(game);
        }
    });
    game.dialogueUI.open(npc, relationshipLevel);
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

    renderNPCChoices(game, convo.choices);
}

function getNPCActionsContainer() {
    return document.querySelector(
        '#npc-modal .npc-modal-actions, #npc-modal .npc-actions, .dialogue-container .dialogue-choices'
    );
}

/**
 * Render the current conversation choices as buttons in the NPC modal
 */
export function renderNPCChoices(game, choices = []) {
    const actionsDiv = getNPCActionsContainer();
    if (!actionsDiv) {
        logger.warn('NPC actions container not found');
        return;
    }
    actionsDiv.textContent = '';

    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-cartoon btn-sm';
        btn.textContent = choice.text;
        btn.onclick = () => {
            // Disable every button so a choice can't be applied twice
            actionsDiv.querySelectorAll('button').forEach(b => { b.disabled = true; });
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

    // Show what the NPC actually said, plus the relationship change
    DOMUtils.updateElement('#npc-dialogue-area', {
        textContent: result.text ? `"${result.text}"` : '...'
    });
    if (result.effects?.relationship) {
        const sign = result.effects.relationship > 0 ? '+' : '';
        game.showToast?.(`Relationship ${sign}${result.effects.relationship}`, 'info');
    } else if (result.isSpecialAction && !result.success) {
        game.showToast?.(result.text, 'warning');
    }

    if (result.ended || !result.choices || result.choices.length === 0) {
        setTimeout(() => {
            const modal = DOMUtils.query('#npc-modal');
            if (modal) {
                modal.className = 'modal hidden';
            }
            game.showToast?.('Conversation finished.', 'success');
        }, 1500);
        return;
    }

    renderNPCChoices(game, result.choices);
}

/**
 * Handle giving a gift to an NPC
 */
export function handleNPCGift(game, npcId) {
    const result = game.gameState.npcManager?.giveGift(npcId, 'coffee');
    if (!result) {
        game.showToast?.('Unable to give gift right now.', 'error');
        return;
    }
    if (!result.success) {
        game.showToast?.(result.message || 'Unable to give gift right now.', 'warning');
        return;
    }
    DOMUtils.updateElement('#npc-dialogue-area', {
        textContent: result.liked ? "Wow! I love this! Thanks!" : "Oh... thanks, I guess."
    });
    game.showToast?.(`Gift given (-$${result.cost}). Relationship ${result.relationshipGain >= 0 ? '+' : ''}${result.relationshipGain}`, 'info');
    game.uiUpdater?.updateAllUI?.();
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

    const cards = npcs.map(npc => {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.dataset.npc = npc.id;

        const textIcon = getTextIcon(npc.icon || getNPCFallback(npc));
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
            // Prefer per-NPC mapped icon (textIcon); fall back to generic
            innerHTML: textIcon || getTextIcon(fallbackIcon),
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

        // Keyboard accessible like a button (#1123)
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Visit ${npc.name}`);
        card.addEventListener('click', () => {
            handleVisitNPC(game, npc.id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                handleVisitNPC(game, npc.id);
            }
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



