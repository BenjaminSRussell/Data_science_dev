import { describe, it, expect, beforeEach } from 'vitest';
import { OfficeManager } from '../../src/js/game/OfficeManager.js';
import { GameState } from '../../src/js/game/GameState.js';
import { OFFICES, STAFF_TYPES, EQUIPMENT } from '../../src/js/data/tycoonData.js';

/**
 * Test suite for OfficeManager - ensures the doc-matching office system works
 */
describe('OfficeManager', () => {
    let officeManager;
    let mockGameState;

    beforeEach(() => {
        // Create a mock game state with money
        mockGameState = {
            money: 100000,
            character: {
                getEmoji: () => '👨'
            }
        };

        officeManager = new OfficeManager(mockGameState);
    });

    describe('Office Progression', () => {
        it('should start in Bedroom Corner with no cost', () => {
            expect(officeManager.currentOffice.id).toBe('bedroom');
            expect(officeManager.currentOffice.name).toBe('Bedroom Corner');
            expect(officeManager.currentOffice.price).toBe(0);
            expect(officeManager.currentOffice.capacity).toBe(1);
        });

        it('should match doc spec: Office Locations progression', () => {
            const expectedOffices = [
                { name: 'Bedroom Corner', price: 0, capacity: 1, clientBonus: 0 },
                { name: 'Home Office', price: 2000, capacity: 1, clientBonus: 0.1 },
                { name: 'Co-working Space', price: 5000, capacity: 2, clientBonus: 0.2 },
                { name: 'Small Office', price: 15000, capacity: 4, clientBonus: 0.35 },
                { name: 'Office Floor', price: 50000, capacity: 10, clientBonus: 0.5 },
                { name: 'Company HQ', price: 200000, capacity: 25, clientBonus: 0.75 }
            ];

            OFFICES.forEach((office, i) => {
                expect(office.name).toBe(expectedOffices[i].name);
                expect(office.price).toBe(expectedOffices[i].price);
                expect(office.capacity).toBe(expectedOffices[i].capacity);
                expect(office.clientBonus).toBe(expectedOffices[i].clientBonus);
            });
        });

        it('should upgrade office when affordable', () => {
            mockGameState.money = 2500;
            const result = officeManager.upgradeOffice();

            expect(result.success).toBe(true);
            expect(officeManager.currentOffice.id).toBe('home_office');
            expect(officeManager.currentOffice.name).toBe('Home Office');
            expect(mockGameState.money).toBe(500); // 2500 - 2000
        });

        it('should not upgrade office when not affordable', () => {
            mockGameState.money = 500;
            const result = officeManager.upgradeOffice();

            expect(result.success).toBe(false);
            expect(officeManager.currentOffice.id).toBe('bedroom');
        });
    });

    describe('Staff Management', () => {
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

            STAFF_TYPES.forEach((staff, i) => {
                expect(staff.name).toBe(expectedStaff[i].name);
                expect(staff.baseSalary).toBe(expectedStaff[i].baseSalary);
            });
        });

        it('should hire staff when affordable and capacity available', () => {
            mockGameState.money = 1000;
            const result = officeManager.hireStaff('intern');

            expect(result.success).toBe(true);
            expect(officeManager.staff.length).toBe(1);
            expect(result.staff.type.name).toBe('Intern');
            expect(mockGameState.money).toBe(900); // 1000 - (50 * 2)
        });

        it('should not hire when capacity exceeded', () => {
            // Bedroom has capacity 1
            mockGameState.money = 5000;
            officeManager.hireStaff('intern');

            const result = officeManager.hireStaff('intern');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Office at capacity');
        });

        it('should get available staff respecting capacity', () => {
            mockGameState.money = 5000;
            officeManager.hireStaff('intern');

            const available = officeManager.getAvailableStaff();
            expect(available.length).toBe(0); // Capacity 1, already full
        });

        it('should fire staff member', () => {
            mockGameState.money = 5000;
            const hired = officeManager.hireStaff('intern');
            const staffId = hired.staff.id;

            const fireResult = officeManager.fireStaff(staffId);
            expect(fireResult.success).toBe(true);
            expect(officeManager.staff.length).toBe(0);
        });

        it('should calculate daily staff costs', () => {
            mockGameState.money = 10000;
            officeManager.hireStaff('intern'); // 50/day

            const cost = officeManager.getDailyStaffCost();
            expect(cost).toBe(50);
        });
    });

    describe('Equipment Management', () => {
        it('should match doc spec: Office Equipment customization', () => {
            const expectedEquipment = {
                computer: ['Old Laptop', 'Desktop PC', 'Gaming Rig', 'Workstation Pro', 'Server Cluster'],
                desk: ['Folding Table', 'Basic Desk', 'Standing Desk', 'L-Shaped Desk', 'Executive Desk'],
                monitor: ['Laptop Screen', '24" Monitor', 'Dual Monitors', 'Ultrawide', 'Triple 4K Setup'],
                chair: ['Kitchen Chair', 'Office Chair', 'Ergonomic Chair', 'Gaming Chair', 'Herman Miller']
            };

            Object.entries(expectedEquipment).forEach(([type, names]) => {
                const equipment = EQUIPMENT[type];
                names.forEach((name, i) => {
                    expect(equipment.levels[i].name).toBe(name);
                });
            });
        });

        it('should get equipment details at current level', () => {
            const details = officeManager.getEquipmentDetails('computer');

            expect(details.currentLevel).toBe(0);
            expect(details.current.name).toBe('Old Laptop');
            expect(details.next.name).toBe('Desktop PC');
            expect(details.maxLevel).toBe(4);
        });

        it('should upgrade equipment when affordable', () => {
            mockGameState.money = 1000;
            const result = officeManager.upgradeEquipment('computer');

            expect(result.success).toBe(true);
            expect(officeManager.equipmentLevels.computer).toBe(1);
            expect(mockGameState.money).toBe(500); // 1000 - 500
        });

        it('should not upgrade at max level', () => {
            mockGameState.money = 50000;

            // Upgrade to max
            for (let i = 0; i < 5; i++) {
                officeManager.upgradeEquipment('computer');
            }

            const result = officeManager.upgradeEquipment('computer');
            expect(result.success).toBe(false);
        });

        it('should get equipment bonuses for current levels', () => {
            const bonuses = officeManager.getEquipmentBonuses();

            expect(bonuses.speed).toBe(1.0); // Old Laptop level
            expect(bonuses.comfort).toBe(1.0);
            expect(bonuses.clarity).toBe(1.0);
            expect(bonuses.stamina).toBe(1.0);
            expect(bonuses.capability).toBe(1.0);
        });
    });

    describe('Marketing', () => {
        // #1969: marketing channel state lives on GameState, so these tests
        // need the real GameState rather than the plain money stub.
        beforeEach(() => {
            mockGameState = new GameState();
            officeManager = new OfficeManager(mockGameState);
        });

        it('should toggle marketing channels', () => {
            const result1 = officeManager.toggleMarketing('social_media');
            expect(result1.active).toBe(true);
            expect(officeManager.isMarketingActive('social_media')).toBe(true);

            const result2 = officeManager.toggleMarketing('social_media');
            expect(result2.active).toBe(false);
            expect(officeManager.isMarketingActive('social_media')).toBe(false);
        });

        it('should calculate daily marketing costs', () => {
            mockGameState.money = 10000;
            officeManager.toggleMarketing('word_of_mouth');

            const cost = officeManager.getDailyMarketingCost();
            expect(typeof cost).toBe('number');
        });
    });

    describe('Persistence', () => {
        it('should serialize state for saving', () => {
            mockGameState.money = 10000;
            officeManager.hireStaff('intern');
            officeManager.upgradeEquipment('computer');

            const saved = officeManager.toJSON();

            expect(saved.equipmentLevels.computer).toBe(1);
            expect(saved.staff.length).toBe(1);
        });

        it('should restore state from saved data', () => {
            const saved = {
                equipmentLevels: { computer: 2, desk: 1, monitor: 0, chair: 0, software: 0 },
                currentOfficeIndex: 1,
                staff: [],
                activeMarketing: ['word_of_mouth']
            };

            officeManager.fromJSON(saved);

            expect(officeManager.equipmentLevels.computer).toBe(2);
            expect(officeManager.currentOfficeIndex).toBe(1);
        });
    });

    describe('GameState Integration', () => {
        it('should be wired in by MainGame.loadDeferredSystems() in production code', async () => {
            // Verify the actual production code contains the wiring, not a test double
            // Read the main.js source to verify the integration is implemented
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/main.js');
            const mainContent = fs.readFileSync(filePath, 'utf8');

            // Verify OfficeManager is imported
            expect(mainContent).toMatch(/import\s+{\s*OfficeManager\s*}\s+from\s+['"]\.\/game\/OfficeManager\.js['"]/);

            // Verify loadDeferredSystems() method exists
            expect(mainContent).toContain('loadDeferredSystems()');

            // Verify the actual initialization code is present (not mocked in test)
            // This is the exact code from main.js that should exist:
            expect(mainContent).toMatch(
                /if\s*\(\s*!this\.gameState\.officeManager\s*\)\s*{\s*this\.gameState\.officeManager\s*=\s*new\s+OfficeManager\s*\(\s*this\.gameState\s*\)\s*;\s*this\.officeManager\s*=\s*this\.gameState\.officeManager\s*;\s*}/
            );

            // Verify it's in the loadDeferredSystems method (not elsewhere)
            const loadDeferredStart = mainContent.indexOf('loadDeferredSystems()');
            expect(loadDeferredStart).toBeGreaterThan(0);

            const officeManagerInitStart = mainContent.search(/if\s*\(\s*!this\.gameState\.officeManager/);
            expect(officeManagerInitStart).toBeGreaterThan(loadDeferredStart);
        });

        it('can be instantiated and used when initialized in gameState', () => {
            // Direct test that OfficeManager works when wired
            const mockGameState = {
                money: 10000,
                character: {
                    getEmoji: () => '👨'
                }
            };

            // This simulates what the production code does
            mockGameState.officeManager = new OfficeManager(mockGameState);

            expect(mockGameState.officeManager).toBeDefined();
            expect(mockGameState.officeManager).toBeInstanceOf(OfficeManager);
            expect(mockGameState.officeManager.currentOffice.id).toBe('bedroom');
        });

        it('should provide document-matching office tiers in game', () => {
            const gameState = {
                money: 500000,
                character: {
                    getEmoji: () => '👨'
                }
            };

            const manager = new OfficeManager(gameState);

            // Verify the documented office progression is accessible
            expect(OFFICES.length).toBe(6);
            expect(OFFICES[0].id).toBe('bedroom');
            expect(OFFICES[OFFICES.length - 1].id).toBe('headquarters');

            // Verify staff types match documentation
            expect(STAFF_TYPES.length).toBe(7);
            expect(STAFF_TYPES[0].name).toBe('Intern');
            expect(STAFF_TYPES[STAFF_TYPES.length - 1].name).toBe('Sales Rep');
        });
    });
});
