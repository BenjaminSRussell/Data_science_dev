/**
 * EnhancedDialogueSystem.js
 * Integrates deep character stories into dialogue trees
 * Dialogue reveals character depth based on relationship level
 */

import { CHARACTER_STORIES, getStoryReveal, getCharacterStory } from './DeepCharacterStories.js';
import { DialogueNode, DialogueTree } from './DialogueTreeSystem.js';

export class EnhancedDialogueSystem {
    constructor() {
        this.storyCache = new Map();
    }

    /**
     * Build enhanced dialogue tree for NPC with deep stories
     */
    buildEnhancedTree(npc, relationshipLevel) {
        const story = CHARACTER_STORIES[npc.id];
        if (!story) {
            // Fallback to basic dialogue if no story exists
            return this.buildBasicTree(npc);
        }

        const nodes = [];

        // Root node with relationship-based greeting
        nodes.push(this.createRootNode(npc, relationshipLevel, story));

        // Add story reveal nodes based on relationship
        story.storyReveals.forEach(reveal => {
            if (relationshipLevel >= reveal.relationshipLevel) {
                nodes.push(this.createStoryRevealNode(npc, reveal, story));
            }
        });

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
    createRootNode(npc, relationshipLevel, story) {
        let greeting = this.getGreetingForLevel(npc, relationshipLevel);

        const choices = [
            { id: 'ask_about_work', text: 'Ask about their work' },
            { id: 'ask_about_life', text: 'Ask how they are' },
            { id: 'compliment', text: 'Give a compliment' }
        ];

        // Add story phase option if available
        if (story.phases) {
            const activePhase = this.getActivePhase(npc, story, relationshipLevel);
            // In a real implementation we would check if the specific phase is completed via flags
            if (activePhase) {
                choices.unshift({ id: `phase_${activePhase.id}`, text: "Talk about something important" });
            }
        }

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
            generous: `Welcome! I\'m ${npc.name}. Always happy to help.`
        };

        return greetings[npc.personality] || `Hello, I\'m ${npc.name}.`;
    }

    /**
     * Create story reveal node
     */
    createStoryRevealNode(npc, reveal, story) {
        const choices = [
            { id: 'empathize', text: this.getEmpathyResponse(reveal.topic) },
            { id: 'ask_more', text: 'Tell me more about that' },
            { id: 'change_topic', text: 'Change topic' }
        ];

        return new DialogueNode({
            id: `story_${reveal.topic}`,
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
        // Need to check specific flags in real implementation, 
        // passing mock flags for now or checking implementation in NPCManager
        for (const phase of story.phases) {
            // Check relationship trigger
            if (relationshipLevel >= phase.trigger.relationship) {
                // Check if already completed (this logic would typically access game state flags)
                // For now, we assume if it's available and not 'done', it's active
                // The actual check logic should ideally rely on a flags system passed in or accessible globally
                return phase;
            }
        }
        return null;
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
    getDeepReveal(npc, story) {
        const reveal = getStoryReveal(npc.id, 80, 'philosophy');
        if (reveal) return reveal.dialogue;
        return story.personalStory.philosophy;
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

