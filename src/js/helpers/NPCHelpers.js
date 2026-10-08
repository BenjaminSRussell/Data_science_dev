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
import { GIFT_COSTS } from '../game/NPCManager.js';

/**
 * Handle visiting an NPC (opens clean dialogue interface)
 */
export function handleVisitNPC(game, npcId) {
    const npcManager = game.gameState?.npcManager;
    const npc = npcManager?.getNPC(npcId);
    if (!npc) {
        // Don't fail silently (#1119)
        logger.warn(`handleVisitNPC: NPC "${npcId}" not found`);
        game.showToast?.("That person isn't around right now.", 'warning');
        return;
    }

    // Visiting counts as meeting them (relationships screen, first-NPC beat) (#1465)
    npcManager.registerVisit?.(npcId);

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
        // Relationship-gated choices are shown locked, not hidden (#1581)
        if (choice.locked) {
            const need = choice.conditions?.relationship;
            if (need) btn.textContent += ` (relationship ${need})`;
            btn.disabled = true;
            btn.classList.add('locked');
            btn.title = need ? `Needs relationship ${need}` : 'Not available yet';
            actionsDiv.appendChild(btn);
            return;
        }
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
export function handleNPCGift(game, npcId, giftId = 'coffee') {
    // The player picks the gift; coffee is only the default (#1118)
    const result = game.gameState.npcManager?.giveGift(npcId, giftId);
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
    const gain = Math.round((result.relationshipGain || 0) * 10) / 10;
    const reaction = result.liked ? 'loved it' : 'accepted it';
    game.showToast?.(`Gift given (-$${result.cost}): they ${reaction}. Relationship ${gain >= 0 ? '+' : ''}${gain}`, result.liked ? 'success' : 'info');
    game.uiUpdater?.updateAllUI?.();
    if (game.screenManager?.isScreenActive?.('screen-relationships')) {
        updateRelationshipsScreen(game);
    }
}

/**
 * Build the gift picker for a relationships card: a select of gifts with
 * prices and a Give button. This is the live entry point to giveGift() (#1304).
 */
function createGiftControls(game, npc) {
    const wrap = document.createElement('div');
    wrap.className = 'npc-gift-controls';
    wrap.style.cssText = 'display:flex;gap:4px;margin-top:6px;';
    // Clicks inside the picker must not open the conversation
    ['click', 'keydown'].forEach(evt => wrap.addEventListener(evt, e => e.stopPropagation()));

    const select = document.createElement('select');
    select.className = 'npc-gift-select';
    select.setAttribute('aria-label', `Gift for ${npc.name}`);
    Object.entries(GIFT_COSTS).forEach(([id, cost]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `${id.replace(/_/g, ' ')} ($${cost})`;
        select.appendChild(opt);
    });

    const btn = document.createElement('button');
    btn.className = 'btn-cartoon btn-sm npc-gift-btn';
    btn.textContent = 'Give gift';
    btn.addEventListener('click', () => handleNPCGift(game, npc.id, select.value));

    wrap.appendChild(select);
    wrap.appendChild(btn);
    return wrap;
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

    if (npcs.length === 0) {
        grid.appendChild(DOMUtils.createElement('p', {
            className: 'npc-grid-empty',
            textContent: 'No contacts yet. Visit locations around the city to meet people.'
        }));
        return;
    }

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
                style: { width: `${Math.max(0, Math.min(100, Number(npc.relationship) || 0))}%` }
            })
        );
        const tier = DOMUtils.createContainer({ className: 'relationship-tier' }, npc.tier?.label ?? '');

        card.appendChild(avatar);
        card.appendChild(info);
        card.appendChild(relationshipBar);
        card.appendChild(tier);
        card.appendChild(createGiftControls(game, npc));

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



