/**
 * Sarah Martinez Dialogue
 * Individual dialogue file for Sarah Martinez
 * Age: 34, Single mother, Professional
 */

export default {
    npcId: 'sarah_martinez',
    age: 34,
    personality: 'professional',
    
    stages: {
        stranger: {
            greeting: [
                "Hello.",
                "Hi there.",
                "Hey."
            ],
            topics: {
                work: [
                    "I work in data analytics.",
                    "Fortune 500 company.",
                    "It's challenging but rewarding."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Hey! Good to see you.",
                "Hello again.",
                "Hi, how are you?"
            ],
            topics: {
                work: [
                    "Work's been busy lately.",
                    "Big project coming up.",
                    "Always something new."
                ],
                kids: [
                    "My kids keep me busy.",
                    "They're my motivation.",
                    "Everything I do is for them."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hey! Always good to catch up.",
                "Hello! How's everything?",
                "Hi there!"
            ],
            topics: {
                work: [
                    "I didn't go to an Ivy League school.",
                    "Started as a barista.",
                    "Taught myself to code at night."
                ],
                struggle: [
                    "It's hard balancing work and being a mom.",
                    "Sometimes I feel like I'm failing at both.",
                    "But I keep going."
                ]
            }
        },
        
        friend: {
            greeting: [
                "My friend! So good to see you.",
                "Hey! I was hoping to see you.",
                "Hello! Come sit."
            ],
            topics: {
                secret: [
                    "I was offered a C-suite position.",
                    "More money, more prestige.",
                    "But it would mean less time with my kids.",
                    "I said no."
                ],
                dream: [
                    "Someday I want to start my own firm.",
                    "Work on my own terms.",
                    "Be there for my kids.",
                    "One day at a time."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "My dear friend! I'm so glad you're here.",
                "Hello! I needed to talk to someone.",
                "Hey! You're the only one who understands."
            ],
            topics: {
                fear: [
                    "I'm terrified I'm not doing enough.",
                    "Failing as a mother and a professional.",
                    "But I can't stop."
                ],
                turning_point: [
                    "My daughter said 'Mommy, you're so smart'.",
                    "After seeing me present at a conference.",
                    "That moment changed everything."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought we understood each other.",
                "Maybe I was wrong.",
                "..."
            ],
            quickTime: 'comfort'
        },
        work_life_stress: {
            trigger: { stress: 'high' },
            emotion: 'crying',
            dialogue: [
                "I can't do this anymore.",
                "I'm failing at everything.",
                "I don't know what to do."
            ],
            quickTime: 'support'
        },
        rejection: {
            trigger: { rejection: true },
            emotion: 'yelling',
            dialogue: [
                "After everything I've shared?!",
                "You're just like everyone else!",
                "I should have known better!"
            ],
            quickTime: 'defuse'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { playerSuccess: true, npcStruggling: true },
            emotion: 'jealousy',
            dialogue: "You make it look so easy.",
            subtext: 'There's pain in her voice'
        },
        {
            condition: { mentionKids: true, relationship: '>40' },
            emotion: 'warmth',
            dialogue: "Thank you for asking about them.",
            subtext: 'Her eyes light up'
        }
    ],
    
    actions: {
        gift_coffee: "Thanks. I need this.",
        gift_tech: "Oh, this is nice. Thank you.",
        compliment: "That means a lot.",
        ask_help: "I'll help if I can.",
        rejection: "I see. Okay.",
        betrayal: "I trusted you with my story."
    }
};

