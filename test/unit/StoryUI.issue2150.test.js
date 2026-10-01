import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoryUI } from '../../src/js/ui/StoryUI.js';

describe('StoryUI', () => {
  let storyUI;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      gameState: {
        storylineManager: {
          getStatus: vi.fn(() => ({
            arc: { name: 'Test Arc', description: 'Test Description' },
            progress: 50,
            phase: 'early',
            decisions: []
          })),
          majorDecisions: [],
          processDecision: vi.fn()
        },
        narrativeClaritySystem: null,
        timeManager: { totalDays: 0 },
        characterArcSystem: null,
        storyBeatsSystem: null
      },
      screenManager: null,
      npcMemorySystem: null,
      characterArcSystem: null,
      showToast: vi.fn(),
      uiUpdater: null
    };

    storyUI = new StoryUI(mockGame);
    document.body.innerHTML = `
      <div class="top-bar-right"></div>
      <div id="screen-container"></div>
    `;
  });

  describe('showDecisionModal - error handling', () => {
    it('should remove modal even if handleDecisionChoice throws an error', () => {
      const decision = {
        id: 'test-decision',
        title: 'Test Decision',
        description: 'Test Description',
        choices: {
          optionA: { message: 'Option A', consequences: { money: 100 } },
          optionB: { message: 'Option B', consequences: { money: -50 } }
        }
      };

      // Mock handleDecisionChoice to throw an error
      const throwError = new Error('StorylineManager phase transition failed');
      storyUI.handleDecisionChoice = vi.fn(() => {
        throw throwError;
      });

      // Show the modal
      storyUI.showDecisionModal(decision);

      // Get the modal and button
      const modal = document.querySelector('.story-decision-modal');
      expect(modal).toBeTruthy();

      const buttons = modal.querySelectorAll('.decision-choice-btn');
      const firstButton = buttons[0];

      // Click the button
      firstButton.click();

      // Modal should be removed even though handleDecisionChoice threw
      const modalAfter = document.querySelector('.story-decision-modal');
      expect(modalAfter).toBeFalsy();
    });

    it('should show error toast when decision processing fails', () => {
      const decision = {
        id: 'test-decision',
        title: 'Test Decision',
        description: 'Test Description',
        choices: {
          optionA: { message: 'Option A' }
        }
      };

      const throwError = new Error('Phase transition bug');
      storyUI.handleDecisionChoice = vi.fn(() => {
        throw throwError;
      });

      storyUI.showDecisionModal(decision);

      const modal = document.querySelector('.story-decision-modal');
      const button = modal.querySelector('.decision-choice-btn');

      button.click();

      // showToast should have been called with error message
      expect(mockGame.showToast).toHaveBeenCalledWith(
        'Decision failed: Phase transition bug',
        'error'
      );
    });

    it('should log error for debugging', () => {
      const decision = {
        id: 'test-decision',
        title: 'Test Decision',
        description: 'Test Description',
        choices: {
          optionA: { message: 'Option A' }
        }
      };

      const throwError = new Error('Test error');
      storyUI.handleDecisionChoice = vi.fn(() => {
        throw throwError;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      storyUI.showDecisionModal(decision);

      const modal = document.querySelector('.story-decision-modal');
      const button = modal.querySelector('.decision-choice-btn');

      button.click();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing decision:', throwError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle normal flow when no error occurs', () => {
      const decision = {
        id: 'test-decision',
        title: 'Test Decision',
        description: 'Test Description',
        choices: {
          optionA: { message: 'Option A' }
        }
      };

      const normalResult = { message: 'Decision recorded' };
      storyUI.handleDecisionChoice = vi.fn(() => normalResult);

      storyUI.showDecisionModal(decision);

      const modal = document.querySelector('.story-decision-modal');
      expect(modal).toBeTruthy();

      const button = modal.querySelector('.decision-choice-btn');
      button.click();

      // Modal should be removed after successful click
      const modalAfter = document.querySelector('.story-decision-modal');
      expect(modalAfter).toBeFalsy();

      // showToast should not be called for errors
      expect(mockGame.showToast).not.toHaveBeenCalled();
    });
  });
});
