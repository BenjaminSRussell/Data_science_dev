/**
 * ChartManager - Handles Chart.js integration and chart rendering
 */

import Chart from 'chart.js/auto';

// Color palettes
const PALETTES = {
    corporate: [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',   // Orange
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(168, 85, 247, 0.8)'    // Indigo
    ],
    vibrant: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(153, 102, 255, 0.8)'
    ],
    pastel: [
        'rgba(165, 180, 252, 0.8)',
        'rgba(249, 168, 212, 0.8)',
        'rgba(167, 243, 208, 0.8)',
        'rgba(253, 230, 138, 0.8)',
        'rgba(196, 181, 253, 0.8)',
        'rgba(254, 202, 202, 0.8)'
    ],
    monochrome: [
        'rgba(55, 65, 81, 0.9)',
        'rgba(75, 85, 99, 0.8)',
        'rgba(107, 114, 128, 0.7)',
        'rgba(156, 163, 175, 0.6)',
        'rgba(209, 213, 219, 0.5)',
        'rgba(229, 231, 235, 0.4)'
    ]
};

export class ChartManager {
    constructor(game) {
        this.game = game;
        this.previewChart = null;
        this.reviewChart = null;
    }

    /**
     * Initialize chart manager
     */
    init() {
        // Set default Chart.js options
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.font.family = "'Inter', sans-serif";


    }

    /**
     * Create preview chart in chart studio
     */
    createPreviewChart(data, config) {
        const canvas = document.getElementById('preview-chart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.previewChart) {
            this.previewChart.destroy();
        }

        const chartConfig = this.buildChartConfig(data, config);
        this.previewChart = new Chart(canvas, chartConfig);
    }

    /**
     * Update existing preview chart
     */
    updatePreviewChart(data, config) {
        if (!this.previewChart) {
            this.createPreviewChart(data, config);
            return;
        }

        const chartConfig = this.buildChartConfig(data, config);

        // Update chart type
        this.previewChart.config.type = chartConfig.type;

        // Update data
        this.previewChart.data = chartConfig.data;

        // Update options
        this.previewChart.options = chartConfig.options;

        // Refresh
        this.previewChart.update();
    }

    /**
     * Build Chart.js configuration from game config
     */
    buildChartConfig(data, config) {
        const palette = PALETTES[config.palette] || PALETTES.corporate;
        const type = this.mapChartType(config.type);

        // Get the first dataset key with non-empty data
        const datasetKeys = Object.keys(data.datasets || {});
        let primaryKey = 'Value';
        let values = [];

        // Find first dataset with data
        for (const key of datasetKeys) {
            const datasetValues = data.datasets?.[key];
            if (Array.isArray(datasetValues) && datasetValues.length > 0) {
                primaryKey = key;
                values = datasetValues;
                break;
            }
        }

        // Fallback to rows if no dataset found
        if (values.length === 0 && data.rows && data.rows.length > 0) {
            values = data.rows.map(r => r[1] || 0);
            primaryKey = data.columns?.[1] || 'Value';
        }

        return {
            type: type,
            data: {
                labels: data.labels || data.rows?.map(r => r[0]) || [],
                datasets: [{
                    label: primaryKey,
                    data: values,
                    backgroundColor: type === 'line' ? palette[0].replace('0.8', '0.2') : palette,
                    borderColor: type === 'line' ? palette[0] : palette.map(c => c.replace('0.8', '1')),
                    borderWidth: type === 'line' ? 3 : 1,
                    tension: 0.3,
                    fill: type === 'line' ? true : undefined,
                    pointBackgroundColor: palette[0],
                    pointBorderColor: '#fff',
                    pointRadius: type === 'line' ? 5 : undefined,
                    pointHoverRadius: type === 'line' ? 7 : undefined
                }]
            },
            options: this.buildChartOptions(config, type)
        };
    }

    /**
     * Map game chart type to Chart.js type
     */
    mapChartType(type) {
        const mapping = {
            bar: 'bar',
            line: 'line',
            pie: 'pie',
            doughnut: 'doughnut',
            scatter: 'scatter',
            radar: 'radar',
            area: 'line',
            bubble: 'bubble',
            polarArea: 'polarArea'
        };
        return mapping[type] || 'bar';
    }

    /**
     * Build chart options
     */
    buildChartOptions(config, chartType) {
        const isPolar = ['pie', 'doughnut', 'polarArea', 'radar'].includes(chartType);

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: config.showLegend,
                    position: 'top',
                    labels: {
                        color: '#9ca3af',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: !!config.title,
                    text: config.title || '',
                    color: '#f9fafb',
                    font: {
                        size: 16,
                        weight: 600
                    },
                    padding: {
                        bottom: 20
                    }
                },
                datalabels: config.showDataLabels ? {
                    color: '#fff',
                    anchor: 'end',
                    align: 'top'
                } : false
            },
            scales: isPolar ? {} : {
                x: {
                    display: true,
                    grid: {
                        display: config.showGrid,
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: config.showGrid,
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function (value) {
                            if (value >= 1000) {
                                return '$' + (value / 1000).toFixed(0) + 'k';
                            }
                            return value;
                        }
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 750,
                easing: 'easeOutQuart'
            }
        };
    }

    /**
     * Copy preview chart to review screen
     */
    copyToReviewChart() {
        const reviewCanvas = document.getElementById('submitted-chart');
        if (!reviewCanvas || !this.previewChart) return;

        // Destroy existing
        if (this.reviewChart) {
            this.reviewChart.destroy();
        }

        // Clone configuration
        const config = {
            type: this.previewChart.config.type,
            data: JSON.parse(JSON.stringify(this.previewChart.data)),
            options: {
                ...this.previewChart.options,
                animation: false // No animation for review
            }
        };

        this.reviewChart = new Chart(reviewCanvas, config);
    }

    /**
     * Get current chart configuration for scoring
     */
    getCurrentConfig() {
        if (!this.previewChart) return null;

        return {
            type: this.previewChart.config.type,
            hasLegend: this.previewChart.options.plugins?.legend?.display,
            hasTitle: !!this.previewChart.options.plugins?.title?.text,
            hasGrid: this.previewChart.options.scales?.x?.grid?.display
        };
    }

    /**
     * Destroy all charts (cleanup)
     */
    destroy() {
        if (this.previewChart) {
            this.previewChart.destroy();
            this.previewChart = null;
        }
        if (this.reviewChart) {
            this.reviewChart.destroy();
            this.reviewChart = null;
        }
    }
}
