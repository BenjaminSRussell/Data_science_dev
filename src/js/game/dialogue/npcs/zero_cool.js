/**
 * Zero (The Info Broker) dialogue
 * Generated from story_line/zero_cool.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "zero_cool",
    "personality": "mysterious",
    "stages": {
        "stranger": {
            "greeting": [
                "...",
                "Encrypt your comms.",
                "Who asks?"
            ],
            "topics": {},
            "topicHints": "Zero-days, exploits."
        },
        "friendly": {
            "greeting": [
                "Connection secure.",
                "Zero.",
                "Data received."
            ],
            "topics": {
                "background": [
                    "I don't exist. You're talking to a packet stream. A glitch."
                ]
            },
            "topicHints": "Corporate leaks, insecure passwords."
        },
        "acquaintance": {
            "greeting": [
                "I found something.",
                "Hey. Look.",
                "Upload complete."
            ],
            "topics": {
                "background": [
                    "I don't exist. You're talking to a packet stream. A glitch."
                ],
                "philosophy": [
                    "Everyone has a dirty secret. Everyone. I just index them."
                ],
                "secret": [
                    "You think I'm one person? Cute. We are legion. Or maybe I'm just bored."
                ]
            },
            "topicHints": "The fragility of privacy."
        },
        "friend": {
            "greeting": [
                "User authenticated.",
                "Hey! Nice firewall."
            ],
            "topics": {
                "background": [
                    "I don't exist. You're talking to a packet stream. A glitch."
                ],
                "philosophy": [
                    "Everyone has a dirty secret. Everyone. I just index them."
                ],
                "secret": [
                    "You think I'm one person? Cute. We are legion. Or maybe I'm just bored."
                ],
                "goal": [
                    "The Panopticon. Looking back at the watchers. That's the game."
                ]
            },
            "topicHints": "The collective identity hint."
        },
        "close_friend": {
            "greeting": [
                "Access Level: Audit.",
                "Hey! We trust you."
            ],
            "topics": {
                "background": [
                    "I don't exist. You're talking to a packet stream. A glitch."
                ],
                "philosophy": [
                    "Everyone has a dirty secret. Everyone. I just index them."
                ],
                "secret": [
                    "You think I'm one person? Cute. We are legion. Or maybe I'm just bored."
                ],
                "goal": [
                    "The Panopticon. Looking back at the watchers. That's the game."
                ],
                "warning": [
                    "Once you know, you can't unknow. Are you sure you want to open this file?"
                ]
            },
            "topicHints": "The ultimate leak."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_crypto": "Received. Confirmed.",
        "gift_exploits": "Juicy. Thanks.",
        "compliment": "Irrelevant."
    }
};
