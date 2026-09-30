/**
 * ConversationScreen Unit Tests
 * Tests for concurrent showConversation() calls race condition
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConversationScreen } from '../../src/js/game/dialogue/ConversationScreen.js';

describe('ConversationScreen', () => {
    let conversationScreen;
    let mockGame;
    let mockNpcManager;

    beforeEach(() => {
        // Setup mock game and NPC manager
        mockNpcManager = {
            getNPC: vi.fn((npcId) => {
                if (npcId === 'npc-a') {
                    return {
                        id: 'npc-a',
                        name: 'Alice',
                        title: 'Archer',
                        personality: 'friendly',
                        modelPath: null
                    };
                } else if (npcId === 'npc-b') {
                    return {
                        id: 'npc-b',
                        name: 'Bob',
                        title: 'Blacksmith',
                        personality: 'gruff',
                        modelPath: null
                    };
                }
                return null;
            }),
            startConversation: vi.fn(async (npcId) => {
                // CRITICAL: Use different delays to test race condition
                // npc-a has a LONGER delay (50ms) so its promise resolves AFTER npc-b
                // npc-b has a SHORTER delay (10ms) so its promise resolves FIRST
                // This tests the scenario where an earlier call resolves after a later call
                const delay = npcId === 'npc-a' ? 50 : 10;
                await new Promise(resolve => setTimeout(resolve, delay));
                if (npcId === 'npc-a') {
                    return {
                        greeting: "Hello, I'm Alice!",
                        choices: [
                            { text: 'Hi Alice', conditions: {} },
                            { text: 'Goodbye', conditions: {} }
                        ]
                    };
                } else if (npcId === 'npc-b') {
                    return {
                        greeting: "I'm Bob, the blacksmith.",
                        choices: [
                            { text: 'Hi Bob', conditions: {} },
                            { text: 'Goodbye', conditions: {} }
                        ]
                    };
                }
                return null;
            }),
            getRelationship: vi.fn(() => 50),
            getRelationshipTier: vi.fn(() => ({ color: 'green', label: 'Friendly' }))
        };

        mockGame = {
            npcManager: mockNpcManager,
            showToast: vi.fn()
        };

        // Create ConversationScreen instance
        conversationScreen = new ConversationScreen(mockGame);

        // Mock DOM elements
        document.body.innerHTML = '';
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('Concurrent showConversation calls - Race Condition Prevention', () => {
        it('should NOT render stale NPC data when earlier call resolves after later call', async () => {
            // SCENARIO: Earlier call (npc-a, 50ms delay) + Later call (npc-b, 10ms delay)
            // npc-b's promise resolves FIRST (10ms) and renders Bob
            // npc-a's promise resolves SECOND (50ms) - should NOT overwrite with Alice

            conversationScreen.showConversation('npc-a');  // 50ms delay

            // Immediately call with NPC B before A's promise resolves
            conversationScreen.showConversation('npc-b');  // 10ms delay, overwrites currentNPC

            // After 20ms, B's promise has resolved but A's hasn't yet
            await new Promise(resolve => setTimeout(resolve, 20));

            let screen = document.getElementById('conversation-screen');
            let npcName = screen?.querySelector('.conversation-npc-name')?.textContent;
            let dialogueText = screen?.querySelector('#conversation-dialogue-text')?.textContent;

            // At this point, Bob should be rendered (his promise resolved at ~10ms)
            expect(npcName).toBe('Bob');
            expect(dialogueText).toContain("I'm Bob");

            // Wait for A's promise to also resolve
            await new Promise(resolve => setTimeout(resolve, 40));

            // Re-query the DOM
            screen = document.getElementById('conversation-screen');
            npcName = screen?.querySelector('.conversation-npc-name')?.textContent;
            dialogueText = screen?.querySelector('#conversation-dialogue-text')?.textContent;

            // CRITICAL TEST: Alice's data should NOT overwrite Bob's
            // This verifies the guard: if (this.currentNPC?.id !== capturedNPC.id) return;
            expect(npcName).toBe('Bob', 'Bob data should persist after Alice resolves');
            expect(dialogueText).toContain("I'm Bob", 'Bob dialogue should persist after Alice resolves');

            // Confirm we did NOT get the bug (mixed data)
            const hasBuggyMix = npcName === 'Alice' && dialogueText.includes("I'm Bob");
            expect(hasBuggyMix).toBe(false, 'Should not have Alice name with Bob dialogue');
        });

        it('should render latest call only when three rapid calls occur', async () => {
            // Rapid fire calls: A (50ms) -> B (10ms) -> A (50ms)
            // Second A should win since it's the most recent
            conversationScreen.showConversation('npc-a');  // capturedNPC = A
            conversationScreen.showConversation('npc-b');  // capturedNPC = B, first A's promise still pending
            conversationScreen.showConversation('npc-a');  // capturedNPC = A again, both previous promises pending

            // Wait for all promises to resolve (max 50ms each)
            await new Promise(resolve => setTimeout(resolve, 100));

            const screen = document.getElementById('conversation-screen');
            const npcName = screen?.querySelector('.conversation-npc-name')?.textContent;
            const dialogueText = screen?.querySelector('#conversation-dialogue-text')?.textContent;

            // Only the last call (npc-a) should be rendered
            expect(npcName).toBe('Alice');
            expect(dialogueText).toContain("I'm Alice");

            // Should not have Bob's data (middle call should not persist)
            expect(npcName).not.toBe('Bob');
            expect(dialogueText).not.toContain("I'm Bob");
        });

        it('should capture NPC at call time and guard against stale renders', async () => {
            // This test verifies the fix: both the captured NPC and the guard work together
            conversationScreen.showConversation('npc-a');

            // Small delay to let A's async start
            await new Promise(resolve => setTimeout(resolve, 5));

            // Switch to B while A is still pending
            conversationScreen.showConversation('npc-b');

            // Wait for B to complete (10ms) but not A (50ms)
            await new Promise(resolve => setTimeout(resolve, 15));

            const screen = document.getElementById('conversation-screen');
            const npcName = screen?.querySelector('.conversation-npc-name')?.textContent;

            // B should be rendered
            expect(npcName).toBe('Bob');

            // Store the rendered state after B
            const renderedStateAfterB = screen.innerHTML;

            // Wait for A to complete as well
            await new Promise(resolve => setTimeout(resolve, 50));

            // Get the rendered state after A completes
            const renderedStateAfterA = screen.innerHTML;

            // States should be the same - A's render was prevented by the guard
            expect(renderedStateAfterA).toBe(renderedStateAfterB);
        });
    });

    describe('Single showConversation call', () => {
        it('should render NPC conversation correctly', async () => {
            conversationScreen.showConversation('npc-a');

            // npc-a has a 50ms delay, so wait longer
            await new Promise(resolve => setTimeout(resolve, 70));

            const screen = document.getElementById('conversation-screen');
            expect(screen).toBeTruthy();

            const npcName = screen?.querySelector('.conversation-npc-name')?.textContent;
            const npcTitle = screen?.querySelector('.conversation-npc-title')?.textContent;
            const dialogueText = screen?.querySelector('#conversation-dialogue-text')?.textContent;

            expect(npcName).toBe('Alice');
            expect(npcTitle).toBe('Archer');
            expect(dialogueText).toContain("I'm Alice");
        });

        it('should render choices correctly', async () => {
            conversationScreen.showConversation('npc-b');

            // npc-b has a 10ms delay, so 30ms is plenty
            await new Promise(resolve => setTimeout(resolve, 30));

            const screen = document.getElementById('conversation-screen');
            const choices = screen?.querySelectorAll('.conversation-choice:not(.disabled)');

            expect(choices?.length).toBe(2);
            expect(choices?.[0]?.textContent.trim()).toBe('Hi Bob');
            expect(choices?.[1]?.textContent.trim()).toBe('Goodbye');
        });
    });
});
