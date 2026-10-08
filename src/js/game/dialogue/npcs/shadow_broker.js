/**
 * Shadow (The Information Broker) dialogue
 * Generated from story_line/shadow_broker.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "shadow_broker",
    "personality": "mysterious",
    "stages": {
        "stranger": {
            "greeting": [
                "...",
                "What do you want?",
                "Shh."
            ],
            "topics": {},
            "topicHints": "Rumors, blackmail."
        },
        "friendly": {
            "greeting": [
                "Step closer.",
                "Shadow.",
                "I hear things."
            ],
            "topics": {
                "background": [
                    "names are for friends. I have clients. You want to be a client?"
                ]
            },
            "topicHints": "Market manipulation."
        },
        "acquaintance": {
            "greeting": [
                "I have a file.",
                "Hey.",
                "Interesting news."
            ],
            "topics": {
                "background": [
                    "names are for friends. I have clients. You want to be a client?"
                ],
                "philosophy": [
                    "Truth is a commodity. It fluctuates. Buy low, sell high."
                ],
                "secret": [
                    "The birds... they watch. You think they're birds? Look closer."
                ]
            },
            "topicHints": "The pigeon drones."
        },
        "friend": {
            "greeting": [
                "My eyes and ears.",
                "Hey! A secret for you."
            ],
            "topics": {
                "background": [
                    "names are for friends. I have clients. You want to be a client?"
                ],
                "philosophy": [
                    "Truth is a commodity. It fluctuates. Buy low, sell high."
                ],
                "secret": [
                    "The birds... they watch. You think they're birds? Look closer."
                ],
                "goal": [
                    "A world without secrets. Except mine."
                ]
            },
            "topicHints": "The value of silence."
        },
        "close_friend": {
            "greeting": [
                "Partner.",
                "Hey! The network is yours."
            ],
            "topics": {
                "background": [
                    "names are for friends. I have clients. You want to be a client?"
                ],
                "philosophy": [
                    "Truth is a commodity. It fluctuates. Buy low, sell high."
                ],
                "secret": [
                    "The birds... they watch. You think they're birds? Look closer."
                ],
                "goal": [
                    "A world without secrets. Except mine."
                ],
                "trust": [
                    "I never betray a client. Unless the price is right. For you? Free."
                ]
            },
            "topicHints": "Total omniscience."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_crypto": "Discreet. Good.",
        "gift_anonymous_tips": "Useful.",
        "compliment": "..."
    }
};
