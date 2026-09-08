/**
 * Noah Williams Dialogue
 * Individual dialogue file for Noah Williams
 * Age: 28, Visual Artist, Hidden colorblindness & moon-mural dream
 */

export default {
    npcId: 'noah_artist',
    age: 28,
    personality: 'friendly',
    
    stages: {
        stranger: {
            greeting: [
                "Hello.",
                "Like the art?",
                "Noah."
            ],
            topics: {
                aesthetics: [
                    "Aesthetics matter.",
                    "Composition is everything.",
                    "It's all about balance."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Hey! Inspired?",
                "Noah here.",
                "Nice colors."
            ],
            topics: {
                creative_blocks: [
                    "Creative blocks happen.",
                    "You just have to keep going.",
                    "Muse strikes when you least expect it."
                ],
                museums: [
                    "Museums are my second home.",
                    "There's so much to see.",
                    "Every piece tells a story."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hey! Look at this.",
                "I made this.",
                "Beautiful day."
            ],
            topics: {
                secret_hint: [
                    "Colors... they're tricky for me.",
                    "I memorize the codes.",
                    "#FF0000 is red. I know it, even if I don't see it."
                ]
            }
        },
        
        friend: {
            greeting: [
                "Muse!",
                "Hey! Portrait time?"
            ],
            topics: {
                moon_mural: [
                    "The moon. A blank canvas.",
                    "Imagine the contrast.",
                    "That's the ultimate installation."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "My love.",
                "Hey! Let's create."
            ],
            topics: {
                emotional_connection: [
                    "You are my favorite subject.",
                    "The one variable I can't predict.",
                    "Life isn't black and white. It's a spectrum."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought we connected.",
                "Guess not.",
                "..."
            ],
            quickTime: 'comfort'
        },
        misunderstood: {
            trigger: { judgment: true },
            emotion: 'sadness',
            dialogue: [
                "You don't understand me.",
                "I'm always misunderstood.",
                "That's my fear, you know."
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
            condition: { mentionColors: true, judgment: true },
            emotion: 'defensive',
            dialogue: "You don't have to understand it.",
            subtext: 'His voice is quiet, guarded'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thanks for seeing me. Really seeing me.",
            subtext: 'Genuine relief in his voice'
        }
    ],
    
    actions: {
        gift_art_supplies: "Perfect. I needed these.",
        gift_coffee: "Warmth. Thanks.",
        compliment: "You have a beautiful soul.",
        ask_help: "Yeah, I got you.",
        rejection: "Okay. I get it.",
        betrayal: "I can't believe you'd do that to me."
    }
};
