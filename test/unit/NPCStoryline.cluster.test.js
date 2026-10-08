import { describe, it, expect } from 'vitest';
import { NPCs } from '../../src/js/game/NPCManager.js';
import { CHARACTER_STORIES } from '../../src/js/game/dialogue/DeepCharacterStories.js';
import { NPCDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';
import { RelationshipDialogueSystem } from '../../src/js/game/dialogue/RelationshipDialogueSystem.js';
import { EnhancedDialogueSystem } from '../../src/js/game/dialogue/EnhancedDialogueSystem.js';
import { DialogueTreeSystem } from '../../src/js/game/dialogue/DialogueTreeSystem.js';

// issue -> roster id, for the story_line/*.txt characters (#817-#842)
const GENERATED = {
    817: 'agent_smith', 818: 'bella_lux', 820: 'carlos_tech', 821: 'casey_lee',
    822: 'chloe_competitor', 823: 'coach_motivation', 824: 'dr_amara_patel', 825: 'dr_wellness',
    826: 'james_wilson', 827: 'judge_roberts', 828: 'luna_bookstore',
    829: 'marcus_thompson', 830: 'maya_engineer', 831: 'noah_artist',
    832: 'priya_sharma', 833: 'rachel_green', 834: 'robert_kim', 835: 'sam_taylor',
    836: 'shadow_broker', 837: 'sophia_zhang', 838: 'taylor_morgan',
    839: 'the_broker', 840: 'tyler_rival', 841: 'victoria_sterling', 842: 'zero_cool'
};
const STAGES = ['stranger', 'friendly', 'acquaintance', 'friend', 'close_friend'];
const FLOOR = { stranger: 0, friendly: 20, acquaintance: 40, friend: 60, close_friend: 80 };

describe('story_line characters are implemented (#817-#842)', () => {
    for (const [issue, id] of Object.entries(GENERATED)) {
        it(`#${issue} ${id}: roster entry, dialogue file and character story`, async () => {
            expect(NPCs.some(n => n.id === id), 'roster').toBe(true);

            const loader = new NPCDialogueLoader();
            const dialogue = await loader.loadDialogueFile(id); // throws if there is no file
            expect(dialogue.npcId).toBe(id);
            for (const stage of STAGES) {
                expect(dialogue.stages[stage].greeting.length, stage).toBeGreaterThan(0);
            }
            expect(Object.keys(dialogue.actions).length).toBeGreaterThanOrEqual(3);

            const story = CHARACTER_STORIES[id];
            expect(Object.keys(story.personalStory).sort()).toEqual(
                ['background', 'dream', 'fear', 'motivation', 'philosophy', 'relationship', 'secret', 'turningPoint']);
            expect(story.storyReveals.map(r => r.relationshipLevel)).toEqual([10, 25, 40, 60, 80]);

            // A reveal is never offered at a stage that can be reached before its threshold
            for (const stage of STAGES) {
                for (const topic of Object.keys(dialogue.stages[stage].topics)) {
                    const reveal = story.storyReveals.find(r => r.topic === topic);
                    expect(reveal.relationshipLevel).toBeLessThanOrEqual(FLOOR[stage]);
                }
            }
        });
    }

    it('Maya matches her design doc', async () => {
        const maya = CHARACTER_STORIES.maya_engineer;
        expect(maya.personalStory.secret).toBe('She writes fanfiction about open source frameworks dating each other.');
        expect(maya.personalStory.philosophy).toBe('Code is poetry. Logic is art.');
        expect(maya.storyReveals[2].dialogue).toBe("Okay, don't laugh. I wrote a story where React breaks up with Angular. It's... emotional.");
        const d = await new NPCDialogueLoader().loadDialogueFile('maya_engineer');
        expect(d.stages.stranger.greeting).toEqual(['Hello world.', 'Maya.', 'Coding?']);
        expect(d.stages.close_friend.greeting).toEqual(['Partner.', "Hey! Let's build a life."]);
        expect(d.actions).toEqual({
            gift_tech_gadgets: 'Ooh. Shiny. Thanks.',
            gift_code_reviews: 'Best gift ever. Seriously.',
            compliment: "You're optimizing my heart rate."
        });
    });

    it('Shadow and Gordon (the_broker) stay separate characters', () => {
        expect(CHARACTER_STORIES.shadow_broker.personalStory.secret).toMatch(/pigeons/);
        expect(CHARACTER_STORIES.the_broker.personalStory.secret).not.toMatch(/pigeons/);
    });

    it('hand-written stories are not overwritten', () => {
        expect(CHARACTER_STORIES.alex_rivera.personalStory.background).toMatch(/Former hacker/);
    });

    it('the enhanced tree surfaces unlocked reveals for a generated character', () => {
        const npc = NPCs.find(n => n.id === 'maya_engineer');
        const tree = new EnhancedDialogueSystem().buildEnhancedTree(npc, 45);
        const texts = tree.nodes ? [...tree.nodes.values()].map(n => n.text) : [];
        expect(texts.join('\n')).toContain('React breaks up with Angular');
    });
});

describe('fallback dialogue covers all 5 stages (#2317)', () => {
    it('defines every stage getRelationshipStage can return', () => {
        const fb = new NPCDialogueLoader().getFallbackDialogue('nobody');
        expect(Object.keys(fb.stages).sort()).toEqual([...STAGES].sort());
    });

    it('a close friend without a dialogue file still gets a close-friend greeting', async () => {
        const sys = new RelationshipDialogueSystem({});
        const line = await sys.getDialogue('npc_without_file', 90);
        expect(line).toBe('There you are! I was hoping you would stop by.');
        expect(await sys.getDialogue('npc_without_file', 25)).toBe('Hey, good to see you.');
    });
});

describe('first meeting is tracked by metNPCs, not relationship < 10 (#1609)', () => {
    const npc = { id: 'x', name: 'Pat Lee', personality: 'friendly' };
    const eds = new EnhancedDialogueSystem();

    it('a returning low-relationship NPC does not say "Nice to meet you"', () => {
        expect(eds.getGreetingForLevel(npc, 3, { isFirstMeeting: true })).toMatch(/Nice to meet you/);
        expect(eds.getGreetingForLevel(npc, 3, { isFirstMeeting: false })).not.toMatch(/Nice to meet you/);
        expect(eds.getGreetingForLevel(npc, 3)).toMatch(/Nice to meet you/); // unknown: old behaviour
    });

    it('getTree threads the flag through and caches first/met trees separately', () => {
        const sys = new DialogueTreeSystem();
        sys.getNPC = () => ({ ...NPCs.find(n => n.id === 'maya_engineer') });
        const first = sys.getTree('maya_engineer', 2, {}, { isFirstMeeting: true });
        const again = sys.getTree('maya_engineer', 2, {}, { isFirstMeeting: false });
        expect(first).not.toBe(again);
        expect(first.getRootNode().text).toMatch(/Nice to meet you|I'm Maya/);
        expect(again.getRootNode().text).not.toMatch(/Nice to meet you/);
    });
});

describe('dialogue loader and trigger fixes (#2184, #2186, #117)', () => {
    it('caches the fallback so cache-reading getters see it (#2184)', async () => {
        const loader = new NPCDialogueLoader();
        await loader.loadNPCDialogue('nobody_here');
        expect(loader.getDialogueForStage('nobody_here', 85).greeting).toEqual(['There you are! I was hoping you would stop by.']);
        expect(loader.getAgeAppropriateDialogue('nobody_here', 30, 0).greeting).toEqual(['Hello.']);
    });

    it('concurrent loads share one promise', () => {
        const loader = new NPCDialogueLoader();
        expect(loader.loadNPCDialogue('maya_engineer')).toBe(loader.loadNPCDialogue('maya_engineer'));
    });

    it('trigger conditions check every key, including relationship thresholds (#117)', () => {
        const sys = new RelationshipDialogueSystem({});
        expect(sys.checkTriggerCondition({ mentionPast: true, judgment: true }, { mentionPast: true, judgment: true })).toBe(true);
        expect(sys.checkTriggerCondition({ mentionPast: true, judgment: true }, { mentionPast: true })).toBe(false);
        expect(sys.checkTriggerCondition({ playerSupports: true, relationship: '>40' }, { playerSupports: true, relationship: 55 })).toBe(true);
        expect(sys.checkTriggerCondition({ playerSupports: true, relationship: '>40' }, { playerSupports: true, relationship: 40 })).toBe(false);
        expect(sys.checkTriggerCondition({ mentionKids: true, relationship: '>40' }, { mentionKids: true })).toBe(false);
    });

    it('getEmotionalResponse fires a file-defined trigger', async () => {
        const sys = new RelationshipDialogueSystem({});
        const res = await sys.getEmotionalResponse('alex_rivera', { playerSupports: true, relationship: 60 });
        expect(res.dialogue).toBe('Thanks for believing in me.');
    });
});
