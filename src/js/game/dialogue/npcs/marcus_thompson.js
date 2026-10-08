/**
 * Marcus Thompson (The Scaling Guru) dialogue
 * Generated from story_line/marcus_thompson.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "marcus_thompson",
    "personality": "generous",
    "stages": {
        "stranger": {
            "greeting": [
                "Hey.",
                "Need something?",
                "Yo."
            ],
            "topics": {},
            "topicHints": "Server load, uptime, latency."
        },
        "friendly": {
            "greeting": [
                "Hey! How's the build?",
                "Good to see you.",
                "What's up?"
            ],
            "topics": {
                "background": [
                    "I've seen systems crumble under pressure. It's not pretty. That's why I obsess over the foundation."
                ]
            },
            "topicHints": "Infrastructure challenges, scalability tips."
        },
        "acquaintance": {
            "greeting": [
                "Good to see a familiar face.",
                "Hey, got a second?",
                "How's it going?"
            ],
            "topics": {
                "background": [
                    "I've seen systems crumble under pressure. It's not pretty. That's why I obsess over the foundation."
                ],
                "philosophy": [
                    "Code is easy. Architecture is hard. Anyone can write a script; few can build a system."
                ],
                "secret_hobby": [
                    "You see this watch? Mechanical. No API, no downtime. Just gears and physics. I love that honesty."
                ]
            },
            "topicHints": "The annoyance of \"spaghetti code\", tech debt."
        },
        "friend": {
            "greeting": [
                "My man!",
                "Hey! Grab a coffee?",
                "Good to see you!"
            ],
            "topics": {
                "background": [
                    "I've seen systems crumble under pressure. It's not pretty. That's why I obsess over the foundation."
                ],
                "philosophy": [
                    "Code is easy. Architecture is hard. Anyone can write a script; few can build a system."
                ],
                "secret_hobby": [
                    "You see this watch? Mechanical. No API, no downtime. Just gears and physics. I love that honesty."
                ],
                "war_story": [
                    "Black Friday, 2018. The servers were melting. I stayed up for 36 hours. But we stayed online. That was a good day."
                ]
            },
            "topicHints": "Respect for vintage tech (\"They don't make them like this anymore\"), family life."
        },
        "close_friend": {
            "greeting": [
                "Marcus here. Best architect in town.",
                "Hey! Always got time for you."
            ],
            "topics": {
                "background": [
                    "I've seen systems crumble under pressure. It's not pretty. That's why I obsess over the foundation."
                ],
                "philosophy": [
                    "Code is easy. Architecture is hard. Anyone can write a script; few can build a system."
                ],
                "secret_hobby": [
                    "You see this watch? Mechanical. No API, no downtime. Just gears and physics. I love that honesty."
                ],
                "war_story": [
                    "Black Friday, 2018. The servers were melting. I stayed up for 36 hours. But we stayed online. That was a good day."
                ],
                "dream": [
                    "One day I want to build something that outlasts me. A system so robust it runs for a hundred years."
                ]
            },
            "topicHints": "\"The Big One\" (fear of crash), legacy."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_tech_gadgets": "Nice build quality. Thanks.",
        "gift_books": "I'll read this later. Thanks.",
        "compliment": "Just doing my job, kid."
    }
};
