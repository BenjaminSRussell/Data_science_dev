/**
 * ChartManager - Handles Chart.js integration and chart rendering
 */

import Chart from 'chart.js/auto';
import { isCurrencyColumn } from '../utils/dataFormat.js';

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

// Text/grid colours Chart.js draws onto the canvas. CSS can't reach the
// canvas, so these follow [data-theme] by hand (#1893).
const THEME_COLORS = {
    dark: {
        text: '#9ca3af',
        title: '#f9fafb',
        dataLabel: '#f9fafb',
        grid: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        pointBorder: '#ffffff'
    },
    light: {
        text: '#52525b',
        title: '#18181b',
        dataLabel: '#18181b',
        grid: 'rgba(0, 0, 0, 0.08)',
        border: 'rgba(0, 0, 0, 0.12)',
        pointBorder: '#ffffff'
    }
};

export class ChartManager {
    static THEME_COLORS = THEME_COLORS;
    static PALETTES = PALETTES;

    /**
     * Chart colours for the active theme
     */
    static getThemeColors() {
        const theme = typeof document !== 'undefined'
            && document.documentElement?.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        return THEME_COLORS[theme];
    }

    /**
     * CSS background for a palette swatch, built from the real palette so the
     * picker matches the chart (#1892)
     */
    static paletteSwatch(name) {
        const colors = PALETTES[name];
        if (!colors) return null;
        const step = 100 / colors.length;
        const stops = colors.map((c, i) => `${c} ${(i * step).toFixed(0)}% ${((i + 1) * step).toFixed(0)}%`);
        return `linear-gradient(90deg, ${stops.join(', ')})`;
    }

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
        this.applyThemeDefaults();
        Chart.defaults.font.family = "'Inter', sans-serif";


    }

    applyThemeDefaults() {
        const colors = ChartManager.getThemeColors();
        Chart.defaults.color = colors.text;
        Chart.defaults.borderColor = colors.border;
    }

    /**
     * Redraw charts after the theme changes so canvas text stays readable
     */
    refreshTheme() {
        this.applyThemeDefaults();
        if (this.previewChart && this.lastPreview) {
            this.createPreviewChart(this.lastPreview.data, this.lastPreview.config);
        }
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

        this.lastPreview = { data, config: { ...config } };
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

        this.lastPreview = { data, config: { ...config } };
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
     * Every non-empty numeric series in task data (#1491). Previously only
     * the first one was plotted and the rest silently dropped.
     */
    static collectSeries(data = {}) {
        const series = [];
        for (const key of Object.keys(data.datasets || {})) {
            const values = data.datasets?.[key];
            if (Array.isArray(values) && values.length > 0) series.push({ key, values });
        }
        // Fallback to rows if no dataset found
        if (series.length === 0 && data.rows && data.rows.length > 0) {
            series.push({ key: data.columns?.[1] || 'Value', values: data.rows.map(r => r[1] || 0) });
        }
        if (series.length === 0) series.push({ key: 'Value', values: [] });
        return series;
    }

    /**
     * Single-ring chart types only make sense with one series
     */
    static plottedSeries(series, chartJsType) {
        return ['pie', 'doughnut', 'polarArea'].includes(chartJsType) ? series.slice(0, 1) : series;
    }

    /**
     * Which columns the preview actually plots, for the Chart Studio
     * MAPPING panel (#1494): x is the label column, y the plotted series
     */
    describeMapping(data = {}, config = {}) {
        const type = this.mapChartType(config.type || 'bar');
        const plotted = ChartManager.plottedSeries(ChartManager.collectSeries(data), type);
        const columns = data.columns || data.headers || [];
        return {
            x: columns[0] || 'Label',
            y: plotted.map(s => s.key).join(', ')
        };
    }

    /**
     * Build Chart.js configuration from game config
     */
    buildChartConfig(data, config) {
        const palette = PALETTES[config.palette] || PALETTES.corporate;
        const type = this.mapChartType(config.type);
        const labels = data.labels || data.rows?.map(r => r[0]) || [];

        const series = ChartManager.collectSeries(data);
        const primaryKey = series[0].key;
        const plotted = ChartManager.plottedSeries(series, type);
        const multi = plotted.length > 1;
        const isPointType = type === 'scatter' || type === 'bubble';

        const datasets = plotted.map((s, i) => {
            const color = palette[i % palette.length];
            let points = s.values;
            if (isPointType) {
                // Scatter/bubble need {x, y(, r)} points on a linear x axis; map
                // each category to its index so nothing parses as NaN (#2254).
                const max = Math.max(1, ...s.values.map(v => Math.abs(Number(v) || 0)));
                points = s.values.map((v, idx) => {
                    const y = Number(v) || 0;
                    return type === 'bubble'
                        ? { x: idx, y, r: 4 + Math.round((Math.abs(y) / max) * 12) }
                        : { x: idx, y };
                });
            }
            const lineLike = type === 'line' || isPointType || multi;
            return {
                label: s.key,
                data: points,
                backgroundColor: type === 'line' ? color.replace('0.8', '0.2') : (lineLike ? color : palette),
                borderColor: lineLike ? color.replace('0.8', '1') : palette.map(c => c.replace('0.8', '1')),
                borderWidth: type === 'line' ? 3 : 1,
                tension: 0.3,
                fill: type === 'line' ? (config.type === 'area' || !multi) : undefined,
                pointBackgroundColor: color,
                pointBorderColor: ChartManager.getThemeColors().pointBorder,
                pointRadius: type === 'line' ? 5 : (type === 'scatter' ? 6 : undefined),
                pointHoverRadius: type === 'line' ? 7 : undefined
            };
        });

        const options = this.buildChartOptions(config, type, primaryKey);
        if (isPointType && options.scales?.x) {
            options.scales.x = {
                ...options.scales.x,
                type: 'linear',
                min: -0.5,
                max: Math.max(0, labels.length - 0.5),
                ticks: {
                    ...options.scales.x.ticks,
                    stepSize: 1,
                    callback: (value) => (Number.isInteger(value) && labels[value] !== undefined ? labels[value] : '')
                }
            };
        }

        return {
            type: type,
            data: { labels, datasets },
            options
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
    buildChartOptions(config, chartType, datasetName) {
        const isPolar = ['pie', 'doughnut', 'polarArea', 'radar'].includes(chartType);
        const theme = ChartManager.getThemeColors();

        // Only format y-axis ticks as currency when the plotted series is a
        // currency metric (same heuristic used for the data table)
        const columnName = (datasetName || '').toLowerCase();
        const isCurrency = isCurrencyColumn(columnName);

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: config.showLegend,
                    position: 'top',
                    labels: {
                        color: theme.text,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: !!config.title,
                    text: config.title || '',
                    color: theme.title,
                    font: {
                        size: 16,
                        weight: 600
                    },
                    padding: {
                        bottom: 20
                    }
                },
                datalabels: config.showDataLabels ? {
                    color: theme.dataLabel,
                    anchor: 'end',
                    align: 'top'
                } : false
            },
            scales: isPolar ? {} : {
                x: {
                    display: true,
                    grid: {
                        display: config.showGrid,
                        color: theme.grid
                    },
                    ticks: {
                        color: theme.text
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: config.showGrid,
                        color: theme.grid
                    },
                    ticks: {
                        color: theme.text,
                        callback: function (value) {
                            if (value >= 1000) {
                                if (isCurrency) {
                                    return '$' + (value / 1000).toFixed(0) + 'k';
                                }
                                return (value / 1000).toFixed(0) + 'k';
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

        // Rebuild a fresh config from the source data instead of spreading the
        // preview chart's resolved options: Chart.js exposes those as a Proxy with
        // Symbol keys, and spreading it made `new Chart()` throw
        // "startsWith is not a function", which aborted submitChart().
        let config;
        if (this.lastPreview) {
            config = this.buildChartConfig(this.lastPreview.data, this.lastPreview.config);
        } else {
            config = {
                type: this.previewChart.config.type,
                data: JSON.parse(JSON.stringify(this.previewChart.data)),
                options: {}
            };
        }
        config.options = { ...config.options, animation: false }; // No animation for review

        this.reviewChart = new Chart(reviewCanvas, config);
    }

    /**
     * Render a chart into an arbitrary canvas (used by the dev menu's chart tests
     * and GraphValidator, #1025 / #2350).
     * Accepts either Chart.js-style data ({ labels, datasets: [{ label, data }] })
     * or the game's task-data shape ({ labels, datasets: { name: [..] } } / rows).
     * @returns {Chart|null} the Chart instance, or null if the canvas is missing.
     */
    createChart(canvasOrId, type = 'bar', data = {}, config = {}) {
        const canvas = typeof canvasOrId === 'string'
            ? document.getElementById(canvasOrId)
            : canvasOrId;
        if (!canvas) return null;

        const existing = typeof Chart.getChart === 'function' ? Chart.getChart(canvas) : null;
        if (existing) existing.destroy();

        let chartConfig;
        if (Array.isArray(data?.datasets)) {
            const chartType = this.mapChartType(type);
            const palette = PALETTES[config.palette] || PALETTES.corporate;
            chartConfig = {
                type: chartType,
                data: {
                    labels: data.labels || [],
                    datasets: data.datasets.map((ds, i) => ({
                        backgroundColor: chartType === 'line' ? palette[i % palette.length] : palette,
                        borderColor: chartType === 'line' ? palette[i % palette.length] : palette.map(c => c.replace('0.8', '1')),
                        borderWidth: 1,
                        fill: type === 'area' ? true : undefined,
                        ...ds
                    }))
                },
                options: this.buildChartOptions({ ...config, type }, chartType, data.datasets[0]?.label || 'Value')
            };
        } else {
            chartConfig = this.buildChartConfig(data || {}, { ...config, type });
        }
        return new Chart(canvas, chartConfig);
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
