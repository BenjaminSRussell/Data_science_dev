import { describe, it, expect, vi, afterEach } from 'vitest';
import { CommonUtils as C } from '../../src/js/utils/CommonUtils.js';

describe('CommonUtils numeric/formatting helpers (#475)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('formatCurrency uses a $ prefix, locale grouping and a null guard', () => {
        expect(C.formatCurrency(1234)).toBe(`$${(1234).toLocaleString()}`);
        expect(C.formatCurrency(5, '€')).toBe('€5');
        expect(C.formatCurrency(null)).toBe('$0');
        expect(C.formatCurrency(undefined)).toBe('$0');
    });

    it('formatNumber delegates to toLocaleString', () => {
        expect(C.formatNumber(1234567)).toBe((1234567).toLocaleString());
    });

    it('clamp / lerp / mapRange', () => {
        expect(C.clamp(5, 0, 10)).toBe(5);
        expect(C.clamp(-3, 0, 10)).toBe(0);
        expect(C.clamp(99, 0, 10)).toBe(10);
        expect(C.lerp(0, 10, 0)).toBe(0);
        expect(C.lerp(0, 10, 0.5)).toBe(5);
        expect(C.lerp(0, 10, 1)).toBe(10);
        expect(C.mapRange(5, 0, 10, 0, 100)).toBe(50);
        expect(C.mapRange(0, 0, 10, 100, 200)).toBe(100);
    });

    it('randomInt is inclusive of both bounds', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(C.randomInt(3, 7)).toBe(3);
        Math.random.mockReturnValue(0.9999);
        expect(C.randomInt(3, 7)).toBe(7);
    });

    it('formatDuration picks the two largest units', () => {
        expect(C.formatDuration(5000)).toBe('5s');
        expect(C.formatDuration(65000)).toBe('1m 5s');
        expect(C.formatDuration(3_660_000)).toBe('1h 1m');
        expect(C.formatDuration(90_000_000)).toBe('1d 1h');
    });

    it('formatPercent multiplies by 100 with fixed decimals', () => {
        expect(C.formatPercent(0.5)).toBe('50%');
        expect(C.formatPercent(0.1234, 1)).toBe('12.3%');
    });

    it('generateId uses the prefix and is unique', () => {
        const a = C.generateId('npc');
        const b = C.generateId('npc');
        expect(a).toMatch(/^npc_\d+_[a-z0-9]+$/);
        expect(a).not.toBe(b);
        expect(C.generateId()).toMatch(/^id_/);
    });
});
