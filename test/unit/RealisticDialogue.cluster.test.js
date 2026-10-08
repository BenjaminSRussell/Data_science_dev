import { describe, it, expect, vi, afterEach } from 'vitest';
import { RealisticDialogueSystem, RELATIONSHIP } from '../../src/js/game/RealisticDialogueSystem.js';

const sys = () => new RealisticDialogueSystem();
const patterns = (cat, lvl) => sys().dialoguePatterns[cat][lvl];

afterEach(() => vi.restoreAllMocks());

describe('RealisticDialogueSystem cluster', () => {
    it('#1598 determineEmotion and generateDialogue share the WARM threshold', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const s = sys();
        const r = RELATIONSHIP.WARM + 5;
        expect(s.determineEmotion(r, 'casual')).toBe('happy');
        const line = s.generateRelationshipDialogue({ name: 'A', personality: 'friendly' }, r, 'casual');
        expect(patterns('happiness', 'strong')).toContain(line);
        // happy but not warm: mild happiness instead of a greeting
        const mild = s.generateDialogue({ emotion: 'happy', relationship: 40 });
        expect(patterns('happiness', 'mild')).toContain(mild);
    });

    it('#112 situation changes the line', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const s = sys();
        expect(patterns('goodbye', 'formal')).toContain(s.generateDialogue({ situation: 'goodbye', personality: 'professional' }));
        expect(patterns('goodbye', 'emotional')).toContain(s.generateDialogue({ situation: 'goodbye', relationship: 90 }));
        expect(patterns('concern', 'low')).toContain(s.generateDialogue({ situation: 'crisis', relationship: 20 }));
        expect(patterns('anger', 'mild')).toContain(s.generateDialogue({ situation: 'conflict' }));
    });

    it('#1595 only uncertain emotions trail off', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9);
        const s = sys();
        expect(s.addNaturalSpeech('Fine', 'friendly', 'happy')).toBe('Fine');
        expect(s.addNaturalSpeech('Fine', 'friendly', 'worried')).toBe('Fine...');
    });

    it('#1597 personality changes gift and betrayal reactions', () => {
        const s = sys();
        const warm = s.generateEmotionalResponse('gift', { personality: 'friendly' }, 80);
        const pro = s.generateEmotionalResponse('gift', { personality: 'professional' }, 80);
        const blunt = s.generateEmotionalResponse('betrayal', { personality: 'blunt' }, 10);
        expect(pro).not.toBe(warm);
        expect(blunt).not.toBe(s.generateEmotionalResponse('betrayal', { personality: 'friendly' }, 10));
        expect(s.generateEmotionalResponse('help', { personality: 'shy' }, 80)).toBe('Thank you so much. I really needed that.');
        expect(s.generateEmotionalResponse('dance', null, 80)).toBe('I see.');
    });
});
