import { describe, it, expect, vi } from 'vitest';
import emma from '../../src/js/game/dialogue/npcs/emma_bloom.js';
import higgins from '../../src/js/game/dialogue/npcs/professor_higgins.js';
import { RelationshipDialogueSystem, PLAYER_START_AGE } from '../../src/js/game/dialogue/RelationshipDialogueSystem.js';
import { NPCDialogueLoader, npcDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

const text = (lines) => (Array.isArray(lines) ? lines.join(' ') : String(lines || '')).toLowerCase();

describe("Emma's close_friend secret isn't given away early (#2159)", () => {
    it('only the close_friend stage mentions the pseudonymous papers', () => {
        for (const [stage, data] of Object.entries(emma.stages)) {
            if (stage === 'close_friend') continue;
            const all = text(Object.values(data.topics || {}).flat()) + text(data.greeting);
            expect(all, stage).not.toMatch(/pseudonym|published/);
        }
        expect(text(emma.stages.close_friend.topics.secret)).toMatch(/pseudonym/);
    });
});

describe('age groups key off the player (#2081, #2185)', () => {
    it('player age starts at 22 and grows with the calendar', () => {
        const sys = new RelationshipDialogueSystem({ timeManager: { totalDays: 1 } });
        expect(sys.getPlayerAge()).toBe(PLAYER_START_AGE);
        sys.gameState.timeManager.totalDays = 1 + 365 * 4;
        expect(sys.getPlayerAge()).toBe(26);
        expect(new RelationshipDialogueSystem({ playerAge: 41 }).getPlayerAge()).toBe(41);
    });

    it("a new-graduate player hears Higgins's 'young' greeting; an older one the adult one", () => {
        const l = new NPCDialogueLoader();
        l.loadedDialogues.set('professor_higgins', higgins);
        const stage = Object.keys(higgins.stages).find(s => higgins.stages[s].ageGroups?.young);
        const level = { stranger: 0, friendly: 20, acquaintance: 40, friend: 60, close_friend: 80 }[stage];
        expect(l.getAgeAppropriateDialogue('professor_higgins', 22, level))
            .toBe(higgins.stages[stage].ageGroups.young);
        expect(l.getAgeAppropriateDialogue('professor_higgins', 30, level))
            .toBe(higgins.stages[stage].ageGroups.adult);
    });

    it('getDialogue passes the player age, not the NPC age', async () => {
        const spy = vi.spyOn(npcDialogueLoader, 'getAgeAppropriateDialogue').mockReturnValue(null);
        vi.spyOn(npcDialogueLoader, 'loadNPCDialogue').mockResolvedValue({ stages: { stranger: { greeting: ['Hi.'] } } });
        const sys = new RelationshipDialogueSystem({ timeManager: { totalDays: 1 }, npcManager: { getNPC: () => ({ age: 58 }) } });
        await sys.getDialogue('professor_higgins', 0);
        expect(spy).toHaveBeenCalledWith('professor_higgins', 22, 0);
        vi.restoreAllMocks();
    });
});

describe('authored topics are reachable in conversation (#2080)', () => {
    it("'next' rotates greeting → each topic → greeting", async () => {
        vi.spyOn(npcDialogueLoader, 'getAgeAppropriateDialogue').mockReturnValue(null);
        vi.spyOn(npcDialogueLoader, 'loadNPCDialogue').mockResolvedValue({
            stages: { stranger: { greeting: ['Hi.'], topics: { work: ['I code.', 'A lot.'], dream: ['Sail.'] } } }
        });
        const sys = new RelationshipDialogueSystem({});
        const seen = [];
        for (let i = 0; i < 4; i++) seen.push(await sys.getDialogue('x', 0, 'next'));
        expect(seen).toEqual(['Hi.', 'I code. A lot.', 'Sail.', 'Hi.']);
        vi.restoreAllMocks();
    });

    it('NPCManager asks for the rotation on returning visits only', async () => {
        const { readFileSync } = await import('node:fs');
        const src = readFileSync('src/js/game/NPCManager.js', 'utf8');
        expect(src).toMatch(/getDialogue\(\s*npcId, relationship, isFirstMeeting \|\| preview \? null : 'next'\)/);
    });
});
