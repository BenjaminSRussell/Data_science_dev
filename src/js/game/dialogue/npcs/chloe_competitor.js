/**
 * Chloe Martinez Dialogue
 * Individual dialogue file for Chloe Martinez (Rival Analyst)
 * NPC id: chloe_competitor
 * Personality: Competitive, Sharp, Unapologetic
 */

export default {
    npcId: 'chloe_competitor',
    age: 28,
    personality: 'competitive',

    stages: {
        stranger: {
            greeting: [
                "Oh. You.",
                "Still in business?",
                "Chloe."
            ],
            topics: {
                competition: [
                    "Market share is a game. I'm winning it.",
                    "I've seen your mistakes. Everyone has."
                ]
            }
        },

        friendly: {
            greeting: [
                "Up for a challenge?",
                "Hello, rival.",
                "Nice suit."
            ],
            topics: {
                competition: [
                    "Healthy competition keeps us sharp.",
                    "I heard some industry gossip. You should hear the rest."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "I saw your numbers.",
                "Trying to keep up?",
                "Hello."
            ],
            topics: {
                background: [
                    "I graduated Summa Cum Laude. You? Just checking the competition.",
                    "My academic records speak for themselves."
                ],
                standards: [
                    "Clients don't want 'good'. They want the best. That's me.",
                    "There is no second place. You win, or you learn."
                ]
            }
        },

        friend: {
            greeting: [
                "You're decent opposition.",
                "Hey! Good fight.",
                "Let's compare notes."
            ],
            topics: {
                secret: [
                    "I saw your latest report. Not terrible. I would have used a different model, but... decent.",
                    "I admit you're a worthy adversary. That's rare."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Only the best.",
                "Hey! Watch your back (kidding)."
            ],
            topics: {
                dream: [
                    "CEO. That's the title I want. And I'm not asking for permission.",
                    "I don't sleep. I optimize. That's why I'll always be one step ahead."
                ],
                philosophy: [
                    "We share the same drive for excellence. That's why I respect you.",
                    "There is no second place. You win, or you learn."
                ]
            }
        }
    },

    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'dismissive',
            dialogue: [
                "Oh. You.",
                "Still in business?",
                "..."
            ],
            quickTime: 'challenge'
        },
        challenged: {
            trigger: { challenge: true },
            emotion: 'competitive',
            dialogue: [
                "You're on.",
                "Let's see if you can keep up.",
                "Don't say I didn't warn you."
            ],
            quickTime: 'accept'
        },
        betrayed: {
            trigger: { betrayal: true },
            emotion: 'anger',
            dialogue: [
                "I thought you were better than that.",
                "We're done.",
                "Don't talk to me."
            ],
            quickTime: 'apologize'
        }
    },

    emotionalTriggers: [
        {
            condition: { mentioned: 'mediocrity' },
            emotion: 'defensive',
            dialogue: "Mediocrity is the only thing I can't tolerate.",
            subtext: 'Her voice is sharp'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'grudging_respect',
            dialogue: "I saw your latest report. Not terrible.",
            subtext: 'A rare compliment from her'
        }
    ],

    actions: {
        gift: "Startled? I don't need charity.",
        challenge: "You're on.",
        compliment: "I know.",
        ask_help: "I don't need help. But... thanks.",
        rejection: "Fine. I'll find someone better.",
        betrayal: "I can't believe you'd do that to me."
    }
};
