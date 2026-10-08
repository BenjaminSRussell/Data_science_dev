import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/js/characters/ThreeCharacterRenderer.js', () => ({
    ThreeCharacterRenderer: class { create3DCharacter() { return document.createElement('div'); } dispose() {} }
}));

const { ConversationScreen } = await import('../../src/js/game/dialogue/ConversationScreen.js');
const { renderNPCChoices } = await import('../../src/js/helpers/NPCHelpers.js');

const makeScreen = (rel = 10) => {
    const toasts = [];
    const game = {
        showToast: (m, t) => toasts.push([m, t]),
        npcManager: { getRelationship: () => rel, getRelationshipTier: () => ({ label: 'Friend', color: 'x' }) }
    };
    const cs = new ConversationScreen(game);
    cs.currentNPC = { id: 'npc1', name: 'Ana', title: 'Analyst' };
    cs.screenElement = document.createElement('div');
    cs.screenElement.innerHTML = `<div class="conversation-footer"><button class="conversation-action-btn">Gift</button>
        <button class="conversation-action-btn">Topic</button></div>`;
    return { cs, toasts, game };
};

describe('ConversationScreen (#304)', () => {
    it('renderChoices: empty or null shows a disabled placeholder', () => {
        const { cs } = makeScreen();
        expect(cs.renderChoices([])).toContain('No options available');
        expect(cs.renderChoices(null)).toContain('conversation-choice disabled');
    });

    it('renderChoices: relationship conditions and locked choices disable the button', () => {
        const { cs } = makeScreen(30);
        const host = document.createElement('div');
        host.innerHTML = cs.renderChoices([
            { text: 'Hi' },
            { text: 'Deep talk', conditions: { relationship: 60 } },
            { text: 'Easy', conditions: { relationship: 20 } },
            { text: 'Locked', locked: true }
        ]);
        const btns = [...host.querySelectorAll('button')];
        expect(btns.map(b => b.disabled)).toEqual([false, true, false, true]);
        expect(btns[1].textContent).toMatch(/relationship 60/);
        expect(btns[1].classList.contains('disabled')).toBe(true);
    });

    it('renderChoices escapes choice text', () => {
        const { cs } = makeScreen();
        const host = document.createElement('div');
        host.innerHTML = cs.renderChoices([{ text: '<img src=x onerror=1>' }]);
        expect(host.querySelector('img')).toBeNull();
    });

    it('showEffects: signed relationship, XP, and no crash without showToast', () => {
        const { cs, toasts, game } = makeScreen();
        cs.showEffects({ relationship: 5 });
        cs.showEffects({ relationship: -3 });
        cs.showEffects({ xp: 'intelligence', xpAmount: 15 });
        expect(toasts[0][0]).toBe('Relationship +5');
        expect(toasts[1][0]).toBe('Relationship -3');
        expect(toasts[2][0]).toMatch(/Gained 15 .* XP/);
        delete game.showToast;
        expect(() => cs.showEffects({ xp: 'intelligence', relationship: 1 })).not.toThrow();
    });

    it('close() hides the screen and clears state', () => {
        const { cs } = makeScreen();
        cs.screenElement.classList.add('active');
        cs.currentNode = 'root';
        cs.close();
        expect(cs.screenElement.classList.contains('active')).toBe(false);
        expect(cs.currentNPC).toBeNull();
        expect(cs.currentNode).toBeNull();
    });

    it('handleGift/handleTopic disable their own buttons', () => {
        const { cs } = makeScreen();
        cs.handleGift();
        cs.handleTopic();
        for (const b of cs.screenElement.querySelectorAll('.conversation-action-btn')) {
            expect(b.disabled).toBe(true);
            expect(b.style.opacity).toBe('0.5');
            expect(b.style.cursor).toBe('not-allowed');
        }
    });
});

describe('#1695 no stale conversation flash', () => {
    beforeEach(() => { document.body.innerHTML = ''; });
    it('the screen is cleared before it becomes visible', () => {
        const { cs, game } = makeScreen();
        game.npcManager.getNPC = () => ({ id: 'npc2', name: 'Bo' });
        game.npcManager.startConversation = () => new Promise(() => {});
        const old = document.createElement('div');
        old.id = 'conversation-screen';
        old.innerHTML = '<div class="conversation-npc-name">Ana</div>';
        document.body.appendChild(old);
        cs.showConversation('npc2');
        expect(old.classList.contains('active')).toBe(true);
        expect(old.textContent).not.toContain('Ana');
        expect(old.querySelector('.conversation-loading')).not.toBeNull();
    });
});

describe('#1581 gated tree choices are visible but locked', () => {
    it('NPCManager keeps gated generated-tree choices as locked and refuses them', async () => {
        const { NPCManager } = await import('../../src/js/game/NPCManager.js');
        const nm = Object.create(NPCManager.prototype);
        const node = { choices: [{ id: 'chat', text: 'Chat' }, { id: 'deep_connect', text: 'Share something personal', conditions: { relationship: 60 } }] };
        nm.relationships = { n1: 20 };
        nm.npcStates = {};
        nm.gameState = {};
        nm.currentConversation = { npc: { id: 'n1' }, stage: 'greeting', currentNode: 'root', dialogueTree: { getNode: () => node } };
        const choices = nm.buildConversationChoices();
        expect(choices.map(c => !!c.locked)).toEqual([false, true]);
        expect(choices[1].conditions).toEqual({ relationship: 60 });
        nm.currentConversation.choices = choices;
        expect(nm.makeChoice(1)).toBeNull();
        nm.relationships.n1 = 70;
        expect(nm.buildConversationChoices().some(c => c.locked)).toBe(false);
    });

    it('the live NPC panel renders a locked choice disabled with its requirement', () => {
        document.body.innerHTML = '<div id="npc-modal"><div class="npc-modal-actions"></div></div>';
        const game = { gameState: { npcManager: { makeChoice: vi.fn() } } };
        renderNPCChoices(game, [{ text: 'Chat' }, { text: 'Share', locked: true, conditions: { relationship: 60 } }]);
        const btns = [...document.querySelectorAll('#npc-modal .npc-modal-actions button')];
        expect(btns).toHaveLength(2);
        expect(btns[1].disabled).toBe(true);
        expect(btns[1].textContent).toBe('Share (relationship 60)');
        btns[1].click();
        expect(game.gameState.npcManager.makeChoice).not.toHaveBeenCalled();
    });
});
