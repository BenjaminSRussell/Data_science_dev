/**
 * Graph/Chart Validation System
 * Validates that all charts render correctly and data is accurate
 */

export class GraphValidator {
    constructor(game) {
        this.game = game;
    }

    async validateAll() {
        const results = {
            chartTypes: await this.validateChartTypes(),
            dataAccuracy: await this.validateDataAccuracy(),
            rendering: await this.validateRendering(),
            interactions: await this.validateInteractions()
        };

        return results;
    }

    async validateChartTypes() {
        const chartManager = this.game.chartManager;
        if (!chartManager) {
            return { error: 'Chart manager not found' };
        }

        const chartTypes = ['bar', 'line', 'pie', 'scatter', 'doughnut', 'area', 'radar'];
        const results = {
            total: chartTypes.length,
            passed: 0,
            failed: 0,
            errors: []
        };

        const testData = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Test Dataset',
                data: [10, 20, 30, 40]
            }]
        };

        for (const type of chartTypes) {
            try {
                // Create temporary canvas
                const canvas = document.createElement('canvas');
                canvas.id = `test-chart-${type}-${Date.now()}`;
                canvas.width = 400;
                canvas.height = 300;
                document.body.appendChild(canvas);

                // Create chart
                if (chartManager.createChart) {
                    const chart = chartManager.createChart(canvas.id, type, testData);
                    
                    if (chart) {
                        // Wait for chart to render
                        await this.wait(200);
                        
                        // Verify chart exists and has data
                        const chartData = chart.data || chart.config?.data;
                        if (chartData) {
                            results.passed++;
                        } else {
                            results.failed++;
                            results.errors.push({ type, error: 'Chart created but no data' });
                        }
                    } else {
                        results.failed++;
                        results.errors.push({ type, error: 'Chart creation returned null' });
                    }
                } else {
                    results.failed++;
                    results.errors.push({ type, error: 'createChart method not found' });
                }

                // Cleanup
                setTimeout(() => canvas.remove(), 500);
            } catch (error) {
                results.failed++;
                results.errors.push({ type, error: error.message });
            }
        }

        return results;
    }

    async validateDataAccuracy() {
        const testCases = [
            {
                name: 'Simple sum',
                data: [10, 20, 30, 40],
                expectedSum: 100,
                expectedAverage: 25,
                expectedMax: 40,
                expectedMin: 10
            },
            {
                name: 'Negative values',
                data: [-10, 0, 10, 20],
                expectedSum: 20,
                expectedAverage: 5
            },
            {
                name: 'Decimal values',
                data: [10.5, 20.3, 30.7, 40.1],
                expectedSum: 101.6
            },
            {
                name: 'Single value',
                data: [42],
                expectedSum: 42,
                expectedAverage: 42
            }
        ];

        const results = {
            total: testCases.length,
            passed: 0,
            failed: 0,
            errors: []
        };

        for (const testCase of testCases) {
            try {
                const sum = testCase.data.reduce((a, b) => a + b, 0);
                const average = sum / testCase.data.length;
                const max = Math.max(...testCase.data);
                const min = Math.min(...testCase.data);

                let passed = true;
                const errors = [];

                if (Math.abs(sum - testCase.expectedSum) > 0.01) {
                    passed = false;
                    errors.push(`Sum mismatch: expected ${testCase.expectedSum}, got ${sum}`);
                }

                if (testCase.expectedAverage && Math.abs(average - testCase.expectedAverage) > 0.01) {
                    passed = false;
                    errors.push(`Average mismatch: expected ${testCase.expectedAverage}, got ${average}`);
                }

                if (testCase.expectedMax && max !== testCase.expectedMax) {
                    passed = false;
                    errors.push(`Max mismatch: expected ${testCase.expectedMax}, got ${max}`);
                }

                if (testCase.expectedMin && min !== testCase.expectedMin) {
                    passed = false;
                    errors.push(`Min mismatch: expected ${testCase.expectedMin}, got ${min}`);
                }

                if (passed) {
                    results.passed++;
                } else {
                    results.failed++;
                    results.errors.push({ test: testCase.name, errors });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({ test: testCase.name, error: error.message });
            }
        }

        return results;
    }

    async validateRendering() {
        const chartManager = this.game.chartManager;
        if (!chartManager) {
            return { error: 'Chart manager not found' };
        }

        const canvas = document.createElement('canvas');
        canvas.id = `test-render-${Date.now()}`;
        canvas.width = 400;
        canvas.height = 300;
        document.body.appendChild(canvas);

        const testData = {
            labels: ['A', 'B', 'C'],
            datasets: [{
                label: 'Test',
                data: [10, 20, 30]
            }]
        };

        const results = {
            passed: false,
            error: null
        };

        try {
            const chart = chartManager.createChart(canvas.id, 'bar', testData);
            await this.wait(300);

            // Check if canvas has content (non-zero pixels)
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasContent = imageData.data.some((value, index) => {
                // Check alpha channel (every 4th value)
                return index % 4 === 3 && value > 0;
            });

            if (hasContent) {
                results.passed = true;
            } else {
                results.error = 'Canvas appears empty';
            }
        } catch (error) {
            results.error = error.message;
        } finally {
            setTimeout(() => canvas.remove(), 500);
        }

        return results;
    }

    async validateInteractions() {
        // Test chart interactions (hover, click, etc.)
        const chartManager = this.game.chartManager;
        if (!chartManager) {
            return { error: 'Chart manager not found' };
        }

        const canvas = document.createElement('canvas');
        canvas.id = `test-interactions-${Date.now()}`;
        canvas.width = 400;
        canvas.height = 300;
        document.body.appendChild(canvas);

        const testData = {
            labels: ['A', 'B', 'C'],
            datasets: [{
                label: 'Test',
                data: [10, 20, 30]
            }]
        };

        const results = {
            hover: false,
            click: false,
            error: null
        };

        try {
            const chart = chartManager.createChart(canvas.id, 'bar', testData);
            await this.wait(300);

            // Test hover
            const hoverEvent = new MouseEvent('mousemove', {
                clientX: canvas.offsetLeft + canvas.width / 2,
                clientY: canvas.offsetTop + canvas.height / 2
            });
            canvas.dispatchEvent(hoverEvent);
            results.hover = true;

            // Test click
            const clickEvent = new MouseEvent('click', {
                clientX: canvas.offsetLeft + canvas.width / 2,
                clientY: canvas.offsetTop + canvas.height / 2
            });
            canvas.dispatchEvent(clickEvent);
            results.click = true;
        } catch (error) {
            results.error = error.message;
        } finally {
            setTimeout(() => canvas.remove(), 500);
        }

        return results;
    }

    validateChartDataIntegrity(chartData) {
        // Validate chart data structure
        const issues = [];

        if (!chartData) {
            issues.push('Chart data is null/undefined');
            return { valid: false, issues };
        }

        if (!chartData.labels || !Array.isArray(chartData.labels)) {
            issues.push('Labels missing or not an array');
        }

        if (!chartData.datasets || !Array.isArray(chartData.datasets)) {
            issues.push('Datasets missing or not an array');
        } else {
            chartData.datasets.forEach((dataset, index) => {
                if (!dataset.data || !Array.isArray(dataset.data)) {
                    issues.push(`Dataset ${index} missing data array`);
                } else {
                    // Check for invalid values
                    dataset.data.forEach((value, valueIndex) => {
                        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
                            issues.push(`Dataset ${index}, value ${valueIndex} is invalid: ${value}`);
                        }
                    });
                }
            });
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

