import { describe, it, expect, vi } from 'vitest';
globalThis.__DSD_NO_AUTOBOOT__ = true;
const { UIUpdater } = await import('../../src/js/ui/UIUpdater.js');
const { MainGame } = await import('../../src/js/main.js');

const updater = (screen) => {
    const u = Object.create(UIUpdater.prototype);
    u.game = { screenManager: { getCurrentScreen: () => screen }, gameState: { purchasedItems: [] } };
    for (const m of ['updateTopBar', 'updateRankProgress', 'updateChartTypeGrid', 'updateSoftwareDisplay', 'updateBankScreen',
        'updateCareerScreen', 'updateLibraryScreen', 'updateNewspaperScreen', 'updateOfficeEquipment']) u[m] = vi.fn();
    return u;
};

describe('updateAllUI refreshes the active screen (#1483)', () => {
    it.each(Object.entries(UIUpdater.SCREEN_REFRESHERS).filter(([, m]) => m !== 'updateShopScreen'))(
        '%s -> %s', (screen, method) => {
            const u = updater(screen);
            u.updateAllUI();
            expect(u[method]).toHaveBeenCalledTimes(1);
            expect(u.updateBankScreen).toHaveBeenCalled();
        });

    it('screens without a refresher, and a missing ScreenManager, are a no-op', () => {
        const u = updater('screen-game');
        expect(u.refreshActiveScreen()).toBeNull();
        u.game = {};
        expect(u.refreshActiveScreen()).toBeNull();
    });

    it('a throwing refresher does not break updateAllUI', () => {
        const u = updater('screen-career');
        u.updateCareerScreen = vi.fn(() => { throw new Error('boom'); });
        expect(() => u.updateAllUI()).not.toThrow();
    });

    it('a shop refresh keeps the tab the player picked', () => {
        document.body.innerHTML = '<div id="shop-grid"></div>';
        const u = updater('screen-shop');
        u.updateShopScreen('software');
        const html = document.getElementById('shop-grid').innerHTML;
        u.updateAllUI();
        expect(u.currentShopCategory).toBe('software');
        expect(document.getElementById('shop-grid').innerHTML).toBe(html);
        const fresh = updater('screen-shop');
        fresh.updateShopScreen();
        expect(fresh.currentShopCategory).toBe('tools');
    });
});

describe('toggleTheme toast (#90)', () => {
    it('uses MainGame.showToast', () => {
        document.documentElement.removeAttribute('data-theme');
        const fake = { currentTheme: 'dark', showToast: vi.fn() };
        MainGame.prototype.toggleTheme.call(fake);
        expect(fake.showToast).toHaveBeenCalledWith('Switched to Light Mode', 'info');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        MainGame.prototype.toggleTheme.call(fake);
        expect(fake.showToast).toHaveBeenLastCalledWith('Switched to Dark Mode', 'info');
    });
});

describe('research paper check is throttled (#1324)', () => {
    it('runs at most once per second of frames', () => {
        const fake = {
            gameState: { isGameStarted: true },
            researchPaperSystem: { checkForNewPapers: vi.fn() },
            updateInboxBadge: vi.fn()
        };
        for (let t = 0; t < 1000; t += 16) MainGame.prototype.gameLoopTick.call(fake, 5000 + t);
        expect(fake.researchPaperSystem.checkForNewPapers).toHaveBeenCalledTimes(1);
        MainGame.prototype.gameLoopTick.call(fake, 6000);
        expect(fake.researchPaperSystem.checkForNewPapers).toHaveBeenCalledTimes(2);
    });
});
