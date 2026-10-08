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
        // Was a second purple next to the first one; pink keeps all six
        // series distinguishable (#1891)
        'rgba(236, 72, 153, 0.8)'    // Pink
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
     * Build Chart.js configuration from game config
     */
    buildChartConfig(data, config) {
        const palette = PALETTES[config.palette] || PALETTES.corporate;
        const type = this.mapChartType(config.type);
        const labels = data.labels || data.rows?.map(r => r[0]) || [];

        // Collect every non-empty numeric series (#1491). Previously only the
        // first one was plotted and the rest silently dropped.
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

        const primaryKey = series[0].key;
        // Single-ring chart types only make sense with one series
        const isSingleSeriesType = ['pie', 'doughnut', 'polarArea'].includes(type);
        const plotted = isSingleSeriesType ? series.slice(0, 1) : series;
        const multi = plotted.length > 1;
        const isPointType = type === 'scatter' || type === 'bubble';

        // One colour per category for bar/pie-style charts. Past the end of
        // the palette, colours repeat at lower opacity instead of running out
        // (#1372)
        const categoryColors = ChartManager.categoryColors(palette, Math.max(labels.length, ...plotted.map(s => s.values.length)));
        const withAlpha = ChartManager.withAlpha;

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
            // Radar draws one filled shape per dataset, so it needs one colour,
            // not the whole palette (#1489)
            const lineLike = type === 'line' || type === 'radar' || isPointType || multi;
            // Opacity is set by parsing the colour, not by replacing "0.8"
            // (which silently did nothing for monochrome) (#1890, #61)
            return {
                label: s.key,
                data: points,
                backgroundColor: (type === 'line' || type === 'radar') ? withAlpha(color, 0.2) : (lineLike ? color : categoryColors),
                borderColor: lineLike ? withAlpha(color, 1) : categoryColors.map(c => withAlpha(c, 1)),
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
            options,
            // Data labels are drawn by our own small plugin; the
            // chartjs-plugin-datalabels package was never installed (#1490)
            // It's always attached and draws only while the option is on, so
            // toggling the checkbox works on an existing preview chart
            plugins: [ChartManager.dataLabelsPlugin]
        };
    }

    /**
     * Replace a colour's alpha. Understands rgb()/rgba() and #rrggbb.
     */
    static withAlpha(color, alpha) {
        const a = Math.max(0, Math.min(1, Number(alpha)));
        const str = String(color || '').trim();
        const m = str.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
        if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})`;
        const h = str.match(/^#([0-9a-f]{6})$/i);
        if (h) {
            const n = parseInt(h[1], 16);
            return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
        }
        return str;
    }

    /**
     * count colours from a palette; each pass past the end is fainter so
     * neighbouring categories stay distinguishable
     */
    static categoryColors(palette, count) {
        const n = Math.max(palette.length, Number(count) || 0);
        const out = [];
        for (let i = 0; i < n; i++) {
            const base = palette[i % palette.length];
            const pass = Math.floor(i / palette.length);
            if (pass === 0) {
                out.push(base);
            } else {
                const m = String(base).match(/,\s*([\d.]+)\s*\)$/);
                const alpha = m ? Number(m[1]) : 0.8;
                out.push(ChartManager.withAlpha(base, Math.max(0.25, alpha * Math.pow(0.6, pass))));
            }
        }
        return out;
    }

    /**
     * Minimal data-labels plugin: writes each value above its bar/point or
     * in the middle of its slice
     */
    static dataLabelsPlugin = {
        id: 'dsdDataLabels',
        afterDatasetsDraw(chart) {
            const opts = chart.options?.plugins?.datalabels;
            const ctx = chart.ctx;
            if (!opts || !ctx) return;
            const color = opts.color || ChartManager.getThemeColors().dataLabel;
            ctx.save();
            ctx.fillStyle = color;
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            chart.data.datasets.forEach((dataset, di) => {
                const meta = chart.getDatasetMeta(di);
                if (!meta || meta.hidden) return;
                meta.data.forEach((element, idx) => {
                    const raw = dataset.data[idx];
                    const value = raw && typeof raw === 'object' ? raw.y : raw;
                    if (value === null || value === undefined || Number.isNaN(Number(value))) return;
                    const pos = typeof element.tooltipPosition === 'function'
                        ? element.tooltipPosition() : { x: element.x, y: element.y };
                    ctx.fillText(ChartManager.formatDataLabel(value), pos.x, pos.y - 4);
                });
            });
            ctx.restore();
        }
    };

    /**
     * Compact label text: 1234 -> "1.2k", 2500000 -> "2.5M"
     */
    static formatDataLabel(value) {
        const n = Number(value);
        const abs = Math.abs(n);
        if (abs >= 1e6) return `${+(n / 1e6).toFixed(1)}M`;
        if (abs >= 1e3) return `${+(n / 1e3).toFixed(1)}k`;
        return Number.isInteger(n) ? String(n) : String(+n.toFixed(2));
    }

    /**
     * Radial scale (radar / polar area) styled like the x/y axes, so the
     * Show Grid toggle works there too (#2436)
     */
    static radialScale(config, theme) {
        return {
            r: {
                grid: { display: !!config.showGrid, color: theme.grid },
                angleLines: { display: !!config.showGrid, color: theme.grid },
                pointLabels: { color: theme.text },
                ticks: { color: theme.text, backdropColor: 'transparent' },
                beginAtZero: true
            }
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
            scales: isPolar ? (['radar', 'polarArea'].includes(chartType) ? ChartManager.radialScale(config, theme) : {}) : {
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
                        backgroundColor: chartType === 'line' ? palette[i % palette.length] : ChartManager.categoryColors(palette, ds.data?.length),
                        borderColor: chartType === 'line' ? palette[i % palette.length] : ChartManager.categoryColors(palette, ds.data?.length).map(c => ChartManager.withAlpha(c, 1)),
                        borderWidth: 1,
                        fill: type === 'area' ? true : undefined,
                        ...ds
                    }))
                },
                options: this.buildChartOptions({ ...config, type }, chartType, data.datasets[0]?.label || 'Value'),
                plugins: [ChartManager.dataLabelsPlugin]
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
