/**
 * EconomySystem Unit Tests
 * Verifies the progressive tax bracket math in calculateTax(income)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EconomySystem } from './EconomySystem.js';

describe('EconomySystem.calculateTax', () => {
    let economy;

    beforeEach(() => {
        const gameState = {};
        economy = new EconomySystem(gameState);
    });

    it('returns 0 for income <= 0 (zero and negative)', () => {
        expect(economy.calculateTax(0)).toBe(0);
        expect(economy.calculateTax(-100)).toBe(0);
    });

    it('returns 0 for income exactly at the tax-free ceiling (192)', () => {
        expect(economy.calculateTax(192)).toBe(0);
    });

    it('returns 0 for income just over the ceiling (193) due to Math.floor of 1 * 0.10', () => {
        // (193 - 192) * 0.10 = 0.1 -> Math.floor(0.1) = 0
        expect(economy.calculateTax(193)).toBe(0);
    });

    it('computes exact tax at the 10% bracket ceiling (962)', () => {
        // (962 - 192) * 0.10 = 77.0 -> Math.floor(77) = 77
        expect(economy.calculateTax(962)).toBe(77);
    });

    it('computes exact tax at the 20% bracket ceiling (1923)', () => {
        // 10% bracket: (962 - 192) * 0.10 = 77
        // 20% bracket: (1923 - 962) * 0.20 = 192.2
        // total = 269.2 -> Math.floor(269.2) = 269
        expect(economy.calculateTax(1923)).toBe(269);
    });

    it('stacks all three brackets and floors once at the end (5000)', () => {
        // 10% bracket: (962 - 192) * 0.10 = 77
        // 20% bracket: (1923 - 962) * 0.20 = 192.2
        // 30% bracket: (5000 - 1923) * 0.30 = 923.1
        // total = 1192.3 -> Math.floor(1192.3) = 1192
        expect(economy.calculateTax(5000)).toBe(1192);
    });
});
