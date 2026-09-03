/**
 * Unit tests for EconomySystem reward conversion pipeline
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';

describe('EconomySystem', () => {
    let economy;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {};
        economy = new EconomySystem(mockGameState);
    });

    describe('scoreToStars', () => {
        it('should return 5 stars for score >= 90', () => {
            expect(economy.scoreToStars(90)).toBe(5);
            expect(economy.scoreToStars(95)).toBe(5);
            expect(economy.scoreToStars(100)).toBe(5);
        });

        it('should return 4 stars for score just below 90', () => {
            expect(economy.scoreToStars(89.9)).toBe(4);
        });

        it('should return 4 stars for score >= 75 and < 90', () => {
            expect(economy.scoreToStars(75)).toBe(4);
            expect(economy.scoreToStars(80)).toBe(4);
            expect(economy.scoreToStars(89)).toBe(4);
        });

        it('should return 3 stars for score just below 75', () => {
            expect(economy.scoreToStars(74.9)).toBe(3);
        });

        it('should return 3 stars for score >= 55 and < 75', () => {
            expect(economy.scoreToStars(55)).toBe(3);
            expect(economy.scoreToStars(60)).toBe(3);
            expect(economy.scoreToStars(74)).toBe(3);
        });

        it('should return 2 stars for score just below 55', () => {
            expect(economy.scoreToStars(54.9)).toBe(2);
        });

        it('should return 2 stars for score >= 35 and < 55', () => {
            expect(economy.scoreToStars(35)).toBe(2);
            expect(economy.scoreToStars(40)).toBe(2);
            expect(economy.scoreToStars(54)).toBe(2);
        });

        it('should return 1 star for score just below 35', () => {
            expect(economy.scoreToStars(34.9)).toBe(1);
        });

        it('should return 1 star for score < 35', () => {
            expect(economy.scoreToStars(0)).toBe(1);
            expect(economy.scoreToStars(10)).toBe(1);
            expect(economy.scoreToStars(34)).toBe(1);
        });
    });

    describe('calculateMoneyReward', () => {
        const task = { potentialReward: 100 };

        it('should return 20 for 1 star (0.2 multiplier)', () => {
            expect(economy.calculateMoneyReward(task, 1)).toBe(Math.round(100 * 0.2));
        });

        it('should return 40 for 2 stars (0.4 multiplier)', () => {
            expect(economy.calculateMoneyReward(task, 2)).toBe(Math.round(100 * 0.4));
        });

        it('should return 70 for 3 stars (0.7 multiplier)', () => {
            expect(economy.calculateMoneyReward(task, 3)).toBe(Math.round(100 * 0.7));
        });

        it('should return 100 for 4 stars (1.0 multiplier)', () => {
            expect(economy.calculateMoneyReward(task, 4)).toBe(Math.round(100 * 1.0));
        });

        it('should return 130 for 5 stars (1.3 multiplier)', () => {
            expect(economy.calculateMoneyReward(task, 5)).toBe(Math.round(100 * 1.3));
        });

        it('should fall back to 1.0 multiplier for invalid stars', () => {
            expect(economy.calculateMoneyReward(task, undefined)).toBe(Math.round(100 * 1.0));
            expect(economy.calculateMoneyReward(task, 0)).toBe(Math.round(100 * 1.0));
            expect(economy.calculateMoneyReward(task, 6)).toBe(Math.round(100 * 1.0));
            expect(economy.calculateMoneyReward(task, 'bad')).toBe(Math.round(100 * 1.0));
        });
    });

    describe('calculateRepReward', () => {
        it('should return 2 rep for 1 star', () => {
            expect(economy.calculateRepReward(1)).toBe(2);
        });

        it('should return 5 rep for 2 stars', () => {
            expect(economy.calculateRepReward(2)).toBe(5);
        });

        it('should return 10 rep for 3 stars', () => {
            expect(economy.calculateRepReward(3)).toBe(10);
        });

        it('should return 18 rep for 4 stars', () => {
            expect(economy.calculateRepReward(4)).toBe(18);
        });

        it('should return 30 rep for 5 stars', () => {
            expect(economy.calculateRepReward(5)).toBe(30);
        });

        it('should fall back to 10 rep for invalid stars', () => {
            expect(economy.calculateRepReward(undefined)).toBe(10);
            expect(economy.calculateRepReward(0)).toBe(10);
            expect(economy.calculateRepReward(6)).toBe(10);
            expect(economy.calculateRepReward('bad')).toBe(10);
        });
    });
});
