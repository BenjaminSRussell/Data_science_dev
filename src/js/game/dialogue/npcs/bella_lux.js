/**
 * Bella Lux Dialogue
 * Individual dialogue file for Bella Lux
 * Age: 27, Influencer, Hidden debt
 */

export default {
    npcId: 'bella_lux',
    age: 27,
    personality: 'high_maintenance',
    
    stages: {
        stranger: {
            greeting: [
                "Do I know you?",
                "No photos.",
                "Bella."
            ],
            topics: {
                followers: [
                    "Do you know who I am? I have 2 million followers.",
                    "That's basically royalty."
                ],
                lighting: [
                    "The lighting here is terrible.",
                    "No wonder my content looks better."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Hey babe!",
                "Bella here.",
                "Love the outfit (lie)."
            ],
            topics: {
                sponsorships: [
                    "I'm juggling three sponsorships right now.",
                    "It's a lot, but the money is real."
                ],
                brand_deals: [
                    "Brand deals are everything.",
                    "If it's not sponsored, it didn't happen."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hey! Collab?",
                "Selfie time!",
                "What's trending?"
            ],
            topics: {
                debt: [
                    "Rent is due and I'm... managing.",
                    "Don't tell anyone I said that."
                ],
                hustle: [
                    "I'm always on. Always working.",
                    "The hustle never stops."
                ]
            }
        },
        
        friend: {
            greeting: [
                "My favorite fan!",
                "Hey! VIP access."
            ],
            topics: {
                irrelevance: [
                    "If I stop posting, do I disappear?",
                    "Sometimes I think I might."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "Babe.",
                "Hey! No cameras."
            ],
            topics: {
                real_connection: [
                    "Maybe I want something real.",
                    "Just one thing not for the 'gram.",
                    "Could that be you?"
                ],
                persona: [
                    "The Bella you see online? That's a character.",
                    "This is the real one. For now."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "You're not on my list.",
                "I have 2 million followers.",
                "You're not one of them."
            ],
            quickTime: 'flatter'
        },
        debt_exposed: {
            trigger: { judgment: true },
            emotion: 'defensive',
            dialogue: [
                "You think I can afford all this?!",
                "Perception is reality!",
                "If it looks expensive, it IS expensive!"
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you.",
                "This is going in a story.",
                "Don't talk to me."
            ],
            quickTime: 'apologize'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { mentionDebt: true, judgment: true },
            emotion: 'defensive',
            dialogue: "Perception is reality. If it looks expensive, it is expensive.",
            subtext: 'Her smile doesn't reach her eyes'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'vulnerable',
            dialogue: "Maybe I want something real. Just one thing not for the 'gram.",
            subtext: 'She lowers her phone for the first time'
        }
    ],
    
    actions: {
        gift_designer_bags: "Omg. Yesss. Unboxing video time!",
        gift_jewelry: "You have taste. I love it.",
        compliment: "Tell me more.",
        ask_help: "Only if it's worth the exposure.",
        rejection: "Okay. I get it.",
        betrayal: "I can't believe you'd do that to me."
    }
};
