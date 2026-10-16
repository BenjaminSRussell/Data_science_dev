/**
 * RomanceSystem family mechanics: housing ladder and children (#1078)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';

describe('RomanceSystem family mechanics', () => {
    let gs, rs;
    beforeEach(() => {
        gs = {
            money: 1000000,
            characterStats: { ethics: 0, getStat: () => 50 },
            npcManager: { getNPC: () => null, getRelationship: () => 0, modifyRelationship() {} },
            timeManager: { totalDays: 10, energy: 100, useEnergy() {}, advanceTime() {} }
        };
        rs = new RomanceSystem(gs);
    });

    describe('upgradeHouse', () => {
        it('walks the housing ladder and pays each tier as you move in', () => {
            expect(rs.houseLevel).toBe(0);
            expect(rs.upgradeHouse()).toMatchObject({ success: true, cost: 15000, houseLevel: 1 });
            expect(rs.upgradeHouse()).toMatchObject({ success: true, cost: 50000, houseLevel: 2 });
            expect(rs.upgradeHouse()).toMatchObject({ success: true, cost: 200000, houseLevel: 3 });
            expect(gs.money).toBe(1000000 - 15000 - 50000 - 200000);
        });

        it('stops at the mansion without charging', () => {
            rs.houseLevel = 3;
            const before = gs.money;
            expect(rs.upgradeHouse().success).toBe(false);
            expect(rs.houseLevel).toBe(3);
            expect(gs.money).toBe(before);
        });

        it('refuses when the next tier is not affordable', () => {
            gs.money = 14999;
            expect(rs.upgradeHouse().success).toBe(false);
            expect(rs.houseLevel).toBe(0);
            expect(gs.money).toBe(14999);
        });
    });

    describe('haveChild', () => {
        it('needs a marriage', () => {
            for (const status of ['single', 'dating', 'engaged']) {
                rs.relationshipStatus = status;
                expect(rs.haveChild().success).toBe(false);
            }
            expect(rs.children).toEqual([]);
            expect(gs.money).toBe(1000000);
        });

        it('charges, records the birth day, and waits out the cooldown', () => {
            rs.relationshipStatus = 'married';
            expect(rs.haveChild()).toMatchObject({ success: true, cost: 10000 });
            expect(rs.children).toEqual([{ bornDay: 10 }]);
            expect(gs.money).toBe(990000);

            gs.timeManager.totalDays = 99; // 89 days after the birth: still cooling down
            expect(rs.haveChild().success).toBe(false);
            expect(rs.children).toHaveLength(1);

            gs.timeManager.totalDays = 100; // 90 days after the birth: allowed again
            expect(rs.haveChild().success).toBe(true);
            expect(rs.children).toEqual([{ bornDay: 10 }, { bornDay: 100 }]);
        });

        it('refuses when the child cost is not affordable', () => {
            rs.relationshipStatus = 'married';
            gs.money = 9999;
            expect(rs.haveChild().success).toBe(false);
            expect(rs.children).toEqual([]);
        });
    });

    describe('save shape', () => {
        it('round-trips the family fields through toJSON and fromJSON', () => {
            rs.relationshipStatus = 'married';
            rs.partnerId = 'ana';
            rs.upgradeHouse();
            rs.haveChild();
            const saved = JSON.parse(JSON.stringify(rs));
            const loaded = new RomanceSystem(gs);
            loaded.fromJSON(saved);
            expect(loaded.houseLevel).toBe(1);
            expect(loaded.children).toEqual([{ bornDay: 10 }]);
        });

        it('loads older saves that have no family data', () => {
            const loaded = new RomanceSystem(gs);
            loaded.fromJSON({ partnerId: null, relationshipStatus: 'single', relationshipScore: 0, anniversary: null });
            expect(loaded.houseLevel).toBe(0);
            expect(loaded.children).toEqual([]);
        });
    });
});
