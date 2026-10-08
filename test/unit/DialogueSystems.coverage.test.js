/**
 * DeepCharacterStories (#305), DialogueTreeSystem (#306), EnhancedDialogueSystem (#309)
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CHARACTER_STORIES, getStoryReveal, getCharacterStory } from '../../src/js/game/dialogue/DeepCharacterStories.js';
import { DialogueTreeSystem, DialogueTreeBuilder } from '../../src/js/game/dialogue/DialogueTreeSystem.js';
import { EnhancedDialogueSystem, enhancedDialogueSystem } from '../../src/js/game/dialogue/EnhancedDialogueSystem.js';

afterEach(() => vi.restoreAllMocks());

describe('DeepCharacterStories lookups (#305)', () => {
    it('getStoryReveal: unknown NPC, below the first threshold, highest unlocked, locked topic', () => {
        expect(getStoryReveal('nonexistent_npc', 50)).toBeNull();
        expect(getStoryReveal('professor_higgins', 5)).toBeNull();
        expect(getStoryReveal('professor_higgins', 45).topic).toBe('secret_project');
        // A topic that hasn't unlocked yet returns null so callers fall back
        // to personalStory (changed from the old "any reveal" fallback)
        expect(getStoryReveal('professor_higgins', 15, 'secret_project')).toBeNull();
        expect(getStoryReveal('professor_higgins', 45, 'father').relationshipLevel).toBe(25);
    });

    it('getCharacterStory returns the field or null', () => {
        expect(getCharacterStory('sarah_martinez', 'secret')).toBe(CHARACTER_STORIES.sarah_martinez.personalStory.secret);
        expect(typeof getCharacterStory('sarah_martinez', 'secret')).toBe('string');
        expect(getCharacterStory('sarah_martinez', 'not_a_field')).toBeNull();
        expect(getCharacterStory('unknown_npc', 'secret')).toBeNull();
    });
});

describe('DialogueTreeSystem (#306)', () => {
    const npcs = {
        grumpy_gus: { id: 'grumpy_gus', name: 'Gus', personality: 'grumpy' },
        odd_olive: { id: 'odd_olive', name: 'Olive', personality: 'unheard_of' },
        professor_higgins: { id: 'professor_higgins', name: 'Professor Higgins', personality: 'professional' }
    };
    const makeSystem = () => {
        const sys = new DialogueTreeSystem();
        sys.setNPCManager({ getNPC: (id) => npcs[id] || null });
        return sys;
    };

    it('getTree returns null and warns for an unknown NPC', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(makeSystem().getTree('nobody', 10)).toBeNull();
        expect(warn).toHaveBeenCalled();
        expect(new DialogueTreeSystem().getNPC('grumpy_gus')).toBeNull();
    });

    it('caches trees and rebuilds after clearCache', () => {
        const sys = makeSystem();
        const build = vi.spyOn(sys.builder, 'buildTreeForNPC');
        const a = sys.getTree('grumpy_gus', 10);
        expect(sys.getTree('grumpy_gus', 10)).toBe(a);
        expect(build).toHaveBeenCalledTimes(1);
        sys.clearCache();
        expect(sys.treeCache.size).toBe(0);
        expect(sys.getTree('grumpy_gus', 10)).not.toBe(a);
        expect(build).toHaveBeenCalledTimes(2);
    });

    it('story trees are cached per level and per flag set', () => {
        const sys = makeSystem();
        const build = vi.spyOn(sys.builder, 'buildTreeForNPC');
        sys.getTree('professor_higgins', 10);
        sys.getTree('professor_higgins', 10);
        sys.getTree('professor_higgins', 30);
        expect(build).toHaveBeenCalledTimes(2);
    });

    it('grumpy NPCs get the grumpy tree; unknown personalities get the default', () => {
        const builder = new DialogueTreeBuilder();
        const grumpyIds = builder.buildTreeForNPC(npcs.grumpy_gus, 0).getRootNode().choices.map(c => c.id);
        expect(grumpyIds).toEqual(expect.arrayContaining(['apologize', 'persist', 'goodbye']));
        const def = vi.spyOn(builder, 'buildDefaultTree');
        builder.buildTreeForNPC(npcs.odd_olive, 0);
        expect(def).toHaveBeenCalled();
    });

    it('falls back to personality trees when the enhanced builder throws or returns a trivial tree', () => {
        const builder = new DialogueTreeBuilder();
        vi.spyOn(enhancedDialogueSystem, 'buildEnhancedTree').mockImplementationOnce(() => { throw new Error('x'); });
        expect(builder.buildTreeForNPC(npcs.grumpy_gus, 0).getRootNode().choices.map(c => c.id)).toContain('apologize');
        enhancedDialogueSystem.buildEnhancedTree.mockReturnValueOnce({ nodes: new Map([['root', {}]]) });
        expect(builder.buildTreeForNPC(npcs.grumpy_gus, 0).getRootNode().choices.map(c => c.id)).toContain('apologize');
    });
});

describe('EnhancedDialogueSystem (#309)', () => {
    const eds = new EnhancedDialogueSystem();
    const higgins = { id: 'professor_higgins', name: 'Professor Higgins', personality: 'professional' };
    const emma = { id: 'emma_bloom', name: 'Emma Bloom', personality: 'friendly' };
    const ids = (tree) => [...tree.nodes.keys()];

    it('no story -> basic tree; known story -> multi-node tree', () => {
        const basic = vi.spyOn(eds, 'buildBasicTree');
        eds.buildEnhancedTree({ id: 'nobody', name: 'No Body', personality: 'friendly' }, 50);
        expect(basic).toHaveBeenCalled();
        expect(eds.buildEnhancedTree(higgins, 45).nodes.size).toBeGreaterThan(1);
    });

    it('reveal nodes follow the relationship level', () => {
        expect(ids(eds.buildEnhancedTree(higgins, 5)).filter(id => id.startsWith('story_'))).toEqual([]);
        const at45 = ids(eds.buildEnhancedTree(higgins, 45));
        expect(at45).toEqual(expect.arrayContaining(['story_background', 'story_father', 'story_secret_project']));
        expect(at45).not.toContain('story_dream');
        expect(at45).not.toContain('story_philosophy');
    });

    it('greeting tiers at 0/10/25/50/75', () => {
        const g = (l) => eds.getGreetingForLevel(higgins, l);
        expect(g(0)).toBe(eds.getFirstMeetingGreeting(higgins));
        expect(g(10)).toBe('Hey Professor! Good to see you.');
        expect(g(25)).toContain('Always good to catch up');
        expect(g(50)).toContain('I was just thinking about you');
        expect(g(75)).toContain('My friend!');
    });

    it('getPersonalReveal only uses secret/fear/struggle topics', () => {
        const story = {
            storyReveals: [
                { topic: 'background', relationshipLevel: 10, dialogue: 'bg' },
                { topic: 'dream', relationshipLevel: 60, dialogue: 'dream' },
                { topic: 'fear', relationshipLevel: 40, dialogue: 'fear' }
            ]
        };
        expect(eds.getPersonalReveal(higgins, story, 90)).toBe('fear');
        expect(eds.getPersonalReveal(higgins, story, 30)).not.toBe('bg');
    });

    it('emma phases unlock by relationship and advance once a phase option is chosen', () => {
        const story = CHARACTER_STORIES.emma_bloom;
        const [p1, p2] = story.phases;
        expect(eds.getActivePhase(emma, story, 20)).toBeNull();
        expect(eds.getActivePhase(emma, story, 30).id).toBe('phase_1');
        expect(eds.getActivePhase(emma, story, 90).id).toBe('phase_1');
        const afterP1 = { [p1.options[0].flag]: true };
        expect(eds.getActivePhase(emma, story, 30, afterP1)).toBeNull();
        expect(eds.getActivePhase(emma, story, p2.trigger.relationship, afterP1).id).toBe('phase_2');
        const allDone = Object.fromEntries(story.phases.map(p => [p.options[0].flag, true]));
        expect(eds.getActivePhase(emma, story, 100, allDone)).toBeNull();
    });

    it('the root offers the active phase, built from the flags', () => {
        const story = CHARACTER_STORIES.emma_bloom;
        const flags = { [story.phases[0].options[1].flag]: true };
        const root = eds.buildEnhancedTree(emma, story.phases[1].trigger.relationship, flags).getRootNode();
        expect(root.choices[0].id).toBe('phase_phase_2');
    });
});
