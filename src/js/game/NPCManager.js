/**
 * NPC System - Non-player characters with relationships and dialogue
 * Dynamic conversations based on relationship level and player choices
 */

// NPC personality traits
export const PERSONALITY_TRAITS = {
    friendly: { relationshipGain: 1.2, dialogueTone: 'warm' },
    professional: { relationshipGain: 1.0, dialogueTone: 'formal' },
    competitive: { relationshipGain: 0.8, dialogueTone: 'challenging' },
    mysterious: { relationshipGain: 0.9, dialogueTone: 'cryptic' },
    generous: { relationshipGain: 1.1, dialogueTone: 'helpful' }
};

// Base NPC definitions
export const NPCs = [
    // Mentors
    {
        id: 'professor_higgins',
        name: 'Professor Higgins',
        title: 'University Professor',
        icon: '👨‍🏫',
        type: 'mentor',
        personality: 'generous',
        location: 'university',
        unlockRequirement: null,
        gifts: ['books', 'coffee'],
        dialogueTopics: ['data_science', 'career', 'research'],
        benefits: { statBoost: 'intelligence', referrals: true },
        backstory: 'A veteran data scientist who teaches at the university. Known for mentoring successful analysts.'
    },
    {
        id: 'sarah_martinez',
        name: 'Sarah Martinez',
        title: 'Senior Data Analyst',
        icon: '👩‍💼',
        type: 'mentor',
        personality: 'professional',
        location: 'coffee_shop',
        unlockRequirement: { day: 5 },
        gifts: ['coffee', 'tech_gadgets'],
        dialogueTopics: ['industry', 'career', 'visualization'],
        benefits: { statBoost: 'analytics', clientReferrals: true },
        backstory: 'Works at a top tech company. Loves helping newcomers break into the field.'
    },

    // Business Contacts
    {
        id: 'mike_johnson',
        name: 'Mike Johnson',
        title: 'Marketing Director',
        icon: '👔',
        type: 'business',
        personality: 'friendly',
        location: 'networking_bar',
        unlockRequirement: { stat: 'charisma', value: 20 },
        gifts: ['drinks', 'business_cards'],
        dialogueTopics: ['marketing', 'data', 'business'],
        benefits: { clientReferrals: true, premiumClients: true },
        backstory: 'Runs marketing for a Fortune 500. Always looking for good analysts.'
    },
    {
        id: 'lisa_wong',
        name: 'Lisa Wong',
        title: 'Startup Founder',
        icon: '🚀',
        type: 'business',
        personality: 'competitive',
        location: 'tech_hub',
        unlockRequirement: { reputation: 500 },
        gifts: ['tech_gadgets', 'investment_tips'],
        dialogueTopics: ['startups', 'funding', 'growth'],
        benefits: { startupOpportunities: true, investorIntros: true },
        backstory: 'Founded two successful startups. Now runs an accelerator program.'
    },

    // Investors
    {
        id: 'david_chen',
        name: 'David Chen',
        title: 'Angel Investor',
        icon: '💰',
        type: 'investor',
        personality: 'mysterious',
        location: 'downtown',
        unlockRequirement: { reputation: 1000, stat: 'charisma', value: 40 },
        gifts: ['fine_wine', 'art'],
        dialogueTopics: ['investments', 'startups', 'market'],
        benefits: { seedFunding: true, vcIntros: true },
        backstory: 'Made millions in tech. Now invests in promising data-driven startups.'
    },
    {
        id: 'victoria_sterling',
        name: 'Victoria Sterling',
        title: 'VC Partner',
        icon: '👸',
        type: 'investor',
        personality: 'professional',
        location: 'luxury_district',
        unlockRequirement: { reputation: 5000, relationship: { david_chen: 50 } },
        gifts: ['fine_wine', 'luxury_watch'],
        dialogueTopics: ['global_markets', 'acquisitions', 'leverage'],
        benefits: { seriesAFunding: true, boardSeat: true },
        backstory: 'A tough-as-nails VC who demands excellence. Her endorsement guarantees success.'
    },

    // Shopkeepers
    {
        id: 'donna_delight',
        name: 'Donna',
        title: 'Donut Shop Owner',
        icon: '👩‍🍳',
        type: 'shopkeeper',
        personality: 'friendly',
        location: 'donut_shop',
        unlockRequirement: null,
        gifts: ['tips', 'compliments'],
        dialogueTopics: ['baking', 'sugar', 'mornings'],
        benefits: { free_donuts: true },
        backstory: 'Bakes the best donuts in the city. Always has a smile ready.'
    },
    {
        id: 'bob_bagel',
        name: 'Bob',
        title: 'Bagel Expert',
        icon: '👨‍🍳',
        type: 'shopkeeper',
        personality: 'generous',
        location: 'bagel_shop',
        unlockRequirement: null,
        gifts: ['tips', 'coffee'],
        dialogueTopics: ['yeast', 'nyc', 'cream_cheese'],
        benefits: { extra_cream_cheese: true },
        backstory: 'Takes bagels very seriously. Claims to import water from NYC.'
    },
    {
        id: 'flora_bloom',
        name: 'Flora',
        title: 'Florist',
        icon: '👩‍🌾',
        type: 'shopkeeper',
        personality: 'friendly',
        location: 'flower_store',
        unlockRequirement: null,
        gifts: ['water', 'sunshine'],
        dialogueTopics: ['gardening', 'nature', 'design'],
        action: 'buy_flowers',
        backstory: 'Loves plants more than people. Makes beautiful arrangements.'
    },


    // Friends
    {
        id: 'alex_rivera',
        name: 'Alex Rivera',
        title: 'Fellow Freelancer',
        icon: '🧑‍💻',
        image: '/assets/npcs/alex_young.png', // New Young Asset
        type: 'friend',
        personality: 'friendly',
        location: 'coffee_shop',
        unlockRequirement: null,
        gifts: ['coffee', 'snacks'],
        dialogueTopics: ['freelancing', 'life', 'hobbies'],
        benefits: { moralBoost: true, jobSharing: true },
        backstory: 'Started freelancing the same time as you. Currently struggling to find steady work.'
    },
    {
        id: 'jordan_kim',
        name: 'Jordan Kim',
        title: 'Gym Buddy',
        icon: '💪',
        type: 'friend',
        personality: 'friendly',
        location: 'gym',
        unlockRequirement: { stat: 'stamina', value: 15 },
        gifts: ['protein', 'sports_gear'],
        dialogueTopics: ['fitness', 'motivation', 'life'],
        benefits: { staminaBoost: true, workoutPartner: true },
        backstory: 'Personal trainer who believes in work-life balance.'
    },

    // Rivals
    {
        id: 'brad_sterling',
        name: 'Brad Sterling',
        title: 'Competing Analyst',
        icon: '😏',
        type: 'rival',
        personality: 'competitive',
        location: 'networking_bar',
        unlockRequirement: { reputation: 200 },
        gifts: [], // Rivals don't accept gifts easily
        dialogueTopics: ['competition', 'achievements', 'clients'],
        benefits: { competitionEvents: true, motivationBoost: true },
        backstory: 'Started around the same time as you. Always trying to one-up you.'
    },

    // Shady Characters (Evil Playthrough)
    {
        id: 'vinnie_shark',
        name: 'Vinnie "The Shark"',
        title: 'Loan Consultant',
        icon: '🦈',
        image: '/assets/npcs/loan_shark.png',
        type: 'criminal',
        personality: 'aggressive',
        location: 'downtown', // Or secluded alley
        unlockRequirement: { ethics: -10 },
        gifts: ['cash', 'fancy_cigar'],
        dialogueTopics: ['quick_cash', 'debt', 'protection'],
        benefits: { loanShark: true, debtCollection: true },
        backstory: 'Runs a "consulting" business. Lending money at high rates.'
    },
    {
        id: 'the_broker',
        name: 'Gordon "The Broker"',
        title: 'Stock Operator',
        icon: '🕶️',
        image: '/assets/npcs/the_broker.png',
        type: 'criminal',
        personality: 'greedy',
        location: 'stock_exchange',
        unlockRequirement: { ethics: -20, netWorth: 100000 },
        gifts: ['cocaine', 'insider_info'], // cocaine might be too much, let's say "expensive_champagne"
        dialogueTopics: ['penny_stocks', 'ratholes', 'sec_evasion'],
        benefits: { pumpDump: true, ratholes: true },
        backstory: 'Former wall street legend, now operating in the shadows.'
    },
    {
        id: 'zero_cool',
        name: 'Zero',
        title: 'Info Broker',
        icon: '💻',
        image: '/assets/npcs/the_hacker.png',
        type: 'criminal',
        personality: 'mysterious',
        location: 'coffee_shop', // or internet cafe
        unlockRequirement: { ethics: -40 },
        gifts: ['crypto', 'exploits'],
        dialogueTopics: ['corporate_espionage', 'data_leaks', 'security_flaws'],
        benefits: { insiderTrading: true, sabotage: true },
        backstory: 'A ghost in the machine. Can find dirt on anyone.'
    },
    // Love Interests
    {
        id: 'emma_bloom',
        name: 'Emma Bloom',
        title: 'Librarian & Teacher',
        icon: '📚',
        // image: '/assets/npcs/emma_young.png',
        type: 'romance',
        personality: 'friendly',
        location: 'library',
        unlockRequirement: { ethics: 20 }, // Needs good ethics
        romanceOptions: { minEthics: 10 },
        gifts: ['books', 'flowers'],
        dialogueTopics: ['books', 'education', 'future'],
        benefits: { studyBoost: true, ethicsBoost: true },
        backstory: 'Passionate about education. Looking for someone kind and stable.'
    },
    {
        id: 'bella_lux',
        name: 'Bella Lux',
        title: 'Influencer',
        icon: '💎',
        // image: '/assets/npcs/bella_young.png',
        type: 'romance',
        personality: 'high_maintenance', // Custom handling
        location: 'luxury_district',
        unlockRequirement: { netWorth: 100000 },
        romanceOptions: { maxEthics: -10 }, // Prefers bad boys/girls
        gifts: ['jewelry', 'designer_bags'],
        dialogueTopics: ['parties', 'fame', 'money'],
        benefits: { popularityBoost: true, expensiveTastes: true },
        backstory: 'Always chasing the spotlight. Wants a partner who can fund her lifestyle.'
    }
];

// Dialogue templates based on relationship levels
export const DIALOGUE_TEMPLATES = {
    first_meeting: [
        { text: "Hi, I'm {name}. Nice to meet you.", relationshipReq: 0 },
        { text: "Oh, you're new around here? Welcome!", relationshipReq: 0 }
    ],
    low_relationship: [
        { text: "Hey, good to see you again.", relationshipReq: 10 },
        { text: "How's the data business treating you?", relationshipReq: 10 }
    ],
    medium_relationship: [
        { text: "Hey friend! Always happy to chat with you.", relationshipReq: 40 },
        { text: "I was just thinking about you. How are things?", relationshipReq: 40 }
    ],
    high_relationship: [
        { text: "My favorite person! What brings you by?", relationshipReq: 70 },
        { text: "I've got some great news for you!", relationshipReq: 70 }
    ],
    max_relationship: [
        { text: "You know you can always count on me.", relationshipReq: 90 },
        { text: "Let's make something amazing happen today!", relationshipReq: 90 }
    ]
};

// Dialogue choices and their effects
export const DIALOGUE_CHOICES = {
    greeting: [
        { text: "Nice to meet you too!", effect: { relationship: 2 }, tone: 'friendly' },
        { text: "I've heard a lot about you.", effect: { relationship: 3 }, tone: 'flattering' },
        { text: "*nod silently*", effect: { relationship: 0 }, tone: 'cold' }
    ],
    ask_advice: [
        { text: "What's your best career tip?", effect: { relationship: 3, xp: 'intelligence' }, requiredRelationship: 20 },
        { text: "How did you get where you are?", effect: { relationship: 5 }, requiredRelationship: 30 },
        { text: "Can you help me with a problem?", effect: { relationship: 2, favor: true }, requiredRelationship: 50 }
    ],
    business_talk: [
        { text: "Know anyone who needs an analyst?", effect: { relationship: 1, referralChance: true }, requiredRelationship: 40 },
        { text: "Let's collaborate on something!", effect: { relationship: 5, projectChance: true }, requiredRelationship: 60 },
        { text: "I'm interested in investment opportunities.", effect: { relationship: 2, investmentInfo: true }, requiredRelationship: 50 }
    ],
    give_gift: [
        { text: "I brought you something!", effect: { relationship: 10, giftBonus: true } }
    ],
    farewell: [
        { text: "Great talking to you!", effect: { relationship: 1 } },
        { text: "Let's do this again soon.", effect: { relationship: 2 } },
        { text: "See you around.", effect: { relationship: 0 } }
    ],
    // Illegal Choices
    shady_deal: [
        { text: "I'm looking for a... shortcut.", effect: { relationship: 5, ethics: -5 }, requiredRelationship: 10 },
        { text: "How can I make money fast?", effect: { relationship: 2, ethics: -2 }, requiredRelationship: 0 },
        { text: "I'm in. Tell me the scheme.", effect: { relationship: 10, ethics: -10, unlockScheme: true }, requiredRelationship: 40 }
    ]
};

// Deep Dialogue Trees for Key Characters
export const DIALOGUE_TREES = {
    'emma_bloom': {
        'root': {
            text: "Hi! Welcome to the library. Can I help you find something?",
            choices: [
                { text: "What are you reading?", next: 'reading_topic', effect: { relationship: 1 } },
                { text: "I'm just looking for a quiet place.", next: 'quiet_topic', effect: { relationship: 0 } },
                { text: "Actually, I wanted to ask you something...", next: 'personal_topic', requiredRelationship: 20 }
            ]
        },
        'reading_topic': {
            text: "Oh, this? It's a fascinating book on Neural Networks. I love how they mimic the human brain.",
            choices: [
                { text: "I love algorithms! I'm a Data Scientist.", next: 'algorithms_topic', effect: { relationship: 5, xp: 'python' } },
                { text: "Sounds complicated.", next: 'root', effect: { relationship: -1 } }
            ]
        },
        'algorithms_topic': {
            text: "Really? That's amazing! We should study together sometime.",
            choices: [
                { text: "I'd love that.", next: 'root', effect: { relationship: 5, studyBoost: true } },
                { text: "Maybe later.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'quiet_topic': {
            text: "I understand. The world can be so noisy. Enjoy the silence.",
            choices: [
                { text: "Thanks.", next: 'root', effect: { relationship: 1 } }
            ]
        },
        'personal_topic': {
            text: "Oh? What's on your mind?",
            choices: [
                { text: "Would you like to go out sometime?", action: 'date_ask', next: 'root' },
                { text: "Never mind.", next: 'root' }
            ]
        }
    },
    'alex_rivera': {
        'root': {
            text: "Yo! What's up? Plotting your next big move?",
            choices: [
                { text: "Just working hard. Any tips?", next: 'hustle_topic', effect: { relationship: 1 } },
                { text: "Have you started that app yet?", next: 'startup_topic', effect: { relationship: 1 } },
                { text: "Let's grab a coffee.", next: 'coffee_topic', effect: { relationship: 2 } }
            ]
        },
        'hustle_topic': {
            text: "Always be closing, my friend. I heard crypto is about to moon. You in?",
            choices: [
                { text: "Crypto is a scam.", next: 'root', effect: { relationship: -2, ethics: 2 } },
                { text: "Tell me more!", next: 'root', effect: { relationship: 5, ethics: -1 } }
            ]
        },
        'startup_topic': {
            text: "Bro, it's going to be the Uber for Dog Walking Data. I just need a seed investor.",
            choices: [
                { text: "Sounds... unique.", next: 'root', effect: { relationship: 0 } },
                { text: "I'll invest in you (if I had money).", next: 'root', effect: { relationship: 5 } }
            ]
        },
        'coffee_topic': {
            text: "You buying? Just kidding. Let's get caffeinated.",
            choices: [
                { text: "Let's go.", next: 'root', effect: { relationship: 3, energy: 10 } }
            ]
        }
    },
    'bella_lux': {
        'root': {
            text: "Do I know you? You don't look like you're on the list.",
            choices: [
                { text: "I'm a Data Scientist. I analyze trends.", next: 'value_topic', effect: { relationship: 0 } },
                { text: "Sorry, just passing through.", next: 'ignore_topic', effect: { relationship: 0 } },
                { text: "I can make you rich.", next: 'money_topic', requiredRelationship: 10, effect: { relationship: 5, ethics: -2 } }
            ]
        },
        'value_topic': {
            text: "Data? Boring. Unless... can you predict which fashion stocks will tank next week?",
            choices: [
                { text: "That would be insider trading.", next: 'root', effect: { relationship: -5, ethics: 5 } },
                { text: "I could run some models for you.", next: 'scheme_topic', effect: { relationship: 5, ethics: -5 } }
            ]
        },
        'scheme_topic': {
            text: "Now you're talking my language. Meet me here later. Don't be late.",
            choices: [
                { text: "Understood.", next: 'root', effect: { relationship: 5 } }
            ]
        },
        'ignore_topic': {
            text: "Thought so. Ciao.",
            choices: [
                { text: "Bye.", next: 'root' }
            ]
        },
        'money_topic': {
            text: "Bold. I like bold. You better have the portfolio to back that up.",
            choices: [
                { text: "I do.", next: 'root', effect: { relationship: 5 } }
            ]
        }
    },
    'vinnie_shark': {
        'root': {
            text: "You lost, kid? This ain't the library.",
            choices: [
                { text: "I'm looking for a loan.", next: 'loan_topic', effect: { relationship: 0, ethics: -1 } },
                { text: "Just looking for opportunities.", next: 'job_topic', effect: { relationship: 0, ethics: -2 } },
                { text: "I'm leaving.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'loan_topic': {
            text: "I got cash. Interest is... strictly non-negotiable. 20% weekly. Take it or leave it.",
            choices: [
                { text: "I'm desperate. I'll take it.", next: 'root', effect: { relationship: 5, money: 1000, ethics: -5, flag: 'loan_taken' } },
                { text: "Too high.", next: 'root', effect: { relationship: -1 } }
            ]
        },
        'job_topic': {
            text: "I got a friend who needs some numbers... adjusted. On a spreadsheet. No questions asked.",
            choices: [
                { text: "I can do that.", next: 'root', effect: { relationship: 10, money: 500, ethics: -10 } },
                { text: "I don't cook books.", next: 'root', effect: { relationship: -5, ethics: 5 } }
            ]
        }
    },
    professor_higgins: {
        'root': {
            text: "Good day. Have you completed the reading on Bayesian Inference?",
            choices: [
                { text: "Yes, Professor. Fascinating stuff.", next: 'theory_topic', effect: { relationship: 2, xp: 'statistics' } },
                { text: "I'm here about the exam.", next: 'exam_topic', effect: { relationship: 0 } },
                { text: "Not yet.", next: 'lecture_topic', effect: { relationship: -1 } }
            ]
        },
        'theory_topic': {
            text: "Glad to hear it. Remember, p-values are not a substitute for critical thinking.",
            choices: [
                { text: "Of course.", next: 'root', effect: { relationship: 2 } }
            ]
        },
        'exam_topic': {
            text: "The exam is tough. If you haven't mastered Python and SQL, don't bother.",
            choices: [
                { text: "I'm ready.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'lecture_topic': {
            text: "Then why are you bothering me? Go study!",
            choices: [
                { text: "Sorry.", next: 'root', effect: { relationship: -1 } }
            ]
        }
    },
    'mike_johnson': {
        'root': {
            text: "Hey! Good to see you. How's the freelance grind?",
            choices: [
                { text: "It's tough but freeing.", next: 'freelance_topic', effect: { relationship: 1 } },
                { text: "I'm looking for corporate clients.", next: 'corporate_topic', effect: { relationship: 2 } }
            ]
        },
        'freelance_topic': {
            text: "I respect that. Though at GlobalCorp, we enjoy the steady paycheck and free coffee.",
            choices: [
                { text: "Maybe one day.", next: 'root', effect: { relationship: 0 } }
            ]
        },
        'corporate_topic': {
            text: "We actually need some data cleaning done. It's boring work, but pays okay.",
            choices: [
                { text: "I'll take it.", next: 'root', effect: { relationship: 5, money: 300, energy: -20, xp: 'python' } },
                { text: "I'm too expensive for cleaning.", next: 'root', effect: { relationship: -1 } }
            ]
        }
    },
    'lisa_wong': {
        'root': {
            text: "Does this pitch deck look 'disruptive' enough to you?",
            choices: [
                { text: "Needs more blockchain keywords.", next: 'hype_topic', effect: { relationship: 2, ethics: -1 } },
                { text: "Focus on the revenue model.", next: 'revenue_topic', effect: { relationship: 1 } }
            ]
        },
        'hype_topic': {
            text: "Brilliant! 'DeFi AI on the Edge'. Investors will eat it up.",
            choices: [
                { text: "Go get 'em.", next: 'root', effect: { relationship: 5 } }
            ]
        },
        'revenue_topic': {
            text: "Revenue? That's pre-seed thinking. We need growth!",
            choices: [
                { text: "My mistake.", next: 'root', effect: { relationship: -1 } }
            ]
        }
    },
    'jordan_kim': {
        'root': {
            text: "Bro, did you see those gains? My portfolio is up 5%... muscle mass, I mean.",
            choices: [
                { text: "Looking huge, Jordan.", next: 'fitness_topic', effect: { relationship: 2 } },
                { text: "I need to work out more.", next: 'workout_topic', effect: { relationship: 5 } }
            ]
        },
        'fitness_topic': {
            text: "Thanks! It's all about consistency. Same with coding, right?",
            choices: [
                { text: "Totally.", next: 'root', effect: { relationship: 1 } }
            ]
        },
        'workout_topic': {
            text: "Let's hit the weights right now! I'll spot you.",
            choices: [
                { text: "Let's do it!", next: 'root', effect: { relationship: 10, stamina: 10, energy: -30 } }
            ]
        }
    },
    'brad_sterling': {
        'root': {
            text: "Oh, it's you. Still playing with Excel spreadsheets?",
            choices: [
                { text: "I use Python actually.", next: 'tech_topic', effect: { relationship: 0, xp: 'python' } },
                { text: "I'm doing better than you.", next: 'rival_topic', effect: { relationship: -2 } },
                { text: "Go away, Brad.", next: 'root', effect: { relationship: -5 } }
            ]
        },
        'tech_topic': {
            text: "Python? Cute. I'm already optimizing LLMs on custom hardware.",
            choices: [
                { text: "Show off.", next: 'root', effect: { relationship: -1 } }
            ]
        },
        'rival_topic': {
            text: "We'll see about that when the quarterly rankings come out.",
            choices: [
                { text: "Bring it on.", next: 'root', effect: { relationship: 0, motivation: 5 } }
            ]
        }
    },
    'david_chen': {
        'root': {
            text: "...",
            choices: [
                { text: "Mr. Chen? I have a proposal.", next: 'pitch_topic', requiredRelationship: 20 },
                { text: "*Nod silently*", next: 'silent_topic', effect: { relationship: 1 } }
            ]
        },
        'silent_topic': {
            text: "*He nods back, appreciating the lack of noise.*",
            choices: [
                { text: "...", next: 'root', effect: { relationship: 2 } }
            ]
        },
        'pitch_topic': {
            text: "I'm listening. Make it quick.",
            choices: [
                { text: "Data-driven AI for Healthcare.", next: 'root', effect: { relationship: 5, money: 5000, flag: 'seed_interest' } },
                { text: "Uhh... an App for Dogs?", next: 'root', effect: { relationship: -10 } }
            ]
        }
    }
};

/**
 * NPCManager class - handles NPC interactions and relationships
 */
export class NPCManager {
    constructor(gameState) {
        this.gameState = gameState;

        // Relationship levels with each NPC (0-100)
        this.relationships = {};

        // Advanced State Tracking (Dialogue Trees & Flags)
        this.npcStates = {}; // { npcId: { currentNode: 'root', flags: {}, history: [] } }

        // Start tracking
        this.initializeRelationships();

        // Track interaction history
        this.interactionHistory = {};

        // NPCs met
        this.metNPCs = [];

        // Active conversations
        this.currentConversation = null;
    }

    initializeRelationships() {
        if (!NPCs) return; // Saftey check
        NPCs.forEach(npc => {
            if (this.relationships[npc.id] === undefined) {
                this.relationships[npc.id] = 0;
            }
            if (!this.npcStates[npc.id]) {
                this.npcStates[npc.id] = { currentNode: 'root', flags: {}, history: [] };
            }
        });
    }

    getNPCState(npcId) {
        if (!this.npcStates[npcId]) {
            this.npcStates[npcId] = { currentNode: 'root', flags: {}, history: [] };
        }
        return this.npcStates[npcId];
    }

    updateNPCState(npcId, updates) {
        const state = this.getNPCState(npcId);
        Object.assign(state, updates);
    }

    toJSON() {
        return {
            relationships: this.relationships,
            npcStates: this.npcStates,
            interactionHistory: this.interactionHistory,
            metNPCs: this.metNPCs
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.relationships = data.relationships || {};
        this.npcStates = data.npcStates || {};
        this.interactionHistory = data.interactionHistory || {};
        this.metNPCs = data.metNPCs || [];

        // Re-init if needed to ensure all NPCs exist
        this.initializeRelationships();
    }

    /**
     * Get available NPCs at a location
     */
    getNPCsAtLocation(locationId) {
        return NPCs.filter(npc => {
            if (npc.location !== locationId) return false;

            // Check unlock requirements
            if (npc.unlockRequirement) {
                const req = npc.unlockRequirement;
                if (req.day && this.gameState.timeManager.totalDays < req.day) return false;
                if (req.stat && this.gameState.characterStats.getStat(req.stat) < req.value) return false;
                if (req.reputation && this.gameState.reputation < req.reputation) return false;
                if (req.relationship) {
                    for (const [npcId, level] of Object.entries(req.relationship)) {
                        if (this.relationships[npcId] < level) return false;
                    }
                }
            }

            return true;
        });
    }

    /**
     * Get NPC by ID
     */
    getNPC(npcId) {
        return NPCs.find(n => n.id === npcId);
    }

    /**
     * Get relationship level
     */
    getRelationship(npcId) {
        return this.relationships[npcId] || 0;
    }

    /**
     * Get relationship tier (stranger, acquaintance, friend, close friend, best friend)
     */
    getRelationshipTier(npcId) {
        const level = this.relationships[npcId] || 0;
        if (level < 10) return { tier: 'stranger', label: 'Stranger', color: '#888' };
        if (level < 30) return { tier: 'acquaintance', label: 'Acquaintance', color: '#4ecdc4' };
        if (level < 60) return { tier: 'friend', label: 'Friend', color: '#6bcb77' };
        if (level < 85) return { tier: 'close_friend', label: 'Close Friend', color: '#a855f7' };
        return { tier: 'best_friend', label: 'Best Friend', color: '#ffd93d' };
    }

    /**
     * Modify relationship
     */
    modifyRelationship(npcId, amount) {
        const npc = this.getNPC(npcId);
        if (!npc) return;

        const personality = PERSONALITY_TRAITS[npc.personality];
        const adjustedAmount = Math.floor(amount * personality.relationshipGain);

        this.relationships[npcId] = Math.max(0, Math.min(100,
            (this.relationships[npcId] || 0) + adjustedAmount
        ));

        return this.relationships[npcId];
    }

    /**
     * Start conversation with NPC
     */
    startConversation(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc) return null;

        const relationship = this.relationships[npcId];
        const isFirstMeeting = !this.metNPCs.includes(npcId);

        if (isFirstMeeting) {
            this.metNPCs.push(npcId);
        }

        // Get appropriate greeting
        let greetingPool;
        if (isFirstMeeting) {
            greetingPool = DIALOGUE_TEMPLATES.first_meeting;
        } else if (relationship < 20) {
            greetingPool = DIALOGUE_TEMPLATES.low_relationship;
        } else if (relationship < 50) {
            greetingPool = DIALOGUE_TEMPLATES.medium_relationship;
        } else if (relationship < 80) {
            greetingPool = DIALOGUE_TEMPLATES.high_relationship;
        } else {
            greetingPool = DIALOGUE_TEMPLATES.max_relationship;
        }

        const greeting = greetingPool[Math.floor(Math.random() * greetingPool.length)];

        this.currentConversation = {
            npc,
            relationship,
            isFirstMeeting,
            stage: 'greeting'
        };

        // Check for dynamic choices
        let choices = this.getAvailableChoices('greeting', relationship);

        // Add "Ask on Date" if eligible and single
        if (!this.gameState.romanceSystem.partnerId && npc.romanceOptions && relationship >= 30) {
            choices.push({
                text: "Would you like to go on a date?",
                action: 'date_ask',
                effect: { relationship: 0 }
            });
        }

        // Add Date Night choices if partner
        if (this.gameState.romanceSystem.partnerId === npc.id) {
            choices = [
                { text: "Let's grab a coffee ($20)", action: 'date_coffee', effect: { relationship: 0 } },
                { text: "Dinner tonight? ($100)", action: 'date_dinner', effect: { relationship: 0 } },
                { text: "Weekend Trip! ($2000)", action: 'date_vacation', effect: { relationship: 0 } }
            ];
            if (this.gameState.romanceSystem.relationshipStatus === 'dating' && this.gameState.romanceSystem.relationshipScore > 80) {
                choices.push({ text: "I have a question... (Propose)", action: 'date_propose', effect: { relationship: 0 } });
            }
        }

        return {
            npc,
            greeting: greeting.text.replace('{name}', npc.name),
            choices: choices,
            relationship,
            tier: this.getRelationshipTier(npcId)
        };
    }

    /**
     * Get available dialogue choices
     */
    getAvailableChoices(stage, relationship) {
        // Tree Logic
        const npcId = this.currentConversation ? this.currentConversation.npc.id : null;
        if (npcId && DIALOGUE_TREES[npcId]) {
            const state = this.getNPCState(npcId);
            const node = DIALOGUE_TREES[npcId][state.currentNode || 'root'];

            if (node) {
                // Filter choices by requirements
                return node.choices.filter(c => {
                    let met = true;
                    if (c.requiredRelationship && relationship < c.requiredRelationship) met = false;
                    return met;
                });
            }
        }

        // Fallback to legacy choices
        const choices = DIALOGUE_CHOICES[stage] || DIALOGUE_CHOICES['greeting'];

        // Filter by relationship requirement
        return choices.filter(c => {
            if (!c.requiredRelationship) return true;
            return relationship >= c.requiredRelationship;
        });
    }

    makeChoice(choiceIndex) {
        if (!this.currentConversation) return null;

        // Re-get choices to include dynamic ones
        let choices = this.getAvailableChoices(this.currentConversation.stage, this.currentConversation.relationship);

        // Dynamic Choices injection logic
        // 1. Ask Date (if single)
        if (!this.gameState.romanceSystem.partnerId &&
            this.currentConversation.npc.romanceOptions &&
            this.currentConversation.relationship >= 30) {
            choices.push({
                text: "Would you like to go on a date?",
                action: 'date_ask',
                effect: { relationship: 0 }
            });
        }

        // 2. Date Night (if partner)
        if (this.gameState.romanceSystem.partnerId === this.currentConversation.npc.id) {
            choices.push(
                { text: "Let's grab a coffee ($20)", action: 'date_coffee', effect: { relationship: 0 } },
                { text: "Dinner tonight? ($100)", action: 'date_dinner', effect: { relationship: 0 } },
                { text: "Weekend Trip! ($2000)", action: 'date_vacation', effect: { relationship: 0 } }
            );
            // Propose logic
            if (this.gameState.romanceSystem.relationshipStatus === 'dating' && this.gameState.romanceSystem.relationshipScore > 80) {
                choices.push({ text: "I have a question... (Propose)", action: 'date_propose', effect: { relationship: 0 } });
            }
        }

        const choice = choices[choiceIndex];
        if (!choice) return null;

        // Handle special actions
        if (choice.action === 'date_ask') {
            const result = this.gameState.romanceSystem.askOnDate(this.currentConversation.npc.id);
            return {
                success: result.success,
                text: result.message,
                effects: {},
                newRelationship: this.relationships[this.currentConversation.npc.id],
                isSpecialAction: true
            };
        }

        // Handle Dating Actions
        if (choice.action && choice.action.startsWith('date_')) {
            let result;
            if (choice.action === 'date_propose') {
                result = this.gameState.romanceSystem.propose();
            } else {
                const type = choice.action.replace('date_', '');
                result = this.gameState.romanceSystem.goOnDate(type);
            }

            return {
                success: result.success,
                text: result.message,
                effects: {},
                newRelationship: this.relationships[this.currentConversation.npc.id],
                isSpecialAction: true
            };
        }

        // Handle Tree Navigation
        const npcId = this.currentConversation.npc.id;
        if (choice.next) {
            const state = this.getNPCState(npcId);
            state.currentNode = choice.next;

            // If navigating to root, maybe just keep conversation open?
            // Or update greeting text based on next node?
        }

        const effects = choice.effect || {};
        // Apply relationship change
        if (effects.relationship) {
            this.modifyRelationship(npcId, effects.relationship);
        }

        // Other effects
        if (effects.xp) {
            const amount = 20;
            this.gameState.characterStats.addXP(effects.xp, amount);
            // alert(`Learned something! +${amount} ${effects.xp} XP`);
        }

        // Handle Ethics change from dialogue
        if (effects.ethics) {
            this.gameState.characterStats.modifyEthics(effects.ethics);
        }

        // Handle Money change (Loans/Jobs)
        if (effects.money) {
            this.gameState.money += effects.money;
            // No easy way to show toast from here unless passed down or via GameState events
            // Assuming UI updates automatically via listeners or main loop
        }

        // Handle Flags (Quest tracking)
        if (effects.flag) {
            const state = this.getNPCState(npcId);
            if (!state.flags) state.flags = {};
            state.flags[effects.flag] = true;
        }

        // Return result including new dialogue text if in tree
        let responseText = choice.text;

        if (DIALOGUE_TREES[npcId]) {
            const state = this.getNPCState(npcId);
            const nextNode = DIALOGUE_TREES[npcId][state.currentNode];
            if (nextNode) {
                responseText = nextNode.text;
            }
        }

        return {
            success: true,
            text: responseText,
            effects,
            newRelationship: this.relationships[npcId],
            tier: this.getRelationshipTier(npcId),
            isTreeAction: true
        };
    }

    /**
     * Give gift to NPC
     */
    giveGift(npcId, giftId) {
        const npc = this.getNPC(npcId);
        if (!npc) return { success: false, reason: 'NPC not found' };

        const likesGift = npc.gifts.includes(giftId);
        const relationshipGain = likesGift ? 15 : 5;

        this.modifyRelationship(npcId, relationshipGain);

        return {
            success: true,
            liked: likesGift,
            relationshipGain,
            newRelationship: this.relationships[npcId]
        };
    }

    /**
     * Get all met NPCs
     */
    getMetNPCs() {
        return this.metNPCs.map(id => ({
            ...this.getNPC(id),
            relationship: this.relationships[id],
            tier: this.getRelationshipTier(id)
        }));
    }
}




