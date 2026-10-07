const { NPCMemorySystem } = require('../../src/js/game/NPCMemorySystem');
const { GameState } = require('../../src/js/game/GameState');

describe('NPCMemorySystem', () => {
    let npcMemorySystem;
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        npcMemorySystem = new NPCMemorySystem(gameState);
    });

    describe('recordDecision', () => {
        it('should correctly identify and record memory only for relevant NPCs', () => {
            const decisionId = 'criminal_opportunity';
            const choice = 'accept';

            // NPCs relevant to 'criminal_opportunity' decision
            const relevantNPCs = ['alex_rivera', 'vinnie_shark']; // Note: 'vinnie' typo should be fixed

            // Record decision for relevant NPCs
            relevantNPCs.forEach(npcId => {
                npcMemorySystem.recordDecision(decisionId, choice, npcId);
            });

            // Check if memory is recorded for relevant NPCs
            relevantNPCs.forEach(npcId => {
                const memory = npcMemorySystem.getNPCMemory(npcId);
                expect(memory.decisions).toHaveLength(1);
                expect(memory.decisions[0].decisionId).toBe(decisionId);
                expect(memory.decisions[0].choice).toBe(choice);
            });
        });

        it('should skip recording memory for NPCs not in the relevance list', () => {
            const decisionId = 'criminal_opportunity';
            const choice = 'accept';
            const irrelevantNPCId = 'irrelevant_npc';

            // Record decision for an irrelevant NPC
            npcMemorySystem.recordDecision(decisionId, choice, irrelevantNPCId);

            // Check if memory is not recorded for the irrelevant NPC
            const memory = npcMemorySystem.getNPCMemory(irrelevantNPCId);
            expect(memory.decisions).toHaveLength(0);
        });

        it('should document actual current behavior regarding id-mismatch bug', () => {
            const decisionId = 'criminal_opportunity';
            const choice = 'accept';
            const npcIdWithTypo = 'vinnie'; // Typo in NPC id
            const npcIdCorrect = 'vinnie_shark'; // Correct NPC id

            // Record decision for NPC with typo
            npcMemorySystem.recordDecision(decisionId, choice, npcIdWithTypo);

            // Check if memory is recorded for NPC with typo
            const memoryWithTypo = npcMemorySystem.getNPCMemory(npcIdWithTypo);
            expect(memoryWithTypo.decisions).toHaveLength(0); // Expected to be skipped due to typo

            // Record decision for correct NPC id
            npcMemorySystem.recordDecision(decisionId, choice, npcIdCorrect);

            // Check if memory is recorded for correct NPC id
            const memoryCorrect = npcMemorySystem.getNPCMemory(npcIdCorrect);
            expect(memoryCorrect.decisions).toHaveLength(1);
            expect(memoryCorrect.decisions[0].decisionId).toBe(decisionId);
            expect(memoryCorrect.decisions[0].choice).toBe(choice);
        });
    });

    describe('getNPCMemory', () => {
        it('should return a sensible empty/default structure for an NPC with no recorded memory', () => {
            const npcId = 'non_existent_npc';
            const memory = npcMemorySystem.getNPCMemory(npcId);
            expect(memory).toEqual({
                decisions: []
            });
        });
    });

    describe('generateReaction', () => {
        it('should generate reaction for a criminal-type NPC reacting to a decision it has memory of', () => {
            const npcId = 'alex_rivera';
            const decisionId = 'criminal_opportunity';
            const choice = 'accept';
            const relationship = 30;

            // Record decision for the NPC
            npcMemorySystem.recordDecision(decisionId, choice, npcId);

            // Generate reaction
            const reaction = npcMemorySystem.generateReaction(npcId, decisionId, relationship);

            // Check if reaction is generated
            expect(reaction).not.toBeNull();
            expect(reaction.text).toBeDefined();
            expect(reaction.relationshipChange).toBeDefined();
            expect(reaction.tone).toBeDefined();
        });

        it('should generate reaction for a criminal-type NPC reacting to a decision it does not have memory of', () => {
            const npcId = 'alex_rivera';
            const decisionId = 'non_existent_decision';
            const choice = 'accept';
            const relationship = 30;

            // Generate reaction without recording the decision
            const reaction = npcMemorySystem.generateReaction(npcId, decisionId, relationship);

            // Check if reaction is generated
            expect(reaction).toBeNull();
        });
    });
});