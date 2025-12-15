/**
 * Chart Types - Available visualization types
 */

export const CHART_TYPES = [
    {
        id: "bar",
        name: "Bar Chart",
        icon: "📊",
        description: "Compare values across categories",
        unlockRank: 0,
        bestFor: ["comparisons", "categories", "rankings"]
    },
    {
        id: "line",
        name: "Line Chart",
        icon: "📈",
        description: "Show trends over time",
        unlockRank: 0,
        bestFor: ["trends", "time series", "changes"]
    },
    {
        id: "pie",
        name: "Pie Chart",
        icon: "🥧",
        description: "Show proportions of a whole",
        unlockRank: 0,
        bestFor: ["proportions", "percentages", "distributions"]
    },
    {
        id: "scatter",
        name: "Scatter Plot",
        icon: "⚬",
        description: "Show relationships between variables",
        unlockRank: 2,
        bestFor: ["correlations", "distributions", "outliers"]
    },
    {
        id: "doughnut",
        name: "Donut Chart",
        icon: "🍩",
        description: "Proportions with center space",
        unlockRank: 2,
        bestFor: ["proportions", "progress", "comparisons"]
    },
    {
        id: "radar",
        name: "Radar Chart",
        icon: "📡",
        description: "Compare multiple variables",
        unlockRank: 3,
        bestFor: ["multi-dimensional", "performance", "profiles"]
    },
    {
        id: "area",
        name: "Area Chart",
        icon: "📉",
        description: "Show volume over time",
        unlockRank: 3,
        bestFor: ["cumulative", "volume", "trends"]
    },
    {
        id: "bubble",
        name: "Bubble Chart",
        icon: "⭕",
        description: "Three-dimensional comparisons",
        unlockRank: 4,
        bestFor: ["3 variables", "correlations", "size comparisons"]
    },
    {
        id: "polarArea",
        name: "Polar Area",
        icon: "🧭",
        description: "Radial proportional chart",
        unlockRank: 5,
        bestFor: ["cyclical data", "comparisons", "proportions"]
    }
];
