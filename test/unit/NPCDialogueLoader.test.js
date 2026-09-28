/**
 * NPCDialogueLoader Unit Tests
 * Covers promise de-duplication, fallback behavior, and stage/age mapping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NPCDialogueLoader, npcDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

describe('NPCDialogueLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new NPCDialogueLoader();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadNPCDialogue de-duplication', () => {
        it('only performs the actual file load once when called twice for the same npcId', async () => {
            const spy = vi
                .spyOn(loader, 'loadDialogueFile')
                .mockResolvedValue({ npcId: 'npc1', stages: {} });

            const first = await loader.loadNPCDialogue('npc1');
            const second = await loader.loadNPCDialogue('npc1');

            expect(spy).toHaveBeenCalledTimes(1);
            expect(first).toEqual({ npcId: 'npc1', stages: {} });
            expect(second).toBe(first);
        });

        it('shares a single in-flight promise for two concurrent unawaited calls', async () => {
            let resolveLoad;
            const spy = vi
                .spyOn(loader, 'loadDialogueFile')
                .mockImplementation(
                    () => new Promise((resolve) => { resolveLoad = resolve; })
                );

            const p1 = loader.loadNPCDialogue('npc2');
            const p2 = loader.loadNPCDialogue('npc2');

            // Both calls share the same in-flight promise
            expect(spy).toHaveBeenCalledTimes(1);
            expect(p1).toBe(p2);

            resolveLoad({ npcId: 'npc2', stages: {} });
            const [r1, r2] = await Promise.all([p1, p2]);
            expect(r1).toEqual({ npcId: 'npc2', stages: {} });
            expect(r2).toBe(r1);
        });
    });

    describe('fallback behavior', () => {
        it('resolves to the fallback shape when both dynamic import and fetch fail', async () => {
            vi.spyOn(loader, 'loadDialogueFile').mockRejectedValue(
                new Error('No dialogue file found for missing_npc')
            );

            const result = await loader.loadNPCDialogue('missing_npc');

            expect(result).toEqual({
                npcId: 'missing_npc',
                stages: {
                    stranger: { greeting: 'Hello.', topics: [] },
                    acquaintance: { greeting: 'Hey.', topics: [] },
                    friend: { greeting: 'Hi there!', topics: [] }
                },
                breakdowns: [],
                emotionalTriggers: []
            });
        });
    });

    describe('getRelationshipStage boundaries', () => {
        it('maps relationship levels to stages at the 20/40/60/80 boundaries', () => {
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

    describe('getAgeGroup boundaries', () => {
        it('maps ages to groups at the 25/40/60 boundaries', () => {
            expect(loader.getAgeGroup(0)).toBe('young');
            expect(loader.getAgeGroup(24)).toBe('young');
            expect(loader.getAgeGroup(25)).toBe('adult');
            expect(loader.getAgeGroup(39)).toBe('adult');
            expect(loader.getAgeGroup(40)).toBe('middle_aged');
            expect(loader.getAgeGroup(59)).toBe('middle_aged');
            expect(loader.getAgeGroup(60)).toBe('elderly');
            expect(loader.getAgeGroup(120)).toBe('elderly');
        });
    });

    describe('getDialogueForStage', () => {
        it('returns null when the dialogue has not been loaded', () => {
            expect(loader.getDialogueForStage('unknown', 50)).toBeNull();
        });

        it('falls back to the stranger stage when the computed key is not present', () => {
            loader.loadedDialogues.set('npc3', {
                stages: {
                    stranger: { greeting: 'Hello.' },
                    friendly: { greeting: 'Hi.' }
                }
            });

            // Stage 'acquaintance' (level 50) is missing -> stranger fallback
            expect(loader.getDialogueForStage('npc3', 50)).toEqual({ greeting: 'Hello.' });
            // Present stage is returned as-is
            expect(loader.getDialogueForStage('npc3', 25)).toEqual({ greeting: 'Hi.' });
        });
    });

    describe('getAgeAppropriateDialogue', () => {
        it('returns the age-group-specific dialogue when present', () => {
            loader.loadedDialogues.set('npc4', {
                stages: {
                    stranger: {
                        greeting: 'Hello.',
                        ageGroups: {
                            young: { greeting: 'Hey kid!' },
                            elderly: { greeting: 'Hello, elder.' }
                        }
                    }
                }
            });

            expect(loader.getAgeAppropriateDialogue('npc4', 20, 10)).toEqual(
                { greeting: 'Hey kid!' }
            );
            expect(loader.getAgeAppropriateDialogue('npc4', 70, 10)).toEqual(
                { greeting: 'Hello, elder.' }
            );
            // No age group for 'adult' -> falls back to the stage dialogue
            expect(loader.getAgeAppropriateDialogue('npc4', 30, 10)).toEqual(
                {
                    greeting: 'Hello.',
                    ageGroups: {
                        young: { greeting: 'Hey kid!' },
                        elderly: { greeting: 'Hello, elder.' }
                    }
                }
            );
        });

        it('returns null when the stage is missing from the dialogue', () => {
            loader.loadedDialogues.set('npc5', { stages: {} });
            expect(loader.getAgeAppropriateDialogue('npc5', 30, 10)).toBeNull();
        });
    });

    describe('singleton export', () => {
        it('exports a ready-made singleton instance of the class', () => {
            expect(npcDialogueLoader).toBeInstanceOf(NPCDialogueLoader);
            expect(npcDialogueLoader.loadedDialogues).toBeInstanceOf(Map);
            expect(npcDialogueLoader.loadingPromises).toBeInstanceOf(Map);
        });
    });
});
