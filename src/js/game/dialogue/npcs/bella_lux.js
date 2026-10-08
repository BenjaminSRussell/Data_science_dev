/**
 * Bella Lux (The Influencer) dialogue
 * Generated from story_line/bella_lux.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "bella_lux",
    "personality": "high_maintenance",
    "stages": {
        "stranger": {
            "greeting": [
                "Do I know you?",
                "No photos.",
                "Bella."
            ],
            "topics": {},
            "topicHints": "Follower count, lighting."
        },
        "friendly": {
            "greeting": [
                "Hey babe!",
                "Bella here.",
                "Love the outfit (lie)."
            ],
            "topics": {
                "background": [
                    "Do you know who I am? I have 2 million followers. That's basically royalty."
                ]
            },
            "topicHints": "Sponsorships, brand deals."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Collab?",
                "Selfie time!",
                "What's trending?"
            ],
            "topics": {
                "background": [
                    "Do you know who I am? I have 2 million followers. That's basically royalty."
                ],
                "philosophy": [
                    "Perception is reality. If it looks expensive, it is expensive."
                ],
                "secret": [
                    "This bag? Rented. The car? Leased. But the likes? Real. And that's all that matters."
                ]
            },
            "topicHints": "The debt stress (hidden), hustle."
        },
        "friend": {
            "greeting": [
                "My favorite fan!",
                "Hey! VIP access."
            ],
            "topics": {
                "background": [
                    "Do you know who I am? I have 2 million followers. That's basically royalty."
                ],
                "philosophy": [
                    "Perception is reality. If it looks expensive, it is expensive."
                ],
                "secret": [
                    "This bag? Rented. The car? Leased. But the likes? Real. And that's all that matters."
                ],
                "fear": [
                    "If I stop posting, do I disappear? Sometimes I think I might."
                ]
            },
            "topicHints": "The fear of irrelevance."
        },
        "close_friend": {
            "greeting": [
                "Babe.",
                "Hey! No cameras."
            ],
            "topics": {
                "background": [
                    "Do you know who I am? I have 2 million followers. That's basically royalty."
                ],
                "philosophy": [
                    "Perception is reality. If it looks expensive, it is expensive."
                ],
                "secret": [
                    "This bag? Rented. The car? Leased. But the likes? Real. And that's all that matters."
                ],
                "fear": [
                    "If I stop posting, do I disappear? Sometimes I think I might."
                ],
                "vulnerability": [
                    "Maybe I want something real. Just one thing not for the 'gram. Could that be you?"
                ]
            },
            "topicHints": "True connection vs online persona."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_designer_bags": "Omg. Yesss. Unboxing video time!",
        "gift_jewelry": "You have taste. I love it.",
        "compliment": "Tell me more."
    }
};
