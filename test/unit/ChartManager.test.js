import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartManager } from '../../src/js/chart/ChartManager.js';

vi.mock('chart.js/auto', () => ({
    Chart: vi.fn(),
}));

describe('ChartManager', () => {
    let chartManager;
    let mockData;
    let mockOptions;
    let mockChartConfig;

    beforeEach(() => {
        mockData = {
            datasets: [
                { label: 'Dataset 1', data: [] },
                { label: 'Dataset 2', data: [1, 2, 3] },
            ],
            columns: ['Column 1', 'Column 2'],
            rows: [
                [1, 500],
                [2, 1500],
                [3, 2500],
            ],
        };
        mockOptions = {
            type: 'line',
            data: mockData,
            options: {},
        };
        mockChartConfig = {
            type: 'line',
            data: {
                labels: [1, 2, 3],
                datasets: [
                    {
                        label: 'Dataset 2',
                        data: [1, 2, 3],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 1,
                        fill: true,
                        pointRadius: 4,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        ticks: {
                            callback: vi.fn(),
                        },
                    },
                },
            },
        };

        chartManager = new ChartManager();
    });

    describe('buildChartConfig', () => {
        it('should build config with first non-empty dataset', () => {
            const config = chartManager.buildChartConfig(mockData);
            expect(config).toEqual(mockChartConfig);
        });

        it('should fall back to data.rows if datasets are empty', () => {
            mockData.datasets = [];
            const config = chartManager.buildChartConfig(mockData);
            expect(config.data.labels).toEqual([1, 2, 3]);
            expect(config.data.datasets[0].label).toBe('Column 2');
            expect(config.data.datasets[0].data).toEqual([500, 1500, 2500]);
        });
    });

    describe('mapChartType', () => {
        it('should map "area" to "line"', () => {
            expect(chartManager.mapChartType('area')).toBe('line');
        });

        it('should default to "bar" for unrecognized types', () => {
            expect(chartManager.mapChartType('unknown')).toBe('bar');
        });
    });

    describe('buildChartOptions', () => {
        it('should return empty scales for pie/doughnut/polarArea/radar', () => {
            mockOptions.type = 'pie';
            const options = chartManager.buildChartOptions(mockOptions);
            expect(options.scales).toEqual({});
        });

        it('should populate scales for other types', () => {
            mockOptions.type = 'line';
            const options = chartManager.buildChartOptions(mockOptions);
            expect(options.scales.y.ticks.callback(1500)).toBe('$2k');
            expect(options.scales.y.ticks.callback(500)).toBe(500);
        });
    });

    describe('getCurrentConfig', () => {
        it('should return null with no previewChart', () => {
            expect(chartManager.getCurrentConfig()).toBeNull();
        });

        it('should return correct config once previewChart exists', () => {
            chartManager.previewChart = { config: mockChartConfig };
            expect(chartManager.getCurrentConfig()).toEqual(mockChartConfig);
        });
    });

    describe('copyToReviewChart', () => {
        it('should deep-clone data and force animation:false', () => {
            chartManager.previewChart = { config: mockChartConfig };
            chartManager.copyToReviewChart();
            expect(chartManager.reviewChart.config.data.datasets[0].data).toEqual([1, 2, 3]);
            expect(chartManager.reviewChart.config.options.animation).toBe(false);
        });

        it('should destroy pre-existing reviewChart', () => {
            chartManager.reviewChart = { destroy: vi.fn() };
            chartManager.copyToReviewChart();
            expect(chartManager.reviewChart.destroy).toHaveBeenCalled();
        });
    });

    describe('destroy', () => {
        it('should null both refs', () => {
            chartManager.previewChart = { destroy: vi.fn() };
            chartManager.reviewChart = { destroy: vi.fn() };
            chartManager.destroy();
            expect(chartManager.previewChart).toBeNull();
            expect(chartManager.reviewChart).toBeNull();
        });

        it('should be safe to call twice', () => {
            chartManager.destroy();
            chartManager.destroy();
            // No errors should be thrown
        });
    });
});