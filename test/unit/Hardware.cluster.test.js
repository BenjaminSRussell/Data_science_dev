import { describe, it, expect, beforeEach } from 'vitest';
import {
    HardwareManager, HARDWARE_TYPES, HARDWARE_PARTS,
    THERMAL_BASE_WATTS, THERMAL_WATTS_PER_COOLING, OVERHEAT_PRODUCTIVITY_PENALTY
} from '../../src/js/game/HardwareSystems.js';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';

describe('hardware cluster', () => {
    let gs, hm;
    beforeEach(() => { gs = { money: 1e6, rankIndex: 10 }; hm = new HardwareManager(gs); });

    it('#1895 RAM, storage and monitor upgrades all raise productivity', () => {
        expect(hm.getTotalStats().productivity).toBeCloseTo(1.0);
        hm.buyPart(HARDWARE_TYPES.MONITOR, 'dual_24'); // +0.5
        const afterMonitor = hm.getTotalStats().productivity;
        hm.buyPart(HARDWARE_TYPES.RAM, 'ram_16gb'); // +0.4 over 0.8 stock
        const afterRam = hm.getTotalStats().productivity;
        hm.buyPart(HARDWARE_TYPES.STORAGE, 'ssd_nvme_1tb'); // +0.4 over 0.9 stock
        const afterStorage = hm.getTotalStats().productivity;
        expect(afterMonitor).toBeCloseTo(1.5);
        expect(afterRam).toBeCloseTo(1.9);
        expect(afterStorage).toBeCloseTo(2.3);
    });

    it('#1896 CPU power draw beyond the cooling budget overheats and slows work', () => {
        hm.buyPart(HARDWARE_TYPES.CPU, 'cpu_i9'); // 200W vs stock cooler budget
        const hot = hm.getTotalStats();
        expect(hot.thermalBudget).toBe(THERMAL_BASE_WATTS + 1 * THERMAL_WATTS_PER_COOLING);
        expect(hot.overheating).toBe(true);
        expect(hot.productivity).toBeCloseTo(1 - OVERHEAT_PRODUCTIVITY_PENALTY);
        hm.buyPart(HARDWARE_TYPES.COOLING, 'custom_loop_soft'); // cooling 12
        const cool = hm.getTotalStats();
        expect(cool.overheating).toBe(false);
        expect(cool.productivity).toBeCloseTo(1.0);
    });

    it('#1894 #1000 no part is strictly worse and cheaper than an earlier-rank part', () => {
        for (const [type, parts] of Object.entries(HARDWARE_PARTS)) {
            for (let i = 0; i < parts.length; i++) {
                for (let j = 0; j < parts.length; j++) {
                    const a = parts[i], b = parts[j];
                    if (!(b.unlockRank > a.unlockRank)) continue;
                    const keys = new Set([...Object.keys(a.stats), ...Object.keys(b.stats)]);
                    // noise is a cost, lower is better
                    const better = (k) => k === 'noise' ? (a.stats[k] ?? 0) <= (b.stats[k] ?? 0) : (a.stats[k] ?? 0) >= (b.stats[k] ?? 0);
                    const dominated = [...keys].every(better) && a.price <= b.price;
                    expect(dominated, `${type}: ${b.id} is dominated by ${a.id}`).toBe(false);
                }
            }
        }
    });

    it('#995 the equipment shop lists all seven hardware categories plus a power readout', () => {
        document.body.innerHTML = '<div id="equipment-grid"></div>';
        const ui = Object.create(UIUpdater.prototype);
        Object.defineProperty(ui, 'gameState', { get: () => ({ ...gs, hardwareManager: hm }) });
        ui.updateOfficeEquipment();
        const cards = [...document.querySelectorAll('.equipment-card')].map(c => c.dataset.type);
        expect(cards.sort()).toEqual(Object.values(HARDWARE_TYPES).sort());
        expect(document.querySelector('.equipment-thermal').textContent).toMatch(/Power: \d+W/);
    });
});
