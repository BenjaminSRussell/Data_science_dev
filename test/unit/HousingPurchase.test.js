/**
 * Buying a home writes housingLevel and changes the home background (#2009).
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/js/ui/LitUIManager.js', () => ({
    LitUIManager: class { initialize() {} }
}));

import { handleLocationAction } from '../../src/js/helpers/MapHelpers.js';
import { LocationBackgroundSystem } from '../../src/js/game/LocationBackgroundSystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { WorldMap } from '../../src/js/game/WorldMap.js';
import { OFFICE_LOCATIONS } from '../../src/js/data/locations.js';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { HOUSING_LADDER } from '../../src/js/game/Housing.js';

function makeGame(money, housingLevel = 'apartment') {
    const gameState = {
        money,
        housingLevel,
        totalSpent: 0,
        totalEarned: 0,
        weeklyIncome: 0,
        lastHousingRentWeek: null,
        timeManager: { totalDays: 1 }
    };
    gameState.worldMap = new WorldMap(gameState);
    return {
        gameState,
        uiUpdater: { updateAllUI: vi.fn(), updateLocationLayout: vi.fn() },
        audioManager: { play: vi.fn() },
        showToast: vi.fn(),
        showError: vi.fn()
    };
}

describe('housing purchase (#2009)', () => {
    it('buy_property steps apartment to condo to house to mansion', () => {
        const game = makeGame(2000000);
        handleLocationAction(game, 'buy_property');
        expect(game.gameState.housingLevel).toBe('condo');
        expect(game.gameState.money).toBe(2000000 - 50000);
        expect(game.gameState.totalSpent).toBe(50000);
        expect(game.gameState.worldMap.getLocation('home').name).toBe('Condo');
        expect(game.showToast.mock.calls[0][0]).toMatch(/Condo/);
        expect(game.audioManager.play).toHaveBeenCalledWith('kaching');

        handleLocationAction(game, 'buy_property');
        expect(game.gameState.housingLevel).toBe('house');
        handleLocationAction(game, 'buy_property');
        expect(game.gameState.housingLevel).toBe('mansion');
        expect(game.gameState.worldMap.getLocation('home').name).toBe('Mansion');

        const before = game.gameState.money;
        handleLocationAction(game, 'buy_property');
        expect(game.gameState.housingLevel).toBe('mansion');
        expect(game.gameState.money).toBe(before);
        expect(game.showError).toHaveBeenCalledWith('You already live in a mansion.');
    });

    it('refuses a home the player cannot afford', () => {
        const game = makeGame(49999);
        handleLocationAction(game, 'buy_property');
        expect(game.gameState.housingLevel).toBe('apartment');
        expect(game.gameState.money).toBe(49999);
        expect(game.showError.mock.calls[0][0]).toMatch(/Condo/);
        expect(game.showToast).not.toHaveBeenCalled();
    });

    it('browse_properties lists the ladder and charges nothing', () => {
        const game = makeGame(10, 'house');
        handleLocationAction(game, 'browse_properties');
        const text = game.showToast.mock.calls[0][0];
        expect(text).toMatch(/House: your home/);
        expect(text).toContain(`Mansion: $${(1000000).toLocaleString()}`);
        expect(game.gameState.money).toBe(10);
        expect(game.gameState.housingLevel).toBe('house');
    });

    it('collect_rent pays once per week and only after you own a home', () => {
        const renter = makeGame(100);
        handleLocationAction(renter, 'collect_rent');
        expect(renter.showError.mock.calls[0][0]).toMatch(/bigger home/);
        expect(renter.gameState.money).toBe(100);

        const game = makeGame(100, 'condo');
        handleLocationAction(game, 'collect_rent');
        expect(game.gameState.money).toBe(100 + 250);
        expect(game.gameState.totalEarned).toBe(250);
        expect(game.gameState.weeklyIncome).toBe(250);
        expect(game.gameState.lastHousingRentWeek).toBe(0);

        handleLocationAction(game, 'collect_rent');
        expect(game.gameState.money).toBe(350);
        expect(game.showError).toHaveBeenCalledWith('Rent was already collected this week.');

        game.gameState.timeManager.totalDays = 8;
        handleLocationAction(game, 'collect_rent');
        expect(game.gameState.money).toBe(600);
        expect(game.gameState.lastHousingRentWeek).toBe(1);
    });

    it('persists the home and the rent week, and ignores an unknown level', () => {
        const saved = new GameState();
        saved.housingLevel = 'house';
        saved.lastHousingRentWeek = 4;
        const raw = saved.toJSON();
        expect(raw.housingLevel).toBe('house');
        expect(raw.lastHousingRentWeek).toBe(4);

        const loaded = new GameState();
        loaded.fromJSON(raw);
        expect(loaded.housingLevel).toBe('house');
        expect(loaded.lastHousingRentWeek).toBe(4);

        loaded.fromJSON({ housingLevel: 'penthouse', lastHousingRentWeek: 1.5 });
        expect(loaded.housingLevel).toBe('house');
        expect(loaded.lastHousingRentWeek).toBe(null);
    });

    it('home background follows the bought level instead of the apartment photo', () => {
        const gs = new GameState();
        gs.worldMap = new WorldMap(gs);
        gs.timeManager = { timeSlot: 2 };
        const system = new LocationBackgroundSystem(gs);

        const starter = system.getLayeredBackground('home');
        expect(starter).toContain('home.png');
        expect(starter).toContain(system.backgrounds.home.apartment);

        gs.housingLevel = 'condo';
        expect(system.getBackground('home')).toBe(system.backgrounds.home.condo);
        expect(system.getLayeredBackground('home')).toBe(system.backgrounds.home.condo);

        gs.housingLevel = 'mansion';
        expect(system.getLayeredBackground('home')).toBe(system.backgrounds.home.mansion);
        expect(HOUSING_LADDER.map(tier => tier.id)).toEqual(['apartment', 'condo', 'house', 'mansion']);
    });

    it('repaints the home screen when you buy while you are home', () => {
        document.body.innerHTML = '<section id="screen-office"></section>';
        const game = makeGame(80000);
        game.gameState.worldMap.currentLocation = 'home';
        const system = new LocationBackgroundSystem(game.gameState);
        game.locationBackgroundSystem = system;

        handleLocationAction(game, 'buy_property');
        const painted = document.getElementById('screen-office').style.backgroundImage;
        expect(painted.toLowerCase()).toContain('linear-gradient');
        expect(painted).not.toContain('home.png');
    });

    it('shows buy / browse / collect on the real estate screen', () => {
        const theme = OFFICE_LOCATIONS.find(loc => loc.id === 'real_estate');
        expect(theme?.hidden).toBe(true);

        document.body.innerHTML = `
            <div class="office-background"></div>
            <div class="office-desk"></div>
            <div class="office-badge"></div>
            <div id="location-interactions" class="hidden"></div>
            <div id="office-equipment-section"></div>
            <div id="interaction-grid"></div>
        `;
        const ui = new UIUpdater({
            gameState: { money: 50000, housingLevel: 'apartment', rankIndex: 0, purchasedItems: [], unlockedLibraries: [] }
        });
        const activities = ['browse_properties', 'buy_property', 'collect_rent'];
        ui.game.worldMap = {
            currentLocation: 'real_estate',
            getCurrentActivities: () => activities,
            getLocation: () => ({
                id: 'real_estate',
                type: 'investment',
                name: 'Property Investments',
                description: 'Buy commercial and residential real estate.',
                activities,
                icon: ''
            })
        };
        ui.updateLocationLayout('real_estate');

        expect(document.querySelector('.office-desk').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('location-interactions').classList.contains('hidden')).toBe(false);
        const html = document.getElementById('interaction-grid').innerHTML;
        expect(html).toContain("game.handleLocationAction('buy_property')");
        expect(html).toContain(`Buy Condo ($${(50000).toLocaleString()})`);
        expect(html).toContain('Browse Properties');
        expect(html).toContain('Collect Rent');
    });
});
