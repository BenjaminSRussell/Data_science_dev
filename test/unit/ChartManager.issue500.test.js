/**
 * Unit tests for ChartManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartManager } from '../../src/js/charts/ChartManager.js';

// Mock Chart.js
vi.mock('chart.js/auto', () => {
    const mockChart = vi.fn(function(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.data = config.data;
        this.options = config.options;
        this.destroy = vi.fn();
        this.update = vi.fn();
    });

    mockChart.defaults = {
        color: '#000',
        borderColor: '#000',
        font: { family: 'Arial' }
    };

    return { default: mockChart };
});

// getCurrentConfig() was removed from ChartManager as dead code (#2255);
// these tests now read the same facts straight off the rendered preview chart.
function previewSummary(chartManager) {
    const chart = chartManager.previewChart;
    if (!chart) return null;
    return {
        type: chart.config.type,
        hasLegend: chart.options.plugins?.legend?.display,
        hasTitle: !!chart.options.plugins?.title?.text,
        hasGrid: chart.options.scales?.x?.grid?.display
    };
}

describe('ChartManager', () => {
    let chartManager;
    let mockGame;

    beforeEach(() => {
        mockGame = {};
        chartManager = new ChartManager(mockGame);

        // Set up mock canvases
        document.body.innerHTML = `
            <canvas id="preview-chart"></canvas>
            <canvas id="submitted-chart"></canvas>
        `;
    });

    describe('buildChartConfig', () => {
        it('should select first non-empty dataset as primary source', () => {
            const data = {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: {
                    'Empty': [],
                    'Revenue': [100, 200, 300],
                    'Profit': [50, 100, 150]
                }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'Test Chart',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            expect(chartConfig.data.datasets[0].label).toBe('Revenue');
            expect(chartConfig.data.datasets[0].data).toEqual([100, 200, 300]);
        });

        it('should fall back to rows when datasets is empty', () => {
            const data = {
                rows: [
                    ['Jan', 50],
                    ['Feb', 150],
                    ['Mar', 200]
                ],
                columns: ['Month', 'Sales']
            };

            const config = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            expect(chartConfig.data.datasets[0].label).toBe('Sales');
            expect(chartConfig.data.datasets[0].data).toEqual([50, 150, 200]);
        });

        it('should handle rows with missing values (fallback to 0)', () => {
            const data = {
                rows: [
                    ['Jan', 50],
                    ['Feb', null],
                    ['Mar', 200]
                ],
                columns: ['Month', 'Sales']
            };

            const config = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            expect(chartConfig.data.datasets[0].data).toEqual([50, 0, 200]);
        });

        it('should configure line type with correct properties', () => {
            const data = {
                labels: ['A', 'B', 'C'],
                datasets: { 'Values': [10, 20, 30] }
            };

            const config = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);
            const dataset = chartConfig.data.datasets[0];

            // Line chart should have translucent background, not full palette
            expect(dataset.backgroundColor).toContain('0.2');
            expect(dataset.borderWidth).toBe(3);
            expect(dataset.fill).toBe(true);
            expect(dataset.pointRadius).toBe(5);
            expect(dataset.pointHoverRadius).toBe(7);
        });

        it('should configure bar type with correct properties', () => {
            const data = {
                labels: ['A', 'B', 'C'],
                datasets: { 'Values': [10, 20, 30] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);
            const dataset = chartConfig.data.datasets[0];

            // Bar chart should have full palette array, not translucent single color
            expect(Array.isArray(dataset.backgroundColor)).toBe(true);
            expect(dataset.borderWidth).toBe(1);
            expect(dataset.fill).toBeUndefined();
            expect(dataset.pointRadius).toBeUndefined();
        });

        it('should use area type as line with fill', () => {
            const data = {
                labels: ['A', 'B', 'C'],
                datasets: { 'Values': [10, 20, 30] }
            };

            const config = {
                type: 'area',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            // Area should be rendered as line with fill
            expect(chartConfig.type).toBe('line');
            expect(chartConfig.data.datasets[0].fill).toBe(true);
        });

        it('should use labels from data.labels if available', () => {
            const data = {
                labels: ['January', 'February', 'March'],
                datasets: { 'Revenue': [100, 200, 300] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            expect(chartConfig.data.labels).toEqual(['January', 'February', 'March']);
        });

        it('should fallback to rows for labels when data.labels not available', () => {
            const data = {
                rows: [
                    ['Jan', 50],
                    ['Feb', 150]
                ],
                columns: ['Month', 'Sales'],
                datasets: { 'Values': [50, 150] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            expect(chartConfig.data.labels).toEqual(['Jan', 'Feb']);
        });
    });

    describe('mapChartType', () => {
        it('should map bar type', () => {
            expect(chartManager.mapChartType('bar')).toBe('bar');
        });

        it('should map line type', () => {
            expect(chartManager.mapChartType('line')).toBe('line');
        });

        it('should map pie type', () => {
            expect(chartManager.mapChartType('pie')).toBe('pie');
        });

        it('should map doughnut type', () => {
            expect(chartManager.mapChartType('doughnut')).toBe('doughnut');
        });

        it('should map scatter type', () => {
            expect(chartManager.mapChartType('scatter')).toBe('scatter');
        });

        it('should map radar type', () => {
            expect(chartManager.mapChartType('radar')).toBe('radar');
        });

        it('should map area type to line', () => {
            expect(chartManager.mapChartType('area')).toBe('line');
        });

        it('should map bubble type', () => {
            expect(chartManager.mapChartType('bubble')).toBe('bubble');
        });

        it('should map polarArea type', () => {
            expect(chartManager.mapChartType('polarArea')).toBe('polarArea');
        });

        it('should default to bar for unknown types', () => {
            expect(chartManager.mapChartType('unknown')).toBe('bar');
            expect(chartManager.mapChartType('histogram')).toBe('bar');
            expect(chartManager.mapChartType(null)).toBe('bar');
        });
    });

    describe('buildChartOptions', () => {
        it('should build options with empty scales for pie charts', () => {
            const config = {
                type: 'pie',
                palette: 'corporate',
                showLegend: true,
                title: 'Pie Chart',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'pie');

            expect(options.scales).toEqual({});
        });

        it('should build options with empty scales for doughnut charts', () => {
            const config = {
                type: 'doughnut',
                palette: 'corporate',
                showLegend: true,
                title: 'Doughnut Chart',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'doughnut');

            expect(options.scales).toEqual({});
        });

        it('should build options with empty scales for polarArea charts', () => {
            const config = {
                type: 'polarArea',
                palette: 'corporate',
                showLegend: true,
                title: 'Polar Chart',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'polarArea');

            expect(options.scales).toEqual({});
        });

        it('should build options with empty scales for radar charts', () => {
            const config = {
                type: 'radar',
                palette: 'corporate',
                showLegend: true,
                title: 'Radar Chart',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'radar');

            expect(options.scales).toEqual({});
        });

        it('should include populated scales for non-polar charts', () => {
            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'Bar Chart',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'bar');

            expect(options.scales).toHaveProperty('x');
            expect(options.scales).toHaveProperty('y');
            expect(options.scales.x).toHaveProperty('display', true);
            expect(options.scales.y).toHaveProperty('display', true);
        });

        it('should format y-axis ticks with currency format for values >= 1000', () => {
            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'bar');
            const tickCallback = options.scales.y.ticks.callback;

            expect(tickCallback(1500)).toBe('$2k');
            expect(tickCallback(1000)).toBe('$1k');
            expect(tickCallback(5000)).toBe('$5k');
        });

        it('should pass through values less than 1000 unchanged', () => {
            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'bar');
            const tickCallback = options.scales.y.ticks.callback;

            expect(tickCallback(500)).toBe(500);
            expect(tickCallback(999)).toBe(999);
            expect(tickCallback(0)).toBe(0);
        });

        it('should respect showGrid setting', () => {
            const configWithGrid = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const configWithoutGrid = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: false
            };

            const optionsWithGrid = chartManager.buildChartOptions(configWithGrid, 'line');
            const optionsWithoutGrid = chartManager.buildChartOptions(configWithoutGrid, 'line');

            expect(optionsWithGrid.scales.x.grid.display).toBe(true);
            expect(optionsWithoutGrid.scales.x.grid.display).toBe(false);
        });

        it('should respect showLegend setting', () => {
            const configWithLegend = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const configWithoutLegend = {
                type: 'bar',
                palette: 'corporate',
                showLegend: false,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const optionsWithLegend = chartManager.buildChartOptions(configWithLegend, 'bar');
            const optionsWithoutLegend = chartManager.buildChartOptions(configWithoutLegend, 'bar');

            expect(optionsWithLegend.plugins.legend.display).toBe(true);
            expect(optionsWithoutLegend.plugins.legend.display).toBe(false);
        });

        it('should display title when title is provided', () => {
            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'My Chart Title',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'bar');

            expect(options.plugins.title.display).toBe(true);
            expect(options.plugins.title.text).toBe('My Chart Title');
        });

        it('should hide title when title is not provided', () => {
            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            const options = chartManager.buildChartOptions(config, 'bar');

            expect(options.plugins.title.display).toBe(false);
        });
    });

    describe('preview chart configuration', () => {
        it('should return null when no previewChart exists', () => {
            expect(previewSummary(chartManager)).toBeNull();
        });

        it('should return correct config when previewChart exists', () => {
            // Create a preview chart first
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'Test Title',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);

            const currentConfig = previewSummary(chartManager);

            expect(currentConfig).not.toBeNull();
            expect(currentConfig).toHaveProperty('type');
            expect(currentConfig).toHaveProperty('hasLegend');
            expect(currentConfig).toHaveProperty('hasTitle');
            expect(currentConfig).toHaveProperty('hasGrid');
        });

        it('should return correct type in the preview chart', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);

            const currentConfig = previewSummary(chartManager);
            expect(currentConfig.type).toBe('line');
        });

        it('should return correct hasLegend in the preview chart', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const configWithLegend = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, configWithLegend);
            let currentConfig = previewSummary(chartManager);
            expect(currentConfig.hasLegend).toBe(true);

            // Reset and test without legend
            chartManager.destroy();
            const configWithoutLegend = {
                type: 'bar',
                palette: 'corporate',
                showLegend: false,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, configWithoutLegend);
            currentConfig = previewSummary(chartManager);
            expect(currentConfig.hasLegend).toBe(false);
        });

        it('should return correct hasTitle in the preview chart', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const configWithTitle = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'Chart Title',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, configWithTitle);
            let currentConfig = previewSummary(chartManager);
            expect(currentConfig.hasTitle).toBe(true);

            // Reset and test without title
            chartManager.destroy();
            const configWithoutTitle = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, configWithoutTitle);
            currentConfig = previewSummary(chartManager);
            expect(currentConfig.hasTitle).toBe(false);
        });

        it('should return correct hasGrid in the preview chart', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const configWithGrid = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, configWithGrid);
            let currentConfig = previewSummary(chartManager);
            expect(currentConfig.hasGrid).toBe(true);

            // Reset and test without grid
            chartManager.destroy();
            const configWithoutGrid = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: false
            };

            chartManager.createPreviewChart(data, configWithoutGrid);
            currentConfig = previewSummary(chartManager);
            expect(currentConfig.hasGrid).toBe(false);
        });
    });

    describe('copyToReviewChart', () => {
        it('should deep-clone data so mutations do not affect original', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);
            chartManager.copyToReviewChart();

            // Mutate reviewChart data
            if (chartManager.reviewChart && chartManager.reviewChart.data) {
                chartManager.reviewChart.data.labels[0] = 'Modified';
                chartManager.reviewChart.data.datasets[0].data[0] = 999;
            }

            // Original previewChart data should be unchanged
            expect(chartManager.previewChart.data.labels[0]).toBe('A');
            expect(chartManager.previewChart.data.datasets[0].data[0]).toBe(10);
        });

        it('should force animation to false', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);
            chartManager.copyToReviewChart();

            expect(chartManager.reviewChart.options.animation).toBe(false);
        });

        it('should destroy pre-existing reviewChart before creating new one', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);
            chartManager.copyToReviewChart();

            const firstReviewChart = chartManager.reviewChart;
            const destroySpy = vi.spyOn(firstReviewChart, 'destroy');

            // Copy again
            chartManager.copyToReviewChart();

            expect(destroySpy).toHaveBeenCalled();
            expect(chartManager.reviewChart !== firstReviewChart).toBe(true);
        });

        it('should handle missing canvas gracefully', () => {
            // Remove the submitted-chart canvas
            const canvas = document.getElementById('submitted-chart');
            canvas.remove();

            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);

            // Should not throw
            expect(() => chartManager.copyToReviewChart()).not.toThrow();
            expect(chartManager.reviewChart).toBeNull();
        });

        it('should handle no previewChart gracefully', () => {
            // Should not throw when no previewChart
            expect(() => chartManager.copyToReviewChart()).not.toThrow();
            expect(chartManager.reviewChart).toBeNull();
        });
    });

    describe('destroy', () => {
        it('should null previewChart reference', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);
            expect(chartManager.previewChart).not.toBeNull();

            chartManager.destroy();
            expect(chartManager.previewChart).toBeNull();
        });

        it('should null reviewChart reference', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);
            chartManager.copyToReviewChart();
            expect(chartManager.reviewChart).not.toBeNull();

            chartManager.destroy();
            expect(chartManager.reviewChart).toBeNull();
        });

        it('should be safe to call twice', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);

            expect(() => {
                chartManager.destroy();
                chartManager.destroy();
            }).not.toThrow();

            expect(chartManager.previewChart).toBeNull();
            expect(chartManager.reviewChart).toBeNull();
        });

        it('should call destroy on both chart objects', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);
            chartManager.copyToReviewChart();

            const previewDestroySpy = vi.spyOn(chartManager.previewChart, 'destroy');
            const reviewDestroySpy = vi.spyOn(chartManager.reviewChart, 'destroy');

            chartManager.destroy();

            expect(previewDestroySpy).toHaveBeenCalled();
            expect(reviewDestroySpy).toHaveBeenCalled();
        });
    });

    describe('integration tests', () => {
        it('should create preview chart and extract current config', () => {
            const data = {
                labels: ['Q1', 'Q2', 'Q3'],
                datasets: {
                    'Revenue': [1000, 2000, 3000],
                    'Profit': [300, 600, 900]
                }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'Quarterly Sales',
                showDataLabels: true,
                showGrid: true
            };

            chartManager.createPreviewChart(data, config);

            const currentConfig = previewSummary(chartManager);
            expect(currentConfig.type).toBe('bar');
            expect(currentConfig.hasLegend).toBe(true);
            expect(currentConfig.hasTitle).toBe(true);
            expect(currentConfig.hasGrid).toBe(true);
        });

        it('should update preview chart and reflect changes in the preview chart', () => {
            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const configBar = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: 'Test',
                showDataLabels: false,
                showGrid: true
            };

            chartManager.createPreviewChart(data, configBar);
            let currentConfig = previewSummary(chartManager);
            expect(currentConfig.type).toBe('bar');

            const configLine = {
                type: 'line',
                palette: 'corporate',
                showLegend: false,
                title: 'Test',
                showDataLabels: false,
                showGrid: false
            };

            chartManager.updatePreviewChart(data, configLine);
            currentConfig = previewSummary(chartManager);

            expect(currentConfig.type).toBe('line');
            expect(currentConfig.hasLegend).toBe(false);
            expect(currentConfig.hasGrid).toBe(false);
        });

        it('should handle createPreviewChart with missing canvas', () => {
            // Remove canvas
            const canvas = document.getElementById('preview-chart');
            canvas.remove();

            const data = {
                labels: ['A', 'B'],
                datasets: { 'Values': [10, 20] }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                title: '',
                showDataLabels: false,
                showGrid: true
            };

            // Should not throw
            expect(() => chartManager.createPreviewChart(data, config)).not.toThrow();
            expect(chartManager.previewChart).toBeNull();
        });
    });
});
