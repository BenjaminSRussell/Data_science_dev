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

import { CLIENT_TYPES, MARKETING_CHANNELS } from '../../src/js/data/tycoonData.js';

describe('tycoon data wiring', () => {
    it('#1799 hiring cost is an explicit number of daily salaries', () => {
        expect(OfficeManager.HIRING_COST_DAYS).toBe(2);
        expect(OfficeManager.hiringCost({ baseSalary: 300 })).toBe(600);
    });

    it('#2230 client patience scales the accept window', () => {
        const cm = new ClientManager({ rankIndex: 10 });
        const realRandom = Math.random;
        Math.random = () => 0; // urgency = relaxed (300s)
        try {
            const patient = cm.generateJob({ ...CLIENT_TYPES[0], patience: 1.0 });
            const impatient = cm.generateJob({ ...CLIENT_TYPES[0], patience: 0.5 });
            const pw = patient.expiresAt - patient.createdAt;
            const iw = impatient.expiresAt - impatient.createdAt;
            expect(pw).toBeGreaterThanOrEqual(299000);
            expect(iw).toBeLessThan(pw * 0.6);
        } finally {
            Math.random = realRandom;
        }
    });

    it('#154 #1968 enterprise sales leads pay more than conference leads', () => {
        const ent = MARKETING_CHANNELS.find(m => m.id === 'enterprise_sales');
        const conf = MARKETING_CHANNELS.find(m => m.id === 'conference');
        expect(ent.payMultiplier).toBeGreaterThan(1);
        // Pay-weighted leads per day now beat conference
        expect(ent.leadsPerDay * ent.payMultiplier).toBeGreaterThan(conf.leadsPerDay);
        const cm = new ClientManager({ rankIndex: 10 });
        const realRandom = Math.random;
        Math.random = () => 0.5;
        try {
            const plain = cm.generateJob(CLIENT_TYPES[0], conf);
            const premium = cm.generateJob(CLIENT_TYPES[0], ent);
            expect(premium.payment).toBeGreaterThan(plain.payment);
            expect(premium.source).toBe('enterprise_sales');
        } finally {
            Math.random = realRandom;
        }
        expect(cm.pickLeadChannel([conf, ent], 0.1).id).toBe('conference');
        expect(cm.pickLeadChannel([conf, ent], 0.9).id).toBe('enterprise_sales');
        expect(cm.pickLeadChannel([], 0.5)).toBeNull();
    });

    it('#2328 only data-skilled staff add job capacity; team skills are exposed', () => {
        const om = new OfficeManager({ money: 100000 });
        om.currentOfficeIndex = OFFICES.length - 1;
        om.hireStaff('sales');
        om.hireStaff('analyst');
        const cm = new ClientManager({ officeManager: om });
        expect(cm.getJobCapacity()).toBe(ClientManager.BASE_JOB_SLOTS + 1);
        expect(om.getTeamSkills()).toEqual(expect.arrayContaining(['sales', 'advanced_charts']));
    });
});
