import { describe, it, expect } from 'vitest';
import { formatVolume, getMarketDisplayName, formatPercentChange } from '../../src/js/helpers/StockMarketHelpers.js';

describe('StockMarketHelpers display helpers (#1527)', () => {
    it('formatVolume thresholds and rounding', () => {
        expect(formatVolume(0)).toBe('0');
        expect(formatVolume(999)).toBe('999');
        expect(formatVolume(1000)).toBe('1.0K');
        expect(formatVolume(1550)).toBe('1.6K');
        expect(formatVolume(999999)).toBe('1000.0K');
        expect(formatVolume(1000000)).toBe('1.0M');
        expect(formatVolume(2345678)).toBe('2.3M');
        expect(formatVolume(undefined)).toBe('0');
    });

    it('getMarketDisplayName maps known markets without stray spaces and passes unknown through', () => {
        expect(getMarketDisplayName('US')).toBe('United States');
        expect(getMarketDisplayName('EU')).toBe('Europe');
        expect(getMarketDisplayName('ASIA')).toBe('Asia');
        expect(getMarketDisplayName('EMERGING')).toBe('Emerging Markets');
        expect(getMarketDisplayName('MARS')).toBe('MARS');
    });

    it('formatPercentChange gives one consistent sign/class rule', () => {
        expect(formatPercentChange(1.234)).toEqual({ text: '+1.23%', className: 'positive' });
        expect(formatPercentChange(-0.5)).toEqual({ text: '-0.50%', className: 'negative' });
        expect(formatPercentChange(0)).toEqual({ text: '0.00%', className: 'positive' });
        expect(formatPercentChange(NaN)).toEqual({ text: '0.00%', className: 'positive' });
    });
});
