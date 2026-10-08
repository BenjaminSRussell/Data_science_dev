/**
 * Judge Roberts (The City Judge) dialogue
 * Generated from story_line/judge_roberts.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "judge_roberts",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Order.",
                "Judge Roberts.",
                "Rise."
            ],
            "topics": {},
            "topicHints": "The law, civic duty."
        },
        "friendly": {
            "greeting": [
                "Counselor?",
                "Hello.",
                "Good day."
            ],
            "topics": {
                "background": [
                    "The law is a living thing. It breathes. It changes. But the core principles remain."
                ]
            },
            "topicHints": "Famous cases, ethics."
        },
        "acquaintance": {
            "greeting": [
                "Hello! A free moment.",
                "Judge.",
                "Fairness."
            ],
            "topics": {
                "background": [
                    "The law is a living thing. It breathes. It changes. But the core principles remain."
                ],
                "philosophy": [
                    "It is not enough to do right. One must also be *seen* doing right."
                ],
                "secret": [
                    "I see so many villains. Sometimes, in my stories... I wonder what makes them. Even a judge has imagination."
                ]
            },
            "topicHints": "The mystery novels hint."
        },
        "friend": {
            "greeting": [
                "My chambers act open.",
                "Hey! Good to see you."
            ],
            "topics": {
                "background": [
                    "The law is a living thing. It breathes. It changes. But the core principles remain."
                ],
                "philosophy": [
                    "It is not enough to do right. One must also be *seen* doing right."
                ],
                "secret": [
                    "I see so many villains. Sometimes, in my stories... I wonder what makes them. Even a judge has imagination."
                ],
                "goal": [
                    "A quiet desk. A typewriter. And a story where I control the ending. That is retirement."
                ]
            },
            "topicHints": "The burden of judgment."
        },
        "close_friend": {
            "greeting": [
                "Call me Martha.",
                "Hey! Let's talk books."
            ],
            "topics": {
                "background": [
                    "The law is a living thing. It breathes. It changes. But the core principles remain."
                ],
                "philosophy": [
                    "It is not enough to do right. One must also be *seen* doing right."
                ],
                "secret": [
                    "I see so many villains. Sometimes, in my stories... I wonder what makes them. Even a judge has imagination."
                ],
                "goal": [
                    "A quiet desk. A typewriter. And a story where I control the ending. That is retirement."
                ],
                "wisdom": [
                    "You walk a straight path. It is harder, but it leads to better places. Keep walking."
                ]
            },
            "topicHints": "Retirement dreams."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_legal_books": "A classic text. Thank you.",
        "gift_respect": "Noted.",
        "compliment": "Thank you."
    }
};
