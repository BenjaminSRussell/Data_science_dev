/**
 * Unit tests for RelationshipDialogueSystem
 * Tests that the class works correctly without the unused dialogueCache field
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RelationshipDialogueSystem } from '../../src/js/game/dialogue/RelationshipDialogueSystem.js';

describe('RelationshipDialogueSystem', () => {
    let dialogueSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            npcManager: {
                getNPC: (npcId) => ({ id: npcId, age: 30 })
            }
        };
        dialogueSystem = new RelationshipDialogueSystem(mockGameState);
    });

    describe('constructor', () => {
        it('should initialize with gameState only', () => {
            expect(dialogueSystem.gameState).toBe(mockGameState);
            expect(dialogueSystem.dialogueCache).toBeUndefined();
        });

        it('should not have dialogueCache property', () => {
            expect(Object.prototype.hasOwnProperty.call(dialogueSystem, 'dialogueCache')).toBe(false);
        });
    });

    describe('getRelationshipStage', () => {
        it('should return "stranger" for relationship level < 20', () => {
            expect(dialogueSystem.getRelationshipStage(0)).toBe('stranger');
            expect(dialogueSystem.getRelationshipStage(19)).toBe('stranger');
        });

        it('should return "friendly" for relationship level 20-39', () => {
            expect(dialogueSystem.getRelationshipStage(20)).toBe('friendly');
            expect(dialogueSystem.getRelationshipStage(39)).toBe('friendly');
        });

        it('should return "acquaintance" for relationship level 40-59', () => {
            expect(dialogueSystem.getRelationshipStage(40)).toBe('acquaintance');
            expect(dialogueSystem.getRelationshipStage(59)).toBe('acquaintance');
        });

        it('should return "friend" for relationship level 60-79', () => {
            expect(dialogueSystem.getRelationshipStage(60)).toBe('friend');
            expect(dialogueSystem.getRelationshipStage(79)).toBe('friend');
        });

        it('should return "close_friend" for relationship level >= 80', () => {
            expect(dialogueSystem.getRelationshipStage(80)).toBe('close_friend');
            expect(dialogueSystem.getRelationshipStage(100)).toBe('close_friend');
        });
    });

    describe('checkTriggerCondition', () => {
        it('should return true when playerSuccess matches', () => {
            const condition = { playerSuccess: true };
            const trigger = { playerSuccess: true };
            expect(dialogueSystem.checkTriggerCondition(condition, trigger)).toBe(true);
        });

        it('should return true when betrayal matches', () => {
            const condition = { betrayal: true };
            const trigger = { betrayal: true };
            expect(dialogueSystem.checkTriggerCondition(condition, trigger)).toBe(true);
        });

        it('should return true when rejection matches', () => {
            const condition = { rejection: true };
            const trigger = { rejection: true };
            expect(dialogueSystem.checkTriggerCondition(condition, trigger)).toBe(true);
        });

        it('should return false when no conditions match', () => {
            const condition = { playerSuccess: true };
            const trigger = { betrayal: true };
            expect(dialogueSystem.checkTriggerCondition(condition, trigger)).toBe(false);
        });
    });
});
