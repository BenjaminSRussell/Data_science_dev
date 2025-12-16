/**
 * NPCHelpers.js
 * Helper functions for NPC interactions, dialogues, and relationships
 */

import { getTextIcon } from '../utils/IconMapper.js';
import { getNPCImage, getNPCFallback } from '../utils/NPCImageMapper.js';
import { DialogueUI } from '../ui/DialogueUI.js';

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

    let modal = document.getElementById('npc-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'npc-modal';
        modal.className = 'npc-modal-overlay';
        document.body.appendChild(modal);
    }

    modal.className = 'npc-modal-overlay active';

    // Content with AAA quality design
    modal.innerHTML = `
        <div class="npc-modal-container">
            <button class="npc-modal-close" onclick="document.getElementById('npc-modal').classList.remove('active')">
                <span>✕</span>
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
                     <span>💬</span> Chat
                 </button>
                 <button class="npc-action-btn secondary" onclick="game.handleNPCGift('${npc.id}')">
                     <span>🎁</span> Gift
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
    actionsDiv.innerHTML = '';

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
    const dialogArea = document.getElementById('npc-dialogue-area');
    dialogArea.innerHTML = "Interesting... (Relationship Changed)";

    setTimeout(() => {
        document.getElementById('npc-modal').className = 'modal hidden';
        game.showToast('Conversation finished.', 'success');
    }, 1500);
}

/**
 * Handle giving a gift to an NPC
 */
export function handleNPCGift(game, npcId) {
    const result = game.gameState.npcManager.giveGift(npcId, 'coffee');
    const dialogArea = document.getElementById('npc-dialogue-area');
    if (result.liked) dialogArea.innerHTML = "Wow! I love this! Thanks!";
    else dialogArea.innerHTML = "Oh... thanks, I guess.";
}

/**
 * Update the relationships screen
 */
export function updateRelationshipsScreen(game) {
    const npcManager = game.npcManager || game.gameState?.npcManager;
    console.log('DEBUG updateRelationshipsScreen: npcManager =', npcManager);
    
    if (!npcManager) {
        console.warn('No NPC manager found for relationships screen');
        return;
    }

    const npcs = npcManager.getMetNPCs();
    console.log('DEBUG updateRelationshipsScreen: npcs =', npcs);
    const grid = document.getElementById('npc-grid');
    console.log('DEBUG updateRelationshipsScreen: grid element =', grid);
    
    if (!grid) {
        console.error('NPC grid element not found!');
        return;
    }
    
    grid.innerHTML = '';

    npcs.forEach(npc => {
        const card = document.createElement('div');
        card.className = 'npc-card';
        card.dataset.npc = npc.id;
        
        const textIcon = getTextIcon(npc.icon);
        // Ensure NPC has image
        const npcImage = getNPCImage(npc);
        const fallbackIcon = getNPCFallback(npc);
        
        const avatarContent = `<img src="${npcImage}" alt="${npc.name}" class="npc-avatar-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                               <div class="npc-avatar-text" style="display:none;">${getTextIcon(fallbackIcon)}</div>`;
        
        card.innerHTML = `
            <div class="npc-avatar">${avatarContent}</div>
            <div class="npc-info">
                <div class="npc-name">${npc.name}</div>
                <div class="npc-title">${npc.title}</div>
            </div>
            <div class="relationship-bar">
                <div class="relationship-fill" style="width: ${npc.relationship}%"></div>
            </div>
            <div class="relationship-tier">${npc.tier.label}</div>
        `;

        card.addEventListener('click', () => {
            handleVisitNPC(game, npc.id);
        });

        grid.appendChild(card);
    });
}

/**
 * Interact with an NPC (alias for handleVisitNPC)
 */
export function interactWithNPC(game, npcId) {
    handleVisitNPC(game, npcId);
}



