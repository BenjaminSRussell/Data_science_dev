import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocationBackgroundSystem } from '../../src/js/game/LocationBackgroundSystem.js';

describe('LocationBackgroundSystem', () => {
    let system;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: { currentHour: 12 },
            housingLevel: 'apartment',
            officeLevel: 'small',
            money: 0,
            worldMap: {
                getLocation: vi.fn((locationId) => ({
                    id: locationId,
                    type: 'unknown'
                }))
            }
        };

        system = new LocationBackgroundSystem(mockGameState);
    });

    describe('dead code removal', () => {
        it('should not contain library.modern background variant', () => {
            expect(system.backgrounds.library).not.toHaveProperty('modern');
        });

        it('should not contain gym.premium background variant', () => {
            expect(system.backgrounds.gym).not.toHaveProperty('premium');
        });

        it('should only have default for library backgrounds', () => {
            expect(Object.keys(system.backgrounds.library)).toEqual(['default']);
        });

        it('should only have default for gym backgrounds', () => {
            expect(Object.keys(system.backgrounds.gym)).toEqual(['default']);
        });
    });

    describe('background selection', () => {
        it('should return library default background regardless of time of day', () => {
            for (let hour = 0; hour < 24; hour++) {
                mockGameState.timeManager.currentHour = hour;
                const background = system.getBackground('library');
                expect(background).toBe(system.backgrounds.library.default);
            }
        });

        it('should return gym default background regardless of time of day', () => {
            for (let hour = 0; hour < 24; hour++) {
                mockGameState.timeManager.currentHour = hour;
                const background = system.getBackground('gym');
                expect(background).toBe(system.backgrounds.gym.default);
            }
        });

        it('should return home background based on housing level', () => {
            mockGameState.housingLevel = 'mansion';
            expect(system.getBackground('home')).toBe(system.backgrounds.home.mansion);

            mockGameState.housingLevel = 'house';
            expect(system.getBackground('home')).toBe(system.backgrounds.home.house);

            mockGameState.housingLevel = 'condo';
            expect(system.getBackground('home')).toBe(system.backgrounds.home.condo);

            mockGameState.housingLevel = 'apartment';
            expect(system.getBackground('home')).toBe(system.backgrounds.home.apartment);
        });

        it('should return office background based on office level', () => {
            mockGameState.officeLevel = 'executive';
            expect(system.getBackground('office')).toBe(system.backgrounds.office.executive);

            mockGameState.officeLevel = 'large';
            expect(system.getBackground('office')).toBe(system.backgrounds.office.large);

            mockGameState.officeLevel = 'medium';
            expect(system.getBackground('office')).toBe(system.backgrounds.office.medium);

            mockGameState.officeLevel = 'small';
            expect(system.getBackground('office')).toBe(system.backgrounds.office.small);
        });
    });
});
