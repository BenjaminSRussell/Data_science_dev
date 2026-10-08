/**
 * DialogueTester conversation flow and dialogue-shape validation (#488)
 */
import { describe, it, expect, vi } from 'vitest';
import { DialogueTester } from '../../src/js/dev/DialogueTester.js';

function makeTester(npcManager) {
    const t = new DialogueTester({ gameState: { npcManager } });
    t.stepDelay = 0;
    return t;
}

describe('DialogueTester', () => {
    it('reports a missing startConversation', async () => {
        const r = await makeTester({}).testNPCDialogue('alex', {});
        expect(r).toMatchObject({ passed: false, error: 'startConversation method not found' });
    });

    it('reports when no dialogue comes back', async () => {
        const nm = { startConversation: vi.fn(async () => null) };
        const r = await makeTester(nm).testNPCDialogue('alex', nm);
        expect(r).toMatchObject({ passed: false, error: 'No dialogue returned', dialogueCount: 0 });
    });

    it('tries every opening choice, restarting the conversation before each', async () => {
        const calls = [];
        const nm = {
            startConversation: vi.fn(async (id) => { calls.push(`start:${id}`); return { text: 'hi', choices: [{}, {}, {}] }; }),
            makeChoice: vi.fn((i) => calls.push(`choice:${i}`))
        };
        const r = await makeTester(nm).testNPCDialogue('alex', nm);
        expect(r).toMatchObject({ passed: true, dialogueCount: 1, optionCount: 3, error: null });
        expect(calls).toEqual(['start:alex', 'choice:0', 'start:alex', 'choice:1', 'start:alex', 'choice:2']);
    });

    it('names the failing choice when makeChoice throws mid-loop', async () => {
        const nm = {
            startConversation: async () => ({ text: 'hi', choices: [{}, {}, {}] }),
            makeChoice: (i) => { if (i === 1) throw new Error('boom'); }
        };
        const r = await makeTester(nm).testNPCDialogue('alex', nm);
        expect(r.passed).toBe(false);
        expect(r.optionCount).toBe(2);
        expect(r.error).toBe('Choice 1 failed: boom');
    });

    it('testAll aggregates passes, failures and counts across NPCs', async () => {
        const nm = {
            getAllNPCs: () => [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
            startConversation: async (id) => {
                if (id === 'b') throw new Error('broken npc');
                if (id === 'c') return null;
                return { text: 'hi', choices: [{}, {}] };
            },
            makeChoice: () => {}
        };
        const r = await makeTester(nm).testAll();
        expect(r).toMatchObject({ total: 3, passed: 1, failed: 2, dialogueCount: 1, optionCount: 2 });
        expect(r.errors).toEqual([{ npc: 'b', error: 'broken npc' }, { npc: 'c', error: 'No dialogue returned' }]);
    });

    it('testAll without an npcManager returns an error', async () => {
        expect(await new DialogueTester({ gameState: {} }).testAll()).toEqual({ error: 'NPC Manager not found' });
    });

    it('validateDialogueLogic flags missing text and per-choice issues', () => {
        const t = makeTester({});
        expect(t.validateDialogueLogic({ text: 'hi', choices: [{ text: 'ok', action: 'leave' }] })).toEqual({ valid: true, issues: [] });
        expect(t.validateDialogueLogic({ message: 'hi' }).valid).toBe(true);
        expect(t.validateDialogueLogic({ choices: [{ action: 'x' }, { text: 'y' }] }).issues).toEqual([
            'Dialogue missing text/message', 'Choice 0 missing text', 'Choice 1 missing action'
        ]);
        expect(t.validateDialogueLogic(null)).toEqual({ valid: false, issues: ['Dialogue is null/undefined'] });
        expect(t.validateDialogueLogic({ text: 'hi', choices: 'nope' }).issues).toEqual(['Choices is not an array']);
    });
});
