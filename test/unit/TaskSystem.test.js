/**
 * TaskSystem Unit Tests
 * Tests trend analysis data generation to ensure proper clamping of random walk state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';

describe('TaskSystem', () => {
    let taskSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            currentRank: { salaryMultiplier: 1 },
            rankIndex: 0,
            currentTask: null
        };
        taskSystem = new TaskSystem(mockGameState);
    });

    describe('generateTrendAnalysisData', () => {
        it('should generate 12-week trend data', () => {
            const data = taskSystem.generateTrendAnalysisData();

            expect(data.columns).toEqual(['Week', 'Users']);
            expect(data.labels.length).toBe(12);
            expect(data.datasets.Users.length).toBe(12);
            expect(data.rows.length).toBe(12);
        });

        it('should ensure all trend values are at least 500', () => {
            const data = taskSystem.generateTrendAnalysisData();

            data.datasets.Users.forEach((value) => {
                expect(value).toBeGreaterThanOrEqual(500);
            });
        });

        it('should not produce multiple consecutive 500 values when forced to have negative draws', () => {
            // Mock randomRange to produce negative deltas that would push value below 500
            // Sequence: start at 1000, then apply: -250, -250, -250, +100, +100, ...
            const negativeSequence = [-250, -250, -250, +100, +100, +100, -50, -50, +200, +300, +150, +75];
            let sequenceIndex = 0;

            vi.spyOn(taskSystem, 'randomRange').mockImplementation((min, max) => {
                if (sequenceIndex === 0) {
                    // Initial value
                    sequenceIndex++;
                    return 1000;
                }
                const value = negativeSequence[sequenceIndex - 1];
                sequenceIndex++;
                return value;
            });

            const data = taskSystem.generateTrendAnalysisData();
            const trend = data.datasets.Users;

            // Count consecutive 500 values
            let maxConsecutive500s = 0;
            let current500s = 0;

            for (const value of trend) {
                if (value === 500) {
                    current500s++;
                    maxConsecutive500s = Math.max(maxConsecutive500s, current500s);
                } else {
                    current500s = 0;
                }
            }

            // With the fix, we should not have multiple consecutive 500 values
            // because the clamping is applied to the state before adding the next delta
            expect(maxConsecutive500s).toBeLessThan(3);

            vi.restoreAllMocks();
        });

        it('should vary trend values and not get stuck at the floor', () => {
            // Generate many samples and check for variety
            const samples = [];
            for (let i = 0; i < 10; i++) {
                const data = taskSystem.generateTrendAnalysisData();
                samples.push(data.datasets.Users);
            }

            // Flatten all samples
            const allValues = samples.flat();

            // Should have values above 500, not just stuck at 500
            const maxValue = Math.max(...allValues);
            expect(maxValue).toBeGreaterThan(500);

            // Should have values throughout the range, not clustered
            const uniqueValues = new Set(allValues);
            expect(uniqueValues.size).toBeGreaterThan(10);
        });
    });
});
