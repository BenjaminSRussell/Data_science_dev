/**
 * The eight locations whose every feature fell through executeAction (#2064).
 */
import { describe, it, expect, vi } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';
import { LocationView } from '../../src/js/ui/LocationView.js';
import { LegalSystem, LICENSES } from '../../src/js/game/LegalSystem.js';

const DEAD_LOCATIONS = [
    'flower_store',
    'networking_bar',
    'stock_exchange',
    'city_hall',
    'mall',
    'car_dealership',
    'downtown',
    'venture_capital'
];

function makeView(gameState, extra = {}) {
    const system = new LocationDetailSystem(gameState);
    const game = {
        gameState,
        timeManager: {
            restoreEnergy: vi.fn(),
            useEnergy: vi.fn()
        },
        characterStats: { addExperience: vi.fn() },
        showToast: vi.fn(),
        uiUpdater: { updateAllUI: vi.fn() },
        screenManager: { showScreen: vi.fn() },
        updateStockMarketScreen: vi.fn(),
        locationDetailSystem: system,
        ...extra
    };
    const view = new LocationView(game, null, null, null);
    return { game, view, system };
}

describe('LocationDetailSystem bespoke location actions (#2064)', () => {
    it('gives every feature in the eight dead locations a non-default result', () => {
        const system = new LocationDetailSystem({});
        const messages = new Set();
        for (const locationId of DEAD_LOCATIONS) {
            const features = system.getLocationFeatures(locationId);
            expect(features.length).toBeGreaterThan(0);
            for (const feature of features) {
                const interaction = system.interactWithFeature(locationId, feature.id);
                expect(interaction).not.toBeNull();
                expect(interaction.action).toBe(feature.action);
                expect(interaction.result.message).toBeTruthy();
                expect(interaction.result.message).not.toBe('You interact with ' + feature.id);
                messages.add(interaction.result.message);
            }
        }
        expect(messages.size).toBeGreaterThanOrEqual(33);
    });

    it('keeps generic actions and the default branch', () => {
        const system = new LocationDetailSystem({});
        expect(system.executeAction('rest', 'home', 'bed')).toEqual({
            energy: 50,
            message: 'You rest and restore energy'
        });
        expect(system.interactWithFeature('home', 'bed').result.message).toBe('You rest and restore energy');
        expect(system.executeAction('nope', 'home', 'lamp').message).toBe('You interact with lamp');
    });

    it('does not reuse one result for the same verb in different rooms', () => {
        const system = new LocationDetailSystem({});
        const flowerBrowse = system.executeAction('browse', 'flower_store', 'display');
        const carBrowse = system.executeAction('browse', 'car_dealership', 'showroom');
        expect(flowerBrowse.message).not.toBe(carBrowse.message);

        const bouquet = system.executeAction('buy', 'flower_store', 'counter');
        const plant = system.executeAction('buy', 'flower_store', 'plants');
        const vase = system.executeAction('buy', 'flower_store', 'vases');
        expect(new Set([bouquet.message, plant.message, vase.message]).size).toBe(3);
        expect(bouquet.money).toBeLessThan(0);
        expect(plant.money).toBeLessThan(0);
        expect(vase.money).toBeLessThan(0);
        expect(flowerBrowse.money).toBeUndefined();

        const mallEat = system.executeAction('eat', 'mall', 'food_court');
        const downtownEat = system.executeAction('eat', 'downtown', 'restaurant');
        expect(mallEat.message).not.toBe(downtownEat.message);
        expect(mallEat.money).toBeLessThan(0);
        expect(downtownEat.money).toBeLessThan(0);
    });

    it('files the next unowned City Hall license at the catalog price, once', () => {
        const gameState = { money: 1000, reputation: 0 };
        gameState.legalSystem = new LegalSystem(gameState);
        const { view, game } = makeView(gameState);
        view.currentLocation = 'city_hall';

        const first = view.interactWithFeature({ id: 'license_office' });
        expect(first.blocked).toBeUndefined();
        expect(first.money).toBe(-LICENSES[0].cost);
        expect(gameState.legalSystem.hasLicense(LICENSES[0].id)).toBe(true);
        expect(gameState.money).toBe(1000 - LICENSES[0].cost);
        expect(game.showToast).toHaveBeenCalledWith(
            expect.stringContaining(LICENSES[0].name),
            'info'
        );

        const second = view.interactWithFeature({ id: 'license_office' });
        expect(second.money).toBe(-LICENSES[1].cost);
        expect(gameState.legalSystem.hasLicense(LICENSES[1].id)).toBe(true);
        expect(gameState.money).toBe(1000 - LICENSES[0].cost - LICENSES[1].cost);
    });

    it('refuses a license the player cannot afford and does not grant it', () => {
        const gameState = { money: 50 };
        gameState.legalSystem = new LegalSystem(gameState);
        const { view } = makeView(gameState);
        view.currentLocation = 'city_hall';
        const applied = view.interactWithFeature({ id: 'license_office' });
        expect(applied.blocked).toBe('Insufficient funds.');
        expect(gameState.legalSystem.hasLicense('drivers_license')).toBe(false);
        expect(gameState.money).toBe(50);
    });

    it('says so when every license is already held', () => {
        const gameState = { money: 5000 };
        const legal = new LegalSystem(gameState);
        for (const license of LICENSES) legal.licenses[license.id] = true;
        gameState.legalSystem = legal;
        const system = new LocationDetailSystem(gameState);
        const result = system.executeAction('license', 'city_hall', 'license_office');
        expect(result.licenseId).toBeUndefined();
        expect(result.message).toMatch(/every license/i);
    });

    it('opens the stock screen from the trading terminal and applies networking reputation', () => {
        const gameState = { money: 100, reputation: 3 };
        const { view, game } = makeView(gameState);
        view.currentLocation = 'stock_exchange';
        const traded = view.interactWithFeature({ id: 'terminal' });
        expect(traded.blocked).toBeUndefined();
        expect(game.screenManager.showScreen).toHaveBeenCalledWith('screen-stock-market');
        expect(game.updateStockMarketScreen).toHaveBeenCalled();
        expect(game.characterStats.addExperience).toHaveBeenCalledWith('intelligence', 10);
        expect(gameState.money).toBe(100);

        view.currentLocation = 'networking_bar';
        const networked = view.interactWithFeature({ id: 'networking_area' });
        expect(networked.reputation).toBeGreaterThan(0);
        expect(gameState.reputation).toBe(3 + networked.reputation);
        expect(game.timeManager.useEnergy).not.toHaveBeenCalled();
    });

    it('blocks a purchase the player cannot afford', () => {
        const gameState = { money: 0, totalSpent: 0 };
        const { view } = makeView(gameState);
        view.currentLocation = 'flower_store';
        const applied = view.interactWithFeature({ id: 'counter' });
        expect(applied.blocked).toMatch(/\$12/);
        expect(gameState.money).toBe(0);
        expect(gameState.totalSpent).toBe(0);
        expect(gameState.reputation).toBeUndefined();
    });
});
