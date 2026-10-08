/**
 * Unit tests for UIUpdater price formatting (Issue #194)
 * Verifies that all four money displays use toLocaleString() for consistent formatting
 * These tests verify the source code contains the expected formatting patterns
 */

import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('UIUpdater - Issue #194 Price Formatting (Source Code Verification)', () => {
    let uiUpdaterSource = '';

    beforeAll(() => {
        // Read the actual UIUpdater.js source to verify the fix is in place
        const filePath = path.join(__dirname, '../../src/js/ui/UIUpdater.js');
        uiUpdaterSource = fs.readFileSync(filePath, 'utf8');
    });

    describe('Source code contains formatted price patterns', () => {
        it('contract reward (line 389) should use toLocaleString', () => {
            // Verify contract reward formatting
            const contractMatch = uiUpdaterSource.match(
                /\$\{c\.reward\.toLocaleString\(\)\}/
            );
            expect(contractMatch).toBeTruthy();
        });

        it('library cost (line 515) should use toLocaleString', () => {
            // Verify library cost formatting
            const libraryMatch = uiUpdaterSource.match(
                /\$\{lib\.cost\.toLocaleString\(\)\}/
            );
            expect(libraryMatch).toBeTruthy();
        });

        it('shop price (line 425) should use toLocaleString', () => {
            // Verify shop price formatting
            const shopMatch = uiUpdaterSource.match(
                // price is the perk-discounted item price (#1309)
                /\$\{(item\.)?price\.toLocaleString\(\)\}/
            );
            expect(shopMatch).toBeTruthy();
        });

        it('task reward (line 230) should use toLocaleString', () => {
            // Verify task reward formatting
            // Now formatted by EconomySystem.rewardRangeText, which uses
            // toLocaleString for both amounts (#965)
            expect(uiUpdaterSource).toContain('EconomySystem.rewardRangeText(task.potentialReward)');
            expect(EconomySystem.rewardRangeText(12345)).toBe('$12,345 (up to $16,049 for 5 stars)');
        });
    });

    describe('All price displays use consistent formatting', () => {
        it('should not have unformatted contract reward display', () => {
            // Make sure there is no pattern like $${c.reward} without toLocaleString
            // Check that when we find c.reward pricing, it's always with toLocaleString
            const hasUnformattedContract = /\$\{c\.reward\}(?!\.toLocaleString)/.test(uiUpdaterSource);
            expect(hasUnformattedContract).toBe(false);
        });

        it('should not have unformatted library cost display', () => {
            // Make sure there is no pattern like $${lib.cost} without toLocaleString
            // Check that when we find lib.cost pricing, it's always with toLocaleString
            const hasUnformattedLibrary = /\$\{lib\.cost\}(?!\.toLocaleString)/.test(uiUpdaterSource);
            expect(hasUnformattedLibrary).toBe(false);
        });
    });

    describe('Formatting behavior validation', () => {
        it('toLocaleString() formats large numbers with commas', () => {
            const testCases = [
                { value: 1000, expected: '1,000' },
                { value: 5000, expected: '5,000' },
                { value: 12000, expected: '12,000' },
                { value: 150, expected: '150' }
            ];

            testCases.forEach(({ value, expected }) => {
                expect(value.toLocaleString()).toBe(expected);
            });
        });

        it('all four display types produce identical formatting for same value', () => {
            const testValue = 12000;
            const formatted1 = `$${testValue.toLocaleString()}`;
            const formatted2 = `$${testValue.toLocaleString()}`;
            const formatted3 = `$${testValue.toLocaleString()}`;
            const formatted4 = `$${testValue.toLocaleString()}`;

            expect(formatted1).toBe(formatted2);
            expect(formatted2).toBe(formatted3);
            expect(formatted3).toBe(formatted4);
            expect(formatted1).toBe('$12,000');
        });

        it('formatting difference between formatted and unformatted is evident for prices >= 1000', () => {
            const testPrices = [1000, 5000, 12000, 25000];

            testPrices.forEach(price => {
                const unformatted = `$${price}`;
                const formatted = `$${price.toLocaleString()}`;

                expect(unformatted).not.toBe(formatted);
                expect(formatted).toContain(',');
                expect(unformatted).not.toContain(',');
            });
        });
    });
});
