import { expect } from 'chai';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

describe('DialogueUI', () => {
    let dialogueUI;
    let mockGame;

    beforeEach(() => {
        // Clear any existing dialogue containers
        const existing = document.getElementById('dialogue-ui');
        if (existing) {
            existing.remove();
        }

        // Create mock game object
        mockGame = {
            gameState: {
                npcManager: {
                    getRelationship: () => 0,
                    setRelationship: () => {}
                },
                characterStats: {
                    getStat: () => 0,
                    stats: {}
                },
                dialogueTreeSystem: null
            },
            dialogueTreeSystem: null
        };

        dialogueUI = new DialogueUI(mockGame);
    });

    afterEach(() => {
        const container = document.getElementById('dialogue-ui');
        if (container) {
            container.remove();
        }
        // Remove injected styles
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
            if (style.textContent.includes('dialogue-close')) {
                style.remove();
            }
        });
    });

    it('should have focus-visible styles for dialogue-choice', () => {
        const styles = document.querySelectorAll('style');
        let hasChoiceFocusStyle = false;

        styles.forEach(style => {
            if (style.textContent.includes('.dialogue-choice:focus-visible')) {
                hasChoiceFocusStyle = true;
            }
        });

        expect(hasChoiceFocusStyle).to.be.true;
    });

    it('should have focus-visible styles for dialogue-close', () => {
        const styles = document.querySelectorAll('style');
        let hasCloseFocusStyle = false;

        styles.forEach(style => {
            if (style.textContent.includes('.dialogue-close:focus-visible')) {
                hasCloseFocusStyle = true;
            }
        });

        expect(hasCloseFocusStyle).to.be.true;
    });

    it('should focus the first choice on initial open', () => {
        // Only test the fallback DOM method (not Lit component)
        if (dialogueUI.litComponent) {
            return;
        }

        return new Promise((resolve) => {
            const npc = {
                id: 'test-npc',
                name: 'Test NPC',
                type: 'Trader',
                personality: 'friendly'
            };

            dialogueUI.open(npc);

            // Allow time for focus to be set during open()
            setTimeout(() => {
                const choices = dialogueUI.container.querySelectorAll('.dialogue-choice');
                if (choices.length > 0) {
                    const firstChoice = choices[0];
                    const focusedElement = document.activeElement;
                    expect(focusedElement).to.equal(firstChoice);
                }
                resolve();
            }, 10);
        });
    });

    it('should create dialogue-choice elements with proper class', () => {
        // Only test the fallback DOM method (not Lit component)
        if (dialogueUI.litComponent) {
            return;
        }

        const npc = {
            id: 'test-npc',
            name: 'Test NPC',
            type: 'Trader',
            personality: 'friendly'
        };

        dialogueUI.open(npc);

        dialogueUI.showChoices([
            { id: 'choice1', text: 'Choice 1' },
            { id: 'choice2', text: 'Choice 2' }
        ]);

        const choices = dialogueUI.container.querySelectorAll('.dialogue-choice');
        expect(choices).to.have.length(2);
        expect(choices[0].textContent).to.equal('Choice 1');
        expect(choices[1].textContent).to.equal('Choice 2');
    });

    it('should make dialogue-close button focusable', () => {
        // Only test the fallback DOM method (not Lit component)
        if (dialogueUI.litComponent) {
            return;
        }

        const closeButton = dialogueUI.container.querySelector('.dialogue-close');

        expect(closeButton).to.exist;
        expect(closeButton.tagName).to.equal('BUTTON');

        closeButton.focus();
        expect(document.activeElement).to.equal(closeButton);
    });

    it('should include outline-offset in focus-visible styles', () => {
        const styles = document.querySelectorAll('style');
        let hasOutlineOffset = false;

        styles.forEach(style => {
            if (style.textContent.includes('.dialogue-choice:focus-visible') &&
                style.textContent.includes('outline-offset: 2px')) {
                hasOutlineOffset = true;
            }
        });

        expect(hasOutlineOffset).to.be.true;
    });
});
