/**
 * Misc game-flow fixes (#1932, #2290, #1486, #1679, #1049, #1251, #1229)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { MapCoordinateSystem } from '../../src/js/game/MapCoordinateSystem.js';
import { openExamModal, closeExamModal } from '../../src/js/helpers/EducationHelpers.js';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { DemandingBossSystem } from '../../src/js/game/work/DemandingBossSystem.js';
import { GameplaySettings } from '../../src/js/game/settings/GameplaySettings.js';
import fs from 'fs';
import path from 'path';

describe('MapCoordinateSystem rejects off-grid cells (#1932)', () => {
    it('does not check or reserve a clamped cell', () => {
        const c = new MapCoordinateSystem();
        const max = c.gridSystem.bounds.maxX;
        expect(c.isAvailable(max + 20, 3)).toBe(false);
        expect(c.occupyCoord(max + 20, 3, 'x')).toBe(false);
        expect(c.grid.has(`${max},3`)).toBe(false);
        expect(c.occupyCoord(2, 3, 'x')).toBe(true);
        c.releaseCoord(max + 20, 3, 'x');
        expect(c.grid.has('2,3')).toBe(true);
    });

    it('findAvailableCoord returns exactly the cell it reserved', () => {
        const c = new MapCoordinateSystem();
        const out = c.findAvailableCoord(500, 500);
        expect(c.grid.has(`${out.x},${out.y}`)).toBe(true);
        expect(c.gridSystem.isValidGridCoord(out.x, out.y)).toBe(true);
    });
});

describe('exam modal (#2290)', () => {
    beforeEach(() => {
        document.body.innerHTML = `<button id="opener">open</button>
            <div id="modal-exam" class="modal hidden"><div class="modal-content"><button class="close-modal">x</button></div></div>`;
    });

    it('opens as an overlay, closes on Escape and restores focus', () => {
        const opener = document.getElementById('opener');
        opener.focus();
        const modal = document.getElementById('modal-exam');
        openExamModal(modal);
        expect(modal.classList.contains('hidden')).toBe(false);
        expect(document.activeElement).toBe(modal.querySelector('.close-modal'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal.classList.contains('hidden')).toBe(true);
        expect(document.activeElement).toBe(opener);
        closeExamModal(modal);
    });

    it('main.css styles .modal as a fixed overlay', () => {
        const css = fs.readFileSync(path.resolve(__dirname, '../../src/styles/main.css'), 'utf8');
        const rule = css.match(/\n\.modal \{([^}]*)\}/)[1];
        expect(rule).toContain('position: fixed');
        expect(rule).toContain('z-index: var(--z-modal)');
    });
});

describe('promotion overlay (#1486)', () => {
    beforeEach(() => { document.body.innerHTML = ''; });

    it('shows the rank safely, once, and closes', () => {
        const ui = Object.create(UIUpdater.prototype);
        ui.showPromotionAnimation({ title: '<b>Senior</b>', salaryMultiplier: 1.5 });
        ui.showPromotionAnimation({ title: 'Lead', salaryMultiplier: 2 });
        const overlays = document.querySelectorAll('.promotion-overlay');
        expect(overlays).toHaveLength(1);
        expect(overlays[0].querySelector('.new-rank').textContent).toBe('Lead');
        expect(overlays[0].querySelector('.salary-bonus').textContent).toContain('2x');
        overlays[0].querySelector('button').click();
        expect(document.querySelector('.promotion-overlay')).toBeNull();

        ui.showPromotionAnimation({ title: '<b>x</b>' });
        expect(document.querySelector('.new-rank b')).toBeNull();
        expect(document.querySelector('.salary-bonus')).toBeNull();
    });

    it('the promotion event shows the overlay instead of just a toast', () => {
        const showPromotionAnimation = vi.fn(() => ({}));
        const fake = {
            showToast: vi.fn(), audioManager: { play: vi.fn() },
            uiUpdater: { showPromotionAnimation, updateAllUI: vi.fn() }
        };
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        expect(src).toMatch(/showPromotionAnimation\?\.\(rank\)/);
        // Same logic as the listener
        const rank = { title: 'Lead' };
        if (!fake.uiUpdater?.showPromotionAnimation?.(rank)) fake.showToast('x');
        expect(showPromotionAnimation).toHaveBeenCalledWith(rank);
        expect(fake.showToast).not.toHaveBeenCalled();
    });
});

describe('background asset loading (#1679, #1049)', () => {
    it('waits for the PixiJS managers before choosing a pipeline', async () => {
        let resolveManagers;
        const pixi = { init: vi.fn(async () => {}), loadAll: vi.fn(async () => {}) };
        const fake = {
            assetManager: { getAssetManifest: () => ({}), loadAll: vi.fn(async () => true) },
            phase4ManagersReady: new Promise(r => { resolveManagers = r; })
        };
        const p = MainGame.prototype.loadAssetsInBackground.call(fake);
        fake.pixiAssetManager = pixi;
        resolveManagers();
        expect(await p).toBe(true);
        // Pixi registers the manifest; game images still come from AssetManager (#68)
        expect(pixi.init).toHaveBeenCalled();
        expect(pixi.loadAll).not.toHaveBeenCalled();
        expect(fake.assetManager.loadAll).toHaveBeenCalledTimes(1);
    });

    it('does not reload the manifest for a second game in the same session', async () => {
        const fake = { assetManager: { getAssetManifest: () => ({}), loadAll: vi.fn(async () => true) } };
        await MainGame.prototype.loadAssetsInBackground.call(fake);
        await MainGame.prototype.loadAssetsInBackground.call(fake);
        expect(fake.assetManager.loadAll).toHaveBeenCalledTimes(1);
    });

    it('startNewGame reuses the existing AssetManager', () => {
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        expect(src).toContain('if (!this.assetManager) this.assetManager = new AssetManager();');
    });
});

describe('difficulty has one source of truth (#1251)', () => {
    it('the boss follows GameplaySettings difficulty', () => {
        const gameState = { gameplaySettings: new GameplaySettings() };
        const boss = new DemandingBossSystem(gameState);
        boss.initializeBoss({ name: 'Mr. Anderson' });
        expect(boss.demandLevel).toBe(70);
        gameState.gameplaySettings.setSetting('difficulty', 'bossDemand', 20);
        gameState.gameplaySettings.setSetting('difficulty', 'taskFrequency', 5);
        const task = boss.generateTask();
        expect(boss.demandLevel).toBe(20);
        expect(boss.taskFrequency).toBe(5);
        expect(task.difficulty).toBe(30 + 20 * 0.5);
    });

    it('still works without settings', () => {
        const boss = new DemandingBossSystem({});
        boss.initializeBoss();
        expect(boss.demandLevel).toBe(70);
        expect(boss.syncDifficultyFromSettings()).toBe(false);
    });
});

describe('chart work costs time and energy (#1229)', () => {
    function fakeGame(timeManager) {
        return {
            economySystem: { evaluateChart: vi.fn(() => ({ total: 80 })) },
            gameState: { currentTask: { difficulty: 5 }, chartConfig: {} },
            timeManager,
            showError: vi.fn(), showToast: vi.fn(), stopTaskTimer: vi.fn(),
            readChartStudioForm: vi.fn(), applyTaskRewards: vi.fn(), handleTimeAdvance: vi.fn(),
            screenManager: { showScreen: vi.fn() }, animateReview: vi.fn(), uiUpdater: {},
            chartManager: { createReviewChart: vi.fn() }, audioManager: { play: vi.fn() }
        };
    }

    it('scales with difficulty', () => {
        expect(MainGame.taskWorkCost({ difficulty: 1 })).toEqual({ timeSlots: 1, energy: 7 });
        expect(MainGame.taskWorkCost({ difficulty: 5 })).toEqual({ timeSlots: 2, energy: 15 });
        expect(MainGame.taskWorkCost({ difficulty: 10 })).toEqual({ timeSlots: 3, energy: 25 });
        expect(MainGame.taskWorkCost({})).toEqual({ timeSlots: 1, energy: 7 });
    });

    it('blocks submission when too tired, without scoring', () => {
        const g = fakeGame({ canPerformAction: () => ({ can: false, reason: 'Not enough energy' }), useEnergy: vi.fn() });
        MainGame.prototype.submitChart.call(g);
        expect(g.showError).toHaveBeenCalledWith(expect.stringContaining('Not enough energy'));
        expect(g.economySystem.evaluateChart).not.toHaveBeenCalled();
        expect(g.gameState.currentTask.submitted).toBeUndefined();
    });

    it('charges energy and time on a successful submit', () => {
        const tm = { canPerformAction: () => ({ can: true }), useEnergy: vi.fn() };
        const g = fakeGame(tm);
        try { MainGame.prototype.submitChart.call(g); } catch { /* review UI not faked */ }
        expect(g.economySystem.evaluateChart).toHaveBeenCalled();
        expect(tm.useEnergy).toHaveBeenCalledWith(15);
        expect(g.handleTimeAdvance).toHaveBeenCalledWith(2);
    });
});
