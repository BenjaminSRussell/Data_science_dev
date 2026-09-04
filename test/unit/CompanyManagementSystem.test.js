/**
 * Unit tests for CompanyManagementSystem
 * Covers the non-money operational methods: startCompany, assignTask,
 * getEmployeeWorkStatus, findClients, acquireClient, scheduleMeeting,
 * attendEvent.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyManagementSystem } from '../../src/js/game/company/CompanyManagementSystem.js';

describe('CompanyManagementSystem', () => {
    let cms;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: { totalDays: 10 },
            economySystem: { money: 10000 }
        };
        cms = new CompanyManagementSystem(mockGameState);
    });

    describe('startCompany', () => {
        it('should return an object with a generated id', () => {
            const company = cms.startCompany('My Company');
            expect(company).toBeDefined();
            expect(company.id).toBeDefined();
            expect(company.id).toContain('player_company_');
        });

        it('should store the company as this.playerCompany', () => {
            const company = cms.startCompany('My Company');
            expect(cms.playerCompany).toBe(company);
        });

        it('should default type to consulting when omitted', () => {
            const company = cms.startCompany('My Company');
            expect(company.type).toBe('consulting');
        });

        it('should use the provided type when given', () => {
            const company = cms.startCompany('My Company', 'trading');
            expect(company.type).toBe('trading');
        });

        it('should use the current totalDays as founded date', () => {
            mockGameState.timeManager.totalDays = 42;
            const company = cms.startCompany('My Company');
            expect(company.founded).toBe(42);
        });

        it('should fall back to day 1 when timeManager is undefined', () => {
            mockGameState.timeManager = undefined;
            const company = cms.startCompany('My Company');
            expect(company.founded).toBe(1);
        });
    });

    describe('assignTask', () => {
        let employee;

        beforeEach(() => {
            cms.startCompany('My Company');
            employee = {
                id: 'emp_1',
                name: 'Alice',
                skills: {},
                experience: 0,
                salary: 500,
                hired: 1,
                productivity: 50,
                currentTask: null,
                satisfaction: 50
            };
            cms.employees.push(employee);
        });

        it('should return success false for an unknown employeeId', () => {
            const result = cms.assignTask('nonexistent', { id: 't1', name: 'Task' });
            expect(result.success).toBe(false);
        });

        it('should set employee.currentTask with progress 0 for a known employee', () => {
            const task = { id: 't1', name: 'Analyze Data', type: 'analysis', difficulty: 5, deadline: 20 };
            const result = cms.assignTask('emp_1', task);
            expect(result.success).toBe(true);
            expect(employee.currentTask).toBeDefined();
            expect(employee.currentTask.id).toBe('t1');
            expect(employee.currentTask.name).toBe('Analyze Data');
            expect(employee.currentTask.progress).toBe(0);
        });

        it('should set the assigned day from gameState.timeManager.totalDays', () => {
            mockGameState.timeManager.totalDays = 15;
            const task = { id: 't1', name: 'Analyze Data', type: 'analysis', difficulty: 5, deadline: 20 };
            cms.assignTask('emp_1', task);
            expect(employee.currentTask.assigned).toBe(15);
        });

        it('should fall back to day 1 when timeManager is undefined', () => {
            mockGameState.timeManager = undefined;
            const task = { id: 't1', name: 'Analyze Data', type: 'analysis', difficulty: 5, deadline: 20 };
            cms.assignTask('emp_1', task);
            expect(employee.currentTask.assigned).toBe(1);
        });
    });

    describe('getEmployeeWorkStatus', () => {
        let employee;

        beforeEach(() => {
            cms.startCompany('My Company');
            employee = {
                id: 'emp_1',
                name: 'Alice',
                skills: {},
                experience: 0,
                salary: 500,
                hired: 1,
                productivity: 50,
                currentTask: null,
                satisfaction: 50
            };
            cms.employees.push(employee);
        });

        it('should return null for an unknown employeeId', () => {
            expect(cms.getEmployeeWorkStatus('nonexistent')).toBeNull();
        });

        it('should return status idle when the employee has no task', () => {
            const status = cms.getEmployeeWorkStatus('emp_1');
            expect(status.status).toBe('idle');
        });

        it('should compute progress from (daysWorking / difficulty) * productivity', () => {
            mockGameState.timeManager.totalDays = 15;
            employee.currentTask = {
                id: 't1',
                name: 'Analyze Data',
                type: 'analysis',
                difficulty: 5,
                deadline: 20,
                progress: 0,
                assigned: 10
            };
            // daysWorking = 15 - 10 = 5; progress = (5/5) * 50 = 50
            const status = cms.getEmployeeWorkStatus('emp_1');
            expect(status.status).toBe('working');
            expect(status.progress).toBe(50);
        });

        it('should cap progress at 100', () => {
            mockGameState.timeManager.totalDays = 100;
            employee.currentTask = {
                id: 't1',
                name: 'Analyze Data',
                type: 'analysis',
                difficulty: 1,
                deadline: 20,
                progress: 0,
                assigned: 1
            };
            // daysWorking = 99; progress = (99/1) * 50 = 4950 -> capped at 100
            const status = cms.getEmployeeWorkStatus('emp_1');
            expect(status.progress).toBe(100);
        });

        it('should fall back to day 1 when timeManager is undefined', () => {
            mockGameState.timeManager = undefined;
            employee.currentTask = {
                id: 't1',
                name: 'Analyze Data',
                type: 'analysis',
                difficulty: 5,
                deadline: 20,
                progress: 0,
                assigned: 1
            };
            // daysWorking = 1 - 1 = 0; progress = 0
            const status = cms.getEmployeeWorkStatus('emp_1');
            expect(status.progress).toBe(0);
        });
    });

    describe('findClients', () => {
        it('should return the fixed 4-entry hardcoded list', () => {
            const clients = cms.findClients();
            expect(clients).toHaveLength(4);
            expect(clients).toEqual([
                { name: 'TechCorp', needs: 'data_analysis', budget: 5000 },
                { name: 'RetailCo', needs: 'visualization', budget: 3000 },
                { name: 'FinanceInc', needs: 'machine_learning', budget: 8000 },
                { name: 'StartupXYZ', needs: 'statistics', budget: 2000 }
            ]);
        });

        it('should return the same list regardless of state', () => {
            const first = cms.findClients();
            cms.clients.push({ name: 'Existing' });
            const second = cms.findClients();
            expect(second).toEqual(first);
        });
    });

    describe('acquireClient', () => {
        it('should return success true and push a client when matched by name', () => {
            const result = cms.acquireClient('TechCorp');
            expect(result.success).toBe(true);
            expect(result.client.name).toBe('TechCorp');
            expect(cms.clients).toHaveLength(1);
            expect(cms.clients[0].name).toBe('TechCorp');
            expect(cms.clients[0].needs).toBe('data_analysis');
            expect(cms.clients[0].budget).toBe(5000);
            expect(cms.clients[0].satisfaction).toBe(50);
        });

        it('should return success false for an unknown client', () => {
            const result = cms.acquireClient('NonExistentCorp');
            expect(result.success).toBe(false);
            expect(cms.clients).toHaveLength(0);
        });
    });

    describe('scheduleMeeting', () => {
        it('should return a well-formed meeting object with status scheduled', () => {
            const meeting = cms.scheduleMeeting('TechCorp', 'coffee_shop', '10:00');
            expect(meeting.id).toContain('meeting_');
            expect(meeting.clientId).toBe('TechCorp');
            expect(meeting.location).toBe('coffee_shop');
            expect(meeting.time).toBe('10:00');
            expect(meeting.type).toBe('client_meeting');
            expect(meeting.status).toBe('scheduled');
        });
    });

    describe('attendEvent', () => {
        it('should return null for an unknown eventId', () => {
            expect(cms.attendEvent('nonexistent')).toBeNull();
        });

        it('should return the contacts payload for networking', () => {
            const result = cms.attendEvent('networking');
            expect(result.event.id).toBe('networking');
            expect(result.result.contacts).toBe(3);
            expect(result.result.message).toBe('You made new contacts');
        });

        it('should return the skills payload for conference', () => {
            const result = cms.attendEvent('conference');
            expect(result.event.id).toBe('conference');
            expect(result.result.skills).toBe(5);
            expect(result.result.message).toBe('You learned new skills');
        });

        it('should return the skills payload for workshop', () => {
            const result = cms.attendEvent('workshop');
            expect(result.event.id).toBe('workshop');
            expect(result.result.skills).toBe(5);
            expect(result.result.message).toBe('You learned new skills');
        });

        it('should return the contacts payload for meetup', () => {
            const result = cms.attendEvent('meetup');
            expect(result.event.id).toBe('meetup');
            expect(result.result.contacts).toBe(3);
            expect(result.result.message).toBe('You made new contacts');
        });
    });
});
