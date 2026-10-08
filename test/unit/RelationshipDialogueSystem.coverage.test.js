/**
 * RelationshipDialogueSystem stage/topic selection (#311)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/js/game/dialogue/NPCDialogueLoader.js', () => ({
    npcDialogueLoader: { loadNPCDialogue: vi.fn(), getAgeAppropriateDialogue: vi.fn(() => null) }
}));

import { RelationshipDialogueSystem } from '../../src/js/game/dialogue/RelationshipDialogueSystem.js';
import { npcDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

const FILE = {
    stages: {
        stranger: { greeting: ['Hi.', 'Hey.'], topics: { work: ['Busy.', 'Swamped.'], weather: 'Rainy.' } },
        friend: { greeting: 'Good to see you!' }
    },
    actions: { gift: 'Thanks!' },
    breakdowns: { hurt: { dialogue: ['Why?', 'Ouch.'] } },
    emotionalTriggers: [
        { condition: { betrayal: true }, dialogue: 'How could you?', subtext: 'hurt', emotion: 'angry', extra: 1 }
    ]
};

describe('RelationshipDialogueSystem coverage', () => {
    let sys;
    beforeEach(() => {
        sys = new RelationshipDialogueSystem({ npcManager: { getNPC: () => ({ age: 30 }) } });
        npcDialogueLoader.loadNPCDialogue.mockResolvedValue(FILE);
        npcDialogueLoader.getAgeAppropriateDialogue.mockReturnValue(null);
    });
    afterEach(() => vi.restoreAllMocks());

    it('getRelationshipStage boundaries', () => {
        expect([0, 19, 20, 39, 40, 59, 60, 79, 80, 100].map(l => sys.getRelationshipStage(l))).toEqual([
            'stranger', 'stranger', 'friendly', 'friendly', 'acquaintance', 'acquaintance', 'friend', 'friend', 'close_friend', 'close_friend'
        ]);
    });

    it('getDialogue returns null when the file is missing, the stage is missing, or there are no stages', async () => {
        npcDialogueLoader.loadNPCDialogue.mockResolvedValueOnce(null);
        expect(await sys.getDialogue('x', 0)).toBeNull();
        expect(await sys.getDialogue('x', 45)).toBeNull();
        npcDialogueLoader.loadNPCDialogue.mockResolvedValueOnce({});
        expect(await sys.getDialogue('x', 0)).toBeNull();
    });

    it('topic arrays pick by Math.random; plain strings are returned as-is', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        expect(await sys.getDialogue('x', 0, 'work')).toBe('Swamped.');
        expect(await sys.getDialogue('x', 0, 'weather')).toBe('Rainy.');
    });

    it('greeting fallback: array, string, age-appropriate override, and Hello. when empty', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(await sys.getDialogue('x', 0, 'unknown_topic')).toBe('Hi.');
        expect(await sys.getDialogue('x', 65)).toBe('Good to see you!');
        npcDialogueLoader.getAgeAppropriateDialogue.mockReturnValueOnce({ greeting: ['Yo.'] });
        expect(await sys.getDialogue('x', 0)).toBe('Yo.');
        npcDialogueLoader.loadNPCDialogue.mockResolvedValueOnce({ stages: { stranger: { greeting: [] } } });
        expect(await sys.getDialogue('x', 0)).toBe('Hello.');
    });

    it('getActionResponse', async () => {
        expect(await sys.getActionResponse('x', 'gift')).toBe('Thanks!');
        expect(await sys.getActionResponse('x', 'hug')).toBeNull();
        npcDialogueLoader.loadNPCDialogue.mockResolvedValueOnce(null);
        expect(await sys.getActionResponse('x', 'gift')).toBeNull();
    });

    it('getBreakdownDialogue and getEmotionalResponse shapes', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.6);
        expect(await sys.getBreakdownDialogue('x', 'hurt')).toBe('Ouch.');
        expect(await sys.getBreakdownDialogue('x', 'rage')).toBeNull();
        expect(await sys.getEmotionalResponse('x', { betrayal: true })).toEqual({ dialogue: 'How could you?', subtext: 'hurt', emotion: 'angry' });
        expect(await sys.getEmotionalResponse('x', { rejection: true })).toBeNull();
    });

    it('checkTriggerCondition matches one shared flag and tolerates missing input', () => {
        for (const k of ['playerSuccess', 'betrayal', 'rejection']) {
            expect(sys.checkTriggerCondition({ [k]: true }, { [k]: true })).toBe(true);
        }
        expect(sys.checkTriggerCondition({ betrayal: true }, { rejection: true })).toBe(false);
        expect(sys.checkTriggerCondition({}, {})).toBe(false);
        expect(sys.checkTriggerCondition(null, { betrayal: true })).toBe(false);
        expect(sys.checkTriggerCondition({ betrayal: true }, undefined)).toBe(false);
    });

    it('getAvailableTopics', async () => {
        expect(await sys.getAvailableTopics('x', 0)).toEqual(['work', 'weather']);
        expect(await sys.getAvailableTopics('x', 65)).toEqual([]);
        npcDialogueLoader.loadNPCDialogue.mockResolvedValueOnce({});
        expect(await sys.getAvailableTopics('x', 0)).toEqual([]);
    });
});
