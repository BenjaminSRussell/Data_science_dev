/**
 * ProjectHelpers office/stats/avatar screen updaters (#471)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateOfficeScreen, updateStatsScreen, checkForCharacterEvolution, updatePlayerAvatar } from '../../src/js/helpers/ProjectHelpers.js';
import { OFFICES } from '../../src/js/data/tycoonData.js';

const OFFICE_DOM = `
  <span id="current-office-name"></span>
  <button id="btn-upgrade-office"></button>
  <div id="next-office-info"><span id="next-office-name"></span><span id="next-office-icon"></span></div>
  <div class="ai-console-section hidden">
    <span id="ai-name"></span><span id="ai-level"></span><span id="ai-stat-int"></span><span id="ai-stat-spd"></span>
    <div id="ai-xp-fill"></div><button id="btn-train-ai"></button>
  </div>`;

const game = (gs = {}, extra = {}) => ({ gameState: { money: 0, officeIndex: 0, ...gs }, handleUpgradeOffice: vi.fn(), ...extra });

describe('updateOfficeScreen', () => {
    beforeEach(() => { document.body.innerHTML = OFFICE_DOM; });
    const btn = () => document.getElementById('btn-upgrade-office');

    it('shows the next office price from OFFICES and disables when unaffordable', () => {
        updateOfficeScreen(game({ money: OFFICES[1].price - 1 }));
        expect(document.getElementById('current-office-name').textContent).toBe(OFFICES[0].name);
        expect(btn().textContent).toBe(`[ RENT: $${OFFICES[1].price.toLocaleString()} ]`);
        expect(btn().disabled).toBe(true);
        expect(document.getElementById('next-office-name').textContent).toBe(OFFICES[1].name);
    });

    it('enables the button when affordable and wires the click', () => {
        const g = game({ money: OFFICES[1].price });
        updateOfficeScreen(g);
        expect(btn().disabled).toBe(false);
        btn().click();
        expect(g.handleUpgradeOffice).toHaveBeenCalled();
    });

    it('max tier shows MAXED, disabled, and hides next-office info', () => {
        updateOfficeScreen(game({ officeIndex: OFFICES.length - 1, money: 1e9 }));
        expect(btn().textContent).toBe('MAXED');
        expect(btn().disabled).toBe(true);
        expect(document.getElementById('next-office-info').classList.contains('hidden')).toBe(true);
    });

    it('populates the AI console and clamps the XP bar', () => {
        const aiSystem = { name: 'Bot', level: 3, intelligence: 7, speed: 4, xp: 25, xpToNextLevel: 100 };
        updateOfficeScreen(game({}, { aiSystem }));
        expect(document.querySelector('.ai-console-section').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('ai-name').textContent).toBe('Bot');
        expect(document.getElementById('ai-level').textContent).toBe('3');
        expect(document.getElementById('ai-stat-int').textContent).toBe('7');
        expect(document.getElementById('ai-stat-spd').textContent).toBe('4');
        expect(document.getElementById('ai-xp-fill').style.width).toBe('25%');
        updateOfficeScreen(game({}, { aiSystem: { ...aiSystem, xpToNextLevel: 0 } }));
        expect(document.getElementById('ai-xp-fill').style.width).toBe('0%');
    });

    it('does not crash when worldMap exists but uiUpdater does not', () => {
        expect(() => updateOfficeScreen(game({}, { worldMap: { currentLocation: 'home' } }))).not.toThrow();
    });
});

describe('updateStatsScreen', () => {
    it('renders each stat card and the total level', () => {
        document.body.innerHTML = `
          <span id="stats-name"></span><span id="total-level"></span>
          <div class="stat-card" data-stat="coding"><span class="stat-value"></span><div class="stat-bar-fill"></div><span class="stat-xp"></span></div>
          <div class="stat-card" data-stat="charisma"><span class="stat-value"></span><div class="stat-bar-fill"></div><span class="stat-xp"></span></div>`;
        const stats = [
            { id: 'coding', value: 5, maxLevel: 10, xp: 12.7, xpNeeded: 50 },
            { id: 'charisma', value: 3, maxLevel: 0, xp: 0, xpNeeded: 10 }
        ];
        updateStatsScreen({ gameState: { playerName: 'Ada' }, characterStats: { getAllStats: () => stats } });
        expect(document.getElementById('stats-name').textContent).toBe('Ada');
        const coding = document.querySelector('[data-stat="coding"]');
        expect(coding.querySelector('.stat-value').textContent).toBe('5');
        expect(coding.querySelector('.stat-bar-fill').style.width).toBe('50%');
        expect(coding.querySelector('.stat-xp').textContent).toBe('XP: 12/50');
        expect(document.querySelector('[data-stat="charisma"] .stat-bar-fill').style.width).toBe('0%');
        expect(document.getElementById('total-level').textContent).toBe('8');
    });

    it('does nothing without characterStats', () => {
        expect(() => updateStatsScreen({ gameState: {} })).not.toThrow();
    });
});

describe('checkForCharacterEvolution / updatePlayerAvatar', () => {
    it('toasts, plays kaching and tags player markers on evolution', () => {
        document.body.innerHTML = '<span class="player-icon">P</span><span class="player-icon">P</span>';
        const cs = { visualStage: 'level_2_good', checkEvolution: vi.fn(() => ({ evolved: true, stage: 'level_2_good' })) };
        const g = { gameState: { money: 500, characterStats: cs, visualProgressionSystem: {} }, showToast: vi.fn(), audioManager: { play: vi.fn() } };
        checkForCharacterEvolution(g);
        expect(cs.checkEvolution).toHaveBeenCalledWith(500, g.gameState.visualProgressionSystem);
        expect(g.showToast).toHaveBeenCalledWith('Character Evolved: LEVEL 2 GOOD!', 'success');
        expect(g.audioManager.play).toHaveBeenCalledWith('kaching');
        document.querySelectorAll('.player-icon').forEach(el => {
            expect(el.dataset.stage).toBe('level_2_good');
            expect(el.textContent).toBe('P');
        });
    });

    it('no toast when not evolved; tolerates missing audioManager', () => {
        const g = { gameState: { characterStats: { checkEvolution: () => ({ evolved: false }) } }, showToast: vi.fn() };
        checkForCharacterEvolution(g);
        expect(g.showToast).not.toHaveBeenCalled();
        const g2 = { gameState: { characterStats: { checkEvolution: () => ({ evolved: true, stage: 'x' }) } } };
        expect(() => checkForCharacterEvolution(g2)).not.toThrow();
        expect(() => updatePlayerAvatar({ gameState: {} })).not.toThrow();
    });
});
