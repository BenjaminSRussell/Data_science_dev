import { LocationTester } from '../../js/dev/LocationTester';
import { OFFICE_LOCATIONS } from '../../js/data/locations';
import { game } from '../../js/game';

jest.mock('../../js/game', () => ({
    gameState: {
        worldMap: {
            getLocations: jest.fn(),
            setCurrentLocation: jest.fn()
        }
    },
    environmentManager: {
        refresh: jest.fn()
    },
    screenManager: {
        navigateTo: jest.fn()
    }
}));

describe('LocationTester', () => {
    let locationTester;

    beforeEach(() => {
        locationTester = new LocationTester();
    });

    describe('getAllLocations', () => {
        it('should return all 17 hardcoded knownLocationIds when no worldMap', () => {
            game.gameState.worldMap.getLocations.mockImplementation(() => null);
            const result = locationTester.getAllLocations();
            expect(result).toEqual(OFFICE_LOCATIONS.map(location => location.id).map(id => ({ id, humanized: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })));
        });

        it('should dedup locations when worldMap.getLocations returns an id also in known list', () => {
            const knownIds = OFFICE_LOCATIONS.map(location => location.id);
            const worldMapIds = [...knownIds, 'duplicate_id'];
            game.gameState.worldMap.getLocations.mockImplementation(() => worldMapIds);
            const result = locationTester.getAllLocations();
            expect(result).toEqual(knownIds.map(id => ({ id, humanized: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })));
        });

        it('should not throw when worldMap.getLocations throws', () => {
            game.gameState.worldMap.getLocations.mockImplementation(() => { throw new Error('Simulated error'); });
            const result = locationTester.getAllLocations();
            expect(result).toEqual(OFFICE_LOCATIONS.map(location => location.id).map(id => ({ id, humanized: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })));
        });
    });

    describe('testLocation', () => {
        it('should return errors if location ID is required', () => {
            const result = locationTester.testLocation('');
            expect(result).toEqual({ success: false, errors: ['Location ID is required'] });
        });

        it('should catch setCurrentLocation throwing and push to errors', () => {
            const locationId = 'home_office';
            game.gameState.worldMap.setCurrentLocation.mockImplementation(() => { throw new Error('Simulated error'); });
            const result = locationTester.testLocation(locationId);
            expect(result).toEqual({ success: false, errors: ['Simulated error'] });
        });
    });

    describe('navigateToLocation', () => {
        it('should return success:false with error if setCurrentLocation throws', () => {
            const locationId = 'home_office';
            game.gameState.worldMap.setCurrentLocation.mockImplementation(() => { throw new Error('Simulated error'); });
            const result = locationTester.navigateToLocation(locationId);
            expect(result).toEqual({ success: false, error: 'Simulated error' });
        });
    });
});