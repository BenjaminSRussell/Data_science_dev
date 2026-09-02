import { DialogueNode, DialogueTree } from './DialogueTree.js';
import { EnhancedDialogueSystem } from './EnhancedDialogueSystem.js';

class DialogueTreeSystem {
    constructor() {
        this.treeCache = new Map();
        this.npcManager = null;
        this.builder = new DialogueTreeBuilder();
    }

    setNPCManager(npcManager) {
        this.npcManager = npcManager;
    }

    clearCache() {
        this.treeCache.clear();
    }

    getNPC(npcId) {
        return this.npcManager.getNPC(npcId);
    }

    getTree(npcId, relationshipLevel) {
        const cacheKey = `${npcId}_${relationshipLevel}`;
        if (this.treeCache.has(cacheKey)) {
            return this.treeCache.get(cacheKey);
        }

        const npc = this.getNPC(npcId);
        if (!npc) {
            console.warn(`NPC with id ${npcId} not found.`);
            return null;
        }

        const tree = this.builder.buildTreeForNPC(npc, relationshipLevel);
        this.treeCache.set(cacheKey, tree);
        return tree;
    }
}

class DialogueTreeBuilder {
    constructor() {
        this.enhancedDialogueSystem = new EnhancedDialogueSystem();
    }

    buildTreeForNPC(npc, relationshipLevel) {
        try {
            const enhancedTree = this.enhancedDialogueSystem.buildEnhancedTree(npc, relationshipLevel);
            if (enhancedTree && enhancedTree.nodes.size > 1) {
                return enhancedTree;
            }
        } catch (error) {
            console.warn('Enhanced tree build failed, falling back to personality-based tree.', error);
        }

        switch (npc.personality) {
            case 'competitive':
                return this.buildCompetitiveTree(npc);
            case 'mysterious':
                return this.buildMysteriousTree(npc);
            case 'grumpy':
                return this.buildGrumpyTree(npc);
            case 'generous':
                return this.buildGenerousTree(npc);
            default:
                return this.buildDefaultTree(npc);
        }
    }

    buildCompetitiveTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hey. What do you want?",
                choices: [
                    { id: 'challenge', text: 'Challenge them' },
                    { id: 'compliment', text: 'Give a compliment' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'challenge',
                text: "Oh, you think you can compete? Bring it on. I'm always up for a challenge.",
                choices: [
                    { id: 'challenge_accept', text: 'Accept the challenge' },
                    { id: 'root', text: 'Maybe another time' }
                ],
                effects: { relationship: 2 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "See you around. Don't fall behind.",
                effects: { relationship: 0 }
            })
        ];

        return new DialogueTree(npc.id, nodes);
    }

    buildMysteriousTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "...Hello. What brings you here?",
                choices: [
                    { id: 'ask_about_secrets', text: 'Ask about secrets' },
                    { id: 'observe', text: 'Just observe' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_about_secrets',
                text: "Secrets? Everyone has them. The question is: are you ready to know?",
                choices: [
                    { id: 'secrets_yes', text: 'Yes, I am ready' },
                    { id: 'root', text: 'Maybe not' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "...Until we meet again.",
                effects: { relationship: 0 }
            })
        ];

        return new DialogueTree(npc.id, nodes);
    }

    buildGrumpyTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "What do you want? I'm busy.",
                choices: [
                    { id: 'apologize', text: 'Apologize' },
                    { id: 'persist', text: 'Persist' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'apologize',
                text: "Fine. What is it? Make it quick.",
                choices: [
                    { id: 'root', text: 'Thank you' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Finally. Goodbye.",
                effects: { relationship: 0 }
            })
        ];

        return new DialogueTree(npc.id, nodes);
    }

    buildGenerousTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Welcome! How can I help you today? I am always happy to assist!",
                choices: [
                    { id: 'ask_for_help', text: 'Ask for help' },
                    { id: 'ask_about_gifts', text: 'Ask about gifts' },
                    { id: 'compliment', text: 'Give a compliment' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_for_help',
                text: "Of course! I would love to help! What do you need? I have resources, connections, advice... anything you need!",
                choices: [
                    { id: 'help_resources', text: 'Resources' },
                    { id: 'help_connections', text: 'Connections' },
                    { id: 'help_advice', text: 'Advice' },
                    { id: 'root', text: 'Actually, I am fine' }
                ],
                effects: { relationship: 3 }
            }),
            new DialogueNode({
                id: 'ask_about_gifts',
                text: "Gifts? Oh, I love giving gifts! I have something special for you. Here, take this. I hope it helps you on your journey!",
                choices: [
                    { id: 'gifts_thank', text: 'Thank you so much!' },
                    { id: 'gifts_why', text: 'Why are you so generous?' },
                    { id: 'root', text: 'I cannot accept this' }
                ],
                effects: { relationship: 5, item: 'gift' }
            }),
            new DialogueNode({
                id: 'compliment',
                text: "Oh, you are too kind! But really, I just want to help people. That is what makes me happy!",
                choices: [
                    { id: 'root', text: 'You are amazing' },
                    { id: 'compliment_elaborate', text: 'I really appreciate you' }
                ],
                effects: { relationship: 4 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Take care! And remember, if you ever need anything, just ask! I am always here to help!",
                effects: { relationship: 1 }
            })
        ];

        return new DialogueTree(npc.id, nodes);
    }

    buildDefaultTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hello. How can I help you?",
                choices: [
                    { id: 'ask_help', text: 'I need help' },
                    { id: 'small_talk', text: 'Just talking' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_help',
                text: "I can try to help. What do you need?",
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'small_talk',
                text: "Not much to say, really. How are things with you?",
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "See you later.",
                effects: { relationship: 0 }
            })
        ];

        return new DialogueTree(npc.id, nodes);
    }
}

// Singleton instance
export const dialogueTreeSystem = new DialogueTreeSystem();