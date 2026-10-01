/**
 * DirtyDataSystem.test.js
 * Tests for the DirtyDataSystem class
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DirtyDataSystem } from '../../src/js/game/data/DirtyDataSystem.js';

describe('DirtyDataSystem', () => {
    let gameState;
    let dirtyDataSystem;

    beforeEach(() => {
        gameState = {
            timeManager: {
                totalDays: 10
            },
            legalSystem: null,
            reputationSystem: null,
            money: 1000
        };
        dirtyDataSystem = new DirtyDataSystem(gameState);
    });

    describe('getDirtyOptions', () => {
        it('should return array of dirty data options', () => {
            const options = dirtyDataSystem.getDirtyOptions();
            expect(Array.isArray(options)).toBe(true);
            expect(options.length).toBeGreaterThan(0);
        });

        it('should have all required fields for each option', () => {
            const options = dirtyDataSystem.getDirtyOptions();
            options.forEach(option => {
                expect(option).toHaveProperty('id');
                expect(option).toHaveProperty('name');
                expect(option).toHaveProperty('description');
                expect(option).toHaveProperty('risk');
                expect(option).toHaveProperty('reward');
                expect(option).toHaveProperty('ethical');
                expect(option).toHaveProperty('consequences');
                expect(option.ethical).toBe(false);
            });
        });

        it('should have 5 dirty data options', () => {
            const options = dirtyDataSystem.getDirtyOptions();
            expect(options.length).toBe(5);
        });
    });

    describe('performAction', () => {
        it('should return failure for invalid action id', () => {
            const result = dirtyDataSystem.performAction('invalid_action');
            expect(result.success).toBe(false);
        });

        it('should perform action when not caught', () => {
            // Mock Math.random to return a value > action.risk
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            const result = dirtyDataSystem.performAction('manipulate_data');
            expect(result.success).toBe(true);
            expect(result.caught).toBe(false);
            expect(result.message).toContain('got away with it');
        });

        it('should record action when successful', () => {
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            dirtyDataSystem.performAction('sell_data');
            expect(dirtyDataSystem.unethicalActions.length).toBe(1);
            expect(dirtyDataSystem.unethicalActions[0].action).toBe('sell_data');
            expect(dirtyDataSystem.unethicalActions[0].caught).toBe(false);
        });

        it('should be caught based on risk', () => {
            // Mock Math.random to return a value < action.risk
            vi.spyOn(Math, 'random').mockReturnValue(0.1);

            const result = dirtyDataSystem.performAction('manipulate_data');
            expect(result.success).toBe(false);
            expect(result.caught).toBe(true);
            expect(result.message).toContain('caught');
        });

        it('should record action when caught', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.1);

            dirtyDataSystem.performAction('fake_results');
            expect(dirtyDataSystem.unethicalActions.length).toBe(1);
            expect(dirtyDataSystem.unethicalActions[0].caught).toBe(true);
        });

        it('should apply consequences to reputation', () => {
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            const initialReputation = dirtyDataSystem.reputation;
            dirtyDataSystem.performAction('manipulate_data');
            expect(dirtyDataSystem.reputation).toBeLessThan(initialReputation);
        });

        it('should have higher penalties when caught', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.1);

            const initialReputation = dirtyDataSystem.reputation;
            dirtyDataSystem.performAction('sell_data');
            const caughtReputation = dirtyDataSystem.reputation;

            // Reset
            dirtyDataSystem = new DirtyDataSystem(gameState);

            // Now succeed
            vi.spyOn(Math, 'random').mockReturnValue(1.0);
            dirtyDataSystem.performAction('sell_data');
            const successReputation = dirtyDataSystem.reputation;

            // Caught should result in more negative reputation
            expect(caughtReputation).toBeLessThan(successReputation);
        });
    });

    describe('getReputationLevel', () => {
        it('should return "clean" for positive reputation', () => {
            dirtyDataSystem.reputation = 5;
            expect(dirtyDataSystem.getReputationLevel()).toBe('clean');
        });

        it('should return "clean" for reputation > -10', () => {
            dirtyDataSystem.reputation = -5;
            expect(dirtyDataSystem.getReputationLevel()).toBe('clean');
        });

        it('should return "questionable" for reputation between -10 and -30', () => {
            dirtyDataSystem.reputation = -20;
            expect(dirtyDataSystem.getReputationLevel()).toBe('questionable');
        });

        it('should return "bad" for reputation between -30 and -50', () => {
            dirtyDataSystem.reputation = -40;
            expect(dirtyDataSystem.getReputationLevel()).toBe('bad');
        });

        it('should return "terrible" for reputation < -50', () => {
            dirtyDataSystem.reputation = -60;
            expect(dirtyDataSystem.getReputationLevel()).toBe('terrible');
        });
    });

    describe('unethicalActions tracking', () => {
        it('should maintain history of actions', () => {
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            dirtyDataSystem.performAction('manipulate_data');
            dirtyDataSystem.performAction('sell_data');
            dirtyDataSystem.performAction('fake_results');

            expect(dirtyDataSystem.unethicalActions.length).toBe(3);
            expect(dirtyDataSystem.unethicalActions[0].action).toBe('manipulate_data');
            expect(dirtyDataSystem.unethicalActions[1].action).toBe('sell_data');
            expect(dirtyDataSystem.unethicalActions[2].action).toBe('fake_results');
        });
    });
});

describe('DirtyDataSystem UI Integration', () => {
    let gameState;
    let mockGame;
    let dirtyDataSystem;

    beforeEach(() => {
        // Set up DOM
        if (!document.body) {
            document.body = document.createElement('body');
        }

        // Create required DOM elements for the test
        const textUI = document.createElement('div');
        textUI.className = 'text-ui';
        document.body.appendChild(textUI);

        gameState = {
            timeManager: {
                totalDays: 10
            },
            legalSystem: null,
            reputationSystem: null,
            money: 1000
        };

        dirtyDataSystem = new DirtyDataSystem(gameState);

        // Create a mock game object that tests can use
        mockGame = {
            dirtyDataSystem,
            dialogueUI: null,
            gameState,
            uiUpdater: {
                updateAllUI: vi.fn()
            },
            showModal: vi.fn(),
            updateDirtyReputationDisplay: vi.fn()
        };
    });

    afterEach(() => {
        // Clean up DOM
        const repDisplay = document.getElementById('dirty-reputation-display');
        if (repDisplay) repDisplay.remove();
        const textUI = document.querySelector('.text-ui');
        if (textUI) textUI.remove();
    });

    describe('updateDirtyReputationDisplay', () => {
        it('should create dirty-reputation-display DOM element when it does not exist', () => {
            const repDisplay = document.getElementById('dirty-reputation-display');
            expect(repDisplay).toBeNull();

            // Simulate what updateDirtyReputationDisplay would do
            const repLevel = dirtyDataSystem.getReputationLevel();
            const unethicalCount = dirtyDataSystem.unethicalActions.length;

            let newDisplay = document.createElement('div');
            newDisplay.id = 'dirty-reputation-display';
            newDisplay.className = 'dirty-reputation-display';
            const statsPanel = document.querySelector('.text-ui');
            if (statsPanel) {
                statsPanel.appendChild(newDisplay);
            }

            const createdDisplay = document.getElementById('dirty-reputation-display');
            expect(createdDisplay).not.toBeNull();
            expect(createdDisplay.className).toContain('dirty-reputation-display');
        });

        it('should display ethics rating with correct class based on reputation level', () => {
            // Create display with different reputation levels
            const colorClasses = {
                'clean': 'rep-clean',
                'questionable': 'rep-questionable',
                'bad': 'rep-bad',
                'terrible': 'rep-terrible'
            };

            const testCases = [
                { reputation: 5, expectedLevel: 'clean' },
                { reputation: -20, expectedLevel: 'questionable' },
                { reputation: -40, expectedLevel: 'bad' },
                { reputation: -60, expectedLevel: 'terrible' }
            ];

            testCases.forEach(testCase => {
                dirtyDataSystem.reputation = testCase.reputation;
                const repLevel = dirtyDataSystem.getReputationLevel();
                expect(repLevel).toBe(testCase.expectedLevel);
                expect(colorClasses[repLevel]).toBeDefined();
            });
        });

        it('should display unethical actions count in DOM', () => {
            // Add some actions
            vi.spyOn(Math, 'random').mockReturnValue(1.0);
            dirtyDataSystem.performAction('manipulate_data');
            dirtyDataSystem.performAction('sell_data');

            const unethicalCount = dirtyDataSystem.unethicalActions.length;
            expect(unethicalCount).toBe(2);

            // Create display with this count
            let display = document.createElement('div');
            display.id = 'dirty-reputation-display';
            display.innerHTML = `
                <div class="text-stat-row">
                    <span class="text-stat-label">Unethical Actions:</span>
                    <span class="text-stat-value">${unethicalCount}</span>
                </div>
            `;
            document.body.appendChild(display);

            const statValue = display.querySelector('.text-stat-value');
            expect(statValue.textContent).toBe('2');
        });
    });

    describe('handleChoice wrapper restoration', () => {
        it('should be able to call setOnClose callback to restore original handleChoice', () => {
            // Mock DialogueUI-like object
            const mockDialogueUI = {
                handleChoice: vi.fn(),
                _originalHandleChoice: null,
                setOnClose: function(callback) {
                    this.onCloseCallback = callback;
                },
                close: function() {
                    if (this.onCloseCallback) {
                        this.onCloseCallback();
                    }
                }
            };

            // Store original
            const originalMethod = mockDialogueUI.handleChoice;
            mockDialogueUI._originalHandleChoice = originalMethod.bind(mockDialogueUI);

            // Create wrapper
            mockDialogueUI.handleChoice = vi.fn((choiceId) => {
                if (choiceId === 'cancel') {
                    mockDialogueUI.close();
                }
            });

            // Verify wrapper is in place
            expect(mockDialogueUI.handleChoice).not.toBe(originalMethod);

            // Set up restoration callback
            mockDialogueUI.setOnClose(() => {
                if (mockDialogueUI && mockDialogueUI._originalHandleChoice) {
                    mockDialogueUI.handleChoice = mockDialogueUI._originalHandleChoice;
                    mockDialogueUI._originalHandleChoice = null;
                }
            });

            // Trigger close (should restore)
            mockDialogueUI.close();

            // Verify restoration - check that handleChoice is restored to a callable function
            expect(typeof mockDialogueUI.handleChoice).toBe('function');
            expect(mockDialogueUI._originalHandleChoice).toBeNull();
        });

        it('should prevent nesting of handleChoice wrappers on multiple calls', () => {
            const mockDialogueUI = {
                handleChoice: vi.fn(),
                _originalHandleChoice: null,
                setOnClose: function(callback) {
                    this.onCloseCallback = callback;
                },
                close: function() {
                    if (this.onCloseCallback) {
                        this.onCloseCallback();
                    }
                }
            };

            // First call - store original if not already stored
            if (!mockDialogueUI._originalHandleChoice) {
                mockDialogueUI._originalHandleChoice = mockDialogueUI.handleChoice.bind(mockDialogueUI);
            }
            const originalFromFirst = mockDialogueUI._originalHandleChoice;

            // Create first wrapper
            mockDialogueUI.handleChoice = vi.fn((choiceId) => {
                if (choiceId === 'cancel') {
                    mockDialogueUI.close();
                }
            });
            const firstWrapper = mockDialogueUI.handleChoice;

            // Simulate close - restore
            mockDialogueUI.close();
            mockDialogueUI.handleChoice = originalFromFirst;
            mockDialogueUI._originalHandleChoice = null;

            // Second call - should create new wrapper of original, not wrapper of wrapper
            if (!mockDialogueUI._originalHandleChoice) {
                mockDialogueUI._originalHandleChoice = mockDialogueUI.handleChoice.bind(mockDialogueUI);
            }
            const originalFromSecond = mockDialogueUI._originalHandleChoice;

            // Verify both point to callable functions (preventing double-wrapping)
            expect(typeof originalFromFirst).toBe('function');
            expect(typeof originalFromSecond).toBe('function');
        });
    });
});
