/**
 * DialogueTreeSystem.js
 * Proper dialogue trees for each character
 * No emojis - clean text-based conversations
 * Now with enhanced deep character stories
 */

import { enhancedDialogueSystem } from './EnhancedDialogueSystem.js';
import { CHARACTER_STORIES } from './DeepCharacterStories.js';

export class DialogueNode {
    constructor(config) {
        this.id = config.id;
        this.text = config.text; // What the NPC says
        this.choices = config.choices || []; // Player response options
        this.conditions = config.conditions || {}; // When this node is available
        this.effects = config.effects || {}; // What happens when chosen
        this.nextNode = config.nextNode || null; // Next node ID
        this.synthesized = !!config.synthesized;
    }
}

// Choice ids handled by DialogueUI itself (never looked up as nodes)
export const SPECIAL_CHOICE_IDS = new Set(['goodbye', 'close', 'continue']);

// Choices that should simply return to the conversation hub
const ROUTE_TO_ROOT = new Set(['root', 'change_topic', 'work_change_topic']);

/**
 * Follow-up lines for choice ids that the tree builders reference but never
 * built as nodes (#1142, #1143, #1606, #2121, #2348, #2475). Previously every
 * one of these silently snapped the conversation back to the greeting.
 */
export const RESPONSE_LIBRARY = {
    ask_for_help: { text: "Of course. What do you need? I'll help however I can.", relationship: 1 },
    small_talk: { text: "Ha, not much going on. Same coffee, different spreadsheet. You?", relationship: 1 },
    work_ask_details: { text: "Mostly cleaning data nobody else wants to touch. The glamorous side of analytics.", relationship: 1 },
    work_interesting: { text: "It really is. Every dataset hides a story if you look long enough.", relationship: 1 },
    work_industry: { text: "The industry moves fast. Everyone's chasing the next big model.", relationship: 1 },
    compliment: { text: "Oh! Thank you. That genuinely made my day.", relationship: 2 },
    compliment_elaborate: { text: "You're too kind. I'll remember you said that.", relationship: 2 },
    ask_for_advice: { text: "My advice? Keep your charts simple and your data honest.", relationship: 1 },
    network: { text: "Always happy to expand the network. Let's keep in touch.", relationship: 1 },
    challenge_accept: { text: "Bold. I like that. Let's see what you've got.", relationship: 2 },
    observe: { text: "You notice things. Most people don't.", relationship: 1 },
    secrets_yes: { text: "Not here. Some things are better said when fewer people are listening.", relationship: 1 },
    persist: { text: "Persistent, aren't you? Fine. Ask me again some other time.", relationship: 0.5 },
    help_resources: { text: "The library has more than you'd think. Start with the statistics section.", relationship: 1 },
    help_connections: { text: "I know a few people. I'll put in a good word for you.", relationship: 2 },
    help_advice: { text: "Don't try to do everything at once. Pick one skill and get great at it.", relationship: 1 },
    gifts_thank: { text: "You're welcome! It's nice to have someone to share with.", relationship: 1 },
    gifts_why: { text: "Why not? Kindness is cheap and it comes back around.", relationship: 1 },
    empathize: { text: "Thanks for listening. Not many people actually do.", relationship: 2 },
    life_empathize: { text: "Thanks. It helps to know someone gets it.", relationship: 2 },
    past_empathize: { text: "I don't talk about that much. Thanks for understanding.", relationship: 2 },
    personal_empathize: { text: "That means more than you know.", relationship: 2 },
    ask_more: { text: "There's more to it... but maybe when we know each other better.", relationship: 1 },
    life_ask_more: { text: "Honestly? Some days are better than others. Today's a good one.", relationship: 1 },
    past_ask_more: { text: "It shaped who I am. Maybe I'll tell you the whole story one day.", relationship: 1 },
    dream_encourage: { text: "You really think I could? Maybe I will.", relationship: 2 },
    dream_ask_how: { text: "One step at a time. Save a little, learn a lot, and stay stubborn.", relationship: 1 },
    personal_support: { text: "I'm glad you're in my corner.", relationship: 2 },
    deep_philosophy: { text: "Sometimes I wonder if any of the numbers really mean anything. Then I remember the people behind them.", relationship: 1 },
    deep_connect: { text: "I feel like I can be honest with you. That's rare.", relationship: 3 }
};

const DEFAULT_RESPONSE = { text: "Hm. I'll have to think about that.", relationship: 0.5 };

export class DialogueTree {
    constructor(npcId, nodes) {
        this.npcId = npcId;
        this.nodes = new Map();
        this.missingLookups = new Set();
        nodes.forEach(node => {
            this.nodes.set(node.id, node);
        });
        this.repairGraph();
    }

    /**
     * Make every choice lead somewhere real:
     *  - choices to "change topic" route back to root;
     *  - any other dangling choice id gets a follow-up node from RESPONSE_LIBRARY
     *    that offers a way back to the hub or out of the conversation;
     *  - mid-conversation nodes with no choices continue back to root (#1918, #2123).
     */
    repairGraph() {
        if (!this.nodes.has('root')) return;
        const hubChoices = () => [
            { id: 'root', text: 'Talk about something else' },
            { id: 'goodbye', text: 'Goodbye' }
        ];
        for (const node of Array.from(this.nodes.values())) {
            for (const choice of node.choices || []) {
                if (SPECIAL_CHOICE_IDS.has(choice.id)) continue;
                const target = choice.nextNode || choice.id;
                if (this.nodes.has(target)) continue;
                if (ROUTE_TO_ROOT.has(target)) {
                    choice.nextNode = 'root';
                    continue;
                }
                const response = RESPONSE_LIBRARY[target] || DEFAULT_RESPONSE;
                this.nodes.set(target, new DialogueNode({
                    id: target,
                    text: response.text,
                    choices: hubChoices(),
                    effects: { relationship: response.relationship },
                    synthesized: true
                }));
            }
        }
        for (const node of this.nodes.values()) {
            if (node.id === 'goodbye' || node.id === 'root') continue;
            if ((!node.choices || node.choices.length === 0) && !node.nextNode) {
                node.nextNode = 'root';
            }
        }
    }

    /**
     * Strict lookup: undefined for unknown ids.
     */
    hasNode(nodeId) {
        return this.nodes.has(nodeId);
    }

    getNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node) return node;
        // Make bad lookups observable instead of silently rerouting (#1149)
        if (!this.missingLookups.has(nodeId)) {
            this.missingLookups.add(nodeId);
            console.warn(`[Dialogue] Unknown node "${nodeId}" in tree for ${this.npcId}; falling back to root`);
        }
        return this.nodes.get('root');
    }
    
    getRootNode() {
        return this.nodes.get('root');
    }
}

/**
 * Main Dialogue Tree System
 */
export class DialogueTreeSystem {
    static MAX_CACHE = 100;

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
    getTree(npcId, relationshipLevel = 0, flags = null) {
        // Only story-driven (enhanced) trees depend on the relationship level;
        // personality trees are cached once per NPC (#2122). The cache is also
        // bounded so fractional/ever-changing levels can't grow it forever (#913).
        const level = Math.round(Number(relationshipLevel) || 0);
        // Story phases depend on the NPC's flags, so they're part of the key
        const story = CHARACTER_STORIES[npcId];
        const flagKey = story?.phases && flags
            ? Object.keys(flags).filter(k => flags[k]).sort().join(',')
            : '';
        const cacheKey = story ? `${npcId}_${level}${flagKey ? `_${flagKey}` : ''}` : `${npcId}`;
        if (this.treeCache.has(cacheKey)) {
            const cached = this.treeCache.get(cacheKey);
            // refresh LRU position
            this.treeCache.delete(cacheKey);
            this.treeCache.set(cacheKey, cached);
            return cached;
        }
        
        // Get NPC data
        const npc = this.getNPC(npcId);
        if (!npc) {
            console.warn(`NPC not found: ${npcId}`);
            return null;
        }
        
        // Build tree (enhanced system will be used if character has deep story)
        const tree = this.builder.buildTreeForNPC(npc, level, flags || {});
        
        // Cache it (LRU, bounded)
        this.treeCache.set(cacheKey, tree);
        while (this.treeCache.size > DialogueTreeSystem.MAX_CACHE) {
            this.treeCache.delete(this.treeCache.keys().next().value);
        }
        
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
    buildTreeForNPC(npc, relationshipLevel = 0, flags = {}) {
        // Try enhanced dialogue system first (if character has deep story)
        try {
            const enhancedTree = enhancedDialogueSystem.buildEnhancedTree(npc, relationshipLevel, flags);
            if (enhancedTree && enhancedTree.nodes.size > 1) {
                return enhancedTree;
            }
        } catch (error) {
            // Enhanced dialogue not available
        }
        
        // Fallback to personality-based trees
        // Personalities without a dedicated tree reuse the closest one
        const PERSONALITY_TREE_ALIASES = {
            aggressive: 'grumpy',
            hostile: 'grumpy',
            greedy: 'professional',
            high_maintenance: 'competitive'
        };
        const rawPersonality = npc.personality || 'friendly';
        const personality = PERSONALITY_TREE_ALIASES[rawPersonality] || rawPersonality;
        
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
                choices: [
                    { id: 'help_advice', text: 'Any advice for getting ahead?' },
                    { id: 'root', text: 'Never mind' },
                    { id: 'goodbye', text: 'Goodbye' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'small_talk',
                text: "Not much to say, really. How are things with you?",
                choices: [
                    { id: 'root', text: 'Pretty good, thanks' },
                    { id: 'goodbye', text: 'Goodbye' }
                ],
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
