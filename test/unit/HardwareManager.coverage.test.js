/**
 * HardwareManager purchasing and stat aggregation (#402)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { HardwareManager, HARDWARE_TYPES, HARDWARE_PARTS } from '../../src/js/game/HardwareSystems.js';

describe('HardwareManager coverage', () => {
    let gs, hw;
    beforeEach(() => { gs = { money: 100000, rankIndex: 10 }; hw = new HardwareManager(gs); });

    it('productivity sums each category\'s gain over its stock part (#1895)', () => {
        hw.buyPart(HARDWARE_TYPES.RAM, 'ram_16gb'); // 1.2 vs 0.8 stock: +0.4
        hw.buyPart(HARDWARE_TYPES.MONITOR, 'dual_24'); // 1.5 vs 1.0: +0.5
        expect(hw.getTotalStats().productivity).toBeCloseTo(1.9);
        hw.equipPart(HARDWARE_TYPES.MONITOR, 'crt_monitor');
        expect(hw.getTotalStats().productivity).toBeCloseTo(1.4);
    });

    it('compute and power draw add up across part types', () => {
        hw.buyPart(HARDWARE_TYPES.CPU, 'cpu_i5'); // compute 10, power 95
        hw.buyPart(HARDWARE_TYPES.RAM, 'ram_64gb'); // compute 2
        const expected = Object.entries(hw.equippedParts)
            .map(([t, id]) => HARDWARE_PARTS[t].find(p => p.id === id).stats)
            .reduce((acc, s) => ({ compute: acc.compute + (s.compute || 0), power: acc.power + (s.power_draw || 0) }), { compute: 0, power: 0 });
        const stats = hw.getTotalStats();
        expect(stats.compute).toBe(expected.compute);
        expect(stats.powerDraw).toBe(expected.power);
        expect(stats.compute).toBeGreaterThanOrEqual(12);
    });

    it('"Already owned" is reported before the money check', () => {
        gs.money = 0;
        expect(hw.buyPart(HARDWARE_TYPES.CPU, 'cpu_generic')).toEqual({ success: false, message: 'Already owned' });
    });

    it('unknown part and unknown type', () => {
        expect(hw.buyPart(HARDWARE_TYPES.CPU, 'nonexistent_id').message).toBe('Part not found');
        expect(hw.buyPart('toaster', 'x').message).toBe('Unknown hardware type');
    });

    it('insufficient money leaves everything unchanged', () => {
        gs.money = 10;
        const before = JSON.stringify(hw.toJSON());
        expect(hw.buyPart(HARDWARE_TYPES.CPU, 'cpu_i3').message).toBe('Not enough money');
        expect(gs.money).toBe(10);
        expect(JSON.stringify(hw.toJSON())).toBe(before);
    });

    it('success deducts the price, records ownership and auto-equips', () => {
        const r = hw.buyPart(HARDWARE_TYPES.CPU, 'cpu_i3');
        expect(r.success).toBe(true);
        expect(gs.money).toBe(100000 - 120);
        expect(gs.totalSpent).toBe(120);
        expect(hw.ownedParts.cpu).toContain('cpu_i3');
        expect(hw.equippedParts.cpu).toBe('cpu_i3');
    });

    it('equipPart requires ownership and swaps the equipped part', () => {
        expect(hw.equipPart(HARDWARE_TYPES.CPU, 'cpu_i7')).toEqual({ success: false, message: 'Part not owned' });
        hw.buyPart(HARDWARE_TYPES.CPU, 'cpu_i7');
        expect(hw.equipPart(HARDWARE_TYPES.CPU, 'cpu_generic').success).toBe(true);
        expect(hw.equippedParts.cpu).toBe('cpu_generic');
    });

    it('toJSON/fromJSON round-trip', () => {
        hw.buyPart(HARDWARE_TYPES.GPU, HARDWARE_PARTS.gpu[1].id);
        hw.buyPart(HARDWARE_TYPES.MONITOR, 'lcd_24');
        const restored = new HardwareManager(gs);
        restored.fromJSON(JSON.parse(JSON.stringify(hw.toJSON())));
        expect(restored.ownedParts).toEqual(hw.ownedParts);
        expect(restored.equippedParts).toEqual(hw.equippedParts);
        expect(restored.getTotalStats()).toEqual(hw.getTotalStats());
    });
});
