/**
 * Unit tests for EconomySystem - focusing on scoreDataAccuracy
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';

describe('EconomySystem', () => {
    let economySystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            getSoftwareQualityMultiplier: vi.fn(() => ({
                chartAppropriateness: 1.0,
                visualClarity: 1.0,
                dataAccuracy: 1.0
            })),
            totalRatings: 0,
            ratingSum: 0,
            perfectScores: 0
        };

        economySystem = new EconomySystem(mockGameState);
    });

    describe('scoreDataAccuracy', () => {
        it('should score a correct high-difficulty chart higher than an incorrect one', () => {
            // Correct chart: optimal type for the task
            const correctTask = {
                difficulty: 9.0,
                optimalChartTypes: ['line', 'scatter'],
                acceptableChartTypes: ['bar'],
                dataType: 'performance_metrics'
            };

            const correctChartConfig = {
                type: 'line',
                showLegend: true,
                showGrid: true,
                title: 'Performance Analysis'
            };

            // Incorrect chart: wrong type entirely
            const incorrectChartConfig = {
                type: 'pie',
                showLegend: true,
                showGrid: true,
                title: 'Performance Analysis'
            };

            const correctScore = economySystem.scoreDataAccuracy(correctTask, correctChartConfig);
            const incorrectScore = economySystem.scoreDataAccuracy(correctTask, incorrectChartConfig);

            // The correct chart should score significantly higher
            expect(correctScore).toBeGreaterThan(incorrectScore);
        });

        it('should give high score for optimal chart type selection', () => {
            const task = {
                difficulty: 8.5,
                optimalChartTypes: ['line', 'scatter'],
                acceptableChartTypes: ['bar'],
                dataType: 'trend_analysis'
            };

            const chartConfig = {
                type: 'line',
                showLegend: true,
                showGrid: true,
                title: 'Trend Analysis'
            };

            const score = economySystem.scoreDataAccuracy(task, chartConfig);

            // Optimal choice should give a good score
            expect(score).toBeGreaterThan(70);
        });

        it('should give medium score for acceptable chart type selection', () => {
            const task = {
                difficulty: 8.5,
                optimalChartTypes: ['line', 'scatter'],
                acceptableChartTypes: ['bar'],
                dataType: 'trend_analysis'
            };

            const chartConfig = {
                type: 'bar',
                showLegend: true,
                showGrid: true,
                title: 'Trend Analysis'
            };

            const score = economySystem.scoreDataAccuracy(task, chartConfig);

            // Acceptable choice should give a decent but lower score than optimal
            expect(score).toBeGreaterThan(50);
            expect(score).toBeLessThan(80);
        });

        it('should give low score for completely wrong chart type', () => {
            const task = {
                difficulty: 8.5,
                optimalChartTypes: ['line', 'scatter'],
                acceptableChartTypes: ['bar'],
                dataType: 'trend_analysis'
            };

            const chartConfig = {
                type: 'pie',
                showLegend: true,
                showGrid: true,
                title: 'Trend Analysis'
            };

            const score = economySystem.scoreDataAccuracy(task, chartConfig);

            // Wrong choice should give a low score
            expect(score).toBeLessThan(60);
        });

        it('should handle lower difficulty tasks reasonably', () => {
            const lowDifficultyTask = {
                difficulty: 2.5,
                optimalChartTypes: ['bar'],
                acceptableChartTypes: ['pie'],
                dataType: 'category_breakdown'
            };

            const chartConfig = {
                type: 'bar',
                showLegend: true,
                showGrid: true,
                title: 'Breakdown'
            };

            // Should not throw, and should return a valid score
            const score = economySystem.scoreDataAccuracy(lowDifficultyTask, chartConfig);
            expect(typeof score).toBe('number');
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should give consistent results for the same input', () => {
            const task = {
                difficulty: 9.0,
                optimalChartTypes: ['line'],
                acceptableChartTypes: ['bar'],
                dataType: 'performance_metrics'
            };

            const chartConfig = {
                type: 'line',
                showLegend: true,
                showGrid: true,
                title: 'Performance'
            };

            const score1 = economySystem.scoreDataAccuracy(task, chartConfig);
            const score2 = economySystem.scoreDataAccuracy(task, chartConfig);

            // Scores should be identical (or very close) for deterministic scoring
            expect(Math.abs(score1 - score2)).toBeLessThan(1);
        });

        it('should differentiate between optimal and acceptable choices', () => {
            const task = {
                difficulty: 9.0,
                optimalChartTypes: ['line', 'scatter'],
                acceptableChartTypes: ['bar'],
                dataType: 'performance_metrics'
            };

            const optimalConfig = {
                type: 'line',
                showLegend: true,
                showGrid: true,
                title: 'Analysis'
            };

            const acceptableConfig = {
                type: 'bar',
                showLegend: true,
                showGrid: true,
                title: 'Analysis'
            };

            const optimalScore = economySystem.scoreDataAccuracy(task, optimalConfig);
            const acceptableScore = economySystem.scoreDataAccuracy(task, acceptableConfig);

            // Optimal should be noticeably better than acceptable
            expect(optimalScore).toBeGreaterThan(acceptableScore);
            expect(optimalScore - acceptableScore).toBeGreaterThan(10);
        });
    });

    describe('evaluateChart', () => {
        it('should return valid evaluation with proper scoring components', () => {
            const task = {
                difficulty: 8.5,
                optimalChartTypes: ['line'],
                acceptableChartTypes: ['bar'],
                dataType: 'performance_metrics',
                boss: { strictness: 1.0 },
                potentialReward: 100
            };

            const chartConfig = {
                type: 'line',
                palette: 'corporate',
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                title: 'Analysis'
            };

            const evaluation = economySystem.evaluateChart(task, chartConfig);

            // Check structure
            expect(evaluation).toHaveProperty('chartAppropriateness');
            expect(evaluation).toHaveProperty('visualClarity');
            expect(evaluation).toHaveProperty('dataAccuracy');
            expect(evaluation).toHaveProperty('rawScore');
            expect(evaluation).toHaveProperty('stars');

            // Check types and ranges
            expect(typeof evaluation.chartAppropriateness).toBe('number');
            expect(typeof evaluation.visualClarity).toBe('number');
            expect(typeof evaluation.dataAccuracy).toBe('number');
            expect(typeof evaluation.rawScore).toBe('number');
            expect([1, 2, 3, 4, 5]).toContain(evaluation.stars);
        });
    });
});
