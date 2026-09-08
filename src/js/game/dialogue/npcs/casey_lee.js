/**
 * Casey Lee Dialogue
 * Individual dialogue file for Casey Lee
 * Age: 24, Marketing Specialist, Gen Z trends, Viral campaigns
 */

export default {
    npcId: 'casey_lee',
    age: 24,
    personality: 'friendly',
    
    stages: {
        stranger: {
            greeting: [
                "Hey!",
                "What's up?",
                "Hi there!"
            ],
            topics: {
                work: [
                    "I'm a marketing specialist.",
                    "I speak Fluent Gen Z.",
                    "Trends move fast."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Hey! Good to see you.",
                "What's up?",
                "Hey there!"
            ],
            topics: {
                work: [
                    "Marketing is all about the tribe.",
                    "It's not about the product.",
                    "It's about the people."
                ],
                background: [
                    "I grew up on social media.",
                    "Trends move fast.",
                    "You either adapt or you're left behind."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hey! Always good to catch up.",
                "What's up? How's it going?",
                "Hey! Good to see you."
            ],
            topics: {
                background: [
                    "I started my career in a small agency.",
                    "Learned everything I know on the job.",
                    "Now I run campaigns that actually go viral."
                ],
                philosophy: [
                    "It's not about the product.",
                    "It's about the tribe.",
                    "You find the story that resonates."
                ]
            }
        },
        
        friend: {
            greeting: [
                "My friend! Hey!",
                "What's up? Good to see you!",
                "Hey! Come here!"
            ],
            topics: {
                secret: [
                    "Friday night? My phone goes in a lockbox.",
                    "Seriously.",
                    "The scroll... it consumes you."
                ],
                impact: [
                    "We raised 100k.",
                    "24 hours.",
                    "Just by telling the right story."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "Hey! My friend!",
                "What's up? Good to see you!",
                "Hey! Come here!"
            ],
            topics: {
                dream: [
                    "Imagine using this power for something real.",
                    "Not just selling shoes.",
                    "But changing laws."
                ],
                philosophy: [
                    "That's power.",
                    "Real power.",
                    "You just have to tell the right story."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought we were cool.",
                "Guess not.",
                "..."
            ],
            quickTime: 'comfort'
        },
        past_judgment: {
            trigger: { judgment: true },
            emotion: 'anger',
            dialogue: [
                "You're judging me for my work?!",
                "I thought you understood!",
                "Marketing isn't just selling!"
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you.",
                "We're done.",
                "Don't talk to me."
            ],
            quickTime: 'apologize'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { mentionPast: true, judgment: true },
            emotion: 'defensive',
            dialogue: "That's not who I am anymore.",
            subtext: 'Her voice is tense'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thanks for believing in me.",
            subtext: 'Genuine relief in her voice'
        }
    ],
    
    actions: {
        gift_coffee: "Thanks! I needed this.",
        gift_snacks: "Appreciate it!",
        compliment: "Thanks. That means a lot.",
        ask_help: "Yeah, I got you.",
        rejection: "Okay. I get it.",
        betrayal: "I can't believe you'd do that to me."
    }
};
