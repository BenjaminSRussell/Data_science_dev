/**
 * Carlos (The Tech Store Owner) dialogue
 * Generated from story_line/carlos_tech.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "carlos_tech",
    "personality": "friendly",
    "stages": {
        "stranger": {
            "greeting": [
                "Welcome to the future!",
                "Need an upgrade?",
                "Hey."
            ],
            "topics": {},
            "topicHints": "GPU prices, refresh rates, RGB lighting."
        },
        "friendly": {
            "greeting": [
                "Yo! Check this out.",
                "Carlos here.",
                "Ready to upgrade?"
            ],
            "topics": {
                "background": [
                    "I don't just sell this stuff. I live it. Every GPU on this shelf? I've benchmarked it personally."
                ]
            },
            "topicHints": "Benchmarks, overclocking tips."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Good to see you.",
                "What's the build status?",
                "Yo."
            ],
            "topics": {
                "background": [
                    "I don't just sell this stuff. I live it. Every GPU on this shelf? I've benchmarked it personally."
                ],
                "philosophy": [
                    "Specs aren't everything. It's about the synergy. A 4090 implies a bottleneck if your CPU is trash."
                ],
                "secret": [
                    "To be honest... the electric bill here is insane. Let's just say the display units work the night shift."
                ]
            },
            "topicHints": "The crypto mining secret (hint), thermal paste application."
        },
        "friend": {
            "greeting": [
                "My man!",
                "Hey! I saved this GPU for you.",
                "Carlos Tech!"
            ],
            "topics": {
                "background": [
                    "I don't just sell this stuff. I live it. Every GPU on this shelf? I've benchmarked it personally."
                ],
                "philosophy": [
                    "Specs aren't everything. It's about the synergy. A 4090 implies a bottleneck if your CPU is trash."
                ],
                "secret": [
                    "To be honest... the electric bill here is insane. Let's just say the display units work the night shift."
                ],
                "dream": [
                    "Imagine a Beowulf cluster made of gaming consoles. I think I can do it."
                ]
            },
            "topicHints": "The supercomputer dream, hardware mods."
        },
        "close_friend": {
            "greeting": [
                "You're VIP status.",
                "Hey! Come check the back room."
            ],
            "topics": {
                "background": [
                    "I don't just sell this stuff. I live it. Every GPU on this shelf? I've benchmarked it personally."
                ],
                "philosophy": [
                    "Specs aren't everything. It's about the synergy. A 4090 implies a bottleneck if your CPU is trash."
                ],
                "secret": [
                    "To be honest... the electric bill here is insane. Let's just say the display units work the night shift."
                ],
                "dream": [
                    "Imagine a Beowulf cluster made of gaming consoles. I think I can do it."
                ],
                "advice": [
                    "Hardware is temporary. Skills are forever. But a good mechanical keyboard helps."
                ]
            },
            "topicHints": "True passion for tech, \"family discount\"."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_tips": "Thanks! Goes to the upgrade fund.",
        "gift_tech_reviews": "Ooh, haven't seen this one. Thanks.",
        "compliment": "I know my stuff. Thanks."
    }
};
