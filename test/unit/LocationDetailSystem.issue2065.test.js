/**
 * executeAction gates money and energy, spends time, and will not
 * pay the same action twice in one time slot (#2065).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';
import { LocationView } from '../../src/js/ui/LocationView.js';

function playerState() {
    return {
        money: 100,
        timeManager: {
            energy: 100,
            maxEnergy: 100,
            timeSlot: 0,
            totalDays: 1
        }
    };
}

describe('LocationDetailSystem executeAction costs (#2065)', () => {
    let system;
    let state;

    beforeEach(() => {
        state = playerState();
        system = new LocationDetailSystem(state);
    });

    it('keeps historical payouts and spends time on every action', () => {
        const rest = system.executeAction('rest', 'home', 'bed');
        expect(rest.success).toBe(true);
        expect(rest.energy).toBe(50);
        expect(rest.timeSlots).toBeGreaterThanOrEqual(1);
        expect(rest.message).toBe('You rest and restore energy');

        state.timeManager.timeSlot = 1;
        const work = system.executeAction('work', 'home', 'desk');
        expect(work.skill).toBe(1);
        expect(work.energy).toBe(-10);
        expect(work.timeSlots).toBeGreaterThanOrEqual(1);

        state.timeManager.timeSlot = 2;
        const cook = system.executeAction('cook', 'home', 'kitchen');
        expect(cook.money).toBe(-5);
        expect(cook.energy).toBe(10);
        expect(cook.timeSlots).toBeGreaterThanOrEqual(1);

        state.timeManager.timeSlot = 3;
        const coffee = system.executeAction('coffee', 'office', 'coffee_machine');
        expect(coffee.money).toBe(-3);
        expect(coffee.energy).toBe(20);

        state.timeManager.energy = 100;
        state.timeManager.timeSlot = 0;
        state.timeManager.totalDays = 2;
        const read = system.executeAction('read', 'home', 'bookshelf');
        expect(read.skill).toBe(2);
        expect(read.energy).toBe(-15);
        expect(read.timeSlots).toBe(2);

        const gossip = system.executeAction('gossip', 'office', 'water_cooler', { timeSlot: 1, day: 2, energy: 100 });
        expect(gossip.relationship).toBe(1);
        expect(gossip.energy).toBe(-5);

        const boss = system.executeAction('boss', 'office', 'boss_office', { timeSlot: 2, day: 2, energy: 100 });
        expect(boss.meeting).toBe(true);
        expect(boss.timeSlots).toBeGreaterThanOrEqual(1);

        const computer = system.executeAction('computer', 'home', 'computer', { timeSlot: 3, day: 2, energy: 100 });
        expect(computer.info).toBe(true);
        expect(computer.energy).toBe(-5);

        const other = system.executeAction('window', 'home', 'window', { timeSlot: 4, day: 2 });
        expect(other.success).toBe(true);
        expect(other.timeSlots).toBeGreaterThanOrEqual(1);
        expect(other.money).toBeUndefined();
        expect(other.skill).toBeUndefined();
        expect(other.message).toBe('You interact with window');
    });

    it('refuses a money debit the player cannot cover and does not include it', () => {
        state.money = 4;
        const cook = system.executeAction('cook', 'home', 'kitchen');
        expect(cook.success).toBe(false);
        expect(cook.money).toBeUndefined();
        expect(cook.energy).toBeUndefined();
        expect(cook.timeSlots).toBe(0);

        state.money = 2;
        const coffee = system.executeAction('coffee', 'office', 'coffee_machine');
        expect(coffee.success).toBe(false);
        expect(coffee.money).toBeUndefined();

        state.money = 5;
        const paid = system.executeAction('cook', 'home', 'kitchen');
        expect(paid.success).toBe(true);
        expect(paid.money).toBe(-5);
    });

    it('refuses skill and coffee-table repeats when energy or time cannot cover them', () => {
        state.timeManager.energy = 9;
        const work = system.executeAction('work', 'home', 'desk');
        expect(work.success).toBe(false);
        expect(work.skill).toBeUndefined();

        state.timeManager.energy = 14;
        state.timeManager.timeSlot = 0;
        const tiredRead = system.executeAction('read', 'library', 'bookshelf');
        expect(tiredRead.success).toBe(false);

        state.timeManager.energy = 100;
        state.timeManager.timeSlot = 5;
        const lateRead = system.executeAction('read', 'library', 'periodicals');
        expect(lateRead.success).toBe(false);
        expect(lateRead.message).toBe('Not enough time today');

        state.timeManager.timeSlot = 4;
        const eveningRead = system.executeAction('read', 'library', 'bookshelf');
        expect(eveningRead.success).toBe(true);
        expect(eveningRead.skill).toBe(2);
    });

    it('blocks a second use of the same action until the slot changes, including duplicate tables', () => {
        const first = system.executeAction('work', 'coffee_shop', 'table_1');
        expect(first.success).toBe(true);
        const second = system.executeAction('work', 'coffee_shop', 'table_2');
        expect(second.success).toBe(false);
        expect(second.skill).toBeUndefined();
        const third = system.executeAction('work', 'coffee_shop', 'table_3');
        expect(third.success).toBe(false);

        state.timeManager.timeSlot = 1;
        const later = system.executeAction('work', 'coffee_shop', 'table_2');
        expect(later.success).toBe(true);
        expect(later.skill).toBe(1);

        const home = system.executeAction('work', 'home', 'desk', { timeSlot: 1, day: 1, energy: 100 });
        expect(home.success).toBe(true);
    });

    it('does not lock an action that was rejected, and honors caller-supplied resources', () => {
        state.money = 0;
        const broke = system.executeAction('cook', 'home', 'kitchen');
        expect(broke.success).toBe(false);
        const covered = system.executeAction('cook', 'home', 'kitchen', { money: 5, timeOfDay: 0, day: 1 });
        expect(covered.success).toBe(true);
        expect(covered.money).toBe(-5);

        const night = system.executeAction('read', 'home', 'bookshelf', {
            timeOfDay: 'night',
            energy: 100,
            day: 3
        });
        expect(night.success).toBe(false);
        expect(night.message).toBe('Not enough time today');
    });

    it('uses time and energy named on the feature when the action constant would differ', () => {
        const home = system.getLocationDetails('home');
        home.features.push({ id: 'lab_desk', name: 'Lab', action: 'work', timeSlots: 3, energyCost: 40 });
        state.timeManager.energy = 39;
        const poor = system.executeAction('work', 'home', 'lab_desk');
        expect(poor.success).toBe(false);
        state.timeManager.energy = 40;
        state.timeManager.timeSlot = 2;
        const ok = system.executeAction('work', 'home', 'lab_desk');
        expect(ok.success).toBe(true);
        expect(ok.timeSlots).toBe(3);
        expect(ok.energy).toBe(-40);
        expect(ok.skill).toBe(1);
    });

    it('still returns the feature interaction shape', () => {
        const interaction = system.interactWithFeature('home', 'bed');
        expect(interaction.feature.id).toBe('bed');
        expect(interaction.action).toBe('rest');
        expect(interaction.result.energy).toBe(50);
        expect(interaction.result.timeSlots).toBeGreaterThanOrEqual(1);
    });
});

describe('LocationView applies feature time (#2065)', () => {
    it('advances the clock for a successful feature and spends energy', () => {
        const game = {
            gameState: { money: 100 },
            timeManager: { energy: 40, useEnergy: vi.fn(), restoreEnergy: vi.fn(), advanceTime: vi.fn() },
            handleTimeAdvance: vi.fn(),
            characterStats: { addExperience: vi.fn() },
            showToast: vi.fn(),
            uiUpdater: { updateAllUI: vi.fn() }
        };
        const view = new LocationView(game, null, null, null);
        const applied = view.applyFeatureResult({
            success: true,
            energy: -10,
            skill: 1,
            timeSlots: 1,
            message: 'You work on improving your skills'
        });
        expect(applied.energy).toBe(-10);
        expect(applied.skill).toBe(1);
        expect(applied.timeSlots).toBe(1);
        expect(game.timeManager.useEnergy).toHaveBeenCalledWith(10);
        expect(game.handleTimeAdvance).toHaveBeenCalledWith(1);
    });

    it('applies nothing when the action was rejected', () => {
        const game = {
            gameState: { money: 2 },
            timeManager: { restoreEnergy: vi.fn(), useEnergy: vi.fn(), advanceTime: vi.fn() },
            handleTimeAdvance: vi.fn(),
            characterStats: { addExperience: vi.fn() },
            showToast: vi.fn(),
            uiUpdater: { updateAllUI: vi.fn() },
            locationDetailSystem: {
                interactWithFeature: () => ({
                    feature: { id: 'kitchen' },
                    action: 'cook',
                    result: { success: false, blocked: true, message: 'Not enough money', timeSlots: 0 }
                })
            }
        };
        const view = new LocationView(game, null, null, null);
        view.currentLocation = 'home';
        const applied = view.interactWithFeature({ id: 'kitchen' });
        expect(applied.blocked).toBe('Not enough money');
        expect(game.handleTimeAdvance).not.toHaveBeenCalled();
        expect(game.timeManager.restoreEnergy).not.toHaveBeenCalled();
        expect(game.gameState.money).toBe(2);
        expect(game.showToast).toHaveBeenCalledWith('Not enough money', 'error');
        expect(game.uiUpdater.updateAllUI).not.toHaveBeenCalled();
    });
});
