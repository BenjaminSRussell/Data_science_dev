/**
 * Victoria Sterling Dialogue
 * Individual dialogue file for Victoria Sterling
 * Age: 52, VC Partner, "The Iron Lady" of tech investing
 */

export default {
    npcId: 'victoria_sterling',
    age: 52,
    personality: 'demanding',

    stages: {
        stranger: {
            greeting: [
                "Do you have an appointment?",
                "State your business.",
                "Ms. Sterling."
            ],
            topics: {
                work: [
                    "ROI is the only metric that matters.",
                    "Market caps don't lie.",
                    "I'm interested in exit strategies, not dreams."
                ]
            }
        },

        friendly: {
            greeting: [
                "Hello.",
                "You're still here?",
                "Good day."
            ],
            topics: {
                work: [
                    "My portfolio is performing. Barely.",
                    "I cut the dead weight. It's the only way.",
                    "Underperformance is a choice. I don't make it."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "Victoria Sterling.",
                "I have five minutes.",
                "Make it count."
            ],
            topics: {
                background: [
                    "The Sterling name carries weight. And expectations.",
                    "I hold myself to a standard most can't even name.",
                    "High standards aren't a luxury. They're survival."
                ]
            }
        },

        friend: {
            greeting: [
                "Good to see you.",
                "Sit down.",
                "Let's talk numbers."
            ],
            topics: {
                respect: [
                    "I respect grit. It's rare. You have it.",
                    "The Game rewards those who don't flinch.",
                    "You didn't back down. That's why you're still here."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Victoria.",
                "My door is open.",
                "What's the play?"
            ],
            topics: {
                philosophy: [
                    "Power isn't given. It's shaped.",
                    "We don't play the industry. We shape it.",
                    "Money is just a way of keeping score. The real game is power."
                ]
            }
        }
    },

    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'dismissive',
            dialogue: [
                "I don't have time for this.",
                "Next.",
                "..."
            ],
            quickTime: 'impress'
        },
        challenged: {
            trigger: { challenged: true },
            emotion: 'interest',
            dialogue: [
                "You just pushed back on me?",
                "Good. I can't stand sycophants.",
                "Don't make a habit of it. But don't stop either."
            ],
            quickTime: 'hold_ground'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'cold',
            dialogue: [
                "You wasted my time.",
                "I don't do second chances.",
                "Get out."
            ],
            quickTime: 'apologize'
        }
    },

    emotionalTriggers: [
        {
            condition: { playerChallenges: true, relationship: '>40' },
            emotion: 'respect',
            dialogue: "You didn't flinch when I challenged you. Good.",
            subtext: 'A flicker of genuine approval'
        },
        {
            condition: { playerGrovels: true },
            emotion: 'disdain',
            dialogue: "Don't grovel. It's beneath you.",
            subtext: 'Her tone is ice'
        }
    ],

    actions: {
        gift_fine_wine: "Acceptable. Put it over there.",
        gift_luxury_watch: "A bold choice. I like bold.",
        compliment: "Don't grovel. It's beneath you.",
        ask_help: "I don't do favors. I do deals.",
        rejection: "Fine. The market is full of people who say no.",
        betrayal: "I don't forgive. I just move on."
    }
};
