/**
 * Sophia Zhang (The Corporate Investor) dialogue
 * Generated from story_line/sophia_zhang.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "sophia_zhang",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Ms. Zhang.",
                "We are watching your progress.",
                "Hello."
            ],
            "topics": {},
            "topicHints": "Synergies, acquisition targets, quarterly goals."
        },
        "friendly": {
            "greeting": [
                "Good to see you.",
                "Hello.",
                "Our reports on you are positive."
            ],
            "topics": {
                "background": [
                    "I represent... significant interests. We have resources you can only dream of."
                ]
            },
            "topicHints": "Corporate strategy, \"Golden Handcuffs\"."
        },
        "acquaintance": {
            "greeting": [
                "Hello! Let's talk strategy.",
                "Sophia here.",
                "Interesting moves lately."
            ],
            "topics": {
                "background": [
                    "I represent... significant interests. We have resources you can only dream of."
                ],
                "philosophy": [
                    "Why compete when you can join us? Scale is everything in this market."
                ],
                "secret_envy": [
                    "You have so much... freedom. No board meetings. No compliance checks. Enjoy it while it lasts."
                ]
            },
            "topicHints": "The freedom of startups vs corporate stability."
        },
        "friend": {
            "greeting": [
                "Sophia. Off the record?",
                "Hey! Good to see you."
            ],
            "topics": {
                "background": [
                    "I represent... significant interests. We have resources you can only dream of."
                ],
                "philosophy": [
                    "Why compete when you can join us? Scale is everything in this market."
                ],
                "secret_envy": [
                    "You have so much... freedom. No board meetings. No compliance checks. Enjoy it while it lasts."
                ],
                "strategy": [
                    "We don't just want your tech. We want your talent. We want *you*."
                ]
            },
            "topicHints": "The \"Merger of the Century\", respect for independence."
        },
        "close_friend": {
            "greeting": [
                "Sophia. Let's make a deal.",
                "Hey! You're a rare find."
            ],
            "topics": {
                "background": [
                    "I represent... significant interests. We have resources you can only dream of."
                ],
                "philosophy": [
                    "Why compete when you can join us? Scale is everything in this market."
                ],
                "secret_envy": [
                    "You have so much... freedom. No board meetings. No compliance checks. Enjoy it while it lasts."
                ],
                "strategy": [
                    "We don't just want your tech. We want your talent. We want *you*."
                ],
                "dream": [
                    "Imagine what you could do with our resources. No limits. No budget constraints. Just pure innovation."
                ]
            },
            "topicHints": "Unlimited resources, partnership proposals."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_fine_wine": "Acceptable.",
        "gift_luxury_watch": "We have high standards. This meets them.",
        "compliment": "Noted."
    }
};
