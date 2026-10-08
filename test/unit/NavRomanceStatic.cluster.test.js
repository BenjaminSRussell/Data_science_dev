import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';
import { StoryUI } from '../../src/js/ui/StoryUI.js';
import { RomanceProgressionSystem } from '../../src/js/game/romance/RomanceProgressionSystem.js';
import { definesMethod, callLacksDefinition } from '../../scripts/static-bug-check.js';

const screen = (id) => {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'screen hidden';
    document.body.appendChild(el);
    return el;
};

describe('ScreenManager history symmetry (#1359)', () => {
    let sm;
    beforeEach(() => {
        document.body.innerHTML = '';
        ['screen-menu', 'screen-office', 'screen-shop'].forEach(screen);
        sm = new ScreenManager({ showToast: vi.fn() });
        sm.init?.();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => vi.restoreAllMocks());

    it('showScreen reports success and failure', () => {
        expect(sm.showScreen('screen-office')).toBe(true);
        expect(sm.showScreen('screen-missing')).toBe(false);
        expect(sm.getCurrentScreen()).toBe('screen-office');
    });

    it('a failed showScreen pushes nothing, so goBack returns to the real previous screen', () => {
        sm.showScreen('screen-office');
        sm.showScreen('screen-shop');
        sm.showScreen('screen-missing');
        expect(sm.goBack()).toBe(true);
        expect(sm.getCurrentScreen()).toBe('screen-office');
    });

    it('goBack keeps the history entry when the previous screen cannot be shown', () => {
        sm.showScreen('screen-office');
        sm.showScreen('screen-shop');
        document.getElementById('screen-office').remove();
        delete sm.screens['screen-office'];
        expect(sm.goBack()).toBe(false);
        expect(sm.history).toContain('screen-office');
        expect(sm.getCurrentScreen()).toBe('screen-shop');
        expect(new ScreenManager({}).goBack()).toBe(false);
    });
});

describe('StoryUI only pops history it pushed (#1359)', () => {
    it('hideStoryScreen skips goBack when showing the story screen failed', () => {
        document.body.innerHTML = '<div id="screen-story" class="screen hidden"></div>';
        const sm = { currentScreen: 'screen-office', showScreen: vi.fn(() => false), goBack: vi.fn(() => true), getCurrentScreen() { return this.currentScreen; } };
        const ui = Object.create(StoryUI.prototype);
        ui.game = { screenManager: sm };
        ui.updateStoryDisplay = () => {};
        ui.showStoryScreen();
        ui.hideStoryScreen();
        expect(sm.goBack).not.toHaveBeenCalled();
        expect(document.getElementById('screen-story').classList.contains('hidden')).toBe(true);
    });

    it('hideStoryScreen goes back when the story screen really opened', () => {
        document.body.innerHTML = '<div id="screen-story" class="screen hidden"></div>';
        const sm = { currentScreen: 'screen-office', showScreen: vi.fn(function () { this.currentScreen = 'screen-story'; return true; }), goBack: vi.fn(() => true), getCurrentScreen() { return this.currentScreen; } };
        const ui = Object.create(StoryUI.prototype);
        ui.game = { screenManager: sm };
        ui.updateStoryDisplay = () => {};
        ui.showStoryScreen();
        ui.hideStoryScreen();
        expect(sm.goBack).toHaveBeenCalledTimes(1);
    });
});

describe('RomanceProgressionSystem income uses gameState.money (#2376)', () => {
    it('workTogether and getMarried include the player cash', () => {
        const gs = { money: 5000, economySystem: {} };
        const rp = new RomanceProgressionSystem(gs);
        rp.romancePartner = { name: 'Sam', income: 3000 };
        rp.relationshipStage = 'engaged';
        rp.syncPartner = () => {};
        const r = rp.workTogether({ id: 'p1', title: 'Pipeline', difficulty: 2 });
        expect(r.success).toBe(true);
        expect(r.combinedIncome).toBe(8000);
        const m = rp.getMarried();
        expect(m.success).toBe(true);
        expect(m.householdIncome).toBe(8000);
    });
});

describe('static-bug-check method definitions (#1901)', () => {
    it('recognises every definition style the codebase uses', () => {
        const d = (c) => definesMethod(c, 'registerAnimation');
        expect(d('function registerAnimation(a) {}')).toBe(true);
        expect(d('class A {\n  registerAnimation(name) {\n  }\n}')).toBe(true);
        expect(d('  async registerAnimation() {')).toBe(true);
        expect(d('this.registerAnimation = () => {}')).toBe(true);
        expect(d('const o = { registerAnimation: fn }')).toBe(true);
        expect(d('foo.registerAnimation(1);')).toBe(false);
        expect(d('if (a.registerAnimation === b) {}')).toBe(false);
    });

    it('flags a call only when nothing defines it', () => {
        const call = 'animator.registerAnimation("x");';
        expect(callLacksDefinition(call, call, 'registerAnimation')).toBe(true);
        expect(callLacksDefinition(call, `${call}\n  registerAnimation(n) {\n  }`, 'registerAnimation')).toBe(false);
        expect(callLacksDefinition('// a.registerAnimation(1)', '', 'registerAnimation')).toBe(false);
        expect(callLacksDefinition('a.other(1)', '', 'registerAnimation')).toBe(false);
    });
});
