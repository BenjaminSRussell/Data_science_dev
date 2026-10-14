import { describe, it, expect } from 'vitest';
import { OFFICES, STAFF_TYPES } from '../../src/js/data/tycoonData.js';

/**
 * Canonical office and staff tables. OfficeManager itself is unwired and removed;
 * these tables stay because the live office screen still reads OFFICES.
 */
describe('tycoon office data', () => {
    it('should match doc spec: Office Locations progression', () => {
        const expectedOffices = [
            { name: 'Bedroom Corner', price: 0, capacity: 1, clientBonus: 0 },
            { name: 'Home Office', price: 2000, capacity: 1, clientBonus: 0.1 },
            { name: 'Co-working Space', price: 5000, capacity: 2, clientBonus: 0.2 },
            { name: 'Small Office', price: 15000, capacity: 4, clientBonus: 0.35 },
            { name: 'Office Floor', price: 50000, capacity: 10, clientBonus: 0.5 },
            { name: 'Company HQ', price: 200000, capacity: 25, clientBonus: 0.75 }
        ];

        expect(OFFICES.length).toBe(expectedOffices.length);
        expect(OFFICES[0].id).toBe('bedroom');
        expect(OFFICES[OFFICES.length - 1].id).toBe('headquarters');
        OFFICES.forEach((office, i) => {
            expect(office.name).toBe(expectedOffices[i].name);
            expect(office.price).toBe(expectedOffices[i].price);
            expect(office.capacity).toBe(expectedOffices[i].capacity);
            expect(office.clientBonus).toBe(expectedOffices[i].clientBonus);
        });
    });

    it('should match doc spec: Manage Staff hiring menu', () => {
        const expectedStaff = [
            { name: 'Intern', baseSalary: 50 },
            { name: 'Junior Analyst', baseSalary: 150 },
            { name: 'Data Analyst', baseSalary: 300 },
            { name: 'Senior Analyst', baseSalary: 500 },
            { name: 'Data Scientist', baseSalary: 800 },
            { name: 'Project Manager', baseSalary: 400 },
            { name: 'Sales Rep', baseSalary: 350 }
        ];

        expect(STAFF_TYPES.length).toBe(expectedStaff.length);
        expect(STAFF_TYPES[0].name).toBe('Intern');
        expect(STAFF_TYPES[STAFF_TYPES.length - 1].name).toBe('Sales Rep');
        STAFF_TYPES.forEach((staff, i) => {
            expect(staff.name).toBe(expectedStaff[i].name);
            expect(staff.baseSalary).toBe(expectedStaff[i].baseSalary);
        });
    });
});
