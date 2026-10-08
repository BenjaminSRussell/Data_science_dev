/**
 * Victoria Sterling (The Venture Capitalist) dialogue
 * Generated from story_line/victoria_sterling.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "victoria_sterling",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Do you have an appointment?",
                "State your business.",
                "Ms. Sterling."
            ],
            "topics": {},
            "topicHints": "ROI, market caps, exit strategies."
        },
        "friendly": {
            "greeting": [
                "Hello.",
                "You're still here?",
                "Good day."
            ],
            "topics": {
                "background": [
                    "I don't gamble. I invest. There is a difference. One relies on luck, the other on leverage."
                ]
            },
            "topicHints": "Portfolio performance, \"cutting the dead weight\"."
        },
        "acquaintance": {
            "greeting": [
                "Victoria Sterling.",
                "I have five minutes.",
                "Make it count."
            ],
            "topics": {
                "background": [
                    "I don't gamble. I invest. There is a difference. One relies on luck, the other on leverage."
                ],
                "philosophy": [
                    "I don't care about your 'passion'. I care about your execution. Can you deliver?"
                ],
                "family_hint": [
                    "The Sterling name... it carries weight. And expectations. Some crumble under it. I thrived."
                ]
            },
            "topicHints": "The Sterling legacy, high standards."
        },
        "friend": {
            "greeting": [
                "Good to see you.",
                "Sit down.",
                "Let's talk numbers."
            ],
            "topics": {
                "background": [
                    "I don't gamble. I invest. There is a difference. One relies on luck, the other on leverage."
                ],
                "philosophy": [
                    "I don't care about your 'passion'. I care about your execution. Can you deliver?"
                ],
                "family_hint": [
                    "The Sterling name... it carries weight. And expectations. Some crumble under it. I thrived."
                ],
                "respect": [
                    "You didn't flinch when I challenged you. Good. I can't stand sycophants."
                ]
            },
            "topicHints": "Respect for grit, \"The Game\"."
        },
        "close_friend": {
            "greeting": [
                "Victoria.",
                "My door is open.",
                "What's the play?"
            ],
            "topics": {
                "background": [
                    "I don't gamble. I invest. There is a difference. One relies on luck, the other on leverage."
                ],
                "philosophy": [
                    "I don't care about your 'passion'. I care about your execution. Can you deliver?"
                ],
                "family_hint": [
                    "The Sterling name... it carries weight. And expectations. Some crumble under it. I thrived."
                ],
                "respect": [
                    "You didn't flinch when I challenged you. Good. I can't stand sycophants."
                ],
                "legacy": [
                    "Money is just a way of keeping score. The real game is power. Influence. Shaping the future."
                ]
            },
            "topicHints": "Power dynamics, shaping the industry."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_fine_wine": "Acceptable. Put it over there.",
        "gift_luxury_watch": "A bold choice. I like bold.",
        "compliment": "Don't grovel. It's beneath you."
    }
};
