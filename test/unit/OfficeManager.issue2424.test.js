/**
 * Unit tests for OfficeManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OfficeManager } from '../../src/js/game/OfficeManager.js';
import { STAFF_TYPES } from '../../src/js/data/tycoonData.js';

describe('OfficeManager', () => {
    let officeManager;
    let gameState;

    beforeEach(() => {
        gameState = {
            money: 10000
        };
        officeManager = new OfficeManager(gameState);
    });

    describe('Dead code removal - issue #2424', () => {
        it('should not have happiness field on hired staff', () => {
            const staffType = STAFF_TYPES[0];
            const result = officeManager.hireStaff(staffType.id);

            expect(result.success).toBe(true);
            expect(result.staff).toBeDefined();
            expect(result.staff.happiness).toBeUndefined();
        });

        it('should not have productivity field on hired staff', () => {
            const staffType = STAFF_TYPES[0];
            const result = officeManager.hireStaff(staffType.id);

            expect(result.success).toBe(true);
            expect(result.staff).toBeDefined();
            expect(result.staff.productivity).toBeUndefined();
        });

        it('should not have getTeamEfficiency method', () => {
            expect(typeof officeManager.getTeamEfficiency).toBe('undefined');
        });

        it('should not include happiness in serialized JSON', () => {
            const staffType = STAFF_TYPES[0];
            officeManager.hireStaff(staffType.id);

            const serialized = officeManager.toJSON();
            expect(serialized.staff).toHaveLength(1);
            expect(serialized.staff[0].happiness).toBeUndefined();
        });

        it('should not include productivity in serialized JSON', () => {
            const staffType = STAFF_TYPES[0];
            officeManager.hireStaff(staffType.id);

            const serialized = officeManager.toJSON();
            expect(serialized.staff).toHaveLength(1);
            expect(serialized.staff[0].productivity).toBeUndefined();
        });

        it('should handle deserialization of staff without happiness/productivity', () => {
            const staffType = STAFF_TYPES[0];
            officeManager.hireStaff(staffType.id);

            const serialized = officeManager.toJSON();

            // Create a new instance and load the data
            const newOfficeManager = new OfficeManager(gameState);
            newOfficeManager.fromJSON(serialized);

            expect(newOfficeManager.staff).toHaveLength(1);
            expect(newOfficeManager.staff[0].happiness).toBeUndefined();
            expect(newOfficeManager.staff[0].productivity).toBeUndefined();
        });
    });

    describe('Basic hiring functionality', () => {
        it('should hire staff successfully', () => {
            const staffType = STAFF_TYPES[0];
            const initialMoney = gameState.money;
            const result = officeManager.hireStaff(staffType.id);

            expect(result.success).toBe(true);
            expect(result.staff).toBeDefined();
            expect(result.staff.id).toBeDefined();
            expect(result.staff.type).toBe(staffType);
            expect(gameState.money).toBeLessThan(initialMoney);
        });

        it('should fire staff successfully', () => {
            const staffType = STAFF_TYPES[0];
            const hireResult = officeManager.hireStaff(staffType.id);
            const staffId = hireResult.staff.id;

            const fireResult = officeManager.fireStaff(staffId);
            expect(fireResult.success).toBe(true);
            expect(fireResult.staff.id).toBe(staffId);
            expect(officeManager.staff).toHaveLength(0);
        });

        it('should restore staff correctly after serialization', () => {
            const staffType = STAFF_TYPES[0];
            officeManager.hireStaff(staffType.id);

            const serialized = officeManager.toJSON();

            const newOfficeManager = new OfficeManager(gameState);
            newOfficeManager.fromJSON(serialized);

            expect(newOfficeManager.staff).toHaveLength(1);
            expect(newOfficeManager.staff[0].type.id).toBe(staffType.id);
        });
    });
});
