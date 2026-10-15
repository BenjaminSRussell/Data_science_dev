/**
 * WorkInteractionSystem is reachable from the career screen (#2259).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

function panelDom() {
    document.body.innerHTML = `
        <div id="workplace-panel">
            <span id="workplace-job"></span>
            <span id="workplace-boss"></span>
            <span id="workplace-boss-rel"></span>
            <span id="workplace-readiness"></span>
            <p id="workplace-dialogue"></p>
            <button id="btn-talk-boss" type="button"></button>
            <button id="btn-ask-promotion" type="button"></button>
            <button id="btn-quit-job" type="button"></button>
            <div id="workplace-coworkers"></div>
        </div>`;
}

function updater(gameState) {
    const u = Object.create(UIUpdater.prototype);
    u.game = { gameState, workInteractionSystem: gameState.workInteractionSystem };
    return u;
}

describe('workplace panel (#2259)', () => {
    it('index.html exposes boss, coworker, promotion, and quit controls', () => {
        const html = fs.readFileSync('index.html', 'utf8');
        expect(html).toContain('id="workplace-panel"');
        expect(html).toContain('id="btn-talk-boss"');
        expect(html).toContain('id="btn-ask-promotion"');
        expect(html).toContain('id="btn-quit-job"');
        expect(html).toContain('id="workplace-coworkers"');
        const src = fs.readFileSync('src/js/main.js', 'utf8');
        expect(src).toMatch(/talkToBoss\(\)/);
        expect(src).toMatch(/talkToCoworker\(coworkerId\)/);
        expect(src).toMatch(/askForPromotion\(\)/);
        expect(src).toMatch(/quitJob\(\)/);
    });

    it('renders the live boss and coworkers and disables actions when unemployed', () => {
        const gs = { currentJob: { title: 'Analyst', company: 'Acme' }, reputation: 0 };
        gs.workInteractionSystem = new WorkInteractionSystem(gs);
        gs.workInteractionSystem.boss.relationship = 12;
        gs.workInteractionSystem.boss.promotionReadiness = 34;
        panelDom();
        updater(gs).updateWorkplacePanel();
        expect(document.getElementById('workplace-job').textContent).toBe('Analyst at Acme');
        expect(document.getElementById('workplace-boss').textContent).toContain(gs.workInteractionSystem.boss.name);
        expect(document.getElementById('workplace-boss-rel').textContent).toBe('12');
        expect(document.getElementById('workplace-readiness').textContent).toBe('34');
        const buttons = document.querySelectorAll('#workplace-coworkers [data-coworker-id]');
        expect(buttons).toHaveLength(3);
        expect([...buttons].map(b => b.dataset.coworkerId)).toEqual([
            'coworker_sarah', 'coworker_mike', 'coworker_jessica'
        ]);
        expect(document.getElementById('btn-talk-boss').disabled).toBe(false);

        gs.currentJob = null;
        updater(gs).updateWorkplacePanel();
        expect(document.getElementById('workplace-job').textContent).toBe('Unemployed');
        expect(document.getElementById('btn-quit-job').disabled).toBe(true);
        expect(document.querySelector('#workplace-coworkers button').disabled).toBe(true);
    });

    it('career refresh paints the workplace even with no project system', () => {
        const gs = { currentJob: 'analyst' };
        gs.workInteractionSystem = new WorkInteractionSystem(gs);
        panelDom();
        const u = updater(gs);
        u.updateCareerScreen();
        expect(document.getElementById('workplace-job').textContent).toBe('analyst');
    });

    it('talk, promote, and quit call the system and show the result', () => {
        const gs = {
            currentJob: { title: 'Analyst', company: 'Acme' },
            reputation: 600,
            tasksCompleted: 25
        };
        const wis = new WorkInteractionSystem(gs);
        gs.workInteractionSystem = wis;
        wis.boss.relationship = 70;
        wis.boss.promotionReadiness = 90;
        panelDom();
        const showToast = vi.fn();
        const game = Object.create(MainGame.prototype);
        game.gameState = gs;
        game.workInteractionSystem = wis;
        game.showToast = showToast;
        game.uiUpdater = updater(gs);
        game.audioManager = { play: vi.fn() };

        const talked = game.handleTalkToBoss();
        expect(talked.dialogue).toEqual(expect.any(String));
        expect(wis.boss.relationship).toBe(71);
        expect(document.getElementById('workplace-dialogue').textContent).toContain(talked.dialogue);
        expect(document.getElementById('workplace-boss-rel').textContent).toBe('71');

        const sarah = game.handleTalkToCoworker('coworker_sarah');
        expect(sarah.coworker.name).toBe('Sarah');
        expect(sarah.relationship).toBe(1);

        const promoted = game.handleAskForPromotion();
        expect(promoted.success).toBe(true);
        expect(gs.reputation).toBe(700);
        expect(game.audioManager.play).toHaveBeenCalledWith('promotion');

        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        expect(game.handleQuitJob()).toBeNull();
        expect(gs.currentJob).toBeTruthy();
        confirm.mockReturnValue(true);
        const quit = game.handleQuitJob();
        expect(quit.success).toBe(true);
        expect(gs.currentJob).toBeNull();
        expect(document.getElementById('workplace-job').textContent).toBe('Unemployed');
    });

    it('does nothing useful without a job', () => {
        const gs = { currentJob: null };
        gs.workInteractionSystem = new WorkInteractionSystem(gs);
        const game = Object.create(MainGame.prototype);
        game.gameState = gs;
        game.showToast = vi.fn();
        game.uiUpdater = { updateWorkplacePanel: vi.fn(), updateTopBar: vi.fn() };
        expect(game.handleTalkToBoss()).toBeNull();
        expect(game.handleTalkToCoworker('coworker_sarah')).toBeNull();
        expect(game.handleAskForPromotion()).toBeNull();
        expect(game.handleQuitJob()).toBeNull();
        expect(gs.workInteractionSystem.boss.relationship).toBe(0);
        expect(game.showToast).toHaveBeenCalled();
    });
});
