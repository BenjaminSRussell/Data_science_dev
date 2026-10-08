/**
 * Unit tests for DialogueUI
 * Core dialogue flow testing for the live conversation system
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

describe('DialogueUI', () => {
    let dialogueUI;
    let mockGame;
    let mockGameState;

    beforeEach(() => {
        // Setup mock DOM
        document.body.innerHTML = `
            <div id="dialogue-ui-container"></div>
        `;

        // Setup mock game and gameState objects
        mockGameState = {
            npcManager: {
                getRelationship: vi.fn((npcId) => 0),
                setRelationship: vi.fn()
            },
            characterStats: {
                getStat: vi.fn((stat) => 0),
                stats: {}
            },
            dialogueTreeSystem: null
        };

        mockGame = {
            gameState: mockGameState,
            dialogueTreeSystem: null
        };

        // Create DialogueUI instance
        dialogueUI = new DialogueUI(mockGame);
    });

    afterEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('constructor', () => {
        it('should initialize with correct default values', () => {
            expect(dialogueUI.game).toBe(mockGame);
            expect(dialogueUI.isOpen).toBe(false);
            expect(dialogueUI.currentNPC).toBeNull();
            expect(dialogueUI.currentTree).toBeNull();
            expect(dialogueUI.currentNode).toBeNull();
            expect(dialogueUI.onClose).toBeNull();
        });

        it('should create a container element', () => {
            expect(dialogueUI.container).toBeDefined();
            expect(dialogueUI.container.id).toBe('dialogue-ui');
        });
    });

    describe('open(npc, relationshipLevel)', () => {
        it('should return early if npc is falsy', () => {
            dialogueUI.open(null);
            expect(dialogueUI.currentNPC).toBeNull();
            expect(dialogueUI.isOpen).toBe(false);
        });

        it('should set currentNPC, currentTree, currentNode, and isOpen when given a valid NPC', () => {
            const mockNPC = {
                id: 'npc_1',
                name: 'Alice',
                title: 'Mentor',
                personality: 'friendly'
            };

            // Create a mock dialogue tree
            const mockTree = {
                getRootNode: vi.fn(() => ({
                    id: 'root',
                    text: 'Hello, welcome!',
                    choices: []
                })),
                getNode: vi.fn((id) => ({
                    id,
                    text: 'Some dialogue',
                    choices: []
                }))
            };

            mockGameState.dialogueTreeSystem = {
                getTree: vi.fn(() => mockTree)
            };

            dialogueUI.open(mockNPC, 0);

            expect(dialogueUI.currentNPC).toBe(mockNPC);
            expect(dialogueUI.currentTree).toBe(mockTree);
            expect(dialogueUI.currentNode).toBeDefined();
            expect(dialogueUI.isOpen).toBe(true);
        });

        it('should fall back to trivial one-node tree when no dialogueTreeSystem is reachable', () => {
            const mockNPC = {
                id: 'npc_2',
                name: 'Bob',
                title: 'Friend'
            };

            // No dialogueTreeSystem
            mockGameState.dialogueTreeSystem = null;
            mockGame.dialogueTreeSystem = null;

            dialogueUI.open(mockNPC);

            expect(dialogueUI.currentTree).toBeDefined();
            expect(typeof dialogueUI.currentTree.getRootNode).toBe('function');
            expect(typeof dialogueUI.currentTree.getNode).toBe('function');

            const rootNode = dialogueUI.currentTree.getRootNode();
            expect(rootNode.id).toBe('root');
            expect(rootNode.text).toContain(`I'm ${mockNPC.name}`);
            expect(rootNode.choices).toHaveLength(1);
            expect(rootNode.choices[0].id).toBe('close');
        });

        it('should use npcManager.getRelationship when relationshipLevel is not provided', () => {
            mockGameState.npcManager.getRelationship.mockReturnValue(2);

            const mockNPC = { id: 'npc_3', name: 'Charlie' };
            const mockTree = {
                getRootNode: vi.fn(() => ({
                    id: 'root',
                    text: 'Hello',
                    choices: []
                })),
                getNode: vi.fn()
            };

            mockGameState.dialogueTreeSystem = {
                getTree: vi.fn(() => mockTree)
            };

            dialogueUI.open(mockNPC);

            expect(mockGameState.npcManager.getRelationship).toHaveBeenCalledWith('npc_3');
            expect(mockGameState.dialogueTreeSystem.getTree).toHaveBeenCalledWith('npc_3', 2);
        });

        it('should use provided relationshipLevel over npcManager.getRelationship', () => {
            mockGameState.npcManager.getRelationship.mockReturnValue(0);

            const mockNPC = { id: 'npc_4', name: 'Diana' };
            const mockTree = {
                getRootNode: vi.fn(() => ({
                    id: 'root',
                    text: 'Hello',
                    choices: []
                })),
                getNode: vi.fn()
            };

            mockGameState.dialogueTreeSystem = {
                getTree: vi.fn(() => mockTree)
            };

            dialogueUI.open(mockNPC, 5);

            expect(mockGameState.dialogueTreeSystem.getTree).toHaveBeenCalledWith('npc_4', 5);
        });

        it('should update DOM with NPC info when using fallback DOM method', () => {
            // Ensure we're using the DOM fallback (no Lit component)
            expect(dialogueUI.litComponent).toBeNull();

            const mockNPC = {
                id: 'npc_5',
                name: 'Eve',
                title: 'Guide',
                personality: 'mysterious'
            };

            dialogueUI.open(mockNPC);

            const nameEl = dialogueUI.container.querySelector('#dialogue-npc-name');
            const titleEl = dialogueUI.container.querySelector('#dialogue-npc-title');
            const avatarInitial = dialogueUI.container.querySelector('#dialogue-avatar-initial');

            expect(nameEl.textContent).toBe('Eve');
            expect(titleEl.textContent).toBe('Guide');
            expect(avatarInitial.textContent).toBe('E');
        });
    });

    describe('showNode(node)', () => {
        beforeEach(() => {
            // Open dialogue first to set up container
            const mockNPC = { id: 'npc', name: 'Test' };
            dialogueUI.open(mockNPC);
        });

        it('should return early if node is falsy', () => {
            const previousNode = dialogueUI.currentNode;
            dialogueUI.showNode(null);
            expect(dialogueUI.currentNode).toBe(previousNode);
        });

        it('should set currentNode when given a valid node', () => {
            const newNode = {
                id: 'node_1',
                text: 'New dialogue',
                choices: [{ id: 'choice_1', text: 'Option 1' }]
            };

            dialogueUI.showNode(newNode);

            expect(dialogueUI.currentNode).toBe(newNode);
        });

        it('should populate text in the dialogue container', (done) => {
            const newNode = {
                id: 'node_2',
                text: 'Test dialogue text',
                choices: [{ id: 'choice', text: 'Continue' }]
            };

            dialogueUI.showNode(newNode);

            // Wait for typing animation to complete (default speed 30ms per char)
            setTimeout(() => {
                const textEl = dialogueUI.container.querySelector('#dialogue-text');
                expect(textEl.textContent).toBe('Test dialogue text');
                done();
            }, 500);
        });

        it('should show provided choices', () => {
            const newNode = {
                id: 'node_3',
                text: 'Choose wisely',
                choices: [
                    { id: 'choice_1', text: 'Option 1' },
                    { id: 'choice_2', text: 'Option 2' }
                ]
            };

            dialogueUI.showNode(newNode);

            const choiceButtons = dialogueUI.container.querySelectorAll('.dialogue-choice');
            expect(choiceButtons).toHaveLength(2);
            expect(choiceButtons[0].textContent).toBe('Option 1');
            expect(choiceButtons[1].textContent).toBe('Option 2');
        });

        it('should inject Continue and Goodbye choices when node has no choices', () => {
            const newNode = {
                id: 'node_4',
                text: 'End of dialogue',
                choices: []
            };

            dialogueUI.showNode(newNode);

            const choiceButtons = dialogueUI.container.querySelectorAll('.dialogue-choice');
            expect(choiceButtons).toHaveLength(2);
            expect(choiceButtons[0].textContent).toContain('Continue');
            expect(choiceButtons[1].textContent).toContain('Goodbye');
        });

        it('should inject Continue and Goodbye when node has no choices property', () => {
            const newNode = {
                id: 'node_5',
                text: 'Another dialogue'
                // No choices property
            };

            dialogueUI.showNode(newNode);

            const choiceButtons = dialogueUI.container.querySelectorAll('.dialogue-choice');
            expect(choiceButtons).toHaveLength(2);
            expect(choiceButtons[0].textContent).toContain('Continue');
            expect(choiceButtons[1].textContent).toContain('Goodbye');
        });
    });

    describe('handleChoice(choiceId)', () => {
        let mockNPC;
        let mockTree;

        beforeEach(() => {
            mockNPC = { id: 'npc', name: 'Test NPC' };

            mockTree = {
                getRootNode: vi.fn(() => ({
                    id: 'root',
                    text: 'Root dialogue',
                    choices: []
                })),
                getNode: vi.fn((id) => {
                    if (id === 'node_1') {
                        return {
                            id: 'node_1',
                            text: 'First node',
                            choices: [{ id: 'choice_a', text: 'Choice A', nextNode: 'node_2' }]
                        };
                    }
                    if (id === 'node_2') {
                        return {
                            id: 'node_2',
                            text: 'Second node',
                            nextNode: 'node_3'
                        };
                    }
                    if (id === 'node_3') {
                        return {
                            id: 'node_3',
                            text: 'Third node',
                            choices: []
                        };
                    }
                    return null;
                })
            };

            mockGameState.dialogueTreeSystem = {
                getTree: vi.fn(() => mockTree)
            };

            dialogueUI.open(mockNPC);
            dialogueUI.currentNode = mockTree.getNode('node_1');
        });

        it('should close dialogue when choiceId is "close"', () => {
            const closeCallback = vi.fn();
            dialogueUI.setOnClose(closeCallback);

            dialogueUI.handleChoice('close');

            expect(dialogueUI.isOpen).toBe(false);
            expect(dialogueUI.currentNPC).toBeNull();
            expect(closeCallback).toHaveBeenCalled();
        });

        it('should close dialogue when choiceId is "goodbye"', () => {
            const closeCallback = vi.fn();
            dialogueUI.setOnClose(closeCallback);

            dialogueUI.handleChoice('goodbye');

            expect(dialogueUI.isOpen).toBe(false);
            expect(closeCallback).toHaveBeenCalled();
        });

        it('should follow nextNode when choiceId is "continue"', () => {
            dialogueUI.currentNode = {
                id: 'current',
                text: 'Current node',
                nextNode: 'node_2'
            };

            dialogueUI.handleChoice('continue');

            expect(mockTree.getNode).toHaveBeenCalledWith('node_2');
        });

        it('should close when choiceId is "continue" but currentNode has no nextNode', () => {
            dialogueUI.currentNode = {
                id: 'current',
                text: 'Current node'
                // No nextNode
            };

            dialogueUI.handleChoice('continue');

            expect(dialogueUI.isOpen).toBe(false);
        });

        it('should return without touching state for unrecognized choiceId', () => {
            const previousNode = dialogueUI.currentNode;
            const previousNPC = dialogueUI.currentNPC;

            dialogueUI.handleChoice('unrecognized_choice_id');

            expect(dialogueUI.currentNode).toBe(previousNode);
            expect(dialogueUI.currentNPC).toBe(previousNPC);
        });

        it('should apply the ENTERED node\'s effects and advance for a valid choice (#1156)', () => {
            const applySpy = vi.spyOn(dialogueUI, 'applyEffects');

            dialogueUI.currentNode = {
                id: 'node_with_choice',
                text: 'Choose',
                choices: [{ id: 'choice_1', text: 'Option', nextNode: 'node_2' }],
                effects: { relationship: 5 }
            };
            mockTree.getNode.mockReturnValue({ id: 'node_2', text: 'Next', choices: [], effects: { relationship: 1 } });

            dialogueUI.handleChoice('choice_1');

            expect(applySpy).toHaveBeenCalledWith({ relationship: 1 });
            expect(applySpy).not.toHaveBeenCalledWith({ relationship: 5 });
            expect(mockTree.getNode).toHaveBeenCalledWith('node_2');
        });

        it('should use choiceId as nextNode if choice.nextNode is not defined', () => {
            dialogueUI.currentNode = {
                id: 'node_without_next',
                text: 'Choose',
                choices: [{ id: 'choice_1', text: 'Option' }]
            };

            mockTree.getNode.mockReturnValue({
                id: 'choice_1',
                text: 'Next node text'
            });

            dialogueUI.handleChoice('choice_1');

            expect(mockTree.getNode).toHaveBeenCalledWith('choice_1');
        });

        it('should return to root node when next node does not exist', (done) => {
            dialogueUI.currentNode = {
                id: 'node_with_missing_next',
                text: 'Choose',
                choices: [{ id: 'choice_1', text: 'Option', nextNode: 'missing_node' }]
            };

            mockTree.getNode.mockReturnValue(null);

            dialogueUI.handleChoice('choice_1');

            // Wait for timeout (1000ms) to complete
            setTimeout(() => {
                expect(mockTree.getRootNode).toHaveBeenCalled();
                done();
            }, 1100);
        });
    });

    describe('applyEffects(effects)', () => {
        beforeEach(() => {
            dialogueUI.currentNPC = { id: 'npc_1', name: 'Test' };
        });

        describe('relationship effects', () => {
            it('should increase NPC relationship when effects.relationship is set', () => {
                mockGameState.npcManager.getRelationship.mockReturnValue(5);

                dialogueUI.applyEffects({ relationship: 3 });

                expect(mockGameState.npcManager.setRelationship).toHaveBeenCalledWith('npc_1', 8);
            });

            it('should handle missing npcManager gracefully', () => {
                dialogueUI.game.gameState.npcManager = null;

                expect(() => {
                    dialogueUI.applyEffects({ relationship: 1 });
                }).not.toThrow();
            });

            it('should use current relationship when none is retrieved', () => {
                mockGameState.npcManager.getRelationship.mockReturnValue(null);

                dialogueUI.applyEffects({ relationship: 2 });

                expect(mockGameState.npcManager.setRelationship).toHaveBeenCalledWith('npc_1', 2);
            });
        });

        describe('statBoost effects', () => {
            beforeEach(() => {
                mockGameState.characterStats.stats = {
                    strength: 5,
                    dexterity: 3,
                    intelligence: 7
                };
            });

            it('should increase character stat by 1 for statBoost', () => {
                // Goes through addExperience with exactly one level's worth of XP (#1161)
                const addExperience = vi.fn();
                Object.assign(mockGameState.characterStats, {
                    addExperience,
                    getXPForNextLevel: () => 100,
                    xp: { focus: 30 }
                });

                dialogueUI.applyEffects({ statBoost: 'focus' });

                expect(addExperience).toHaveBeenCalledWith('focus', 70);
            });

            it('levels a real CharacterStats stat by exactly one', async () => {
                const { CharacterStats } = await import('../../src/js/game/CharacterStats.js');
                const cs = new CharacterStats();
                dialogueUI.game.gameState.characterStats = cs;
                const before = cs.getStat('focus');
                dialogueUI.applyEffects({ statBoost: 'focus' });
                expect(cs.getStat('focus')).toBe(before + 1);
                expect(cs.xp.focus).toBe(0);
            });

            it('should cap stat increase at maxLevel', () => {
                mockGameState.characterStats.getStat.mockReturnValue(99);

                dialogueUI.applyEffects({ statBoost: 'strength' });

                // The stat should not exceed maxLevel (default 100)
                expect(mockGameState.characterStats.stats.strength).toBeLessThanOrEqual(100);
            });

            it('should handle missing characterStats gracefully', () => {
                dialogueUI.game.gameState.characterStats = null;

                expect(() => {
                    dialogueUI.applyEffects({ statBoost: 'strength' });
                }).not.toThrow();
            });

            it('should not modify stat if STATS does not have that stat defined', () => {
                const originalValue = mockGameState.characterStats.stats.invalid_stat;

                dialogueUI.applyEffects({ statBoost: 'invalid_stat' });

                expect(mockGameState.characterStats.stats.invalid_stat).toBe(originalValue);
            });
        });

        describe('multiple effects', () => {
            it('should apply both relationship and statBoost effects', () => {
                mockGameState.npcManager.getRelationship.mockReturnValue(0);
                mockGameState.characterStats.stats.intelligence = 5;
                mockGameState.characterStats.getStat.mockReturnValue(5);

                dialogueUI.applyEffects({
                    relationship: 2,
                    statBoost: 'intelligence'
                });

                expect(mockGameState.npcManager.setRelationship).toHaveBeenCalledWith('npc_1', 2);
            });
        });

        describe('item effects', () => {
            it('should not throw when item effect is provided', () => {
                expect(() => {
                    dialogueUI.applyEffects({ item: 'some_item' });
                }).not.toThrow();
            });
        });
    });

    describe('close()', () => {
        beforeEach(() => {
            const mockNPC = { id: 'npc', name: 'Test' };
            dialogueUI.open(mockNPC);

            const mockTree = {
                getRootNode: vi.fn(() => ({
                    id: 'root',
                    text: 'Hello'
                })),
                getNode: vi.fn()
            };
            dialogueUI.currentTree = mockTree;
            dialogueUI.currentNode = mockTree.getRootNode();
        });

        it('should reset isOpen to false', () => {
            dialogueUI.close();
            expect(dialogueUI.isOpen).toBe(false);
        });

        it('should reset currentNPC to null', () => {
            dialogueUI.close();
            expect(dialogueUI.currentNPC).toBeNull();
        });

        it('should reset currentTree to null', () => {
            dialogueUI.close();
            expect(dialogueUI.currentTree).toBeNull();
        });

        it('should reset currentNode to null', () => {
            dialogueUI.close();
            expect(dialogueUI.currentNode).toBeNull();
        });

        it('should invoke onClose callback when set', () => {
            const closeCallback = vi.fn();
            dialogueUI.setOnClose(closeCallback);

            dialogueUI.close();

            expect(closeCallback).toHaveBeenCalled();
        });

        it('should not error when onClose is not set', () => {
            dialogueUI.onClose = null;

            expect(() => {
                dialogueUI.close();
            }).not.toThrow();
        });

        it('should remove "active" class from container when using DOM fallback', () => {
            dialogueUI.container.classList.add('active');

            dialogueUI.close();

            expect(dialogueUI.container.classList.contains('active')).toBe(false);
        });
    });

    describe('setOnClose(callback)', () => {
        it('should set the onClose callback', () => {
            const callback = vi.fn();
            dialogueUI.setOnClose(callback);

            expect(dialogueUI.onClose).toBe(callback);
        });

        it('should allow callback to be called during close', () => {
            const callback = vi.fn();
            dialogueUI.setOnClose(callback);

            dialogueUI.close();

            expect(callback).toHaveBeenCalled();
        });
    });
});
