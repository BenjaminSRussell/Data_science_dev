/**
 * Unit tests for SimpleDialogue
 */

import { describe, it, expect } from 'vitest';
import { SimpleDialogueManager, MOOD, PERSONALITY } from '../../src/js/game/dialogue/SimpleDialogue.js';

describe('SimpleDialogueManager', () => {
    describe('handleSmallTalk', () => {
        let dialogueManager;

        beforeEach(() => {
            dialogueManager = new SimpleDialogueManager();
        });

        it('should return a response object with text, mood, and effect properties', () => {
            const response = dialogueManager.handleSmallTalk(PERSONALITY.FRIENDLY);

            expect(response).toHaveProperty('text');
            expect(response).toHaveProperty('mood');
            expect(response).toHaveProperty('effect');
            expect(typeof response.text).toBe('string');
            expect(response.text.length).toBeGreaterThan(0);
        });

        it('should return personality-specific responses for different personalities', () => {
            const friendlyResponse = dialogueManager.handleSmallTalk(PERSONALITY.FRIENDLY);
            const professionalResponse = dialogueManager.handleSmallTalk(PERSONALITY.PROFESSIONAL);
            const competitiveResponse = dialogueManager.handleSmallTalk(PERSONALITY.COMPETITIVE);

            expect(friendlyResponse.text).not.toBe(professionalResponse.text);
            expect(friendlyResponse.text).not.toBe(competitiveResponse.text);
            expect(professionalResponse.text).not.toBe(competitiveResponse.text);
        });

        it('should handle unknown personality by returning friendly response', () => {
            const unknownPersonality = { name: 'unknown_personality' };
            const response = dialogueManager.handleSmallTalk(unknownPersonality);
            const friendlyResponse = dialogueManager.handleSmallTalk(PERSONALITY.FRIENDLY);

            expect(response.text).toBe(friendlyResponse.text);
        });

        it('should return response with valid mood value', () => {
            const response = dialogueManager.handleSmallTalk(PERSONALITY.GRUMPY);

            expect([MOOD.HAPPY, MOOD.NEUTRAL, MOOD.ANNOYED, MOOD.EXCITED, MOOD.SAD, MOOD.ANGRY, MOOD.FLIRTY, MOOD.SUSPICIOUS]).toContain(response.mood);
        });

        it('should return response with valid effect object containing relationship change', () => {
            const response = dialogueManager.handleSmallTalk(PERSONALITY.GENEROUS);

            expect(response.effect).toHaveProperty('relationship');
            expect(typeof response.effect.relationship).toBe('number');
            expect(response.effect.relationship).toBeGreaterThanOrEqual(0);
        });

        it('should return consistent responses for the same personality', () => {
            const response1 = dialogueManager.handleSmallTalk(PERSONALITY.PROFESSIONAL);
            const response2 = dialogueManager.handleSmallTalk(PERSONALITY.PROFESSIONAL);

            expect(response1.text).toBe(response2.text);
            expect(response1.mood).toBe(response2.mood);
        });
    });
});
