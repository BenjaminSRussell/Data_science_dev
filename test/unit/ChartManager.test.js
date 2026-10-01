import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartManager } from '../../src/js/charts/ChartManager.js';

// Mock Chart.js
vi.mock('chart.js/auto', () => ({
    default: vi.fn(function(canvas, config) {
        this.config = config;
        this.data = config.data;
        this.options = config.options;
        this.destroy = vi.fn();
        this.update = vi.fn();
    })
}));

describe('ChartManager', () => {
    let chartManager;
    let mockGame;

    beforeEach(() => {
        mockGame = {
            // Mock game object if needed
        };
        chartManager = new ChartManager(mockGame);
    });

    describe('Chart creation and management', () => {
        it('should create a preview chart', () => {
            // Create a mock canvas
            const canvas = document.createElement('canvas');
            canvas.id = 'preview-chart';
            document.body.appendChild(canvas);

            const data = {
                labels: ['A', 'B', 'C'],
                datasets: {
                    Value: [1, 2, 3]
                }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                title: 'Test Chart'
            };

            chartManager.createPreviewChart(data, config);
            expect(chartManager.previewChart).toBeDefined();

            // Cleanup
            document.body.removeChild(canvas);
        });

        it('should not expose getCurrentConfig method', () => {
            expect(chartManager.getCurrentConfig).toBeUndefined();
        });

        it('should build chart config with all properties from input config', () => {
            const data = {
                labels: ['A', 'B', 'C'],
                datasets: {
                    Value: [1, 2, 3]
                }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                title: 'Test Chart'
            };

            const chartConfig = chartManager.buildChartConfig(data, config);

            // Verify the built config has the expected properties
            expect(chartConfig).toBeDefined();
            expect(chartConfig.type).toBe('bar');
            expect(chartConfig.data).toBeDefined();
            expect(chartConfig.data.labels).toEqual(['A', 'B', 'C']);
            expect(chartConfig.options).toBeDefined();
            expect(chartConfig.options.plugins.legend.display).toBe(true);
            expect(chartConfig.options.plugins.title.text).toBe('Test Chart');
        });

        it('should copy chart to review screen', () => {
            // Create mock canvases
            const previewCanvas = document.createElement('canvas');
            previewCanvas.id = 'preview-chart';
            document.body.appendChild(previewCanvas);

            const reviewCanvas = document.createElement('canvas');
            reviewCanvas.id = 'submitted-chart';
            document.body.appendChild(reviewCanvas);

            const data = {
                labels: ['A', 'B', 'C'],
                datasets: {
                    Value: [1, 2, 3]
                }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                title: 'Test Chart'
            };

            chartManager.createPreviewChart(data, config);
            chartManager.copyToReviewChart();

            expect(chartManager.reviewChart).toBeDefined();

            // Cleanup
            document.body.removeChild(previewCanvas);
            document.body.removeChild(reviewCanvas);
        });

        it('should cleanup all charts on destroy', () => {
            // Create a mock canvas
            const canvas = document.createElement('canvas');
            canvas.id = 'preview-chart';
            document.body.appendChild(canvas);

            const data = {
                labels: ['A', 'B', 'C'],
                datasets: {
                    Value: [1, 2, 3]
                }
            };

            const config = {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                title: 'Test Chart'
            };

            chartManager.createPreviewChart(data, config);
            expect(chartManager.previewChart).toBeDefined();

            chartManager.destroy();
            expect(chartManager.previewChart).toBeNull();

            // Cleanup
            document.body.removeChild(canvas);
        });
    });
});
