/**
 * James Wilson - The Strategy Consultant
 * Dialogue file for James Wilson
 *
 * James is a polished, expensive consulting director. Former Ivy League,
 * former Wall Street. He knows how to wear a suit and bill by the hour.
 * Beneath the expert polish, he's burned out and quietly dreams of
 * retiring to a vineyard in Italy.
 */

export default {
    npcId: 'james_wilson',
    name: 'James Wilson',
    role: 'Consulting Director',
    personality: 'Professional, Polished, Expensive',

    stages: {
        stranger: {
            greeting: "James Wilson. Consulting.",
            greetings: [
                "James Wilson. Consulting.",
                "Good day.",
                "Do you have an appointment?"
            ],
            topics: [
                "Strategy, markets, enterprise solutions.",
                "The stakes are always high in this industry.",
                "Perception is reality. If you look like the expert, you are the expert."
            ]
        },
        friendly: {
            greeting: "Good to see you.",
            greetings: [
                "Good to see you.",
                "Hello.",
                "How is business?"
            ],
            topics: [
                "High-profile clients and the art of the pitch.",
                "It's not just about the data. It's about the narrative.",
                "Can you tell a story that justifies a billion-dollar decision?"
            ]
        },
        acquaintance: {
            greeting: "Hello! Good to connect.",
            greetings: [
                "Hello! Good to connect.",
                "James here.",
                "What's the word?"
            ],
            topics: [
                "The art of the pitch and billing rates.",
                "I've been in boardrooms you only read about in the news.",
                "Synergy is a word you learn to love, or you learn to leave."
            ]
        },
        friend: {
            greeting: "My friend! Join me.",
            greetings: [
                "My friend! Join me.",
                "Hey! Good to see you outside the office."
            ],
            topics: [
                "The grind never stops. Another airport lounge. Another hotel.",
                "Sometimes the glamour wears thin, you know?",
                "Italy. A vineyard. No phones. No clients. Just grapes and time."
            ]
        },
        close_friend: {
            greeting: "James. Honest talk?",
            greetings: [
                "James. Honest talk?",
                "Hey! Always a pleasure."
            ],
            topics: [
                "I've sacrificed a lot for this career. Families. Friends.",
                "Make sure you don't lose yourself in the hustle.",
                "That's the exit strategy. Italy. A vineyard. No phones. No clients."
            ]
        }
    },

    storyReveals: [
        {
            minRelationship: 10,
            text: "I've been in boardrooms you only read about in the news. The stakes are always high.",
            type: 'background'
        },
        {
            minRelationship: 25,
            text: "It's not just about the data. It's about the narrative. Can you tell a story that justifies a billion-dollar decision?",
            type: 'philosophy'
        },
        {
            minRelationship: 40,
            text: "Another airport lounge. Another hotel. Sometimes the glamour wears thin, you know?",
            type: 'burnout'
        },
        {
            minRelationship: 60,
            text: "Italy. A vineyard. No phones. No clients. Just grapes and time. That's the exit strategy.",
            type: 'secret_dream'
        },
        {
            minRelationship: 80,
            text: "I've sacrificed a lot for this career. Families. Friends. Make sure you don't lose yourself in the hustle.",
            type: 'regret'
        }
    ],

    gifts: {
        fine_wine: "Excellent vintage. You have taste.",
        business_cards: "Sharp. Very sharp.",
        compliment: "Flattery will get you everywhere."
    },

    breakdowns: [
        {
            trigger: "burnout",
            text: "The travel, the hotels, the PowerPoint decks... I sometimes dream of quitting to run a quiet bookstore."
        },
        {
            trigger: "fear",
            text: "Becoming irrelevant. That's the fear that keeps me billing by the hour."
        }
    ],

    emotionalTriggers: [
        "burnout",
        "irrelevance",
        "lost_relationships"
    ]
};
