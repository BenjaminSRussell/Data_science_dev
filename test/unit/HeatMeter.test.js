import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { CrimeSystem } from '../../src/js/game/CrimeSystem.js';
import { handleCrime } from '../../src/js/helpers/StockMarketHelpers.js';

describe('Heat Meter Display', () => {
    let gameState;
    let uiUpdater;
    let game;

    beforeEach(() => {
        // Setup DOM elements for the heat meter
        const stockMarketElements = `
            <div id="heat-value">0</div>
            <div id="heat-meter-fill" style="width: 0%"></div>
            <div id="jail-heat-value">0</div>
            <div id="jail-heat-meter-fill" style="width: 0%"></div>
        `;
        document.body.innerHTML = stockMarketElements;

        // Create mock gameState
        gameState = {
            crimeSystem: new CrimeSystem({ characterStats: { getStat: () => 50 } }),
            money: 1000,
            reputation: 100
        };

        // Create game object
        game = {
            gameState: gameState
        };

        // Create UIUpdater
        uiUpdater = new UIUpdater(game);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('should display heat meter with value 0 initially', () => {
        const heatValue = document.getElementById('heat-value');
        const heatFill = document.getElementById('heat-meter-fill');

        uiUpdater.updateHeatMeter();

        expect(heatValue.textContent).toBe('0');
        expect(heatFill.style.width).toBe('0%');
    });

    it('should display heat meter with correct value when heat is 50', () => {
        gameState.crimeSystem.heat = 50;
        const heatValue = document.getElementById('heat-value');
        const heatFill = document.getElementById('heat-meter-fill');

        uiUpdater.updateHeatMeter();

        expect(heatValue.textContent).toBe('50');
        expect(heatFill.style.width).toBe('50%');
    });

    it('should display heat meter with correct value when heat is at max (100)', () => {
        gameState.crimeSystem.heat = 100;
        const heatValue = document.getElementById('heat-value');
        const heatFill = document.getElementById('heat-meter-fill');

        uiUpdater.updateHeatMeter();

        expect(heatValue.textContent).toBe('100');
        expect(heatFill.style.width).toBe('100%');
    });

    it('should update jail heat display with correct value', () => {
        gameState.crimeSystem.heat = 75;
        const jailHeatValue = document.getElementById('jail-heat-value');
        const jailHeatFill = document.getElementById('jail-heat-meter-fill');

        uiUpdater.updateHeatMeter();

        expect(jailHeatValue.textContent).toBe('75');
        expect(jailHeatFill.style.width).toBe('75%');
    });

    it('should handle decimal heat values by flooring them', () => {
        gameState.crimeSystem.heat = 33.7;
        const heatValue = document.getElementById('heat-value');

        uiUpdater.updateHeatMeter();

        expect(heatValue.textContent).toBe('33');
    });

    it('should gracefully handle missing heat meter elements', () => {
        document.getElementById('heat-value').remove();
        document.getElementById('heat-meter-fill').remove();

        // Should not throw
        expect(() => {
            uiUpdater.updateHeatMeter();
        }).not.toThrow();
    });

    it('should display heat value in crime confirmation dialog', () => {
        gameState.crimeSystem.heat = 50;

        // Mock confirm to capture the message
        let confirmMessage = '';
        global.confirm = vi.fn((msg) => {
            confirmMessage = msg;
            return false;
        });

        game.crimeSystem = gameState.crimeSystem;
        game.uiUpdater = uiUpdater;
        game.showToast = vi.fn();

        handleCrime(game, 'pump_dump', 'STOCK1');

        expect(confirmMessage).toContain('Heat Level: 50/100');
    });

    it('should update heat meter when committing a crime', () => {
        gameState.crimeSystem.heat = 20;
        const heatValue = document.getElementById('heat-value');

        uiUpdater.updateHeatMeter();
        expect(heatValue.textContent).toBe('20');

        // Simulate adding heat
        gameState.crimeSystem.addHeat(30);

        uiUpdater.updateHeatMeter();
        expect(heatValue.textContent).toBe('50');
    });
});
