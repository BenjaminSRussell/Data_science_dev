import DialogueNode from './DialogueNode.js';
import DialogueTree from './DialogueTree.js';
import { getStoryReveal } from './StoryReveal.js';

class EnhancedDialogueSystem {
    constructor() {
        // Constructor code if needed
    }

    /**
     * Create dialogue tree based on NPC and story
     */
    createDialogueTree(npc, story) {
        const relationshipLevel = story.relationshipLevel;
        if (!story || !story.phases || story.phases.length === 0) {
            return this.buildBasicTree(npc);
        }

        const nodes = [];

        // Create root node
        nodes.push(new DialogueNode({
            id: 'root',
            text: `Hello, I'm ${npc.name}. How can I help you?`,
            choices: this.getRootChoices(npc, story, relationshipLevel)
        }));

        // Create dynamic nodes based on relationship and story
        nodes.push(...this.createWorkNodes(npc, story, relationshipLevel));
        nodes.push(...this.createPersonalQuestionNodes(npc, story, relationshipLevel));
        nodes.push(...this.createPhaseNodes(npc, story, relationshipLevel));

        return new DialogueTree(npc.id, nodes);
    }

    /**
     * Get root choices based on relationship and story
     */
    getRootChoices(npc, story, relationshipLevel) {
        const choices = [
            { id: 'talk_about_work', text: 'Tell me about your work' },
            { id: 'talk_about_life', text: 'Tell me about your life' }
        ];

        if (relationshipLevel >= 10) {
            choices.push({ id: 'ask_about_past', text: 'Tell me more about you' });
        }

        if (relationshipLevel >= 25) {
            choices.push({ id: 'ask_about_dreams', text: 'What are your dreams?' });
        }

        if (relationshipLevel >= 40) {
            choices.push({ id: 'ask_personal', text: 'Talk about something personal' });
        }

        if (relationshipLevel >= 60) {
            choices.push({ id: 'deep_question', text: 'Share something profound' });
        }

        const phase = this.getActivePhase(npc, story, relationshipLevel);
        if (phase) {
            choices.push({ id: `phase_${phase.id}`, text: `Talk about something important` });
        }

        choices.push({ id: 'goodbye', text: 'Goodbye' });

        return choices;
    }

    /**
     * Create work-related dialogue nodes
     */
    createWorkNodes(npc, story, relationshipLevel) {
        const nodes = [];

        // Work topic
        nodes.push(new DialogueNode({
            id: 'ask_about_work',
            text: this.getWorkResponse(npc, story, relationshipLevel),
            choices: [
                { id: 'work_empathize', text: this.getEmpathyResponse('work') },
                { id: 'work_ask_more', text: 'What about your work?' },
                { id: 'root', text: 'That sounds great' }
            ],
            effects: { relationship: 1 }
        }));

        // Life topic
        nodes.push(new DialogueNode({
            id: 'ask_about_life',
            text: this.getLifeResponse(npc, story, relationshipLevel),
            choices: [
                { id: 'life_empathize', text: this.getEmpathyResponse('struggle') },
                { id: 'life_ask_more', text: 'How are you handling it?' },
                { id: 'root', text: 'I hope things get better' }
            ],
            effects: { relationship: 2 }
        }));

        return nodes;
    }

    /**
     * Get work response based on relationship
     */
    getWorkResponse(npc, story, relationshipLevel) {
        if (relationshipLevel < 25) {
            return `Work's been good. Busy, but good. I enjoy what I do.`;
        } else if (relationshipLevel < 50) {
            const motivation = story.personalStory.motivation;
            return `Work? It's more than just a job for me. ${motivation}`;
        } else {
            const philosophy = story.personalStory.philosophy;
            return `You know, I've been thinking a lot about my work lately. ${philosophy}`;
        }
    }

    /**
     * Get life response based on relationship
     */
    getLifeResponse(npc, story, relationshipLevel) {
        if (relationshipLevel < 25) {
            return `Life's been... life. You know how it is. Ups and downs.`;
        } else if (relationshipLevel < 50) {
            return `Honestly? It's been a struggle. But I\'m getting through it. Day by day.`;
        } else {
            const turningPoint = story.personalStory.turningPoint;
            return `Life's complicated. But there are moments... ${turningPoint}`;
        }
    }

    /**
     * Create personal question nodes
     */
    createPersonalQuestionNodes(npc, story, relationshipLevel) {
        const nodes = [];

        if (relationshipLevel >= 10) {
            nodes.push(new DialogueNode({
                id: 'ask_about_past',
                text: this.getBackgroundReveal(npc, story, relationshipLevel),
                choices: [
                    { id: 'past_empathize', text: this.getEmpathyResponse('background') },
                    { id: 'past_ask_more', text: 'What was that like?' },
                    { id: 'root', text: 'Thank you for sharing' }
                ],
                effects: { relationship: 2 }
            }));
        }

        if (relationshipLevel >= 25) {
            nodes.push(new DialogueNode({
                id: 'ask_about_dreams',
                text: this.getDreamReveal(npc, story, relationshipLevel),
                choices: [
                    { id: 'dream_encourage', text: 'That sounds amazing' },
                    { id: 'dream_ask_how', text: 'How will you achieve it?' },
                    { id: 'root', text: 'I believe in you' }
                ],
                effects: { relationship: 3 }
            }));
        }

        if (relationshipLevel >= 40) {
            nodes.push(new DialogueNode({
                id: 'ask_personal',
                text: this.getPersonalReveal(npc, story, relationshipLevel),
                choices: [
                    { id: 'personal_empathize', text: 'I understand' },
                    { id: 'personal_support', text: 'I\'m here for you' },
                    { id: 'root', text: 'Thank you for trusting me' }
                ],
                effects: { relationship: 4 }
            }));
        }

        if (relationshipLevel >= 60) {
            nodes.push(new DialogueNode({
                id: 'deep_question',
                text: this.getDeepReveal(npc, story),
                choices: [
                    { id: 'deep_philosophy', text: 'That\'s profound' },
                    { id: 'deep_connect', text: 'I feel the same way' },
                    { id: 'root', text: 'Thank you for sharing that' }
                ],
                effects: { relationship: 5 }
            }));
        }

        return nodes;
    }

    /**
     * Get background reveal
     */
    getBackgroundReveal(npc, story, relationshipLevel) {
        const reveal = getStoryReveal(npc.id, relationshipLevel, 'background');
        if (reveal) return reveal.dialogue;
        return story.personalStory.background;
    }

    /**
     * Get dream reveal
     */
    getDreamReveal(npc, story, relationshipLevel) {
        const reveal = getStoryReveal(npc.id, relationshipLevel, 'dream');
        if (reveal) return reveal.dialogue;
        return `I have dreams. Big ones. ${story.personalStory.dream}`;
    }

    /**
     * Get personal reveal
     */
    getPersonalReveal(npc, story, relationshipLevel) {
        // Get the most recent personal reveal
        const reveals = story.storyReveals
            .filter(r => relationshipLevel >= r.relationshipLevel &&
                ['secret', 'fear', 'struggle'].includes(r.topic))
            .sort((a, b) => b.relationshipLevel - a.relationshipLevel);

        if (reveals.length > 0) {
            return reveals[0].dialogue;
        }

        return `There are things I don't usually talk about. But I trust you.`;
    }

    /**
     * Get active phase for NPC
     */
    getActivePhase(npc, story, relationshipLevel) {
        let activePhase = null;
        for (const phase of story.phases) {
            if (relationshipLevel >= phase.trigger.relationship) {
                activePhase = phase;
            }
        }
        return activePhase;
    }

    /**
     * Create phase-based dialogue nodes
     */
    createPhaseNodes(npc, story, relationshipLevel) {
        const nodes = [];

        if (!story.phases) return nodes;

        story.phases.forEach(phase => {
            const choices = phase.options.map((opt, index) => ({
                id: `phase_opt_${phase.id}_${index}`,
                text: opt.text
            }));

            nodes.push(new DialogueNode({
                id: `phase_${phase.id}`,
                text: phase.dialogue,
                choices: choices,
                effects: { relationship: 0 }
            }));

            phase.options.forEach((opt, index) => {
                nodes.push(new DialogueNode({
                    id: `phase_opt_${phase.id}_${index}`,
                    text: opt.text,
                    choices: [
                        { id: 'root', text: 'Back' }
                    ],
                    effects: opt.effects
                }));
            });
        });

        return nodes;
    }

    /**
     * Get empathy response based on topic
     */
    getEmpathyResponse(topic) {
        switch (topic) {
            case 'work':
                return 'I can imagine how challenging that must be.';
            case 'struggle':
                return 'That sounds tough. I hope you find some comfort in it.';
            case 'background':
                return 'It must have been interesting growing up.';
            default:
                return 'That\'s really interesting.';
        }
    }

    /**
     * Get deep reveal
     */
    getDeepReveal(npc, story) {
        const reveal = getStoryReveal(npc.id, story.relationshipLevel, 'deep');
        if (reveal) return reveal.dialogue;
        return `Sometimes, the deepest truths are the ones we least expect.`;
    }

    /**
     * Build a basic dialogue tree if no story is available
     */
    buildBasicTree(npc) {
        return new DialogueTree(npc.id, [
            new DialogueNode({
                id: 'root',
                text: `Hello, I'm ${npc.name}. How can I help you?`,
                choices: [
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            })
        ]);
    }
}

export default EnhancedDialogueSystem;