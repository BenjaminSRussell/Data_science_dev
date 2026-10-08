/**
 * Unit tests for StoryUI
 */

import { describe, it, expect } from 'vitest';
import { StoryUI } from '../../src/js/ui/StoryUI.js';

describe('StoryUI', () => {
    describe('formatConsequences', () => {
        it('should format ethics positive consequence', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ ethics: 5 });
            expect(result).toContain('Ethics +5');
        });

        it('should format ethics negative consequence', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ ethics: -5 });
            expect(result).toContain('Ethics -5');
        });

        it('should format ethics zero consequence with no sign', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ ethics: 0 });
            expect(result).toContain('Ethics 0');
        });

        it('should format money consequence with locale string', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ money: 1500 });
            expect(result).toContain('+$1,500');
        });

        it('should format empty consequences as empty string', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({});
            expect(result).toBe('');
        });

        it('should format multiple consequences joined with space', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ ethics: 5, money: 1500, reputation: -2 });
            expect(result).toContain('Ethics +5');
            expect(result).toContain('+$1,500');
            expect(result).toContain('Reputation -2');
            // Verify all three are present and separated by single space between spans
            const spanCount = (result.match(/<span/g) || []).length;
            expect(spanCount).toBe(3);
        });

        it('should format reputation positive consequence', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ reputation: 10 });
            expect(result).toContain('Reputation +10');
        });

        it('should format reputation negative consequence', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.formatConsequences({ reputation: -3 });
            expect(result).toContain('Reputation -3');
        });
    });

    describe('getPhaseClass', () => {
        it('should return empty string when no storylineManager', () => {
            const mockGame = {};
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.getPhaseClass('mid');
            expect(result).toBe('');
        });

        it('should return "active" when phase matches current phase', () => {
            const mockGame = {
                gameState: {
                    storylineManager: {
                        storylinePhase: 'mid'
                    }
                }
            };
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.getPhaseClass('mid');
            expect(result).toBe('active');
        });

        it('should return "completed" when phase is before current phase', () => {
            const mockGame = {
                gameState: {
                    storylineManager: {
                        storylinePhase: 'mid'
                    }
                }
            };
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.getPhaseClass('early');
            expect(result).toBe('completed');
        });

        it('should return empty string when phase is after current phase', () => {
            const mockGame = {
                gameState: {
                    storylineManager: {
                        storylinePhase: 'mid'
                    }
                }
            };
            const storyUI = new StoryUI(mockGame);
            const result = storyUI.getPhaseClass('late');
            expect(result).toBe('');
        });

        it('should default to early phase when storylinePhase is not set', () => {
            const mockGame = {
                gameState: {
                    storylineManager: {}
                }
            };
            const storyUI = new StoryUI(mockGame);
            // early is default, so early should be 'active'
            const result = storyUI.getPhaseClass('early');
            expect(result).toBe('active');
        });
    });

    describe('updateStoryDisplay bug and fix', () => {
        it('should handle missing storylineManager gracefully', () => {
            const mockGame = {
                gameState: {}
            };
            const storyUI = new StoryUI(mockGame);

            // Mock the update methods to avoid DOM issues
            storyUI.updateNarrativeContext = () => {};
            storyUI.updatePhaseDisplay = () => {};
            storyUI.updateDecisionsDisplay = () => {};
            storyUI.updateJournalDisplay = () => {};
            storyUI.updateNextBeatDisplay = () => {};
            storyUI.updateCharacterArc = () => {};

            // Should not throw when storylineManager is undefined
            expect(() => storyUI.updateStoryDisplay()).not.toThrow();
        });

        it('should call initialize when storylineManager exists and is not initialized', () => {
            let initializeCalled = false;
            const mockGame = {
                gameState: {
                    storylineManager: {
                        initialize: () => {
                            initializeCalled = true;
                        },
                        getStatus: () => ({ arc: null, progress: 0, decisions: [] }),
                        getCurrentArc: () => ({ name: 'Test Arc', description: 'Test' })
                    }
                }
            };
            const storyUI = new StoryUI(mockGame);

            // Mock the update methods to avoid DOM issues
            storyUI.updateNarrativeContext = () => {};
            storyUI.updatePhaseDisplay = () => {};
            storyUI.updateDecisionsDisplay = () => {};
            storyUI.updateJournalDisplay = () => {};
            storyUI.updateNextBeatDisplay = () => {};
            storyUI.updateCharacterArc = () => {};

            storyUI.updateStoryDisplay();
            expect(initializeCalled).toBe(true);
        });
    });
});
