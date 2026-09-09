/**
 * Bob Bagel Dialogue
 * Individual dialogue file for Bob Bagel
 * Age: 58, Bagel shop owner, Gruff but passionate
 */

export default {
    npcId: 'bob_bagel',
    age: 58,
    personality: 'gruff',

    stages: {
        stranger: {
            greeting: [
                "Hm.",
                "What do you want?",
                "Bagels. That's it."
            ],
            topics: {
                work: [
                    "I make bagels.",
                    "Been doing it 20 years.",
                    "Don't ask me anything else."
                ]
            }
        },

        friendly: {
            greeting: [
                "Hey. You again.",
                "Bagels are fresh.",
                "You look hungry."
            ],
            topics: {
                work: [
                    "The dough's been resting all night.",
                    "You can tell the difference.",
                    "Most people can't, but you can."
                ],
                background: [
                    "Grew up in Brooklyn.",
                    "Learned from my grandfather.",
                    "He'd have liked you, I think."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "Hey, friend.",
                "You know your bagels.",
                "Come back often, I see."
            ],
            topics: {
                background: [
                    "Moved here 20 years ago.",
                    "Nobody knew me. Good thing.",
                    "I didn't need them to."
                ],
                philosophy: [
                    "A bagel is a promise.",
                    "You make it, you keep it.",
                    "No shortcuts. No exceptions."
                ]
            }
        },

        friend: {
            greeting: [
                "Hey! You're my regular.",
                "I saved you a bagel.",
                "You're one of the good ones."
            ],
            topics: {
                secret: [
                    "The water... it's not from New York.",
                    "I filter it myself. Local tap.",
                    "But the myth sells. I let it stand."
                ],
                fear: [
                    "That chain store on 5th... they keep circling.",
                    "They want to buy me out.",
                    "I won't let them."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Hey, buddy.",
                "You're family now.",
                "I trust you with my secret."
            ],
            topics: {
                dream: [
                    "I dream one day a New Yorker will cry at the taste.",
                    "Not from sadness. From joy.",
                    "That's when I'll know I did it right."
                ],
                philosophy: [
                    "A bagel is a promise.",
                    "You make it, you keep it.",
                    "That's all any of us can do."
                ]
            }
        }
    },

    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'irritated',
            dialogue: [
                "I don't have time for this.",
                "Bagels are in the case.",
                "..."
            ],
            quickTime: 'comfort'
        },
        past_judgment: {
            trigger: { judgment: true },
            emotion: 'anger',
            dialogue: [
                "You don't know anything about my bagels.",
                "You don't know anything about me.",
                "Get out."
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you.",
                "You're done here.",
                "Don't come back."
            ],
            quickTime: 'apologize'
        }
    },

    emotionalTriggers: [
        {
            condition: { mentionPast: true, judgment: true },
            emotion: 'defensive',
            dialogue: "You don't know what you're talking about.",
            subtext: 'His jaw tightens'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thanks for sticking around.",
            subtext: 'A rare softness in his voice'
        }
    ],

    actions: {
        gift_coffee: "You don't need to do that. But... thanks.",
        gift_snacks: "Keep your money. Buy another bagel.",
        compliment: "Mm. I'll take that.",
        ask_help: "Yeah, I got you.",
        rejection: "Okay. I get it.",
        betrayal: "I can't believe you'd do that to me."
    }
};
