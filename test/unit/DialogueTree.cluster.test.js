/**
 * Dialogue tree builder, enhanced story dialogue and story data
 * (#121, #1916, #1580, #1583, #1584, #2124, #1150, #1152, #1144, #1607,
 *  #1145, #1146, #2217, #2192, #1151, #2191, #2218, #2193, #2219, #558, #559, #562)
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    DialogueTree, DialogueNode, DialogueTreeBuilder, DialogueTreeSystem, TYPE_TOPICS, relationshipTier
} from '../../src/js/game/dialogue/DialogueTreeSystem.js';
import { EnhancedDialogueSystem, enhancedDialogueSystem } from '../../src/js/game/dialogue/EnhancedDialogueSystem.js';
import { CHARACTER_STORIES } from '../../src/js/game/dialogue/DeepCharacterStories.js';
import { NPCs } from '../../src/js/game/NPCManager.js';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

afterEach(() => vi.restoreAllMocks());

const plain = (over = {}) => ({ id: 'plain_npc', name: 'Pat Plain', personality: 'friendly', type: 'mentor', ...over });

describe('personality trees', () => {
    const builder = new DialogueTreeBuilder();

    it('adds a topic that fits the NPC type', () => {
        const root = builder.buildTreeForNPC(plain({ type: 'investor' }), 0).getRootNode();
        expect(root.choices.map(c => c.id)).toContain(TYPE_TOPICS.investor.id);
        expect(root.choices.at(-1).id).toBe('goodbye');
        const tree = builder.buildTreeForNPC(plain({ type: 'investor' }), 0);
        expect(tree.hasNode('pitch_idea')).toBe(true);
    });

    it('warms up with the relationship', () => {
        const cold = builder.buildTreeForNPC(plain(), 0).getRootNode();
        const friend = builder.buildTreeForNPC(plain(), 35).getRootNode();
        const close = builder.buildTreeForNPC(plain(), 70).getRootNode();
        expect(new Set([cold.text, friend.text, close.text]).size).toBe(3);
        expect(close.choices.map(c => c.id)).toContain('deep_connect');
        expect(friend.choices.map(c => c.id)).not.toContain('deep_connect');
        expect(relationshipTier(29)).toBe(0);
        expect(relationshipTier(30)).toBe(1);
        expect(relationshipTier(60)).toBe(2);
    });

    it('caches personality trees per relationship tier', () => {
        const system = new DialogueTreeSystem();
        system.setNPCManager({ getNPC: () => plain() });
        expect(system.getTree('plain_npc', 5)).toBe(system.getTree('plain_npc', 10));
        expect(system.getTree('plain_npc', 5)).not.toBe(system.getTree('plain_npc', 65));
    });

    it('reports enhanced-dialogue failures instead of swallowing them', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(enhancedDialogueSystem, 'buildEnhancedTree').mockImplementation(() => { throw new Error('boom'); });
        const tree = builder.buildTreeForNPC(plain(), 0);
        expect(tree.getRootNode()).toBeTruthy();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Enhanced dialogue failed'), expect.any(Error));
    });

    it('falls back when the enhanced tree only offers goodbye', () => {
        vi.spyOn(enhancedDialogueSystem, 'buildEnhancedTree').mockReturnValue(new DialogueTree('x', [
            new DialogueNode({ id: 'root', text: 'hi', choices: [{ id: 'goodbye', text: 'bye' }] }),
            new DialogueNode({ id: 'orphan', text: 'never reached' })
        ]));
        const tree = builder.buildTreeForNPC(plain(), 0);
        expect(tree.hasNode('orphan')).toBe(false);
    });

    it('warns about duplicate node ids', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const tree = new DialogueTree('dup', [
            new DialogueNode({ id: 'root', text: 'a', choices: [] }),
            new DialogueNode({ id: 'root', text: 'b', choices: [] })
        ]);
        expect(tree.duplicateIds).toEqual(['root']);
        expect(warn).toHaveBeenCalled();
    });

    it('no dead caches are left around', () => {
        expect(new DialogueTreeBuilder().trees).toBeUndefined();
        expect(new EnhancedDialogueSystem().storyCache).toBeUndefined();
    });
});

describe('enhanced story dialogue', () => {
    const eds = new EnhancedDialogueSystem();
    const npc = (id) => ({ id, name: NPCs.find(n => n.id === id)?.name || id, personality: 'friendly' });

    it('greets grumpy NPCs with their own line', () => {
        expect(eds.getFirstMeetingGreeting({ name: 'Gus Grump', personality: 'grumpy' })).toBe('Gus Grump. Make it quick.');
    });

    it('story reveal nodes are reachable from the root, gated on the choice', () => {
        const tree = eds.buildEnhancedTree(npc('professor_higgins'), 45);
        const root = tree.getRootNode();
        const father = root.choices.find(c => c.id === 'story_father');
        expect(father).toBeTruthy();
        expect(father.conditions).toEqual({ relationship: 25 });
        expect(tree.hasNode('story_father')).toBe(true);
    });

    it('repeated reveal topics get collision-safe ids', () => {
        const story = { storyReveals: [
            { relationshipLevel: 10, topic: 'secret', dialogue: 'a' },
            { relationshipLevel: 20, topic: 'secret', dialogue: 'b' }
        ] };
        expect(eds.getUnlockedReveals(story, 30).map(r => r.nodeId)).toEqual(['story_secret', 'story_secret_2']);
    });

    it('getDeepReveal respects the actual relationship level', () => {
        const story = CHARACTER_STORIES.professor_higgins;
        expect(eds.getDeepReveal(npc('professor_higgins'), story, 60)).toBe(story.personalStory.philosophy);
        expect(eds.getDeepReveal(npc('professor_higgins'), story, 80))
            .toBe(story.storyReveals.find(r => r.topic === 'philosophy').dialogue);
    });

    it("personal reveals cover each character's own topics", () => {
        const higgins = CHARACTER_STORIES.professor_higgins;
        expect(eds.getPersonalReveal(npc('professor_higgins'), higgins, 45))
            .toBe(higgins.storyReveals.find(r => r.topic === 'secret_project').dialogue);
        const brad = CHARACTER_STORIES.brad_sterling;
        expect(eds.getPersonalReveal(npc('brad_sterling'), brad, 30))
            .toBe(brad.storyReveals.find(r => r.topic === 'insecurity').dialogue);
    });

    it('authored secret, fear and relationship text reach the player', () => {
        const story = CHARACTER_STORIES.sarah_martinez;
        const close = eds.buildEnhancedTree(npc('sarah_martinez'), 65);
        expect(close.getNode('personal_insight').text).toContain(story.personalStory.secret);
        const mid = eds.buildEnhancedTree(npc('sarah_martinez'), 45);
        expect(mid.getNode('personal_insight').text).toContain('afraid of');
        expect(mid.getNode('ask_about_people').text).toContain(story.personalStory.relationship);
        expect(mid.getNode('ask_about_life').choices.map(c => c.id)).toContain('ask_about_people');
    });
});

describe('story data', () => {
    it('every reveal and phase uses the 10/25/40/60/80 scale', () => {
        const scale = new Set([10, 25, 40, 60, 80]);
        for (const [id, story] of Object.entries(CHARACTER_STORIES)) {
            for (const reveal of story.storyReveals || []) expect(scale.has(reveal.relationshipLevel), `${id} ${reveal.topic}`).toBe(true);
            for (const phase of story.phases || []) expect(scale.has(phase.trigger.relationship), `${id} ${phase.id}`).toBe(true);
        }
    });

    it("emma's secret phase comes after her secret reveal", () => {
        const emma = CHARACTER_STORIES.emma_bloom;
        const secret = emma.storyReveals.find(r => r.topic === 'secret').relationshipLevel;
        expect(emma.phases[1].trigger.relationship).toBeGreaterThanOrEqual(secret);
    });

    it('phase effects only use keys the game applies', () => {
        const known = new Set(['relationship', 'intelligence', 'ethics', 'reputation', 'xp', 'xpAmount']);
        for (const phase of CHARACTER_STORIES.emma_bloom.phases) {
            for (const opt of phase.options) {
                for (const key of Object.keys(opt.effects)) expect(known.has(key), key).toBe(true);
                expect(opt.flag).toBeTruthy();
            }
        }
    });

    it('brad has a dream reveal', () => {
        expect(CHARACTER_STORIES.brad_sterling.storyReveals.some(r => r.topic === 'dream')).toBe(true);
    });

    it('roster text matches the stories', () => {
        const byId = Object.fromEntries(NPCs.map(n => [n.id, n]));
        expect(byId.david_chen.benefits.seedFunding).toBeUndefined();
        expect(byId.sarah_martinez.backstory).toMatch(/barista/i);
        expect(byId.emma_bloom.backstory).toMatch(/research papers/i);
    });
});

describe('DialogueUI applies story choices', () => {
    it('records story flags and stat effects', () => {
        const flags = {};
        const stats = { modifyEthics: vi.fn(), addExperience: vi.fn() };
        const gameState = {
            reputation: 0,
            characterStats: stats,
            npcManager: { getNPCFlags: () => flags, getRelationship: () => 0, setRelationship: vi.fn() }
        };
        const getTree = vi.fn(() => null);
        const ui = Object.create(DialogueUI.prototype);
        ui.game = { gameState: { ...gameState, dialogueTreeSystem: { getTree } } };
        ui.currentNPC = { id: 'emma_bloom', name: 'Emma Bloom' };
        ui.applyEffects({ flag: 'emma_choice_public', reputation: 10, ethics: 5, intelligence: 5, xp: 'python', xpAmount: 3 });
        expect(flags.emma_choice_public).toBe(true);
        expect(ui.game.gameState.reputation).toBe(10);
        expect(stats.modifyEthics).toHaveBeenCalledWith(5);
        expect(stats.addExperience).toHaveBeenCalledWith('intelligence', 5);
        expect(stats.addExperience).toHaveBeenCalledWith('analytics', 3);
    });
});
