import { describe, it, expect, beforeEach } from 'vitest';
import { OfficeManager } from '../../src/js/game/OfficeManager.js';
import { ClientManager } from '../../src/js/game/ClientManager.js';
import { STAFF_TYPES, OFFICES, EQUIPMENT } from '../../src/js/data/tycoonData.js';

describe('OfficeManager cluster', () => {
    let gs, om;
    beforeEach(() => {
        gs = { money: 100000 };
        om = new OfficeManager(gs);
    });

    it('#102 getAvailableStaff filters per type by affordability and is empty when full', () => {
        gs.money = 700; // intern 100, junior 300, sales 700
        const ids = om.getAvailableStaff().map(s => s.id);
        expect(ids).toContain('intern');
        expect(ids).toContain('sales');
        expect(ids).not.toContain('data_scientist');
        gs.money = 100000;
        om.staff = Array.from({ length: OFFICES[0].capacity }, (_, i) => ({ id: 'x' + i, type: STAFF_TYPES[0] }));
        expect(om.getAvailableStaff()).toEqual([]);
    });

    it('#113 renderOfficeScene shows the equipment bonuses', () => {
        document.body.innerHTML = '<div id="office"></div>';
        om.equipmentLevels.computer = 1;
        om.renderOfficeScene('office');
        const html = document.getElementById('office').innerHTML;
        expect(html).toContain('office-bonuses');
        expect(html).toContain(`x${EQUIPMENT.computer.levels[1].speed.toFixed(2)}`);
    });

    it('#1803 renderOfficeScene uses the player name, not a missing gameState.character', () => {
        gs.playerName = 'Ada <b>';
        document.body.innerHTML = '<div id="office"></div>';
        om.renderOfficeScene('office');
        const avatar = document.querySelector('.character-avatar');
        expect(avatar.textContent).toBe('Ada <b>');
        expect(avatar.querySelector('b')).toBeNull();
    });

    it('#1802 #2228 fromJSON merges partial equipment levels and clamps indexes', () => {
        om.fromJSON({ equipmentLevels: { computer: 99, desk: -3 }, currentOfficeIndex: 42, activeMarketing: ['nope'] });
        expect(om.equipmentLevels.computer).toBe(EQUIPMENT.computer.levels.length - 1);
        expect(om.equipmentLevels.desk).toBe(0);
        expect(om.equipmentLevels.chair).toBe(0);
        expect(om.currentOfficeIndex).toBe(OFFICES.length - 1);
        expect(om.activeMarketing).toEqual([]);
        expect(() => om.getEquipmentBonuses()).not.toThrow();
        expect(() => om.getEquipmentDetails('software')).not.toThrow();
        expect(om.currentOffice).toBeTruthy();
    });

    it('#2229 hires in the same millisecond get distinct ids', () => {
        const realNow = Date.now;
        Date.now = () => 1234;
        try {
            om.currentOfficeIndex = OFFICES.length - 1;
            const a = om.hireStaff('intern');
            const b = om.hireStaff('intern');
            expect(a.success && b.success).toBe(true);
            expect(a.staff.id).not.toBe(b.staff.id);
        } finally {
            Date.now = realNow;
        }
    });

    it('#1798 getStaffBonuses sums project manager and sales bonuses', () => {
        om.currentOfficeIndex = OFFICES.length - 1;
        om.hireStaff('project_manager');
        om.hireStaff('sales');
        om.hireStaff('sales');
        const bonuses = om.getStaffBonuses();
        expect(bonuses.clientSatisfaction).toBeCloseTo(0.2);
        expect(bonuses.clientLeadsPerDay).toBe(2);
    });
});

describe('ClientManager job capacity (#2231)', () => {
    it('refuses jobs beyond base slots plus staff headcount', () => {
        const gs = { money: 0, officeManager: { staff: [] } };
        const cm = new ClientManager(gs);
        const make = (id) => ({ id, expiresAt: Date.now() + 60000, dataComplexity: 1, urgency: 'normal', clientType: { dataComplexity: 1 } });
        cm.pendingJobs = [make('a'), make('b'), make('c')];
        expect(cm.acceptJob('a')).toBeTruthy();
        expect(cm.acceptJob('b')).toBeTruthy();
        expect(cm.acceptJob('c')).toBeNull();
        expect(cm.lastAcceptError).toMatch(/capacity/);
        expect(cm.pendingJobs.map(j => j.id)).toEqual(['c']);
        gs.officeManager.staff.push({ id: 's1' });
        expect(cm.acceptJob('c')).toBeTruthy();
    });
});
