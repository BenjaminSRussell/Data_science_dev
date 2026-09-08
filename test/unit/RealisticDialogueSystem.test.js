/**
 * Unit tests for RealisticDialogueSystem
 */

import { describe, it, expect, vi } from 'vitest';
import { RealisticDialogueSystem } from '../../src/js/dialogue/RealisticDialogueSystem.js';

describe('RealisticDialogueSystem', () => {
    let dialogueSystem;

    beforeEach(() => {
        dialogueSystem = new RealisticDialogueSystem();
    });

    describe('generateDialogue', () => {
        it('should generate happy dialogue when emotion is happy and relationship is > 60', () => {
            const context = { emotion: 'happy', relationship: 70 };
            const dialogue = dialogueSystem.generateDialogue(context);
            expect(dialogue).toContain('happiness');
        });

        it('should generate angry dialogue when emotion is angry and relationship is < 30', () => {
            const context = { emotion: 'angry', relationship: 20 };
            const dialogue = dialogueSystem.generateDialogue(context);
            expect(dialogue).toContain('anger');
        });

        it('should generate worried dialogue when emotion is worried and relationship is > 50', () => {
            const context = { emotion: 'worried', relationship: 60 };
            const dialogue = dialogueSystem.generateDialogue(context);
            expect(dialogue).toContain('high concern');
        });

        it('should generate worried dialogue when emotion is worried and relationship is <= 50', () => {
            const context = { emotion: 'worried', relationship: 40 };
            const dialogue = dialogueSystem.generateDialogue(context);
            expect(dialogue).toContain('low concern');
        });

        it('should generate greeting dialogue based on personality', () => {
            const context = { emotion: 'neutral', relationship: 40, personality: 'friendly' };
            const dialogue = dialogueSystem.generateDialogue(context);
            expect(dialogue).toContain('casual');
        });
    });

    describe('getRandomPattern', () => {
        it('should return fallback pattern for unknown category', () => {
            const pattern = dialogueSystem.getRandomPattern('unknown', 'normal');
            expect(pattern).toBe('Hello.');
        });

        it('should return a pattern based on category and intensity', () => {
            const pattern = dialogueSystem.getRandomPattern('greeting', 'strong');
            expect(pattern).not.toBe('Hello.');
        });
    });

    describe('generateBreakupDialogue', () => {
        it('should generate dialogue for ethics reason when relationship is > 60', () => {
            const dialogue = dialogueSystem.generateBreakupDialogue(70, 'ethics');
            expect(dialogue).toContain('ethical issues');
        });

        it('should generate distinct dialogue for neglect reason', () => {
            const dialogue = dialogueSystem.generateBreakupDialogue(50, 'neglect');
            expect(dialogue).toContain('neglect');
        });

        it('should generate distinct dialogue for money reason', () => {
            const dialogue = dialogueSystem.generateBreakupDialogue(50, 'money');
            expect(dialogue).toContain('money');
        });

        it('should generate default dialogue for unknown reason', () => {
            const dialogue = dialogueSystem.generateBreakupDialogue(50, 'unknown');
            expect(dialogue).toContain('unknown');
        });
    });

    describe('generateEmotionalResponse', () => {
        it('should generate response for gift action when relationship is > 60', () => {
            const response = dialogueSystem.generateEmotionalResponse('gift', 'npc', 70);
            expect(response).toContain('strong');
        });

        it('should generate response for betrayal action when relationship is > 60', () => {
            const response = dialogueSystem.generateEmotionalResponse('betrayal', 'npc', 70);
            expect(response).toContain('strong');
        });

        it('should generate response for help action when relationship is > 60', () => {
            const response = dialogueSystem.generateEmotionalResponse('help', 'npc', 70);
            expect(response).toContain('strong');
        });

        it('should generate default response for unknown action', () => {
            const response = dialogueSystem.generateEmotionalResponse('unknown', 'npc', 50);
            expect(response).toBe('I see.');
        });
    });

    describe('addNaturalSpeech', () => {
        it('should add filler word when casual and random is > 0.7', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.8);
            const speech = dialogueSystem.addNaturalSpeech('Hello', 'casual');
            expect(speech).toContain('um');
        });

        it('should add trailing ellipsis when random is > 0.8', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.9);
            const speech = dialogueSystem.addNaturalSpeech('Hello', 'casual');
            expect(speech).toContain('...');
        });

        it('should not add filler word when casual and random is <= 0.7', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.6);
            const speech = dialogueSystem.addNaturalSpeech('Hello', 'casual');
            expect(speech).not.toContain('um');
        });

        it('should not add trailing ellipsis when random is <= 0.8', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.7);
            const speech = dialogueSystem.addNaturalSpeech('Hello', 'casual');
            expect(speech).not.toContain('...');
        });
    });
});