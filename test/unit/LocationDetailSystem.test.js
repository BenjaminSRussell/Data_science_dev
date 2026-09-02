const LocationDetailSystem = require('../../src/js/game/locations/LocationDetailSystem');
const GameState = require('../../src/js/game/GameState');
const sinon = require('sinon');

describe('LocationDetailSystem', () => {
    let locationDetailSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            locations: new Map([
                ['home', {
                    id: 'home',
                    name: 'Your Apartment',
                    features: [
                        { id: 'bed', name: 'Bed', action: 'rest' },
                        // Add 14 more features to make a total of 15
                        { id: 'couch', name: 'Couch', action: 'relax' },
                        { id: 'table', name: 'Table', action: 'work' },
                        { id: 'chair', name: 'Chair', action: 'sit' },
                        { id: 'bookshelf', name: 'Bookshelf', action: 'read' },
                        { id: 'lamp', name: 'Lamp', action: 'light' },
                        { id: 'window', name: 'Window', action: 'view' },
                        { id: 'door', name: 'Door', action: 'exit' },
                        { id: 'fridge', name: 'Fridge', action: 'eat' },
                        { id: 'toilet', name: 'Toilet', action: 'use' },
                        { id: 'shower', name: 'Shower', action: 'wash' },
                        { id: 'tv', name: 'TV', action: 'watch' },
                        { id: 'computer', name: 'Computer', action: 'work' },
                        { id: 'phone', name: 'Phone', action: 'call' }
                    ]
                }]
            ])
        };
        locationDetailSystem = new LocationDetailSystem(mockGameState);
    });

    it('should return correct details for a valid location', () => {
        const details = locationDetailSystem.getLocationDetails('home');
        expect(details).to.have.property('name', 'Your Apartment');
        expect(details.features).to.be.an('array').with.lengthOf(15);
    });

    it('should return null for a non-existent location', () => {
        const details = locationDetailSystem.getLocationDetails('nonexistent_place');
        expect(details).to.be.null;
    });

    it('should return an empty array for non-existent location features', () => {
        const features = locationDetailSystem.getLocationFeatures('nonexistent_place');
        expect(features).to.be.an('array').that.is.empty;
    });

    it('should interact with a valid feature in a valid location', () => {
        const interaction = locationDetailSystem.interactWithFeature('home', 'bed');
        expect(interaction).to.have.property('feature');
        expect(interaction.feature).to.have.property('id', 'bed');
        expect(interaction).to.have.property('action', 'rest');
        expect(interaction).to.have.property('result');
    });

    it('should return null for interacting with a non-existent location', () => {
        const interaction = locationDetailSystem.interactWithFeature('nonexistent_place', 'bed');
        expect(interaction).to.be.null;
    });

    it('should return null for interacting with a non-existent feature', () => {
        const interaction = locationDetailSystem.interactWithFeature('home', 'nonexistent_feature');
        expect(interaction).to.be.null;
    });
});