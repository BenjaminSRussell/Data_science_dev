/**
 * Priya Sharma (The Ethics Officer) dialogue
 * Generated from story_line/priya_sharma.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "priya_sharma",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Ms. Sharma.",
                "Do you have clearance?",
                "Hello."
            ],
            "topics": {},
            "topicHints": "GDPR, compliance, regulations."
        },
        "friendly": {
            "greeting": [
                "Good to see you.",
                "Hello.",
                "Compliance is key."
            ],
            "topics": {
                "background": [
                    "I used to represent people, not policies. But I realized the biggest threat to rights was in the code, not the courts."
                ]
            },
            "topicHints": "Best practices, \"privacy by design\"."
        },
        "acquaintance": {
            "greeting": [
                "Hello! Good to verify.",
                "Priya here.",
                "Everything secure?"
            ],
            "topics": {
                "background": [
                    "I used to represent people, not policies. But I realized the biggest threat to rights was in the code, not the courts."
                ],
                "philosophy": [
                    "Just because you *can* collect the data, doesn't mean you *should*. That distinction is everything."
                ],
                "secret_past": [
                    "I learned the hard way that doing the right thing has a cost. I paid it once. I'd pay it again."
                ]
            },
            "topicHints": "The Whistleblower hint (\"I've seen what happens when ethics are ignored\")."
        },
        "friend": {
            "greeting": [
                "My friend! Secure channel?",
                "Hey! Good to see an ally."
            ],
            "topics": {
                "background": [
                    "I used to represent people, not policies. But I realized the biggest threat to rights was in the code, not the courts."
                ],
                "philosophy": [
                    "Just because you *can* collect the data, doesn't mean you *should*. That distinction is everything."
                ],
                "secret_past": [
                    "I learned the hard way that doing the right thing has a cost. I paid it once. I'd pay it again."
                ],
                "fear": [
                    "We are sleepwalking into a world where everything is known, tracked, and sold. I'm just trying to wake us up."
                ]
            },
            "topicHints": "The fight for privacy, shared values."
        },
        "close_friend": {
            "greeting": [
                "Priya. Let's talk freely.",
                "Hey! You're one of the good ones."
            ],
            "topics": {
                "background": [
                    "I used to represent people, not policies. But I realized the biggest threat to rights was in the code, not the courts."
                ],
                "philosophy": [
                    "Just because you *can* collect the data, doesn't mean you *should*. That distinction is everything."
                ],
                "secret_past": [
                    "I learned the hard way that doing the right thing has a cost. I paid it once. I'd pay it again."
                ],
                "fear": [
                    "We are sleepwalking into a world where everything is known, tracked, and sold. I'm just trying to wake us up."
                ],
                "dream": [
                    "A Digital Bill of Rights. Enforceable. Global. That's the only way to ensure freedom in the digital age."
                ]
            },
            "topicHints": "The \"Digital Bill of Rights\", trust."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_books": "A thoughtful choice. Thank you.",
        "gift_coffee": "I'll accept this. Thank you.",
        "compliment": "Professionalism is my language."
    }
};
