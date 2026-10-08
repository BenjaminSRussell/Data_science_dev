import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';
import { StoryUI } from '../../src/js/ui/StoryUI.js';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';
import { NarrativeClaritySystem } from '../../src/js/game/NarrativeClaritySystem.js';

const makeGS = (days = 0, extra = {}) => ({
    timeManager: { totalDays: days },
    characterStats: { ethics: 0, modifyEthics: vi.fn() },
    money: 0, reputation: 0, ...extra
});

describe('StorylineManager (#1102, #2394, #1420, #261, #433)', () => {
    it('getDecision resolves a decision after it was made', () => {
        const sm = new StorylineManager(makeGS(0));
        sm.initialize();
        expect(sm.processDecision('first_job_offer', 'reject').success).toBe(true);
        expect(sm.getAvailableDecisions().some(d => d.id === 'first_job_offer')).toBe(false);
        expect(sm.getDecision('first_job_offer').title).toBe('Your First Big Opportunity');
        // ...but it can't be made twice
        expect(sm.processDecision('first_job_offer', 'accept')).toBeNull();
    });

    it('applies consequences and tracks progress', () => {
        const gs = makeGS(0);
        const sm = new StorylineManager(gs);
        sm.initialize();
        sm.processDecision('first_job_offer', 'accept');
        expect(gs.money).toBe(5000);
        expect(gs.reputation).toBe(50);
        expect(gs.characterStats.modifyEthics).toHaveBeenCalledWith(-10);
        expect(sm.storylineProgress).toBe(10);
        expect(sm.majorDecisions[0]).toMatchObject({ decisionId: 'first_job_offer', choice: 'accept', week: 0 });
    });

    it('reputation moves the phase on, days set the floor', () => {
        const gs = makeGS(10);
        const sm = new StorylineManager(gs);
        expect(sm.determinePhase()).toBe('early');
        gs.reputation = 1500;
        expect(sm.determinePhase()).toBe('mid');
        gs.reputation = 6000;
        expect(sm.determinePhase()).toBe('late');
        gs.timeManager.totalDays = 400;
        expect(sm.determinePhase()).toBe('endgame');
    });

    it('offers sell_company once in the endgame', () => {
        const gs = makeGS(400);
        const sm = new StorylineManager(gs);
        sm.initialize();
        expect(sm.storylinePhase).toBe('endgame');
        expect(sm.getAvailableDecisions().map(d => d.id)).toContain('sell_company');
        expect(sm.processDecision('sell_company', 'sell').success).toBe(true);
        expect(gs.money).toBe(1000000);
        expect(sm.getAvailableDecisions().map(d => d.id)).not.toContain('sell_company');
    });

    it('every surfaced decision has its own background (#1532)', () => {
        const sm = new StorylineManager(makeGS(0));
        const ncs = new NarrativeClaritySystem(makeGS(0));
        const generic = ncs.getDecisionBackground('nope');
        sm.getAvailableDecisions({ includeAll: true }).forEach(d => {
            expect(ncs.getDecisionBackground(d.id)).not.toBe(generic);
        });
    });
});

describe('StoryUI (#1773, #1763, #1877, #1422, #1475, #2394)', () => {
    let game, ui;
    beforeEach(() => {
        document.body.innerHTML = '<div class="top-bar-right"></div><div id="screen-container"></div>';
        const gs = makeGS(0);
        gs.storylineManager = new StorylineManager(gs);
        gs.characterArcSystem = {
            updateCurrentState: vi.fn(),
            getArcSummary: () => ({ start: 'S', current: 'C', transformation: 'T' })
        };
        game = { gameState: gs, showToast: vi.fn(), screenManager: { currentScreen: 'screen-game', showScreen: vi.fn(), goBack: vi.fn() } };
        ui = new StoryUI(game);
    });

    it('binds listeners once even if initialize runs twice', () => {
        const spy = vi.spyOn(document, 'addEventListener');
        ui.initialize();
        ui.initialize();
        expect(spy.mock.calls.filter(c => c[0] === 'keydown')).toHaveLength(1);
        ui.destroy();
    });

    it('is not "open" when the screen manager refused to show it', () => {
        ui.initialize();
        ui.showStoryScreen();
        expect(ui.isOpen).toBe(false);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(game.screenManager.goBack).not.toHaveBeenCalled();
        game.screenManager.showScreen = (id) => { game.screenManager.currentScreen = id; };
        ui.showStoryScreen();
        expect(ui.isOpen).toBe(true);
        ui.destroy();
    });

    it('shows arc theme/challenges, the character arc and real decision titles', () => {
        ui.initialize();
        game.gameState.storylineManager.initialize();
        game.gameState.storylineManager.processDecision('first_job_offer', 'reject');
        ui.updateStoryDisplay();
        expect(document.getElementById('story-arc-theme').textContent).toMatch(/Theme: Survival/);
        expect(document.querySelectorAll('.story-arc-challenge')).toHaveLength(3);
        expect(document.getElementById('arc-current-description').textContent).toBe('C');
        expect(document.querySelector('.decision-title').textContent).toBe('Your First Big Opportunity');
        expect(document.getElementById('story-journal').textContent).toMatch(/integrity over convenience/);
        ui.destroy();
    });

    it('decision modal: dialog role, focus, Escape closes and restores focus', () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();
        const sm = game.gameState.storylineManager;
        sm.initialize();
        ui.showDecisionModal(sm.getAvailableDecisions()[0]);
        const modal = document.querySelector('.story-decision-modal');
        expect(modal.getAttribute('role')).toBe('dialog');
        expect(modal.getAttribute('aria-modal')).toBe('true');
        expect(document.activeElement.classList.contains('decision-choice-btn')).toBe(true);
        const buttons = modal.querySelectorAll('button');
        buttons[buttons.length - 1].focus();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        expect(document.activeElement).toBe(buttons[0]);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.querySelector('.story-decision-modal')).toBeNull();
        expect(document.activeElement).toBe(opener);
    });
});

describe('DialogueUI (#47, #1158)', () => {
    it('item effects hand over the item', () => {
        document.body.innerHTML = '';
        const game = { gameState: { money: 0 }, showToast: vi.fn() };
        const d = new DialogueUI(game);
        d.currentNPC = { id: 'x', name: 'Emma' };
        d.applyEffects({ item: 'gift' });
        expect(game.gameState.money).toBe(100);
        expect(game.showToast).toHaveBeenCalledWith(expect.stringMatching(/Emma gave you a small gift/), 'success');
    });

    it('shows the NPC portrait in the fallback box', () => {
        document.body.innerHTML = '';
        const game = { gameState: { money: 0 } };
        const d = new DialogueUI(game);
        d.open({ id: 'emma_bloom', name: 'Emma', type: 'social' });
        const img = document.querySelector('#dialogue-avatar img.dialogue-portrait');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBeTruthy();
        d.close();
    });
});
