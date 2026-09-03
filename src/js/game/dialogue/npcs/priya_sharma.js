/**
 * Priya Sharma Dialogue
 * Individual dialogue file for Priya Sharma
 * Role: Data Privacy Officer, former human rights lawyer
 * Personality: Professional, Principled, Stern but Fair
 */

export default {
    npcId: 'priya_sharma',
    age: 38,
    personality: 'professional',

    stages: {
        stranger: {
            greeting: [
                "Ms. Sharma.",
                "Do you have clearance?",
                "Hello."
            ],
            topics: {
                work: [
                    "I'm a Data Privacy Officer.",
                    "I ensure companies follow data privacy laws.",
                    "Compliance is not optional."
                ]
            }
        },

        friendly: {
            greeting: [
                "Good to see you.",
                "Hello.",
                "Compliance is key."
            ],
            topics: {
                work: [
                    "Best practices matter.",
                    "Privacy by design is the standard.",
                    "I used to represent people, not policies. But I realized the biggest threat to rights was in the code, not the courts."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "Hello! Good to verify.",
                "Priya here.",
                "Everything secure?"
            ],
            topics: {
                background: [
                    "I've seen what happens when ethics are ignored.",
                    "Laws weren't enough. Someone had to stand up from the inside.",
                    "That's the Whistleblower Incident, if you must know."
                ],
                philosophy: [
                    "Just because you *can* collect the data, doesn't mean you *should*. That distinction is everything.",
                    "Privacy isn't a luxury. It's a fundamental human right."
                ]
            }
        },

        friend: {
            greeting: [
                "My friend! Secure channel?",
                "Hey! Good to see an ally."
            ],
            topics: {
                secret: [
                    "I learned the hard way that doing the right thing has a cost. I paid it once. I'd pay it again.",
                    "I blew the whistle on a previous employer.",
                    "It was traumatic. It made me the enforcer I am today."
                ],
                fear: [
                    "We are sleepwalking into a world where everything is known, tracked, and sold. I'm just trying to wake us up.",
                    "A surveillance state where privacy no longer exists. That's what I fear."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Priya. Let's talk freely.",
                "Hey! You're one of the good ones."
            ],
            topics: {
                dream: [
                    "A Digital Bill of Rights. Enforceable. Global. That's the only way to ensure freedom in the digital age.",
                    "I want it universally enforced. No exceptions."
                ],
                philosophy: [
                    "Privacy isn't a luxury. It's a fundamental human right.",
                    "Protecting people from the misuse of their data is why I do this."
                ]
            }
        }
    },

    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'cold',
            dialogue: [
                "I don't have time for this.",
                "Do you have clearance?",
                "..."
            ],
            quickTime: 'comfort'
        },
        privacy_violation: {
            trigger: { judgment: true },
            emotion: 'anger',
            dialogue: [
                "You're treating privacy like a convenience?",
                "That's exactly what I fight against.",
                "Think again."
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you with my confidence.",
                "We're done.",
                "Don't contact me again."
            ],
            quickTime: 'apologize'
        }
    },

    emotionalTriggers: [
        {
            condition: { mentionPast: true, judgment: true },
            emotion: 'defensive',
            dialogue: "The Whistleblower Incident is not a topic for casual conversation.",
            subtext: 'Her voice is measured, but cold'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thank you for standing with me on this.",
            subtext: 'A rare, genuine warmth in her tone'
        }
    ],

    actions: {
        gift_books: "A thoughtful choice. Thank you.",
        gift_coffee: "I'll accept this. Thank you.",
        compliment: "Professionalism is my language.",
        ask_help: "I'll consider it. Compliance is my priority.",
        rejection: "Understood. I respect your decision.",
        betrayal: "I can't believe you'd do that to me."
    }
};
