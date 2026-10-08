/**
 * The filter check can actually fail now (#73)
 */
import { describe, it, expect } from 'vitest';
import { WorkSystemValidator as V } from '../../src/js/dev/WorkSystemValidator.js';

describe('WorkSystemValidator.isFilterResultValid', () => {
    it('fails when a filter shows more rows than the table had', () => {
        expect(V.isFilterResultValid('Q1', 3, 10)).toBe(true);
        expect(V.isFilterResultValid('Q1', 0, 10)).toBe(true);
        expect(V.isFilterResultValid('Q1', 11, 10)).toBe(false);
    });
    it('requires the empty filter to restore every row', () => {
        expect(V.isFilterResultValid('', 10, 10)).toBe(true);
        expect(V.isFilterResultValid('  ', 9, 10)).toBe(false);
    });
    it('rejects non-integer or negative counts', () => {
        expect(V.isFilterResultValid('x', -1, 10)).toBe(false);
        expect(V.isFilterResultValid('x', NaN, 10)).toBe(false);
    });
});
