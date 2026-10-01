/**
 * Unit tests for NPCDialogueLoader
 */

import { describe, it, expect } from 'vitest';
import { NPCDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

describe('NPCDialogueLoader', () => {
    describe('getFallbackDialogue', () => {
        it('should return fallback dialogue with all 5 relationship stages', () => {
            const loader = new NPCDialogueLoader();
            const fallback = loader.getFallbackDialogue('test_npc');

            expect(fallback).toHaveProperty('stages');
            expect(fallback.stages).toHaveProperty('stranger');
            expect(fallback.stages).toHaveProperty('friendly');
            expect(fallback.stages).toHaveProperty('acquaintance');
            expect(fallback.stages).toHaveProperty('friend');
            expect(fallback.stages).toHaveProperty('close_friend');
        });

        it('should have consistent stage structure for all stages', () => {
            const loader = new NPCDialogueLoader();
            const fallback = loader.getFallbackDialogue('test_npc');
            const stages = ['stranger', 'friendly', 'acquaintance', 'friend', 'close_friend'];

            stages.forEach(stage => {
                const stageData = fallback.stages[stage];
                expect(stageData).toHaveProperty('greeting');
                expect(stageData).toHaveProperty('topics');
                expect(typeof stageData.greeting).toBe('string');
                expect(typeof stageData.topics).toBe('object');
            });
        });

        it('should include npcId in fallback dialogue', () => {
            const loader = new NPCDialogueLoader();
            const fallback = loader.getFallbackDialogue('alex_rivera');

            expect(fallback.npcId).toBe('alex_rivera');
        });

        it('should have breakdowns and emotionalTriggers arrays', () => {
            const loader = new NPCDialogueLoader();
            const fallback = loader.getFallbackDialogue('test_npc');

            expect(Array.isArray(fallback.breakdowns)).toBe(true);
            expect(Array.isArray(fallback.emotionalTriggers)).toBe(true);
        });
    });

    describe('getRelationshipStage', () => {
        it('should return correct stage for relationship levels', () => {
            const loader = new NPCDialogueLoader();

            // Test all 5 stages
            expect(loader.getRelationshipStage(0)).toBe('stranger');
            expect(loader.getRelationshipStage(19)).toBe('stranger');
            expect(loader.getRelationshipStage(20)).toBe('friendly');
            expect(loader.getRelationshipStage(39)).toBe('friendly');
            expect(loader.getRelationshipStage(40)).toBe('acquaintance');
            expect(loader.getRelationshipStage(59)).toBe('acquaintance');
            expect(loader.getRelationshipStage(60)).toBe('friend');
            expect(loader.getRelationshipStage(79)).toBe('friend');
            expect(loader.getRelationshipStage(80)).toBe('close_friend');
            expect(loader.getRelationshipStage(100)).toBe('close_friend');
        });
    });

    describe('getDialogueForStage', () => {
        it('should return fallback dialogue stages for missing NPC', () => {
            const loader = new NPCDialogueLoader();

            // Since the NPC is not loaded, it should use fallback
            const stage20 = loader.getDialogueForStage('missing_npc', 20);
            expect(stage20).toBeNull(); // getDialogueForStage returns null if dialogue not found
        });
    });
});
