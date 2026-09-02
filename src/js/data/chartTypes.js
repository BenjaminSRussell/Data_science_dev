export const CHART_TYPES = {
    bar: {
        name: 'Bar Chart',
        icon: 'bar-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 1
    },
    line: {
        name: 'Line Chart',
        icon: 'line-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 1
    },
    pie: {
        name: 'Pie Chart',
        icon: 'pie-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 1
    },
    doughnut: {
        name: 'Doughnut Chart',
        icon: 'doughnut-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 1
    },
    scatter: {
        name: 'Scatter Plot',
        icon: 'scatter-plot',
        suitableFor: ['numeric', 'numeric'],
        rankRequirement: 2
    },
    radar: {
        name: 'Radar Chart',
        icon: 'radar-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 2
    },
    area: {
        name: 'Area Chart',
        icon: 'area-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 2
    },
    bubble: {
        name: 'Bubble Chart',
        icon: 'bubble-chart',
        suitableFor: ['numeric', 'numeric', 'numeric'],
        rankRequirement: 3
    },
    polarArea: {
        name: 'Polar Area Chart',
        icon: 'polar-area-chart',
        suitableFor: ['categorical', 'numeric'],
        rankRequirement: 3
    },
    heatmap: {
        name: 'Heatmap',
        icon: 'heatmap',
        suitableFor: ['numeric', 'numeric'],
        rankRequirement: 5
    }
};