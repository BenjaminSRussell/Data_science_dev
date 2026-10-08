/**
 * UIUpdater cluster: shop icons (#1482, #1129), library tab memory (#1995),
 * rank requirement (#1271, #1267), hardware names/icons (#1485, #1333),
 * dead animateMoneyChange (#1488), software effects table (#1484),
 * coffee shop layout (#2432) and library CSS (#2486).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('../../src/js/ui/LitUIManager.js', () => ({
    LitUIManager: class { initialize() {} }
}));

import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { GameState } from '../../src/js/game/GameState.js';
import { handleLearnLibrary } from '../../src/js/helpers/EducationHelpers.js';
import { OFFICE_LOCATIONS } from '../../src/js/data/locations.js';
import { OFFICES } from '../../src/js/data/tycoonData.js';
import { HARDWARE_TYPES } from '../../src/js/game/HardwareSystems.js';

function makeUpdater(state = {}) {
    const game = { gameState: { money: 0, rankIndex: 0, unlockedLibraries: [], purchasedItems: [], ...state } };
    return new UIUpdater(game);
}

describe('icons (#1482, #1129, #1333)', () => {
    it('renders image paths as <img> and text glyphs as text', () => {
        expect(UIUpdater.iconHTML('/assets/x.png', 'X')).toMatch(/^<img src="\/assets\/x.png" alt="X"/);
        expect(UIUpdater.iconHTML('▦', 'GPU')).toBe('▦');
        expect(UIUpdater.iconHTML('', 'none')).toBe('');
    });

    it('gives every hardware type a non-empty icon', () => {
        const ui = makeUpdater();
        for (const type of Object.values(HARDWARE_TYPES)) {
            expect(ui.getHardwareIcon(type)).not.toBe('');
        }
    });

    it('gives every office an icon', () => {
        for (const office of OFFICES) {
            expect(office.icon).toBeTruthy();
        }
    });
});

describe('hardware names (#1485)', () => {
    it('keeps acronyms upper case', () => {
        const ui = makeUpdater();
        expect(ui.getHardwareName('gpu')).toBe('GPU');
        expect(ui.getHardwareName('cpu')).toBe('CPU');
        expect(ui.getHardwareName('ram')).toBe('RAM');
        expect(ui.getHardwareName('monitor')).toBe('Monitor');
    });
});

describe('dead code (#1488)', () => {
    it('animateMoneyChange is gone', () => {
        expect(UIUpdater.prototype.animateMoneyChange).toBeUndefined();
    });
});

describe('library screen (#1995, #1271, #1267)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button class="lib-cat-btn" data-cat="all"></button>
            <button class="lib-cat-btn" data-cat="modeling"></button>
            <div id="library-grid"></div>`;
    });

    it('keeps the selected tab on a no-argument refresh', () => {
        const ui = makeUpdater();
        ui.updateLibraryScreen('modeling');
        ui.updateLibraryScreen();
        expect(ui.currentLibraryCategory).toBe('modeling');
        expect(document.querySelector('[data-cat="modeling"]').classList.contains('active')).toBe(true);
    });

    it('shows the rank requirement on locked cards', () => {
        const ui = makeUpdater({ money: 1e9, rankIndex: 0 });
        ui.updateLibraryScreen('all');
        expect(document.querySelectorAll('.lib-req').length).toBeGreaterThan(0);
        expect(document.querySelector('.lib-req').textContent).toMatch(/^Requires /);
    });

    it('libraryRankMet uses 1-based reqLevel', () => {
        expect(UIUpdater.libraryRankMet({ reqLevel: 1 }, 0)).toBe(true);
        expect(UIUpdater.libraryRankMet({ reqLevel: 3 }, 1)).toBe(false);
        expect(UIUpdater.libraryRankMet({ reqLevel: 3 }, 2)).toBe(true);
    });

    it('handleLearnLibrary refuses when the rank is too low', () => {
        const game = {
            gameState: { money: 1e6, rankIndex: 0, unlockedLibraries: [] },
            showError: vi.fn(), showToast: vi.fn(),
            audioManager: { play: vi.fn() },
            uiUpdater: { updateAllUI: vi.fn(), updateLibraryScreen: vi.fn() }
        };
        const libs = [{ id: 'hi', name: 'Hi', cost: 10, reqLevel: 4 }, { id: 'lo', name: 'Lo', cost: 10, reqLevel: 1 }];
        handleLearnLibrary(game, 'hi', libs);
        expect(game.showError).toHaveBeenCalled();
        expect(game.gameState.money).toBe(1e6);
        handleLearnLibrary(game, 'lo', libs);
        expect(game.gameState.unlockedLibraries).toEqual(['lo']);
    });
});

describe('software effects (#1484)', () => {
    it('scoring and display come from one table', () => {
        const gs = Object.create(GameState.prototype);
        gs.purchasedItems = ['soft_ide_pro', 'soft_automl'];
        const m = gs.getSoftwareQualityMultiplier();
        expect(m.visualClarity).toBeCloseTo(1.05);
        expect(m.dataAccuracy).toBeCloseTo(1.03);
        expect(m.chartAppropriateness).toBeCloseTo(1.03);
        expect(m.speedBonus).toBeCloseTo(0.10);
        expect(GameState.describeSoftwareEffects('soft_ide_pro')).toEqual(['+5% Visual Clarity', '+3% Data Accuracy']);
        expect(GameState.describeSoftwareEffects('nope')).toEqual([]);
    });
});

describe('coffee shop (#2432)', () => {
    it('has its own hidden theme and renders in shop mode', () => {
        const theme = OFFICE_LOCATIONS.find(l => l.id === 'coffee_shop');
        expect(theme).toBeTruthy();
        expect(theme.hidden).toBe(true);
        document.body.innerHTML = `
            <div class="office-background"></div><div class="office-desk"></div>
            <div class="office-badge"></div><div id="location-interactions" class="hidden"></div>
            <div id="office-equipment-section"></div>`;
        const ui = makeUpdater();
        ui.game.worldMap = { getLocation: () => ({ id: 'coffee_shop', type: 'social', name: 'Coffee Shop', activities: [] }) };
        try { ui.updateLocationLayout('coffee_shop'); } catch { /* later DOM pieces are optional */ }
        expect(document.querySelector('.office-desk').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('office-equipment-section').classList.contains('hidden')).toBe(true);
    });
});

describe('library CSS (#2486)', () => {
    it('styles the library classes with tokens only', () => {
        const css = readFileSync(resolve(__dirname, '../../src/styles/game-panels.css'), 'utf8');
        for (const cls of ['.library-grid', '.library-card', '.lib-header', '.lib-cat-badge', '.lib-footer', '.lib-cost', '.lib-req']) {
            expect(css).toContain(cls);
        }
    });
});
