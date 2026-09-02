import { CHARACTER_STORIES } from './DeepCharacterStories';
import { DialogueNode, DialogueTree } from './DialogueNode';

class EnhancedDialogueSystem {
    constructor() {
        this.characterStories = CHARACTER_STORIES;
    }

    buildEnhancedTree(npc, relationshipLevel) {
        const story = this.characterStories[npc.id];
        if (!story) {
            return this.buildBasicTree(npc);
        }

        const nodes = [
            new DialogueNode({
                id: 'root',
                text: this.getGreetingForLevel(npc, relationshipLevel),
                choices: [
                    { id: 'work', text: 'Talk about work' },
                    { id: 'life', text: 'Talk about life' },
                    { id: 'personal', text: 'Get to know me better' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            })
        ];

        nodes.push(...this.createWorkNodes(npc, story, relationshipLevel));
        nodes.push(...this.createLifeNodes(npc, story, relationshipLevel));
        nodes.push(...this.createPersonalQuestionNodes(npc, story, relationshipLevel));
        nodes.push(...this.createPhaseNodes(npc, story, relationshipLevel));

        return new DialogueTree(npc.id, nodes);
    }

    getGreetingForLevel(npc, relationshipLevel) {
        if (relationshipLevel < 10) {
            return `Hello, I'm ${npc.name}. How can I assist you today?`;
        } else if (relationshipLevel < 25) {
            return `Hi ${npc.name}. What brings you here today?`;
        } else if (relationshipLevel < 50) {
            return `Nice to see you again, ${npc.name}. What's on your mind?`;
        } else if (relationshipLevel < 75) {
            return `Greeting you, ${npc.name}. What can we chat about?`;
        } else {
            return `Long time no see, ${npc.name}. What's been on your mind lately?`;
        }
    }

    createWorkNodes(npc, story, relationshipLevel) {
        const nodes = [];

        nodes.push(new DialogueNode({
            id: 'work',
            text: this.getWorkResponse(npc, story, relationshipLevel),
            choices: [
                { id: 'root', text: 'Back to main menu' }
            ],
            effects: { relationship: 0 }
        }));

        return nodes;
    }

    getWorkResponse(npc, story, relationshipLevel) {
        if (relationshipLevel < 25) {
            return `Work? It's just a part of my day-to-day routine.`;
        } else if (relationshipLevel < 50) {
            const motivation = story.personalStory.motivation;
            return `Work is important to me. ${motivation}`;
        } else {
            const philosophy = story.personalStory.philosophy;
            return `You know, I've been thinking a lot about my work lately. ${philosophy}`;
        }
    }

    createLifeNodes(npc, story, relationshipLevel) {
        const nodes = [];

        nodes.push(new DialogueNode({
            id: 'life',
            text: this.getLifeResponse(npc, story, relationshipLevel),
            choices: [
                { id: 'root', text: 'Back to main menu' }
            ],
            effects: { relationship: 0 }
        }));

        return nodes;
    }

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

    getBackgroundReveal(npc, story, relationshipLevel) {
        const reveal = getStoryReveal(npc.id, relationshipLevel, 'background');
        if (reveal) return reveal.dialogue;
        return story.personalStory.background;
    }

    getDreamReveal(npc, story, relationshipLevel) {
        const reveal = getStoryReveal(npc.id, relationshipLevel, 'dream');
        if (reveal) return reveal.dialogue;
        return `I have dreams. Big ones. ${story.personalStory.dream}`;
    }

    getPersonalReveal(npc, story, relationshipLevel) {
        const reveals = story.storyReveals
            .filter(r => relationshipLevel >= r.relationshipLevel &&
                ['secret', 'fear', 'struggle'].includes(r.topic))
            .sort((a, b) => b.relationshipLevel - a.relationshipLevel);

        if (reveals.length > 0) {
            return reveals[0].dialogue;
        }

        return `There are things I don't usually talk about. But I trust you.`;
    }

    getEmpathyResponse(topic) {
        switch (topic) {
            case 'background':
                return 'I can imagine how that must have been.';
            case 'dream':
                return 'I hope your dreams come true.';
            case 'secret':
                return 'It takes a lot of courage to share that.';
            case 'fear':
                return 'I know it\'s scary, but I\'m here for you.';
            case 'struggle':
                return 'I\'m here to support you through this.';
            default:
                return 'I understand.';
        }
    }

    getActivePhase(npc, story, relationshipLevel) {
        for (const phase of story.phases) {
            if (relationshipLevel >= phase.trigger.relationship) {
                return phase;
            }
        }
        return null;
    }

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
                    text: opt.response,
                    choices: [
                        { id: 'root', text: "Continue" }
                    ],
                    effects: {
                        ...opt.effects,
                        flag: opt.flag
                    }
                }));
            });
        });

        return nodes;
    }

    getDeepReveal(npc, story) {
        const reveal = getStoryReveal(npc.id, 80, 'philosophy');
        if (reveal) return reveal.dialogue;
        return story.personalStory.philosophy;
    }

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