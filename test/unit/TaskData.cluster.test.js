/**
 * Task data generation fixes (#2429, #2428, #2427, #1855, #960, #965, #1313, #2144)
 */
import { describe, it, expect, vi } from 'vitest';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { isCurrencyColumn, proportionalSplit, boundedPartition } from '../../src/js/utils/dataFormat.js';

const ts = () => new TaskSystem({ rankIndex: 0, currentRank: { salaryMultiplier: 1 } });

describe('currency columns (#2429)', () => {
    it('formats Sales ($) as money', () => {
        expect(isCurrencyColumn('Sales ($)')).toBe(true);
        expect(isCurrencyColumn('Revenue')).toBe(true);
        expect(isCurrencyColumn('Rating')).toBe(false);
    });

    it('the data table shows Sales with a $', () => {
        document.body.innerHTML = '<table id="data-table"><thead><tr></tr></thead><tbody></tbody></table>';
        const t = ts();
        t.updateDataTable({ columns: ['Product', 'Sales ($)', 'Rating'], rows: [['A', 12000, 4.5]] });
        expect(document.querySelector('tbody td.currency-cell').textContent).toBe('$12,000');
    });
});

describe('product comparison ratings are numbers (#2428)', () => {
    it('rows and datasets hold the same numeric rating', () => {
        const d = ts().generateProductComparisonData();
        d.rows.forEach((row, i) => {
            expect(typeof row[2]).toBe('number');
            expect(row[2]).toBe(d.datasets.Rating[i]);
        });
    });
});

describe('percentages add up (#2427, #1855, #960)', () => {
    it('demographics sum to 100', () => {
        for (let k = 0; k < 50; k++) {
            const d = ts().generateDemographicsData();
            expect(d.datasets.Percentage.reduce((a, b) => a + b, 0)).toBe(100);
        }
    });

    it('category shares stay within 10-40% and sum to 100', () => {
        for (let k = 0; k < 200; k++) {
            const p = ts().generateCategoryBreakdownData().datasets.Percentage;
            expect(p.reduce((a, b) => a + b, 0)).toBe(100);
            for (const v of p) {
                expect(v).toBeGreaterThanOrEqual(10);
                expect(v).toBeLessThanOrEqual(40);
            }
        }
    });

    it('helpers handle edge cases', () => {
        expect(proportionalSplit([1, 1, 1], 100)).toEqual([34, 33, 33]);
        expect(proportionalSplit([0, 0], 10)).toEqual([5, 5]);
        expect(boundedPartition(3, 100, 40, 50).reduce((a, b) => a + b, 0)).toBe(100);
        expect(boundedPartition(2, 100, 10, 20)).toEqual([50, 50]); // impossible bounds -> even split
    });

    it('randomRange never inverts its range', () => {
        const t = ts();
        for (let k = 0; k < 50; k++) {
            const v = t.randomRange(10, 5);
            expect(v).toBeGreaterThanOrEqual(5);
            expect(v).toBeLessThanOrEqual(10);
        }
    });
});

describe('reward shown before a task (#965)', () => {
    it('includes the 5-star payout', () => {
        expect(EconomySystem.rewardRangeText(200)).toBe('$200 (up to $260 for 5 stars)');
        expect(EconomySystem.STAR_MULTIPLIERS[5]).toBe(1.3);
    });

    it('calculateMoneyReward still uses the same multipliers', () => {
        const econ = Object.create(EconomySystem.prototype);
        econ.getEffectiveTimeLimit = () => null;
        econ.hasPerk = () => false;
        expect(econ.calculateMoneyReward({ potentialReward: 200 }, 5)).toBe(260);
        expect(econ.calculateMoneyReward({ potentialReward: 200 }, 1)).toBe(40);
    });
});

describe('acceptable chart types come from the task (#1313)', () => {
    it('uses task.acceptableChartTypes, which TaskSystem defaults', () => {
        const econ = Object.create(EconomySystem.prototype);
        const task = { optimalChartTypes: ['line'], acceptableChartTypes: ['area'], template: {} };
        const score = econ.scoreChartAppropriateness(task, { type: 'area' });
        expect(score).toBeGreaterThanOrEqual(60);
        expect(score).toBeLessThanOrEqual(80);
    });
});

describe('task data matches its domain (#2144)', () => {
    it('a finance category task shows finance categories', () => {
        const d = ts().generateData({ dataType: 'category_breakdown', domain: 'finance' });
        expect(d.labels).toEqual(TaskSystem.DOMAIN_LABELS.finance.categories);
    });

    it('performance metrics and trends use domain names', () => {
        const t = ts();
        expect(t.generateData({ dataType: 'performance_metrics', domain: 'healthcare' }).labels)
            .toContain('Diagnostic Accuracy');
        const trend = t.generateData({ dataType: 'trend_analysis', domain: 'energy' });
        expect(trend.columns[1]).toBe('MWh Delivered');
        expect(trend.datasets['MWh Delivered']).toHaveLength(12);
    });

    it('every domain in the task pool has labels', async () => {
        const { COMPREHENSIVE_DATA_SCIENCE_TASKS } = await import('../../src/js/data/comprehensive_datascience_tasks.js');
        for (const d of new Set(COMPREHENSIVE_DATA_SCIENCE_TASKS.map(t => t.domain))) {
            expect(TaskSystem.DOMAIN_LABELS[d], d).toBeTruthy();
        }
    });

    it('unknown domains keep the generic labels', () => {
        expect(ts().generateData({ dataType: 'performance_metrics' }).labels[0]).toBe('Speed');
    });
});
