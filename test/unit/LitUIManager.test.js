import { LitUIManager } from '../../src/js/ui/LitUIManager.js';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach, vi } from 'vitest';

describe('LitUIManager', () => {
    let manager;
    let game;
    let topBarContainer;
    let rankProgressContainer;
    let locationContainer;

    beforeEach(() => {
        // Create mock game object
        game = {
            gameState: {
                money: 1000,
                reputation: 50,
                currentRank: { title: 'Novice' },
                progressToNextRank: 25,
                nextRank: { title: 'Apprentice' }
            }
        };

        // Create a new manager for each test
        manager = new LitUIManager(game);

        // Clean up any existing containers
        const existing = document.body.querySelectorAll('[id*="top-bar"], [id*="rank-progress"], [id*="location"]');
        existing.forEach(el => el.remove());
    });

    afterEach(() => {
        // Clean up DOM
        const containers = document.body.querySelectorAll('[id*="top-bar"], [id*="rank-progress"], [id*="location"]');
        containers.forEach(el => el.remove());
    });

    describe('initialize()', () => {
        it('should create <top-bar> when #top-bar-container exists', () => {
            // Setup: create container in DOM
            const container = document.createElement('div');
            container.id = 'top-bar-container';
            document.body.appendChild(container);

            // Act
            manager.initialize();

            // Assert
            expect(manager.components.has('topBar')).to.be.true;
            const topBar = manager.components.get('topBar');
            expect(topBar.tagName.toLowerCase()).to.equal('top-bar');
            expect(topBar.game).to.equal(game);
            expect(container.contains(topBar)).to.be.true;
        });

        it('should not create duplicate <top-bar> when initialize() called twice', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'top-bar-container';
            document.body.appendChild(container);

            // Act: call initialize twice
            manager.initialize();
            const firstTopBar = manager.components.get('topBar');
            manager.initialize();
            const secondTopBar = manager.components.get('topBar');

            // Assert: should be same reference
            expect(firstTopBar).to.equal(secondTopBar);
            expect(container.querySelectorAll('top-bar').length).to.equal(1);
        });

        it('should create <progress-bar> when #rank-progress-container exists', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'rank-progress-container';
            document.body.appendChild(container);

            // Act
            manager.initialize();

            // Assert
            expect(manager.components.has('rankProgress')).to.be.true;
            const progressBar = manager.components.get('rankProgress');
            expect(progressBar.tagName.toLowerCase()).to.equal('progress-bar');
            expect(progressBar.showValue).to.be.true;
            expect(container.contains(progressBar)).to.be.true;
        });

        it('should not create duplicate <progress-bar> when initialize() called twice', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'rank-progress-container';
            document.body.appendChild(container);

            // Act
            manager.initialize();
            const firstProgressBar = manager.components.get('rankProgress');
            manager.initialize();
            const secondProgressBar = manager.components.get('rankProgress');

            // Assert
            expect(firstProgressBar).to.equal(secondProgressBar);
            expect(container.querySelectorAll('progress-bar').length).to.equal(1);
        });

        it('should keep components empty when neither container is present', () => {
            // Ensure no containers exist
            expect(document.getElementById('top-bar-container')).to.be.null;
            expect(document.getElementById('rank-progress-container')).to.be.null;

            // Act
            manager.initialize();

            // Assert
            expect(manager.components.size).to.equal(0);
        });

        it('should not throw when neither container is present', () => {
            // Act & Assert
            expect(() => {
                manager.initialize();
            }).to.not.throw();
        });
    });

    describe('updateLocationView()', () => {
        it('should return without creating anything when neither container exists', () => {
            // Ensure no location containers exist
            expect(document.getElementById('location-view')).to.be.null;
            expect(document.getElementById('location-view-container')).to.be.null;

            // Act
            manager.updateLocationView('loc1', { name: 'Test' }, 'bg.jpg', 'day');

            // Assert
            expect(manager.components.has('locationView')).to.be.false;
            expect(manager.components.size).to.equal(0);
        });

        it('should not throw when neither container exists', () => {
            // Act & Assert
            expect(() => {
                manager.updateLocationView('loc1', { name: 'Test' }, 'bg.jpg', 'day');
            }).to.not.throw();
        });

        it('should create location-view-component when container exists', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'location-view-container';
            document.body.appendChild(container);

            // Act
            manager.updateLocationView('loc1', { name: 'Test' }, 'bg.jpg', 'day');

            // Assert
            expect(manager.components.has('locationView')).to.be.true;
            const locationView = manager.components.get('locationView');
            expect(locationView.tagName.toLowerCase()).to.equal('location-view-component');
            expect(locationView.game).to.equal(game);
            expect(container.contains(locationView)).to.be.true;
        });

        it('should call updateLocation with correct parameters', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'location-view-container';
            document.body.appendChild(container);

            // Act
            const locationId = 'loc123';
            const locationDetails = { name: 'Downtown', type: 'city' };
            const backgroundImage = 'downtown.jpg';
            const timeOfDay = 'night';

            manager.updateLocationView(locationId, locationDetails, backgroundImage, timeOfDay);

            // Assert - verify updateLocation was called by checking the properties it sets
            const locationView = manager.components.get('locationView');
            expect(locationView).to.exist;
            expect(locationView.tagName.toLowerCase()).to.equal('location-view-component');
            expect(locationView.game).to.equal(game);
            // Verify the updateLocation method was called with correct parameters
            // by checking the properties it sets
            expect(locationView.locationId).to.equal(locationId);
            expect(locationView.locationDetails).to.deep.equal(locationDetails);
            expect(locationView.backgroundImage).to.equal(backgroundImage);
            expect(locationView.timeOfDay).to.equal(timeOfDay);
        });

        it('should reuse cached component on second call', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'location-view-container';
            document.body.appendChild(container);

            // Act: first call
            manager.updateLocationView('loc1', { name: 'Test1' }, 'bg1.jpg', 'day');
            const firstComponent = manager.components.get('locationView');

            // Act: second call
            manager.updateLocationView('loc2', { name: 'Test2' }, 'bg2.jpg', 'night');
            const secondComponent = manager.components.get('locationView');

            // Assert: should be same reference
            expect(firstComponent).to.equal(secondComponent);
            expect(container.querySelectorAll('location-view-component').length).to.equal(1);
        });

        it('should use location-view as container if it exists', () => {
            // Setup
            const container = document.createElement('div');
            container.id = 'location-view';
            document.body.appendChild(container);

            // Act
            manager.updateLocationView('loc1', { name: 'Test' }, 'bg.jpg', 'day');

            // Assert
            expect(manager.components.has('locationView')).to.be.true;
            expect(container.contains(manager.components.get('locationView'))).to.be.true;
        });
    });

    describe('updateAllUI()', () => {
        it('should call updateTopBar() exactly once', () => {
            // Spy on updateTopBar
            const updateTopBarSpy = vi.spyOn(manager, 'updateTopBar');

            // Act
            manager.updateAllUI();

            // Assert
            expect(updateTopBarSpy).toHaveBeenCalledOnce();

            // Cleanup
            updateTopBarSpy.mockRestore();
        });

        it('should call updateRankProgress() exactly once', () => {
            // Spy on updateRankProgress
            const updateRankProgressSpy = vi.spyOn(manager, 'updateRankProgress');

            // Act
            manager.updateAllUI();

            // Assert
            expect(updateRankProgressSpy).toHaveBeenCalledOnce();

            // Cleanup
            updateRankProgressSpy.mockRestore();
        });

        it('should call both updateTopBar() and updateRankProgress() exactly once each', () => {
            // Spy on both methods
            const updateTopBarSpy = vi.spyOn(manager, 'updateTopBar');
            const updateRankProgressSpy = vi.spyOn(manager, 'updateRankProgress');

            // Act
            manager.updateAllUI();

            // Assert
            expect(updateTopBarSpy).toHaveBeenCalledOnce();
            expect(updateRankProgressSpy).toHaveBeenCalledOnce();

            // Cleanup
            updateTopBarSpy.mockRestore();
            updateRankProgressSpy.mockRestore();
        });

        it('should not call updateLocationView()', () => {
            // Spy on updateLocationView
            const updateLocationViewSpy = vi.spyOn(manager, 'updateLocationView');

            // Act
            manager.updateAllUI();

            // Assert
            expect(updateLocationViewSpy).not.toHaveBeenCalled();

            // Cleanup
            updateLocationViewSpy.mockRestore();
        });
    });
});
