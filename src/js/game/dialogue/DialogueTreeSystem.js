/**
 * DialogueTreeSystem.js
 * Proper dialogue trees for each character
 * No emojis - clean text-based conversations
 * Now with enhanced deep character stories
 */

import { enhancedDialogueSystem } from './EnhancedDialogueSystem.js';

export class DialogueNode {
    constructor(config) {
        this.id = config.id;
        this.text = config.text; // What the NPC says
        this.choices = config.choices || []; // Player response options
        this.conditions = config.conditions || {}; // When this node is available
        this.effects = config.effects || {}; // What happens when chosen
        this.nextNode = config.nextNode || null; // Next node ID
    }
}

export class DialogueTree {
    constructor(npcId, nodes) {
        this.npcId = npcId;
        this.nodes = new Map();
        nodes.forEach(node => {
            this.nodes.set(node.id, node);
        });
    }
    
    getNode(nodeId) {
        return this.nodes.get(nodeId) || this.nodes.get('root');
    }
    
    getRootNode() {
        return this.getNode('root');
    }
}

/**
 * Main Dialogue Tree System
 */
export class DialogueTreeSystem {
    constructor() {
        this.builder = new DialogueTreeBuilder();
        this.treeCache = new Map();
    }
    
    /**
     * Get dialogue tree for NPC
     * @param {string} npcId - NPC ID
     * @param {number} relationshipLevel - Current relationship level (for enhanced dialogue)
     * @returns {DialogueTree} Dialogue tree
     */
    getTree(npcId, relationshipLevel = 0) {
        // Check cache first (key includes relationship level for enhanced trees)
        const cacheKey = `${npcId}_${relationshipLevel}`;
        if (this.treeCache.has(cacheKey)) {
            return this.treeCache.get(cacheKey);
        }
        
        // Get NPC data
        const npc = this.getNPC(npcId);
        if (!npc) {
            console.warn(`NPC not found: ${npcId}`);
            return null;
        }
        
        // Build tree (enhanced system will be used if character has deep story)
        const tree = this.builder.buildTreeForNPC(npc, relationshipLevel);
        
        // Cache it
        this.treeCache.set(cacheKey, tree);
        
        return tree;
    }
    
    /**
     * Get NPC data (helper method)
     */
    getNPC(npcId) {
        // This will be set by NPCManager
        if (this.npcManager) {
            return this.npcManager.getNPC(npcId);
        }
        return null;
    }
    
    /**
     * Set NPC manager reference
     */
    setNPCManager(npcManager) {
        this.npcManager = npcManager;
    }
    
    /**
     * Clear cache (useful when relationships change significantly)
     */
    clearCache() {
        this.treeCache.clear();
    }
}

/**
 * Build dialogue trees for each NPC
 */
export class DialogueTreeBuilder {
    constructor() {
        this.trees = new Map();
    }
    
    /**
     * Build tree for a specific NPC
     * Uses enhanced dialogue system if character has deep story
     */
    buildTreeForNPC(npc, relationshipLevel = 0) {
        // Try enhanced dialogue system first (if character has deep story)
        try {
            const enhancedTree = enhancedDialogueSystem.buildEnhancedTree(npc, relationshipLevel);
            if (enhancedTree && enhancedTree.nodes.size > 1) {
                return enhancedTree;
            }
        } catch (error) {
            console.warn(`Enhanced dialogue not available for ${npc.id}, using fallback:`, error);
        }
        
        // Fallback to personality-based trees
        const personality = npc.personality || 'friendly';
        const type = npc.type || 'friend';
        
        if (personality === 'friendly') {
            return this.buildFriendlyTree(npc);
        } else if (personality === 'professional') {
            return this.buildProfessionalTree(npc);
        } else if (personality === 'competitive') {
            return this.buildCompetitiveTree(npc);
        } else if (personality === 'mysterious') {
            return this.buildMysteriousTree(npc);
        } else if (personality === 'grumpy') {
            return this.buildGrumpyTree(npc);
        } else if (personality === 'generous') {
            return this.buildGenerousTree(npc);
        }
        
        return this.buildDefaultTree(npc);
    }
    
    buildFriendlyTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hey there! Good to see you! What's on your mind?",
                choices: [
                    { id: 'ask_about_work', text: 'Ask about their work' },
                    { id: 'ask_for_help', text: 'Ask for help' },
                    { id: 'compliment', text: 'Give a compliment' },
                    { id: 'small_talk', text: 'Make small talk' },
                    { id: 'goodbye', text: 'Say goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_about_work',
                text: "Oh, work's been great! I've been working on some really interesting projects lately. The data science field is just exploding right now!",
                choices: [
                    { id: 'work_interesting', text: 'That sounds interesting' },
                    { id: 'work_ask_details', text: 'Tell me more' },
                    { id: 'work_change_topic', text: 'Change topic' }
                ],
                effects: { relationship: 2 }
            }),
            new DialogueNode({
                id: 'work_interesting',
                text: "Yeah! I love what I do. Every day is different, you know? One day I'm analyzing customer behavior, the next I'm building predictive models.",
                choices: [
                    { id: 'work_ask_details', text: 'What kind of models?' },
                    { id: 'root', text: 'That sounds cool' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'compliment',
                text: "Aww, thank you! That's so sweet of you to say. I really appreciate that!",
                choices: [
                    { id: 'root', text: 'You deserve it' },
                    { id: 'compliment_elaborate', text: 'I really mean it' }
                ],
                effects: { relationship: 3 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "See you later! Take care!",
                effects: { relationship: 0.5 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildProfessionalTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hello. How can I assist you today?",
                choices: [
                    { id: 'ask_about_work', text: 'Discuss work' },
                    { id: 'ask_for_advice', text: 'Seek advice' },
                    { id: 'network', text: 'Network' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_about_work',
                text: "I've been working on several high-priority projects. The industry is evolving rapidly, and staying current is essential.",
                choices: [
                    { id: 'work_ask_details', text: 'What projects?' },
                    { id: 'work_industry', text: 'How is the industry changing?' },
                    { id: 'root', text: 'That sounds important' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Goodbye. Best of luck with your endeavors.",
                effects: { relationship: 0 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
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
