/**
 * James Wilson (The Strategy Consultant) dialogue
 * Generated from story_line/james_wilson.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "james_wilson",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "James Wilson. Consulting.",
                "Good day.",
                "Do you have an appointment?"
            ],
            "topics": {},
            "topicHints": "Strategy, markets, enterprise solutions."
        },
        "friendly": {
            "greeting": [
                "Good to see you.",
                "Hello.",
                "How is business?"
            ],
            "topics": {
                "background": [
                    "I've been in boardrooms you only read about in the news. The stakes are always high."
                ]
            },
            "topicHints": "High-profile clients, \"synergy\"."
        },
        "acquaintance": {
            "greeting": [
                "Hello! Good to connect.",
                "James here.",
                "What's the word?"
            ],
            "topics": {
                "background": [
                    "I've been in boardrooms you only read about in the news. The stakes are always high."
                ],
                "philosophy": [
                    "It's not just about the data. It's about the narrative. Can you tell a story that justifies a billion-dollar decision?"
                ],
                "burnout": [
                    "Another airport lounge. Another hotel. Sometimes the glamour wears thin, you know?"
                ]
            },
            "topicHints": "The art of the pitch, billing rates."
        },
        "friend": {
            "greeting": [
                "My friend! Join me.",
                "Hey! Good to see you outside the office."
            ],
            "topics": {
                "background": [
                    "I've been in boardrooms you only read about in the news. The stakes are always high."
                ],
                "philosophy": [
                    "It's not just about the data. It's about the narrative. Can you tell a story that justifies a billion-dollar decision?"
                ],
                "burnout": [
                    "Another airport lounge. Another hotel. Sometimes the glamour wears thin, you know?"
                ],
                "secret_dream": [
                    "Italy. A vineyard. No phones. No clients. Just grapes and time. That's the exit strategy."
                ]
            },
            "topicHints": "Exhaustion (\"The grind never stops\"), Italy dream."
        },
        "close_friend": {
            "greeting": [
                "James. Honest talk?",
                "Hey! Always a pleasure."
            ],
            "topics": {
                "background": [
                    "I've been in boardrooms you only read about in the news. The stakes are always high."
                ],
                "philosophy": [
                    "It's not just about the data. It's about the narrative. Can you tell a story that justifies a billion-dollar decision?"
                ],
                "burnout": [
                    "Another airport lounge. Another hotel. Sometimes the glamour wears thin, you know?"
                ],
                "secret_dream": [
                    "Italy. A vineyard. No phones. No clients. Just grapes and time. That's the exit strategy."
                ],
                "regret": [
                    "I've sacrificed a lot for this career. Families. Friends. Make sure you don't lose yourself in the hustle."
                ]
            },
            "topicHints": "Regret over lost relationships, mentoring you to avoid his mistakes."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_fine_wine": "Excellent vintage. You have taste.",
        "gift_business_cards": "Sharp. Very sharp.",
        "compliment": "Flattery will get you everywhere."
    }
};
