/**
 * Unit tests for NarrativeClaritySystem
 * Tests character motivation generation with both hardcoded and fallback motivations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NarrativeClaritySystem } from '../../src/js/game/NarrativeClaritySystem.js';

describe('NarrativeClaritySystem', () => {
    let narrativeSystem;
    let gameState;

    beforeEach(() => {
        // Create a mock gameState with npcManager
        gameState = {
            npcManager: {
                getNPC: vi.fn(),
                getRelationship: vi.fn()
            },
            timeManager: {},
            rankIndex: 0,
            money: 0,
            reputation: 0,
            characterStats: {
                getStat: vi.fn()
            },
            storylineManager: {}
        };

        narrativeSystem = new NarrativeClaritySystem(gameState);
    });

    describe('getCharacterMotivation - Hardcoded NPCs', () => {
        it('should return hardcoded motivation for alex_rivera at low relationship', () => {
            const alex = { id: 'alex_rivera', name: 'Alex Rivera', type: 'friend', personality: 'friendly' };
            gameState.npcManager.getNPC.mockReturnValue(alex);
            gameState.npcManager.getRelationship.mockReturnValue(20);

            const motivation = narrativeSystem.getCharacterMotivation('alex_rivera');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('Alex');
            expect(motivation).toContain('college');
        });

        it('should return hardcoded motivation for professor_higgins at medium relationship', () => {
            const prof = { id: 'professor_higgins', name: 'Professor Higgins', type: 'mentor', personality: 'generous' };
            gameState.npcManager.getNPC.mockReturnValue(prof);
            gameState.npcManager.getRelationship.mockReturnValue(50);

            const motivation = narrativeSystem.getCharacterMotivation('professor_higgins');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('special interest');
        });

        it('should return hardcoded motivation for emma_bloom at high relationship', () => {
            const emma = { id: 'emma_bloom', name: 'Emma Bloom', type: 'romance', personality: 'friendly' };
            gameState.npcManager.getNPC.mockReturnValue(emma);
            gameState.npcManager.getRelationship.mockReturnValue(80);

            const motivation = narrativeSystem.getCharacterMotivation('emma_bloom');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('close friend');
        });
    });

    describe('getCharacterMotivation - Fallback for unregistered NPCs', () => {
        it('should return null for non-existent NPC', () => {
            gameState.npcManager.getNPC.mockReturnValue(null);

            const motivation = narrativeSystem.getCharacterMotivation('non_existent');

            expect(motivation).toBeNull();
        });

        it('should generate fallback motivation for mike_johnson (business type) at low relationship', () => {
            const mike = {
                id: 'mike_johnson',
                name: 'Mike Johnson',
                type: 'business',
                personality: 'friendly',
                title: 'Marketing Director'
            };
            gameState.npcManager.getNPC.mockReturnValue(mike);
            gameState.npcManager.getRelationship.mockReturnValue(10);

            const motivation = narrativeSystem.getCharacterMotivation('mike_johnson');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('Mike Johnson');
            expect(motivation).toContain('business');
            expect(motivation).not.toContain('high relationship');
        });

        it('should generate fallback motivation for sarah_martinez (mentor type) at medium relationship', () => {
            const sarah = {
                id: 'sarah_martinez',
                name: 'Sarah Martinez',
                type: 'mentor',
                personality: 'professional',
                title: 'Senior Data Analyst'
            };
            gameState.npcManager.getNPC.mockReturnValue(sarah);
            gameState.npcManager.getRelationship.mockReturnValue(50);

            const motivation = narrativeSystem.getCharacterMotivation('sarah_martinez');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('Sarah Martinez');
            expect(motivation).toContain('interest');
        });

        it('should generate fallback motivation for victoria_sterling (investor type) at high relationship', () => {
            const victoria = {
                id: 'victoria_sterling',
                name: 'Victoria Sterling',
                type: 'investor',
                personality: 'professional',
                title: 'VC Partner'
            };
            gameState.npcManager.getNPC.mockReturnValue(victoria);
            gameState.npcManager.getRelationship.mockReturnValue(75);

            const motivation = narrativeSystem.getCharacterMotivation('victoria_sterling');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('Victoria Sterling');
            expect(motivation).toContain('believes');
        });

        it('should generate fallback motivation for brad_sterling (rival type)', () => {
            const brad = {
                id: 'brad_sterling',
                name: 'Brad Sterling',
                type: 'rival',
                personality: 'competitive',
                title: 'Competing Analyst'
            };
            gameState.npcManager.getNPC.mockReturnValue(brad);
            gameState.npcManager.getRelationship.mockReturnValue(25);

            const motivation = narrativeSystem.getCharacterMotivation('brad_sterling');

            expect(motivation).toBeTruthy();
            expect(motivation).toContain('Brad Sterling');
        });

        it('should generate different motivations based on relationship level', () => {
            const npc = {
                id: 'test_npc',
                name: 'Test Person',
                type: 'business',
                personality: 'friendly',
                title: 'Businessperson'
            };
            gameState.npcManager.getNPC.mockReturnValue(npc);

            // Low relationship
            gameState.npcManager.getRelationship.mockReturnValue(10);
            const lowMotivation = narrativeSystem.getCharacterMotivation('test_npc');

            // Medium relationship
            gameState.npcManager.getRelationship.mockReturnValue(50);
            const mediumMotivation = narrativeSystem.getCharacterMotivation('test_npc');

            // High relationship
            gameState.npcManager.getRelationship.mockReturnValue(80);
            const highMotivation = narrativeSystem.getCharacterMotivation('test_npc');

            // All should be non-null and different
            expect(lowMotivation).toBeTruthy();
            expect(mediumMotivation).toBeTruthy();
            expect(highMotivation).toBeTruthy();
            expect(lowMotivation).not.toBe(mediumMotivation);
            expect(mediumMotivation).not.toBe(highMotivation);
        });
    });

    describe('getCharacterMotivation - Fallback for all NPC types', () => {
        const testTypes = ['mentor', 'business', 'investor', 'shopkeeper', 'friend', 'rival', 'criminal', 'romance', 'authority'];

        testTypes.forEach(type => {
            it(`should generate fallback motivation for ${type} type NPCs`, () => {
                const npc = {
                    id: `test_${type}`,
                    name: 'Test NPC',
                    type: type,
                    personality: 'neutral',
                    title: 'Test Title'
                };
                gameState.npcManager.getNPC.mockReturnValue(npc);
                gameState.npcManager.getRelationship.mockReturnValue(50);

                const motivation = narrativeSystem.getCharacterMotivation(`test_${type}`);

                expect(motivation).toBeTruthy();
                expect(typeof motivation).toBe('string');
                expect(motivation.length > 20).toBe(true);
            });
        });
    });
});
