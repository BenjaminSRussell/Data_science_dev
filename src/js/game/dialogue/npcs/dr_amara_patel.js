/**
 * Dr. Amara Patel Dialogue
 * Individual dialogue file for Dr. Amara Patel
 * Role: Machine Learning Expert, Professional, Academic, Brilliant
 */

export default {
    npcId: 'dr_amara_patel',
    age: 42,
    personality: 'professional',

    stages: {
        stranger: {
            greeting: [
                "Hello.",
                "Are you here for the lecture?",
                "Yes?"
            ],
            topics: {
                work: [
                    "I research deep learning.",
                    "Machine learning is changing everything.",
                    "Neural networks are fascinating."
                ]
            }
        },

        friendly: {
            greeting: [
                "Good to see you.",
                "Hello, colleague.",
                "Ah, you again."
            ],
            topics: {
                work: [
                    "I just published a new paper.",
                    "There's a conference next month.",
                    "The field moves fast."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "Hello! I have a new paper to show you.",
                "Excellent timing."
            ],
            topics: {
                work: [
                    "AI researchers carry a real responsibility.",
                    "We must be careful with what we build."
                ],
                mentoring: [
                    "I mentor several promising students.",
                    "They become my intellectual family."
                ]
            }
        },

        friend: {
            greeting: [
                "My friend! Join me.",
                "I was just running a simulation."
            ],
            topics: {
                work: [
                    "There's a beauty in complex systems.",
                    "The data speaks if you listen."
                ],
                family: [
                    "My students are my intellectual family.",
                    "They keep me grounded."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Amara, at your service.",
                "It is always a pleasure."
            ],
            topics: {
                fear: [
                    "AI is Pandora's Box.",
                    "Sometimes I wonder if we're building something we can't control.",
                    "It keeps me up at night."
                ],
                dream: [
                    "I want to build a General Intelligence.",
                    "One that solves humanity's greatest challenges.",
                    "That's what I'm building."
                ]
            }
        }
    },

    actions: {
        gift_research_paper: "Fascinating. Thank you.",
        gift_coffee: "Fuel for the mind. Thanks.",
        compliment: "I prefer peer review to flattery, but thank you.",
        ask_help: "I may be able to assist. What do you need?",
        rejection: "Understood. The data will speak for itself.",
        betrayal: "I trusted you. That changes things."
    }
};
