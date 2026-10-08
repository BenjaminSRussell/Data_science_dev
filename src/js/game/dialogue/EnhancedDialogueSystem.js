/**
 * EnhancedDialogueSystem.js
 * Integrates deep character stories into dialogue trees
 * Dialogue reveals character depth based on relationship level
 */

import { CHARACTER_STORIES, getStoryReveal, getCharacterStory } from './DeepCharacterStories.js';
import { DialogueNode, DialogueTree } from './DialogueTreeSystem.js';

// Reveal topics that already have their own question node; every other topic
// is a "personal" reveal (#1146, #2217)
const DEDICATED_TOPICS = new Set(['background', 'dream', 'philosophy']);

const TOPIC_LABELS = {
    father: 'their father',
    secret_project: 'their side project',
    kids: 'their kids',
    networking: 'networking',
    intensity: 'what drives them',
    quiet: 'being quiet',
    change: 'how they changed',
    mother: 'their mother',
    husband: 'their late husband',
    insecurity: 'what they really think of themselves',
    family: 'their family',
    struggle: 'what has been hard lately',
    secret: 'what they are holding back',
    fear: 'what scares them'
};

const lowerFirst = (text = '') => text.charAt(0).toLowerCase() + text.slice(1);

export class EnhancedDialogueSystem {
    /**
     * Build enhanced dialogue tree for NPC with deep stories
     */
    buildEnhancedTree(npc, relationshipLevel, flags = {}) {
        const story = CHARACTER_STORIES[npc.id];
        if (!story) {
            // Fallback to basic dialogue if no story exists
            return this.buildBasicTree(npc);
        }

        const nodes = [];

        // Root node with relationship-based greeting
        nodes.push(this.createRootNode(npc, relationshipLevel, story, flags));

        // Add story reveal nodes based on relationship; the root links to
        // them, so they are reachable (#1144)
        nodes.push(...this.getUnlockedReveals(story, relationshipLevel)
            .map(({ reveal, nodeId }) => this.createStoryRevealNode(npc, reveal, story, nodeId)));

        // Add topic-based dialogue nodes
        nodes.push(...this.createTopicNodes(npc, story, relationshipLevel));

        // Add personal question nodes
        nodes.push(...this.createPersonalQuestionNodes(npc, story, relationshipLevel));

        // Add story phase nodes if available
        if (story.phases) {
            nodes.push(...this.createPhaseNodes(npc, story, relationshipLevel));
        }

        return new DialogueTree(npc.id, nodes);
    }

    /**
     * Create root node with dynamic greeting
     */
    createRootNode(npc, relationshipLevel, story, flags = {}) {
        let greeting = this.getGreetingForLevel(npc, relationshipLevel);

        const choices = [
            { id: 'ask_about_work', text: 'Ask about their work' },
            { id: 'ask_about_life', text: 'Ask how they are' },
            { id: 'compliment', text: 'Give a compliment' }
        ];

        // Add story phase option if available
        if (story.phases) {
            const activePhase = this.getActivePhase(npc, story, relationshipLevel, flags);
            if (activePhase) {
                choices.unshift({ id: `phase_${activePhase.id}`, text: "Talk about something important" });
            }
        }

        // Topic reveals without a dedicated question get their own choice;
        // the relationship gate sits on the choice, where consumers read it (#1607)
        this.getUnlockedReveals(story, relationshipLevel)
            .filter(({ reveal }) => !DEDICATED_TOPICS.has(reveal.topic))
            .forEach(({ reveal, nodeId }) => {
                choices.push({
                    id: nodeId,
                    text: `Ask about ${TOPIC_LABELS[reveal.topic] || reveal.topic.replace(/_/g, ' ')}`,
                    conditions: { relationship: reveal.relationshipLevel }
                });
            });

        // Add story exploration options based on relationship
        if (relationshipLevel >= 10) {
            choices.push({ id: 'ask_about_past', text: 'Ask about their background' });
        }

        if (relationshipLevel >= 25) {
            choices.push({ id: 'ask_about_dreams', text: 'Ask about their dreams' });
        }

        if (relationshipLevel >= 40) {
            choices.push({ id: 'ask_personal', text: 'Ask something personal' });
        }

        if (relationshipLevel >= 60) {
            choices.push({ id: 'deep_question', text: 'Ask a deep question' });
        }

        choices.push({ id: 'goodbye', text: 'Say goodbye' });

        return new DialogueNode({
            id: 'root',
            text: greeting,
            choices: choices,
            effects: { relationship: 0.5 }
        });
    }

    /**
     * Get greeting based on relationship level
     */
    getGreetingForLevel(npc, relationshipLevel) {
        if (relationshipLevel < 10) {
            return this.getFirstMeetingGreeting(npc);
        } else if (relationshipLevel < 25) {
            return `Hey ${npc.name.split(' ')[0]}! Good to see you.`;
        } else if (relationshipLevel < 50) {
            return `${npc.name.split(' ')[0]}! Always good to catch up. What's on your mind?`;
        } else if (relationshipLevel < 75) {
            return `Hey! I was just thinking about you. How have you been?`;
        } else {
            return `My friend! It's been too long. How are things?`;
        }
    }

    /**
     * Get first meeting greeting
     */
    getFirstMeetingGreeting(npc) {
        const greetings = {
            friendly: `Hi there! I\'m ${npc.name}. Nice to meet you!`,
            professional: `Hello. I\'m ${npc.name}. How can I help you?`,
            competitive: `Hey. ${npc.name}. What do you want?`,
            mysterious: `...Hello. I\'m ${npc.name}.`,
            generous: `Welcome! I\'m ${npc.name}. Always happy to help.`,
            grumpy: `${npc.name}. Make it quick.`
        };

        return greetings[npc.personality] || `Hello, I\'m ${npc.name}.`;
    }

    /**
     * Unlocked reveals with collision-safe node ids: the first reveal of a
     * topic is story_<topic>, repeats get story_<topic>_2, _3, ... (#1144)
     */
    getUnlockedReveals(story, relationshipLevel) {
        const seen = new Map();
        return (story.storyReveals || [])
            .filter(reveal => relationshipLevel >= reveal.relationshipLevel)
            .map(reveal => {
                const count = (seen.get(reveal.topic) || 0) + 1;
                seen.set(reveal.topic, count);
                const nodeId = count === 1 ? `story_${reveal.topic}` : `story_${reveal.topic}_${count}`;
                return { reveal, nodeId };
            });
    }

    /**
     * Create story reveal node
     */
    createStoryRevealNode(npc, reveal, story, nodeId = `story_${reveal.topic}`) {
        const choices = [
            { id: 'empathize', text: this.getEmpathyResponse(reveal.topic) },
            { id: 'ask_more', text: 'Tell me more about that' },
            { id: 'change_topic', text: 'Change topic' }
        ];

        return new DialogueNode({
            id: nodeId,
            text: reveal.dialogue,
            choices: choices,
            conditions: { relationship: reveal.relationshipLevel },
            effects: { relationship: 3 }
        });
    }

    /**
     * Get empathy response based on topic
     */
    getEmpathyResponse(topic) {
        const responses = {
            background: "That must have been difficult",
            father: 'I\'m sorry to hear that',
            secret_project: "That sounds important",
            dream: "That's a beautiful dream",
            fear: "I understand that fear",
            struggle: "That sounds really hard",
            kids: "Your kids are lucky to have you",
            philosophy: "That's a powerful way to see things"
        };

        return responses[topic] || "I understand";
    }

    /**
     * Create topic-based dialogue nodes
     */
    createTopicNodes(npc, story, relationshipLevel) {
        const nodes = [];

        // Work topic
        nodes.push(new DialogueNode({
            id: 'ask_about_work',
            text: this.getWorkResponse(npc, story, relationshipLevel),
            choices: [
                { id: 'work_interesting', text: 'That sounds interesting' },
                { id: 'work_ask_details', text: 'Tell me more about your work' },
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
                ...(relationshipLevel >= 25 && story.personalStory?.relationship
                    ? [{ id: 'ask_about_people', text: 'Ask about the people in their life', conditions: { relationship: 25 } }]
                    : []),
                { id: 'root', text: 'I hope things get better' }
            ],
            effects: { relationship: 2 }
        }));

        if (relationshipLevel >= 25 && story.personalStory?.relationship) {
            nodes.push(new DialogueNode({
                id: 'ask_about_people',
                text: `(From what they share, you piece it together: ${story.personalStory.relationship})`,
                choices: [
                    { id: 'life_empathize', text: 'Thanks for telling me' },
                    { id: 'root', text: 'Talk about something else' }
                ],
                effects: { relationship: 2 }
            }));
        }

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
                    ...(this.getPersonalInsight(npc, story, relationshipLevel)
                        ? [{ id: 'personal_insight', text: 'Read between the lines', conditions: { relationship: 40 } }]
                        : []),
                    { id: 'root', text: 'Thank you for trusting me' }
                ],
                effects: { relationship: 4 }
            }));

            const insight = this.getPersonalInsight(npc, story, relationshipLevel);
            if (insight) {
                nodes.push(new DialogueNode({
                    id: 'personal_insight',
                    text: insight,
                    choices: [
                        { id: 'personal_support', text: 'I\'m here for you' },
                        { id: 'root', text: 'Talk about something else' }
                    ],
                    effects: { relationship: 2 }
                }));
            }
        }

        if (relationshipLevel >= 60) {
            nodes.push(new DialogueNode({
                id: 'deep_question',
                text: this.getDeepReveal(npc, story, relationshipLevel),
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
        return getCharacterStory(npc.id, 'background') || story.personalStory?.background || '';
    }

    /**
     * Get dream reveal
     */
    getDreamReveal(npc, story, relationshipLevel) {
        const reveal = getStoryReveal(npc.id, relationshipLevel, 'dream');
        if (reveal) return reveal.dialogue;
        return `I have dreams. Big ones. ${getCharacterStory(npc.id, 'dream') || story.personalStory?.dream || ''}`.trim();
    }

    /**
     * Get personal reveal
     */
    getPersonalReveal(npc, story, relationshipLevel) {
        // The most recent reveal on any topic that has no dedicated question
        // (covers every character's own topics, not a fixed whitelist)
        const reveals = story.storyReveals
            .filter(r => relationshipLevel >= r.relationshipLevel && !DEDICATED_TOPICS.has(r.topic))
            .sort((a, b) => b.relationshipLevel - a.relationshipLevel);

        if (reveals.length > 0) {
            return reveals[0].dialogue;
        }

        return `There are things I don't usually talk about. But I trust you.`;
    }

    /**
     * Narrated insight from the authored personalStory: their fear once you
     * are close, the secret they hide once you are very close (#2192)
     */
    getPersonalInsight(npc, story, relationshipLevel) {
        const pick = (element) => getCharacterStory(npc.id, element) || story.personalStory?.[element] || null;
        const first = (npc.name || 'they').split(' ')[0];
        const secret = pick('secret');
        const fear = pick('fear');
        if (relationshipLevel >= 60 && secret) {
            return `(You realize what ${first} has been holding back: ${secret})`;
        }
        if (relationshipLevel >= 40 && fear) {
            return `(You sense what ${first} is afraid of: ${lowerFirst(fear)})`;
        }
        return null;
    }

    /**
     * Get active phase for NPC
     */
    getActivePhase(npc, story, relationshipLevel, flags = {}) {
        // The first phase that is unlocked by relationship, whose prerequisite
        // is met, and that hasn't been answered yet. Choosing any option of a
        // phase sets that option's flag (NPCManager stores it per NPC), which
        // completes the phase. Previously this always returned phase 1, so
        // later phases could never come up.
        for (const phase of story.phases || []) {
            if (this.isPhaseComplete(phase, flags)) continue;
            if (relationshipLevel < (phase.trigger?.relationship || 0)) return null;
            const prerequisite = phase.trigger?.flag;
            if (prerequisite && !this.isFlagSatisfied(prerequisite, story, flags)) return null;
            return phase;
        }
        return null;
    }

    /**
     * A phase is complete once any of its options has been chosen
     */
    isPhaseComplete(phase, flags = {}) {
        if (flags[`${phase.id}_complete`]) return true;
        return (phase.options || []).some(opt => opt.flag && flags[opt.flag]);
    }

    /**
     * 'phase_N_complete' prerequisites are derived from the phase's option
     * flags; any other flag must be set directly
     */
    isFlagSatisfied(flag, story, flags = {}) {
        if (flags[flag]) return true;
        const match = /^(.*)_complete$/.exec(flag);
        const phase = match && (story.phases || []).find(p => p.id === match[1]);
        return phase ? this.isPhaseComplete(phase, flags) : false;
    }

    /**
     * Create phase-based dialogue nodes
     */
    createPhaseNodes(npc, story, relationshipLevel) {
        const nodes = [];

        if (!story.phases) return nodes;

        story.phases.forEach(phase => {
            // Trigger check logic again for safety or just build them all 
            // and let the root node decide entry (safer to build all reachable)

            const choices = phase.options.map((opt, index) => ({
                id: `phase_opt_${phase.id}_${index}`,
                text: opt.text
            }));

            // Main Phase Node
            nodes.push(new DialogueNode({
                id: `phase_${phase.id}`,
                text: phase.dialogue,
                choices: choices,
                effects: { relationship: 0 }
            }));

            // Response Nodes for each option
            phase.options.forEach((opt, index) => {
                nodes.push(new DialogueNode({
                    id: `phase_opt_${phase.id}_${index}`,
                    text: opt.response,
                    choices: [
                        { id: 'root', text: "Continue" }
                    ],
                    effects: {
                        ...opt.effects,
                        flag: opt.flag // Set the flag when this option is chosen
                    }
                }));
            });
        });

        return nodes;
    }

    /**
     * Get deep reveal (philosophy)
     */
    getDeepReveal(npc, story, relationshipLevel = 0) {
        // Use the player's real level, not a hardcoded 80 (#1145)
        const reveal = getStoryReveal(npc.id, relationshipLevel, 'philosophy');
        if (reveal) return reveal.dialogue;
        return getCharacterStory(npc.id, 'philosophy') || story.personalStory?.philosophy || '';
    }

    /**
     * Build basic tree if no story exists
     */
    buildBasicTree(npc) {
        return new DialogueTree(npc.id, [
            new DialogueNode({
                id: 'root',
                text: `Hello, I\'m ${npc.name}. How can I help you?`,
                choices: [
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            })
        ]);
    }
}

export const enhancedDialogueSystem = new EnhancedDialogueSystem();

