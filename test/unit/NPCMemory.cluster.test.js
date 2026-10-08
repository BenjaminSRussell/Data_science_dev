import { describe, it, expect } from 'vitest';
import { NPCMemorySystem } from '../../src/js/game/NPCMemorySystem.js';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';

const ROSTER = {
    professor_higgins: { id: 'professor_higgins', type: 'mentor', personality: 'generous' },
    sarah_martinez: { id: 'sarah_martinez', type: 'mentor', personality: 'professional' },
    mike_johnson: { id: 'mike_johnson', type: 'business', personality: 'professional' },
    vinnie_shark: { id: 'vinnie_shark', type: 'criminal', personality: 'aggressive' },
    the_broker: { id: 'the_broker', type: 'criminal', personality: 'greedy' },
    emma_bloom: { id: 'emma_bloom', type: 'romance', personality: 'friendly' }
};

function setup(totalDays = 70) {
    const gs = {
        timeManager: { totalDays },
        npcManager: { getNPC: (id) => ROSTER[id] || null },
        storylineManager: { getDecision: (id) => ({ id }) }
    };
    return { gs, mem: new NPCMemorySystem(gs) };
}

describe('NPCMemorySystem cluster', () => {
    it('#1996 relevance tables and reactions match the real roster', () => {
        const { mem } = setup();
        expect(mem.findRelevantNPCs('criminal_opportunity', 'accept').sort())
            .toEqual(['emma_bloom', 'professor_higgins', 'the_broker', 'vinnie_shark']);
        mem.recordDecision('criminal_opportunity', 'accept');
        for (const id of ['vinnie_shark', 'the_broker', 'emma_bloom', 'professor_higgins']) {
            expect(mem.getMemoryDialogue(id, 50), id).not.toBeNull();
        }
        mem.recordDecision('whistleblower', 'expose');
        expect(mem.getMemoryDialogue('mike_johnson', 50).tone).toBe('respectful');
    });

    it('#2419 #2420 a reaction is applied once and recorded in reactions', () => {
        const { gs, mem } = setup();
        mem.recordDecision('whistleblower', 'expose');
        const preview = mem.getMemoryDialogue('professor_higgins', 50, { consume: false });
        expect(preview.relationshipChange).toBe(15);
        const first = mem.getMemoryDialogue('professor_higgins', 50);
        expect(first.decisionId).toBe('whistleblower');
        expect(mem.getNPCMemory('professor_higgins').reactions).toEqual([
            expect.objectContaining({ decisionId: 'whistleblower', relationshipChange: 15 })
        ]);
        expect(mem.getMemoryDialogue('professor_higgins', 50)).toBeNull();
        expect(gs.npcMemories.professor_higgins.reactions).toHaveLength(1);
    });

    it('#1997 an older decision still gets a reaction when the newest has none', () => {
        const { mem } = setup();
        mem.recordDecision('whistleblower', 'expose', ['sarah_martinez']);
        mem.recordDecision('first_job_offer', 'accept', ['sarah_martinez']); // no rule for accept
        const r = mem.getMemoryDialogue('sarah_martinez', 50);
        expect(r?.decisionId).toBe('whistleblower');
    });

    it('#1998 decisions older than the memory window are not brought up', () => {
        const { gs, mem } = setup(0);
        mem.recordDecision('whistleblower', 'expose', ['professor_higgins']);
        gs.timeManager.totalDays = 7 * (NPCMemorySystem.MEMORY_WEEKS + 1);
        expect(mem.getMemoryDialogue('professor_higgins', 50)).toBeNull();
    });

    it('#1419 a decision made through StorylineManager is remembered', () => {
        const gs = {
            money: 100000, reputation: 50, ethicsScore: 50,
            timeManager: { totalDays: 14 },
            npcManager: { getNPC: (id) => ROSTER[id] || null }
        };
        gs.storylineManager = new StorylineManager(gs);
        const mem = new NPCMemorySystem(gs);
        const result = gs.storylineManager.processDecision('whistleblower', 'expose');
        expect(result).toBeTruthy();
        mem.recordDecision('whistleblower', 'expose');
        expect(mem.getNPCMemory('professor_higgins').decisions).toHaveLength(1);
        expect(mem.getMemoryDialogue('professor_higgins', 50)?.tone).toBe('admiring');
    });
});
