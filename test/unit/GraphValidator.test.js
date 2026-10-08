/**
 * GraphValidator pure checks (#489)
 */
import { describe, it, expect } from 'vitest';
import { GraphValidator } from '../../src/js/dev/GraphValidator.js';

describe('GraphValidator', () => {
    const v = new GraphValidator({});

    it('validateDataAccuracy passes all 4 built-in cases', async () => {
        expect(await v.validateDataAccuracy()).toMatchObject({ total: 4, passed: 4, failed: 0, errors: [] });
    });

    it('null/undefined chart data', () => {
        expect(v.validateChartDataIntegrity(null)).toEqual({ valid: false, issues: ['Chart data is null/undefined'] });
        expect(v.validateChartDataIntegrity(undefined)).toEqual({ valid: false, issues: ['Chart data is null/undefined'] });
    });

    it('labels and datasets are checked independently', () => {
        expect(v.validateChartDataIntegrity({ datasets: [] }).issues).toEqual(['Labels missing or not an array']);
        expect(v.validateChartDataIntegrity({ labels: 'x', datasets: [] }).issues).toEqual(['Labels missing or not an array']);
        expect(v.validateChartDataIntegrity({ labels: [] }).issues).toEqual(['Datasets missing or not an array']);
        expect(v.validateChartDataIntegrity({}).issues).toHaveLength(2);
    });

    it('flags datasets without data and invalid values by index', () => {
        const r = v.validateChartDataIntegrity({
            labels: ['a', 'b', 'c'],
            datasets: [{ data: [1, NaN, Infinity] }, {}, { data: [2, '3'] }]
        });
        expect(r.valid).toBe(false);
        expect(r.issues).toEqual([
            'Dataset 0, value 1 is invalid: NaN',
            'Dataset 0, value 2 is invalid: Infinity',
            'Dataset 1 missing data array',
            'Dataset 2, value 1 is invalid: 3'
        ]);
    });

    it('well-formed data is valid', () => {
        expect(v.validateChartDataIntegrity({ labels: ['a'], datasets: [{ data: [1.5] }] })).toEqual({ valid: true, issues: [] });
    });
});
