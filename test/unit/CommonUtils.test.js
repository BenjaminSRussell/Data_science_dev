const CommonUtils = require('../../src/js/utils/CommonUtils');

describe('CommonUtils numeric/formatting helpers', () => {
    describe('formatCurrency', () => {
        it('formats positive number correctly', () => {
            expect(CommonUtils.formatCurrency(1000)).toBe('$1,000');
        });

        it('formats negative number correctly', () => {
            expect(CommonUtils.formatCurrency(-500)).toBe('$500');
        });

        it('formats zero correctly', () => {
            expect(CommonUtils.formatCurrency(0)).toBe('$0');
        });

        it('formats number with cents correctly', () => {
            expect(CommonUtils.formatCurrency(1234.567)).toBe('$1,234.57');
        });

        it('formats number with no cents correctly', () => {
            expect(CommonUtils.formatCurrency(1000.00)).toBe('$1,000');
        });
    });

    describe('formatNumber', () => {
        it('formats positive number correctly', () => {
            expect(CommonUtils.formatNumber(1234567.89)).toBe('1,234,567.89');
        });

        it('formats negative number correctly', () => {
            expect(CommonUtils.formatNumber(-1234567.89)).toBe('-1,234,567.89');
        });

        it('formats zero correctly', () => {
            expect(CommonUtils.formatNumber(0)).toBe('0');
        });

        it('formats number with no decimal places correctly', () => {
            expect(CommonUtils.formatNumber(1000)).toBe('1,000');
        });

        it('formats number with one decimal place correctly', () => {
            expect(CommonUtils.formatNumber(1234.5)).toBe('1,234.5');
        });
    });

    describe('clamp', () => {
        it('clamps value within range', () => {
            expect(CommonUtils.clamp(5, 0, 10)).toBe(5);
        });

        it('clamps value below range', () => {
            expect(CommonUtils.clamp(-1, 0, 10)).toBe(0);
        });

        it('clamps value above range', () => {
            expect(CommonUtils.clamp(11, 0, 10)).toBe(10);
        });

        it('clamps value at lower bound', () => {
            expect(CommonUtils.clamp(0, 0, 10)).toBe(0);
        });

        it('clamps value at upper bound', () => {
            expect(CommonUtils.clamp(10, 0, 10)).toBe(10);
        });
    });

    describe('lerp', () => {
        it('linearly interpolates between two values', () => {
            expect(CommonUtils.lerp(0, 10, 0.5)).toBe(5);
        });

        it('interpolates to start value when t=0', () => {
            expect(CommonUtils.lerp(10, 20, 0)).toBe(10);
        });

        it('interpolates to end value when t=1', () => {
            expect(CommonUtils.lerp(10, 20, 1)).toBe(20);
        });

        it('interpolates correctly with negative values', () => {
            expect(CommonUtils.lerp(-10, 10, 0.5)).toBe(0);
        });

        it('interpolates correctly with equal values', () => {
            expect(CommonUtils.lerp(5, 5, 0.5)).toBe(5);
        });
    });

    describe('mapRange', () => {
        it('maps value from one range to another', () => {
            expect(CommonUtils.mapRange(5, 0, 10, 0, 100)).toBe(50);
        });

        it('handles equal input bounds', () => {
            expect(CommonUtils.mapRange(5, 5, 5, 0, 100)).toBeNaN();
        });

        it('maps value when input and output ranges are equal', () => {
            expect(CommonUtils.mapRange(5, 0, 10, 0, 10)).toBe(5);
        });

        it('maps value when input range is negative', () => {
            expect(CommonUtils.mapRange(-5, -10, 0, 0, 100)).toBe(50);
        });

        it('maps value when output range is negative', () => {
            expect(CommonUtils.mapRange(5, 0, 10, -100, 0)).toBe(-50);
        });
    });

    describe('randomInt', () => {
        it('returns integer within inclusive range', () => {
            for (let i = 0; i < 1000; i++) {
                const result = CommonUtils.randomInt(1, 5);
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(5);
            }
        });

        it('returns different results for different ranges', () => {
            expect(CommonUtils.randomInt(1, 5)).not.toBe(CommonUtils.randomInt(10, 15));
        });

        it('returns same result for same seed (mock implementation)', () => {
            const originalRandom = Math.random;
            Math.random = () => 0.5;
            expect(CommonUtils.randomInt(1, 5)).toBe(3);
            expect(CommonUtils.randomInt(1, 5)).toBe(3);
            Math.random = originalRandom;
        });
    });

    describe('formatDuration', () => {
        it('formats milliseconds correctly', () => {
            expect(CommonUtils.formatDuration(90000)).toBe('1m 30s');
        });

        it('formats seconds correctly', () => {
            expect(CommonUtils.formatDuration(65)).toBe('1m 5s');
        });

        it('formats minutes correctly', () => {
            expect(CommonUtils.formatDuration(3600)).toBe('1h');
        });

        it('formats hours correctly', () => {
            expect(CommonUtils.formatDuration(3601)).toBe('1h 1s');
        });

        it('formats days correctly', () => {
            expect(CommonUtils.formatDuration(90000)).toBe('1d 1h');
        });

        it('formats days and hours correctly', () => {
            expect(CommonUtils.formatDuration(90061)).toBe('1d 1h 1s');
        });

        it('drops smaller units when only two largest are non-zero', () => {
            expect(CommonUtils.formatDuration(3661)).toBe('1h 1s');
        });
    });

    describe('formatPercent', () => {
        it('formats percentage correctly', () => {
            expect(CommonUtils.formatPercent(0.75)).toBe('75.00%');
        });

        it('formats percentage with one decimal place', () => {
            expect(CommonUtils.formatPercent(0.1234, 1)).toBe('12.3%');
        });

        it('formats zero percentage correctly', () => {
            expect(CommonUtils.formatPercent(0)).toBe('0.00%');
        });

        it('formats one hundred percent correctly', () => {
            expect(CommonUtils.formatPercent(1)).toBe('100.00%');
        });

        it('formats negative percentage correctly', () => {
            expect(CommonUtils.formatPercent(-0.5)).toBe('-50.00%');
        });
    });

    describe('generateId', () => {
        it('generates unique ID with prefix', () => {
            const id1 = CommonUtils.generateId('test');
            const id2 = CommonUtils.generateId('test');
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
        });

        it('generates unique IDs with different prefixes', () => {
            const id1 = CommonUtils.generateId('prefix1');
            const id2 = CommonUtils.generateId('prefix2');
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^prefix1_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^prefix2_\d+_[a-z0-9]+$/);
        });

        it('generates ID with default prefix', () => {
            const id = CommonUtils.generateId();
            expect(id).toMatch(/^id_\d+_[a-z0-9]+$/);
        });

        it('generates IDs with different timestamps', () => {
            const id1 = CommonUtils.generateId('test');
            jest.advanceTimersByTime(1000);
            const id2 = CommonUtils.generateId('test');
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
        });

        it('generates IDs with different random parts', () => {
            const id1 = CommonUtils.generateId('test');
            const id2 = CommonUtils.generateId('test');
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
        });
    });
});