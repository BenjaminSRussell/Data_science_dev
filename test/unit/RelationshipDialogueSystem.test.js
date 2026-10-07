/**
 * RelationshipDialogueSystem Unit Tests
 * Verifies that breakdown dialogue is returned correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RelationshipDialogueSystem } from '../../src/js/game/dialogue/RelationshipDialogueSystem.js';

// Mock the npcDialogueLoader
vi.mock('../../src/js/game/dialogue/NPCDialogueLoader.js', () => ({
    npcDialogueLoader: {
        loadNPCDialogue: vi.fn(),
        getAgeAppropriateDialogue: vi.fn(() => null)
    }
}));

import { npcDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

describe('RelationshipDialogueSystem', () => {
    let system;

    beforeEach(() => {
        system = new RelationshipDialogueSystem({});
    });

    describe('getBreakdownDialogue', () => {
        it('should return breakdown dialogue for valid breakdown type', async () => {
            const mockDialogue = {
                breakdowns: {
                    low_relationship: {
                        emotion: 'hurt',
                        dialogue: ['I thought we understood each other.', 'Maybe I was wrong.']
                    }
                }
            };

            vi.mocked(npcDialogueLoader.loadNPCDialogue).mockResolvedValue(mockDialogue);

            const result = await system.getBreakdownDialogue('sarah_martinez', 'low_relationship');

            expect(result).toBeDefined();
            expect(mockDialogue.breakdowns.low_relationship.dialogue).toContain(result);
        });

        it('should return null for missing NPC', async () => {
            vi.mocked(npcDialogueLoader.loadNPCDialogue).mockResolvedValue(null);

            const result = await system.getBreakdownDialogue('unknown_npc', 'low_relationship');

            expect(result).toBeNull();
        });

        it('should return null for missing breakdown type', async () => {
            const mockDialogue = {
                breakdowns: {
                    low_relationship: {
                        emotion: 'hurt',
                        dialogue: ['Dialogue text']
                    }
                }
            };

            vi.mocked(npcDialogueLoader.loadNPCDialogue).mockResolvedValue(mockDialogue);

            const result = await system.getBreakdownDialogue('sarah_martinez', 'non_existent');

            expect(result).toBeNull();
        });

        it('should handle single dialogue string', async () => {
            const mockDialogue = {
                breakdowns: {
                    work_life_stress: {
                        emotion: 'crying',
                        dialogue: 'I can\'t do this anymore.'
                    }
                }
            };

            vi.mocked(npcDialogueLoader.loadNPCDialogue).mockResolvedValue(mockDialogue);

            const result = await system.getBreakdownDialogue('sarah_martinez', 'work_life_stress');

            expect(result).toBe('I can\'t do this anymore.');
        });

        it('should return random dialogue from array', async () => {
            const dialogueArray = ['Line 1', 'Line 2', 'Line 3'];
            const mockDialogue = {
                breakdowns: {
                    rejection: {
                        emotion: 'yelling',
                        dialogue: dialogueArray
                    }
                }
            };

            vi.mocked(npcDialogueLoader.loadNPCDialogue).mockResolvedValue(mockDialogue);

            const result = await system.getBreakdownDialogue('sarah_martinez', 'rejection');

            expect(dialogueArray).toContain(result);
        });

        it('should access breakdown even without trigger field', async () => {
            // This test verifies that breakdowns work correctly
            // even when trigger fields are not present
            const mockDialogue = {
                breakdowns: {
                    low_relationship: {
                        emotion: 'hurt',
                        dialogue: ['Test dialogue']
                        // Note: no trigger field
                    }
                }
            };

            vi.mocked(npcDialogueLoader.loadNPCDialogue).mockResolvedValue(mockDialogue);

            const result = await system.getBreakdownDialogue('sarah_martinez', 'low_relationship');

            expect(result).toBe('Test dialogue');
        });
    });
});
