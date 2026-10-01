/**
 * UIUpdater Tests
 * Verifies that updateAllUI() calls all screen update methods
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';

describe('UIUpdater', () => {
    describe('updateAllUI', () => {
        let mockGame;
        let uiUpdater;

        beforeEach(() => {
            // Create a mock game object
            mockGame = {
                gameState: {
                    currentLocation: 'home_office',
                    money: 1000,
                    reputation: 100,
                    currentRank: { title: 'Intern', level: 0 },
                    progressToNextRank: 50,
                    nextRank: { title: 'Junior Developer' },
                    purchasedItems: [],
                    isChartTypeUnlocked: vi.fn(() => true),
                    canAfford: vi.fn(() => true),
                    currentTask: null,
                    projectSystem: null,
                    bank: { savings: 0, loan: 0, creditScore: 500 },
                    hardwareManager: null
                },
                gameStore: {
                    getState: vi.fn(() => mockGame.gameState)
                },
                newsManager: {
                    getDailyPaper: vi.fn(() => ({
                        date: '2026-10-01',
                        headline: { title: 'Test', description: 'Test' },
                        weather: 'Clear',
                        horoscope: 'Good',
                        articles: []
                    }))
                },
                worldMap: null
            };

            // Create UIUpdater instance
            uiUpdater = new UIUpdater(mockGame);

            // Mock the DOM elements that are expected to exist
            if (typeof document !== 'undefined') {
                document.body.innerHTML = `
                    <div id="money-value">$0</div>
                    <div id="reputation-value">0</div>
                    <div id="rank-value">None</div>
                    <div id="current-rank">None</div>
                    <div id="rank-progress"></div>
                    <div class="next-rank">Max Rank</div>
                    <div id="software-list"></div>
                    <div id="task-content"><div class="task-description"></div></div>
                    <div class="task-requirements"></div>
                    <div id="task-reward"></div>
                    <div id="boss-name"></div>
                    <div id="boss-title"></div>
                    <div id="boss-dialogue"><p></p></div>
                    <div id="active-project-container" class="hidden"></div>
                    <div id="contracts-grid"></div>
                    <div id="shop-grid"></div>
                    <div id="library-grid"></div>
                    <div id="screen-newspaper"></div>
                    <div id="paper-date"></div>
                    <div id="paper-headline"></div>
                    <div id="paper-story"></div>
                    <div id="paper-weather"></div>
                    <div id="paper-horoscope"></div>
                    <div id="btn-close-paper"></div>
                    <div class="office-background"></div>
                    <div class="office-badge" id="current-office-name"></div>
                    <div class="office-desk"></div>
                    <div class="office-chair"></div>
                    <div class="office-character"></div>
                    <div id="office-equipment-section"></div>
                    <div class="office-upgrade-section"></div>
                    <div id="location-interactions" class="hidden"></div>
                    <div class="ai-console-section"></div>
                    <div id="equipment-grid"></div>
                    <div id="bank-savings-balance">$0</div>
                    <div id="bank-loan-balance">$0</div>
                    <div id="bank-credit-score">500</div>
                    <div id="bank-loan-limit">$500</div>
                    <div id="bank-net-worth">$1000</div>
                    <div class="chart-type-btn" data-type="bar"><div class="chart-icon"></div></div>
                `;
            }

            // Spy on all update methods
            vi.spyOn(uiUpdater, 'updateTopBar');
            vi.spyOn(uiUpdater, 'updateRankProgress');
            vi.spyOn(uiUpdater, 'updateChartTypeGrid');
            vi.spyOn(uiUpdater, 'updateSoftwareDisplay');
            vi.spyOn(uiUpdater, 'updateBankScreen');
            vi.spyOn(uiUpdater, 'updateTaskDisplay');
            vi.spyOn(uiUpdater, 'updateCareerScreen');
            vi.spyOn(uiUpdater, 'updateShopScreen');
            vi.spyOn(uiUpdater, 'updateLibraryScreen');
            vi.spyOn(uiUpdater, 'updateNewspaperScreen');
            vi.spyOn(uiUpdater, 'updateLocationLayout');
        });

        it('should call updateTopBar', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateTopBar).toHaveBeenCalled();
        });

        it('should call updateRankProgress', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateRankProgress).toHaveBeenCalled();
        });

        it('should call updateChartTypeGrid', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateChartTypeGrid).toHaveBeenCalled();
        });

        it('should call updateSoftwareDisplay', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateSoftwareDisplay).toHaveBeenCalled();
        });

        it('should call updateBankScreen', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateBankScreen).toHaveBeenCalled();
        });

        it('should call updateTaskDisplay', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateTaskDisplay).toHaveBeenCalled();
        });

        it('should call updateCareerScreen', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateCareerScreen).toHaveBeenCalled();
        });

        it('should call updateShopScreen', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateShopScreen).toHaveBeenCalled();
        });

        it('should call updateLibraryScreen', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateLibraryScreen).toHaveBeenCalled();
        });

        it('should call updateNewspaperScreen', () => {
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateNewspaperScreen).toHaveBeenCalled();
        });

        it('should call updateLocationLayout if currentLocation exists', () => {
            mockGame.gameState.currentLocation = 'home_office';
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateLocationLayout).toHaveBeenCalledWith('home_office');
        });

        it('should not call updateLocationLayout if currentLocation is null', () => {
            mockGame.gameState.currentLocation = null;
            uiUpdater.updateAllUI();
            expect(uiUpdater.updateLocationLayout).not.toHaveBeenCalled();
        });

        it('should update all UI elements in one call', () => {
            uiUpdater.updateAllUI();

            // Verify all required methods were called
            expect(uiUpdater.updateTopBar).toHaveBeenCalled();
            expect(uiUpdater.updateRankProgress).toHaveBeenCalled();
            expect(uiUpdater.updateChartTypeGrid).toHaveBeenCalled();
            expect(uiUpdater.updateSoftwareDisplay).toHaveBeenCalled();
            expect(uiUpdater.updateBankScreen).toHaveBeenCalled();
            expect(uiUpdater.updateTaskDisplay).toHaveBeenCalled();
            expect(uiUpdater.updateCareerScreen).toHaveBeenCalled();
            expect(uiUpdater.updateShopScreen).toHaveBeenCalled();
            expect(uiUpdater.updateLibraryScreen).toHaveBeenCalled();
            expect(uiUpdater.updateNewspaperScreen).toHaveBeenCalled();
            expect(uiUpdater.updateLocationLayout).toHaveBeenCalled();
        });
    });
});
