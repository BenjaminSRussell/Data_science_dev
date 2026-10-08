// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { HardwareManager, HARDWARE_PARTS, HARDWARE_TYPES } from '../../src/js/game/HardwareSystems.js';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';

const gs = (over = {}) => ({ money: 100000, rankIndex: 0, ...over });

describe('HardwareManager', () => {
    it('buyPart enforces unlockRank (#991)', () => {
        const hm = new HardwareManager(gs());
        const r = hm.buyPart(HARDWARE_TYPES.GPU, 'gpu_rtx4090');
        expect(r.success).toBe(false);
        expect(r.message).toMatch(/Requires/);
        hm.gameState.rankIndex = 5;
        expect(hm.buyPart(HARDWARE_TYPES.GPU, 'gpu_rtx4090').success).toBe(true);
    });

    it('rank 7-10 parts unlock at the final rank', () => {
        const hm = new HardwareManager(gs({ rankIndex: 6, money: 1e6 }));
        expect(hm.buyPart(HARDWARE_TYPES.GPU, 'gpu_pod').success).toBe(true);
    });

    it('aesthetics counts case/monitor aesthetics and cooler style (#1330)', () => {
        const hm = new HardwareManager(gs({ rankIndex: 6 }));
        hm.buyPart(HARDWARE_TYPES.CASE, 'glass_case');       // aesthetics 8
        hm.buyPart(HARDWARE_TYPES.COOLING, 'rgb_fan_pack');  // style 5
        expect(hm.getTotalStats().aesthetics).toBe(13);
    });

    it('aggregates every stat field (#2038)', () => {
        const hm = new HardwareManager(gs({ rankIndex: 6 }));
        hm.buyPart(HARDWARE_TYPES.GPU, 'gpu_rtx3060');
        hm.buyPart(HARDWARE_TYPES.CASE, 'quiet_case');
        hm.buyPart(HARDWARE_TYPES.MONITOR, 'lcd_27_144');
        const s = hm.getTotalStats();
        expect(s.vram).toBe(12);
        expect(s.noiseDampening).toBe(10);
        expect(s.refreshRate).toBe(144);
        expect(s.resolution).toBe(2);
        expect(s.powerDraw).toBe(65);
        expect(s.effectiveNoise).toBe(Math.max(0, s.noise - 10));
        const allKeys = new Set(Object.values(HARDWARE_PARTS).flat().flatMap(p => Object.keys(p.stats)));
        const covered = { noise_dampening: 'noiseDampening', power_draw: 'powerDraw', refresh_rate: 'refreshRate', style: 'aesthetics' };
        for (const k of allKeys) expect(s).toHaveProperty(covered[k] || k);
    });

    it('equipPart switches back to an owned part (#1331)', () => {
        const hm = new HardwareManager(gs({ rankIndex: 6 }));
        hm.buyPart(HARDWARE_TYPES.MONITOR, 'lcd_24');
        expect(hm.equippedParts.monitor).toBe('lcd_24');
        expect(hm.equipPart(HARDWARE_TYPES.MONITOR, 'crt_monitor').success).toBe(true);
        expect(hm.equippedParts.monitor).toBe('crt_monitor');
        expect(hm.equipPart(HARDWARE_TYPES.MONITOR, 'dual_4k').success).toBe(false);
    });

    it('fromJSON merges per type so a partial save cannot crash buyPart (#998)', () => {
        const hm = new HardwareManager(gs({ rankIndex: 6 }));
        hm.fromJSON({ ownedParts: { gpu: ['gpu_integrated', 'gpu_gt1030', 'bogus'] }, equippedParts: { gpu: 'gpu_gt1030', cpu: 'not_owned' } });
        expect(hm.ownedParts.gpu).toEqual(['gpu_integrated', 'gpu_gt1030']);
        expect(hm.equippedParts.gpu).toBe('gpu_gt1030');
        expect(hm.equippedParts.cpu).toBe('cpu_generic');
        expect(() => hm.buyPart(HARDWARE_TYPES.RAM, 'ram_8gb')).not.toThrow();
        expect(hm.ownedParts.ram).toContain('ram_8gb');
    });

    it('project work scales with the rig (#1686)', () => {
        const state = gs({ rankIndex: 6 });
        state.hardwareManager = new HardwareManager(state);
        const ps = new ProjectSystem(state);
        ps.activeProject = { stages: [{ name: 'a', maxProgress: 1000 }], currentStageIndex: 0, stageProgress: 0, totalProgress: 0 };
        ps.workOnProject?.(10);
        const base = ps.activeProject.stageProgress;
        expect(base).toBeGreaterThan(0);
        state.hardwareManager.buyPart(HARDWARE_TYPES.RAM, 'ram_128gb'); // 2.0 vs 0.8 stock: x2.2 (#1895)
        ps.activeProject.stageProgress = 0;
        ps.workOnProject?.(10);
        expect(ps.activeProject.stageProgress).toBeCloseTo(base * 2.2, 5);
    });
});

describe('office equipment UI', () => {
    it('shows locked upgrades with their rank and an equip select for owned parts', () => {
        document.body.innerHTML = '<div id="equipment-grid"></div>';
        const state = gs({ rankIndex: 0 });
        state.hardwareManager = new HardwareManager(state);
        state.hardwareManager.ownedParts.monitor.push('lcd_24');
        const ui = Object.create(UIUpdater.prototype);
        Object.defineProperty(ui, 'gameState', { get: () => state });
        ui.updateOfficeEquipment();
        const html = document.getElementById('equipment-grid').innerHTML;
        expect(html).toMatch(/requires/);
        expect(document.querySelector('.equipment-equip-select')).not.toBeNull();
    });
});
