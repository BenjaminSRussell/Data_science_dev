import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LitUIManager } from '../../src/js/ui/LitUIManager';
import { logger } from '../../src/js/utils/Logger.js';

describe('LitUIManager', () => {
    let litUIManager;
    let warnSpy;

    beforeEach(() => {
        // LitUIManager reports through the shared logger (like UIUpdater)
        warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
        litUIManager = new LitUIManager({ gameState: {} });
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    describe('initialize()', () => {
        it('should warn when top-bar-container element is missing', () => {
            litUIManager.initialize();
            expect(warnSpy.mock.calls.length).toBe(2);
            expect(warnSpy.mock.calls[0][0]).toContain('#top-bar-container');
        });

        it('should warn when rank-progress-container element is missing', () => {
            litUIManager.initialize();
            expect(warnSpy.mock.calls.length).toBe(2);
            expect(warnSpy.mock.calls[1][0]).toContain('#rank-progress-container');
        });

        it('should only warn once about missing containers on multiple calls', () => {
            litUIManager.initialize();
            litUIManager.initialize();
            litUIManager.initialize();
            // Should warn twice (once for each container), not more
            expect(warnSpy.mock.calls.length).toBe(2);
        });

        it('should not warn when top-bar-container exists', () => {
            const topBarContainer = document.createElement('div');
            topBarContainer.id = 'top-bar-container';
            document.body.appendChild(topBarContainer);

            litUIManager.initialize();

            // Should still warn about rank-progress-container but not top-bar-container
            const warnings = warnSpy.mock.calls.map(call => call[0]);
            expect(warnings.some(w => w.includes('#top-bar-container'))).toBe(false);
            expect(warnings.some(w => w.includes('#rank-progress-container'))).toBe(true);

            document.body.removeChild(topBarContainer);
        });

        it('should not warn when rank-progress-container exists', () => {
            const rankProgressContainer = document.createElement('div');
            rankProgressContainer.id = 'rank-progress-container';
            document.body.appendChild(rankProgressContainer);

            litUIManager.initialize();

            // Should still warn about top-bar-container but not rank-progress-container
            const warnings = warnSpy.mock.calls.map(call => call[0]);
            expect(warnings.some(w => w.includes('#top-bar-container'))).toBe(true);
            expect(warnings.some(w => w.includes('#rank-progress-container'))).toBe(false);

            document.body.removeChild(rankProgressContainer);
        });

        it('should not warn when both containers exist', () => {
            const topBarContainer = document.createElement('div');
            topBarContainer.id = 'top-bar-container';
            const rankProgressContainer = document.createElement('div');
            rankProgressContainer.id = 'rank-progress-container';
            document.body.appendChild(topBarContainer);
            document.body.appendChild(rankProgressContainer);

            litUIManager.initialize();

            expect(warnSpy.mock.calls.length).toBe(0);

            document.body.removeChild(topBarContainer);
            document.body.removeChild(rankProgressContainer);
        });
    });

    describe('updateTopBar()', () => {
        it('should warn when topBar component is not available', () => {
            litUIManager.updateTopBar();
            expect(warnSpy.mock.calls.length).toBe(1);
            expect(warnSpy.mock.calls[0][0]).toContain('TopBar');
            expect(warnSpy.mock.calls[0][0]).toContain('falling back');
        });

        it('should only warn once about missing topBar on multiple calls', () => {
            litUIManager.updateTopBar();
            litUIManager.updateTopBar();
            litUIManager.updateTopBar();
            expect(warnSpy.mock.calls.length).toBe(1);
        });

        it('should not warn when topBar component is available', () => {
            const mockTopBar = {
                updateFromGameState: () => {}
            };
            litUIManager.components.set('topBar', mockTopBar);
            litUIManager.game = { gameState: { money: 100, reputation: 50, currentRank: { title: 'Novice' } } };

            litUIManager.updateTopBar();

            expect(warnSpy.mock.calls.length).toBe(0);
        });
    });

    describe('updateRankProgress()', () => {
        it('should warn when rankProgress component is not available', () => {
            litUIManager.updateRankProgress();
            expect(warnSpy.mock.calls.length).toBe(1);
            expect(warnSpy.mock.calls[0][0]).toContain('RankProgress');
            expect(warnSpy.mock.calls[0][0]).toContain('falling back');
        });

        it('should only warn once about missing rankProgress on multiple calls', () => {
            litUIManager.updateRankProgress();
            litUIManager.updateRankProgress();
            litUIManager.updateRankProgress();
            expect(warnSpy.mock.calls.length).toBe(1);
        });

        it('should not warn when rankProgress component is available', () => {
            const mockProgressBar = {
                updateFromGameState: () => {}
            };
            litUIManager.components.set('rankProgress', mockProgressBar);
            litUIManager.game = { gameState: { progressToNextRank: 50, currentRank: { title: 'Novice' } } };

            litUIManager.updateRankProgress();

            expect(warnSpy.mock.calls.length).toBe(0);
        });
    });

    describe('updateLocationView()', () => {
        it('should warn when location view container is not found', () => {
            litUIManager.updateLocationView('location1', {}, '', '');
            expect(warnSpy.mock.calls.length).toBe(1);
            expect(warnSpy.mock.calls[0][0]).toContain('location view container');
        });

        it('should only warn once about missing location view container on multiple calls', () => {
            litUIManager.updateLocationView('location1', {}, '', '');
            litUIManager.updateLocationView('location2', {}, '', '');
            litUIManager.updateLocationView('location3', {}, '', '');
            expect(warnSpy.mock.calls.length).toBe(1);
        });

        it('should not warn when location-view container exists', () => {
            const locationViewContainer = document.createElement('div');
            locationViewContainer.id = 'location-view';
            document.body.appendChild(locationViewContainer);

            litUIManager.updateLocationView('location1', {}, '', '');

            expect(warnSpy.mock.calls.length).toBe(0);

            document.body.removeChild(locationViewContainer);
        });

        it('should not warn when location-view-container exists', () => {
            const locationViewContainer = document.createElement('div');
            locationViewContainer.id = 'location-view-container';
            document.body.appendChild(locationViewContainer);

            litUIManager.updateLocationView('location1', {}, '', '');

            expect(warnSpy.mock.calls.length).toBe(0);

            document.body.removeChild(locationViewContainer);
        });
    });
});
