/**
 * CompanyManagementSystem money flow and lifecycle rules
 * (#278 #218 #1739 #1011 #2044 #1007 #1402 #1397 #1398 #1009 #1403 #1400 #1401 #2043 #1741)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyManagementSystem } from '../../src/js/game/company/CompanyManagementSystem.js';

describe('CompanyManagementSystem money flow', () => {
    let gs;
    let cms;

    beforeEach(() => {
        gs = { money: 10000, timeManager: { totalDays: 10 }, economySystem: {} };
        cms = new CompanyManagementSystem(gs);
    });

    describe('buyCompany', () => {
        it('deducts the price from gameState.money', () => {
            const r = cms.buyCompany('acme', 4000);
            expect(r.success).toBe(true);
            expect(gs.money).toBe(6000);
            expect(cms.playerCompany.id).toBe('acme');
            expect(gs.economySystem.money).toBeUndefined();
        });

        it('rejects when the player cannot afford it', () => {
            const r = cms.buyCompany('acme', 20000);
            expect(r.success).toBe(false);
            expect(gs.money).toBe(10000);
            expect(cms.playerCompany).toBeNull();
        });

        it('rejects invalid prices', () => {
            expect(cms.buyCompany('acme', -5).success).toBe(false);
            expect(cms.buyCompany('acme', 'abc').success).toBe(false);
            expect(gs.money).toBe(10000);
        });

        it('refuses a second company instead of orphaning the first', () => {
            cms.startCompany('Mine');
            const r = cms.buyCompany('acme', 100);
            expect(r.success).toBe(false);
            expect(cms.playerCompany.name).toBe('Mine');
            expect(gs.money).toBe(10000);
            expect(cms.startCompany('Another')).toBeNull();
        });
    });

    describe('hireEmployee', () => {
        beforeEach(() => cms.startCompany('Mine'));

        it('charges the first salary', () => {
            const r = cms.hireEmployee({ name: 'Ann', skills: { programming: 2 }, experience: 2 });
            expect(r.success).toBe(true);
            expect(r.employee.salary).toBe(500 + 200 + 100);
            expect(gs.money).toBe(10000 - 800);
            expect(cms.playerCompany.employees).toContain(r.employee.id);
        });

        it('rejects when salary is unaffordable and charges nothing', () => {
            gs.money = 100;
            const r = cms.hireEmployee({ name: 'Ann', skills: {}, experience: 0 });
            expect(r.success).toBe(false);
            expect(gs.money).toBe(100);
            expect(cms.employees).toHaveLength(0);
        });

        it('requires a company', () => {
            const fresh = new CompanyManagementSystem(gs);
            expect(fresh.hireEmployee({ name: 'Ann' }).success).toBe(false);
        });

        it('treats missing experience as 0 instead of NaN', () => {
            expect(cms.calculateSalary({ name: 'X', skills: {} })).toBe(500);
            gs.money = 10;
            expect(cms.hireEmployee({ name: 'X', skills: {} }).success).toBe(false);
        });

        it('gives zero-skill hires a productivity floor', () => {
            const r = cms.hireEmployee({ name: 'Zed', skills: {}, experience: 0 });
            expect(r.employee.productivity).toBe(CompanyManagementSystem.MIN_PRODUCTIVITY);
        });

        it('caps headcount', () => {
            gs.money = 1e9;
            for (let i = 0; i < CompanyManagementSystem.MAX_EMPLOYEES; i++) {
                expect(cms.hireEmployee({ name: `E${i}`, skills: {} }).success).toBe(true);
            }
            expect(cms.hireEmployee({ name: 'Extra', skills: {} }).success).toBe(false);
        });
    });

    describe('clients, meetings and projects', () => {
        it('acquireClient needs a company', () => {
            expect(cms.acquireClient('TechCorp').success).toBe(false);
            expect(cms.clients).toHaveLength(0);
        });

        it('acquires by id, records it on the company, and blocks duplicates', () => {
            cms.startCompany('Mine');
            const leads = cms.findClients();
            const r = cms.acquireClient(leads[1].id);
            expect(r.success).toBe(true);
            expect(r.client.id).toBe('client_retailco');
            expect(cms.playerCompany.clients).toEqual(['client_retailco']);
            expect(cms.acquireClient('RetailCo').success).toBe(false);
            expect(cms.clients).toHaveLength(1);
        });

        it('stores scheduled meetings and saves them', () => {
            cms.scheduleMeeting('client_techcorp', 'cafe', '10:00');
            expect(cms.meetings).toHaveLength(1);
            const restored = new CompanyManagementSystem(gs);
            restored.fromJSON(JSON.parse(JSON.stringify(cms.toJSON())));
            expect(restored.meetings).toHaveLength(1);
        });

        it('does not overwrite an in-progress task without force', () => {
            cms.startCompany('Mine');
            const emp = cms.hireEmployee({ name: 'Ann', skills: {} }).employee;
            cms.assignTask(emp.id, { id: 't1', name: 'First', difficulty: 50 });
            const r = cms.assignTask(emp.id, { id: 't2', name: 'Second', difficulty: 5 });
            expect(r.success).toBe(false);
            expect(emp.currentTask.id).toBe('t1');
            expect(cms.assignTask(emp.id, { id: 't2', name: 'Second' }, { force: true }).success).toBe(true);
            expect(emp.currentTask.id).toBe('t2');
        });

        it('allows reassignment once the task is complete', () => {
            cms.startCompany('Mine');
            const emp = cms.hireEmployee({ name: 'Ann', skills: {} }).employee;
            cms.assignTask(emp.id, { id: 't1', name: 'First', difficulty: 1 });
            gs.timeManager.totalDays = 100;
            expect(cms.assignTask(emp.id, { id: 't2', name: 'Second', difficulty: 1 }).success).toBe(true);
        });

        it('client tasks create company projects', () => {
            cms.startCompany('Mine');
            cms.acquireClient('TechCorp');
            const emp = cms.hireEmployee({ name: 'Ann', skills: {} }).employee;
            cms.assignTask(emp.id, { id: 't1', name: 'Dashboard', difficulty: 5, clientId: 'client_techcorp' });
            expect(cms.projects).toHaveLength(1);
            expect(cms.playerCompany.projects).toEqual([cms.projects[0].id]);
            expect(cms.clients[0].projects).toEqual([cms.projects[0].id]);
        });
    });

    describe('satisfaction and processWeek', () => {
        it('satisfaction scales work progress', () => {
            cms.startCompany('Mine');
            const emp = cms.hireEmployee({ name: 'Ann', skills: {} }).employee;
            emp.productivity = 20;
            cms.assignTask(emp.id, { id: 't1', name: 'T', difficulty: 10 });
            gs.timeManager.totalDays = 12;
            emp.satisfaction = 50;
            expect(cms.getEmployeeWorkStatus(emp.id).progress).toBeCloseTo(4);
            emp.satisfaction = 100;
            expect(cms.getEmployeeWorkStatus(emp.id).progress).toBeCloseTo(6);
            emp.satisfaction = 0;
            expect(cms.getEmployeeWorkStatus(emp.id).progress).toBeCloseTo(2);
        });

        it('is a no-op without a company', () => {
            expect(cms.processWeek()).toEqual({ payroll: 0, revenue: 0, lostClients: [] });
            expect(gs.money).toBe(10000);
        });

        it('pays payroll and collects retainers', () => {
            cms.startCompany('Mine');
            const emp = cms.hireEmployee({ name: 'Ann', skills: {} }).employee; // 500
            cms.acquireClient('TechCorp'); // budget 5000
            cms.assignTask(emp.id, { id: 't1', name: 'T', difficulty: 5, clientId: 'client_techcorp' });
            const before = gs.money;
            const week = cms.processWeek();
            expect(week.payroll).toBe(500);
            // satisfaction 50 -> 55 with an active project; 5000/4 * 0.55
            expect(week.revenue).toBe(Math.round(1250 * 0.55));
            expect(gs.money).toBe(before - 500 + week.revenue);
            expect(emp.satisfaction).toBe(52);
        });

        it('neglected clients eventually leave and idle staff lose satisfaction', () => {
            cms.startCompany('Mine');
            const emp = cms.hireEmployee({ name: 'Ann', skills: {} }).employee;
            cms.acquireClient('TechCorp');
            let lost = [];
            for (let i = 0; i < 5; i++) lost = lost.concat(cms.processWeek().lostClients);
            expect(lost).toEqual(['TechCorp']);
            expect(cms.clients).toHaveLength(0);
            expect(cms.playerCompany.clients).toHaveLength(0);
            expect(emp.satisfaction).toBe(25);
        });
    });
});
