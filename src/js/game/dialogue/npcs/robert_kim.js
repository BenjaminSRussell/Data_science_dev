/**
 * Robert Kim Dialogue
 * Individual dialogue file for Robert Kim
 * Role: Seed Investor, Analytical, Optimistic
 */

export default {
    npcId: 'robert_kim',
    age: 45,
    personality: 'professional',

    stages: {
        stranger: {
            greeting: [
                "Robert Kim. Nice to meet you.",
                "Do you have a pitch deck?",
                "Hello."
            ],
            topics: {
                work: [
                    "Valuations.",
                    "Seed rounds.",
                    "Burn rates."
                ]
            }
        },

        friendly: {
            greeting: [
                "Hey! Good to see you.",
                "Hello.",
                "How's the startup?"
            ],
            topics: {
                work: [
                    "Market fit.",
                    "The hustle.",
                    "It's all about momentum."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "Hello! Any updates?",
                "Robert here.",
                "Good to connect."
            ],
            topics: {
                background: [
                    "Gut feeling vs data.",
                    "I was there in the 90s. The Wild West.",
                    "We built the internet with duct tape and hope."
                ]
            }
        },

        friend: {
            greeting: [
                "My friend! How's it going?",
                "Hey! Let's chat."
            ],
            topics: {
                fear: [
                    "The fear of missing out.",
                    "Believing in founders.",
                    "Sometimes you have to take the leap."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Robert. I trust you.",
                "Hey! You've got that spark."
            ],
            topics: {
                dream: [
                    "Mentoring the next generation.",
                    "Partnership.",
                    "I'm looking for the next generation. Are you that person?"
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
                "Show me the numbers.",
                "..."
            ],
            quickTime: 'persuade'
        },
        missed_opportunity: {
            trigger: { judgment: true },
            emotion: 'frustrated',
            dialogue: [
                "You're being too cautious.",
                "I've made that mistake before.",
                "Don't be too careful!"
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you.",
                "We're done.",
                "Don't contact me again."
            ],
            quickTime: 'apologize'
        }
    },

    emotionalTriggers: [
        {
            condition: { mentionGut: true, judgment: true },
            emotion: 'defensive',
            dialogue: "I'm analytical. That's what I do.",
            subtext: 'He looks away, uncomfortable'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "You see the spark. That's rare.",
            subtext: 'A genuine smile breaks through'
        }
    ],

    actions: {
        gift_business_plan: "Intriguing. I'll take a look.",
        gift_wine: "A nice gesture. Thank you.",
        compliment: "Thank you. I appreciate the kind words.",
        ask_help: "Let's talk terms.",
        rejection: "Understood. The numbers didn't work.",
        betrayal: "I can't believe you'd do that to me."
    }
};
