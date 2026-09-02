import { StatisticsAggregator } from '../../src/js/ui/StatisticsAggregator.js';

describe('StatisticsAggregator', () => {
    let statsAggregator;

    beforeEach(() => {
        // Instantiate StatisticsAggregator with a fakeSaveManager
        const fakeSaveManager = {
            // Add any necessary methods here if needed
        };
        statsAggregator = new StatisticsAggregator(fakeSaveManager);
    });

    describe('formatPlaytime', () => {
        it('should format 0.2 hours as "< 30m"', () => {
            expect(statsAggregator.formatPlaytime(0.2)).toBe('< 30m');
        });

        it('should format 0.5 hours as "30m"', () => {
            expect(statsAggregator.formatPlaytime(0.5)).toBe('30m');
        });

        it('should format 1.5 hours as "1h 30m"', () => {
            expect(statsAggregator.formatPlaytime(1.5)).toBe('1h 30m');
        });

        it('should format 5 hours as "5h"', () => {
            expect(statsAggregator.formatPlaytime(5)).toBe('5h');
        });

        it('should format 23.9 hours as "< 24h"', () => {
            expect(statsAggregator.formatPlaytime(23.9)).toBe('< 24h');
        });

        it('should format 48 hours as "2d"', () => {
            expect(statsAggregator.formatPlaytime(48)).toBe('2d');
        });

        it('should format 170 hours as "1w"', () => {
            expect(statsAggregator.formatPlaytime(170)).toBe('1w');
        });

        it('should format 200 hours as "1w 1d"', () => {
            expect(statsAggregator.formatPlaytime(200)).toBe('1w 1d');
        });
    });

    describe('formatMoney', () => {
        it('should format 999 as "$999"', () => {
            expect(statsAggregator.formatMoney(999)).toBe('$999');
        });

        it('should format 1000 as "$1.0K"', () => {
            expect(statsAggregator.formatMoney(1000)).toBe('$1.0K');
        });

        it('should format 999999 as "$1000.0K" (not "$1.0M")', () => {
            expect(statsAggregator.formatMoney(999999)).toBe('$1000.0K');
        });

        it('should format 1000000 as "$1.00M"', () => {
            expect(statsAggregator.formatMoney(1000000)).toBe('$1.00M');
        });

        it('should format 0 as "$0"', () => {
            expect(statsAggregator.formatMoney(0)).toBe('$0');
        });
    });
});