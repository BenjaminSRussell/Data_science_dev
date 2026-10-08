/**
 * MainGame without booting a game (#527): staff hiring, game loop, and the
 * world map / vehicle / training / shop click wiring (#1100)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame, STAFF_ROLES, OFFICE_STAFF_CAPACITY, game as bootedGame } from '../../src/js/main.js';

const proto = MainGame.prototype;

describe('importing main.js with __DSD_NO_AUTOBOOT__', () => {
    it('does not construct a game', () => {
        expect(bootedGame).toBeFalsy();
    });
});

describe('handleHireStaff', () => {
    let fake;
    const role = Object.keys(STAFF_ROLES).find(r => !STAFF_ROLES[r].requiresLicense && !(STAFF_ROLES[r].minOffice > 0));
    beforeEach(() => {
        fake = {
            gameState: { money: 1e6, officeIndex: 2, staff: [] },
            legalSystem: { hasLicense: (id) => id === 'llc_registration' },
            showError: vi.fn(), showToast: vi.fn(), updateStaffScreen: vi.fn(), uiUpdater: { updateAllUI: vi.fn() }
        };
    });

    it('rejects an unknown role', () => {
        expect(proto.handleHireStaff.call(fake, 'wizard')).toBe(false);
        expect(fake.showError).toHaveBeenCalledWith('Invalid staff role');
    });

    it('requires an LLC (fails closed without a legal system)', () => {
        delete fake.legalSystem;
        expect(proto.handleHireStaff.call(fake, role)).toBe(false);
        expect(fake.gameState.staff).toHaveLength(0);
    });

    it('enforces office capacity and money', () => {
        fake.gameState.staff = new Array(OFFICE_STAFF_CAPACITY[2]).fill({});
        expect(proto.handleHireStaff.call(fake, role)).toBe(false);
        fake.gameState.staff = [];
        fake.gameState.money = STAFF_ROLES[role].hireCost - 1;
        expect(proto.handleHireStaff.call(fake, role)).toBe(false);
        expect(fake.gameState.money).toBe(STAFF_ROLES[role].hireCost - 1);
    });

    it('hires, charges the hire cost and records the staff member', () => {
        expect(proto.handleHireStaff.call(fake, role)).toBe(true);
        expect(fake.gameState.money).toBe(1e6 - STAFF_ROLES[role].hireCost);
        expect(fake.gameState.staff[0]).toMatchObject({ role, salary: STAFF_ROLES[role].salary });
    });
});

describe('gameLoop', () => {
    it('runs one tick, survives a throwing tick, and schedules the next frame', () => {
        const raf = vi.fn(() => 7);
        vi.stubGlobal('requestAnimationFrame', raf);
        const fake = { gameLoopTick: vi.fn(() => { throw new Error('tick'); }) };
        fake.gameLoop = proto.gameLoop;
        expect(() => proto.gameLoop.call(fake, 1234)).not.toThrow();
        expect(fake.gameLoopTick).toHaveBeenCalledWith(1234);
        expect(raf).toHaveBeenCalledWith(fake.gameLoop);
        expect(fake.gameLoopId).toBe(7);
        vi.unstubAllGlobals();
    });
});

describe('setupWorldInputs', () => {
    let fake;
    beforeEach(() => {
        document.body.innerHTML = `
          <div id="world-map">
            <div class="map-location" data-location="cafe"><span class="label">Cafe</span></div>
            <div class="map-location locked" data-location="vault"></div>
            <div class="decor"></div>
          </div>
          <div id="vehicle-options">
            <div class="vehicle-option" data-vehicle="bike"><span>Bike</span></div>
            <div class="vehicle-option" data-vehicle="scooter"></div>
          </div>
          <div id="training-grid">
            <div class="training-card" data-activity="course"><div class="name">Course</div><button><span>Train</span></button></div>
            <div class="training-card" data-activity="locked"><button disabled>Train</button></div>
          </div>
          <button class="category-btn active" data-category="all">All</button>
          <button class="category-btn" data-category="tech">Tech</button>`;
        fake = {
            worldMap: {
                ownedVehicles: new Set(['bike']),
                currentLocation: 'car_dealership',
                getLocation: () => ({ unlockRequirement: null }),
                switchVehicle: vi.fn(),
                getVehicle: (id) => ({ id, name: 'Scooter', price: 300 }),
                buyVehicle: vi.fn(() => ({ success: true }))
            },
            handleTravel: vi.fn(), handleTraining: vi.fn(), showError: vi.fn(), showToast: vi.fn(),
            updateMapScreen: vi.fn(), uiUpdater: { updateShopScreen: vi.fn() },
            _formatUnlockRequirement: () => ''
        };
        proto.setupWorldInputs.call(fake);
    });
    afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ''; });

    const click = (sel) => document.querySelector(sel).dispatchEvent(new MouseEvent('click', { bubbles: true }));

    it('travels to unlocked locations (including clicks on child elements)', () => {
        click('[data-location="cafe"] .label');
        expect(fake.handleTravel).toHaveBeenCalledWith('cafe');
    });

    it('locked locations show an error and do not travel', () => {
        click('[data-location="vault"]');
        expect(fake.showError).toHaveBeenCalledWith(expect.stringContaining('locked'));
        expect(fake.handleTravel).not.toHaveBeenCalled();
    });

    it('clicks outside a location do nothing', () => {
        click('.decor');
        expect(fake.handleTravel).not.toHaveBeenCalled();
        expect(fake.showError).not.toHaveBeenCalled();
    });

    it('owned vehicles switch; unowned ask to buy', () => {
        click('[data-vehicle="bike"] span');
        expect(fake.worldMap.switchVehicle).toHaveBeenCalledWith('bike');
        expect(fake.worldMap.buyVehicle).not.toHaveBeenCalled();

        vi.spyOn(window, 'confirm').mockReturnValue(false);
        click('[data-vehicle="scooter"]');
        expect(fake.worldMap.buyVehicle).not.toHaveBeenCalled();

        window.confirm.mockReturnValue(true);
        click('[data-vehicle="scooter"]');
        expect(fake.worldMap.buyVehicle).toHaveBeenCalledWith('scooter');
        expect(fake.showToast).toHaveBeenCalledWith('Bought Scooter!', 'success');
    });

    it('vehicle clicks before the world map exists show an error instead of crashing', () => {
        fake.worldMap = null;
        expect(() => click('[data-vehicle="bike"]')).not.toThrow();
        expect(fake.showError).toHaveBeenCalledWith('Game systems not ready yet.');
    });

    it('training: the button (or text inside it) trains; the card body and disabled buttons do not', () => {
        click('[data-activity="course"] .name');
        expect(fake.handleTraining).not.toHaveBeenCalled();
        click('[data-activity="course"] button span');
        expect(fake.handleTraining).toHaveBeenCalledWith('course');
        click('[data-activity="locked"] button');
        expect(fake.handleTraining).toHaveBeenCalledTimes(1);
    });

    it('shop category buttons move .active and refresh the shop', () => {
        click('[data-category="tech"]');
        expect(document.querySelector('[data-category="tech"]').classList.contains('active')).toBe(true);
        expect(document.querySelector('[data-category="all"]').classList.contains('active')).toBe(false);
        expect(fake.uiUpdater.updateShopScreen).toHaveBeenCalledWith('tech');
    });
});
