/**
 * Test to verify consistent money formatting across all utility functions
 * Issue #141: Money is formatted three incompatible ways
 */

import { describe, it, expect } from 'vitest';
import { CommonUtils } from '../../src/js/utils/CommonUtils.js';
import { StatisticsAggregator } from '../../src/js/ui/StatisticsAggregator.js';

// We need to test BaseComponent in the DOM context
import { BaseComponent } from '../../src/js/ui/components/BaseComponent.js';

describe('Money Formatting Consistency - Issue #141', () => {
    let component;
    let statsAggregator;

    beforeEach(() => {
        // Create a test component for BaseComponent
        class TestComponent extends BaseComponent {}
        const elementName = `test-money-format-${Math.random().toString(36).substr(2, 9)}`;
        try {
            customElements.define(elementName, TestComponent);
        } catch (e) {
            // Element already registered, ignore
        }
        component = document.createElement(elementName);
        document.body.appendChild(component);

        // Create statsAggregator
        statsAggregator = new StatisticsAggregator({});
    });

    afterEach(() => {
        if (component && component.parentElement) {
            document.body.removeChild(component);
        }
    });

    describe('All three formatters should use consistent comma-grouped format', () => {
        it('CommonUtils.formatCurrency should use comma-grouped format', () => {
            expect(CommonUtils.formatCurrency(1234567)).toBe('$1,234,567');
        });

        it('BaseComponent.formatMoney should use comma-grouped format', () => {
            expect(component.formatMoney(1234567)).toBe('$1,234,567');
        });

        it('StatisticsAggregator.formatMoney should use comma-grouped format (consistent)', () => {
            expect(statsAggregator.formatMoney(1234567)).toBe('$1,234,567');
        });

        it('StatisticsAggregator should no longer abbreviate large values', () => {
            // Issue #141 requires all three to use consistent format
            expect(statsAggregator.formatMoney(1500000)).toBe('$1,500,000');
        });
    });

    describe('Negative value handling - all formatters should preserve negative sign', () => {
        it('CommonUtils.formatCurrency should preserve negative sign for negative values', () => {
            const result = CommonUtils.formatCurrency(-50);
            expect(result).toContain('-');
            expect(result).toBe('$-50');
        });

        it('BaseComponent.formatMoney should preserve negative sign for negative values', () => {
            const result = component.formatMoney(-50);
            expect(result).toContain('-');
            expect(result).toBe('$-50');
        });

        it('StatisticsAggregator.formatMoney should preserve negative sign for negative values', () => {
            const result = statsAggregator.formatMoney(-50);
            expect(result).toContain('-');
            expect(result).toBe('$-50');
        });

        it('CommonUtils and BaseComponent should format -1234567 consistently', () => {
            const utilsResult = CommonUtils.formatCurrency(-1234567);
            const componentResult = component.formatMoney(-1234567);
            // Both should have the negative sign
            expect(utilsResult).toContain('-');
            expect(componentResult).toContain('-');
            // Both should preserve the magnitude
            expect(utilsResult).toBe('$-1,234,567');
            expect(componentResult).toBe('$-1,234,567');
        });

        it('StatisticsAggregator should format negative large values consistently', () => {
            const result = statsAggregator.formatMoney(-1500000);
            expect(result).toContain('-');
            expect(result).toBe('$-1,500,000');
        });
    });

    describe('Positive value handling', () => {
        it('CommonUtils.formatCurrency should format positive values correctly', () => {
            expect(CommonUtils.formatCurrency(1234567)).toBe('$1,234,567');
        });

        it('BaseComponent.formatMoney should format positive values correctly', () => {
            expect(component.formatMoney(1234567)).toBe('$1,234,567');
        });

        it('StatisticsAggregator should format positive large values correctly', () => {
            expect(statsAggregator.formatMoney(1500000)).toBe('$1,500,000');
        });
    });

    describe('Zero handling', () => {
        it('All formatters should handle zero consistently', () => {
            expect(CommonUtils.formatCurrency(0)).toBe('$0');
            expect(component.formatMoney(0)).toBe('$0');
            expect(statsAggregator.formatMoney(0)).toBe('$0');
        });
    });

    describe('Null/undefined handling', () => {
        it('CommonUtils.formatCurrency should handle undefined gracefully', () => {
            expect(CommonUtils.formatCurrency(undefined)).toBe('$0');
        });

        it('CommonUtils.formatCurrency should handle null gracefully', () => {
            expect(CommonUtils.formatCurrency(null)).toBe('$0');
        });

        it('BaseComponent.formatMoney should handle undefined gracefully', () => {
            expect(component.formatMoney(undefined)).toBe('$0');
        });

        it('StatisticsAggregator.formatMoney should handle undefined gracefully', () => {
            expect(statsAggregator.formatMoney(undefined)).toBe('$0');
        });
    });

    describe('Currency parameter in CommonUtils', () => {
        it('CommonUtils.formatCurrency should support custom currency symbol', () => {
            expect(CommonUtils.formatCurrency(100, '€')).toBe('€100');
            expect(CommonUtils.formatCurrency(100, '¥')).toBe('¥100');
        });

        it('CommonUtils.formatCurrency should preserve sign with custom currency', () => {
            expect(CommonUtils.formatCurrency(-100, '€')).toBe('€-100');
            expect(CommonUtils.formatCurrency(-100, '¥')).toBe('¥-100');
        });

        it('CommonUtils.formatCurrency should handle undefined with custom currency', () => {
            expect(CommonUtils.formatCurrency(undefined, '€')).toBe('€0');
        });
    });
});
