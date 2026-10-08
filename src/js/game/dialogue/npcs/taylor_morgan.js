/**
 * Taylor Morgan (The Developer) dialogue
 * Generated from story_line/taylor_morgan.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "taylor_morgan",
    "personality": "friendly",
    "stages": {
        "stranger": {
            "greeting": [
                "Hello world.",
                "Pushing to prod?",
                "Hey."
            ],
            "topics": {},
            "topicHints": "Frameworks, IDEs, tabs vs spaces."
        },
        "friendly": {
            "greeting": [
                "Hey! Nice commit.",
                "Taylor here.",
                "How's the code?"
            ],
            "topics": {
                "background": [
                    "I started coding on a calculator. TI-83. Snake game. The rest is history."
                ]
            },
            "topicHints": "New JS libraries, Docker containers."
        },
        "acquaintance": {
            "greeting": [
                "Yo! Debugging session?",
                "Hey.",
                "What's the stack?"
            ],
            "topics": {
                "background": [
                    "I started coding on a calculator. TI-83. Snake game. The rest is history."
                ],
                "philosophy": [
                    "Full stack isn't a job, it's a lifestyle. You gotta know the DB *and* the CSS."
                ],
                "secret": [
                    "I have this patent. A tweeting toaster. It seemed like a good idea in 2014. Don't google it."
                ]
            },
            "topicHints": "The toaster patent (embarrassed), tech debt."
        },
        "friend": {
            "greeting": [
                "My favorite dev!",
                "Hey! Code review?",
                "Let's hack."
            ],
            "topics": {
                "background": [
                    "I started coding on a calculator. TI-83. Snake game. The rest is history."
                ],
                "philosophy": [
                    "Full stack isn't a job, it's a lifestyle. You gotta know the DB *and* the CSS."
                ],
                "secret": [
                    "I have this patent. A tweeting toaster. It seemed like a good idea in 2014. Don't google it."
                ],
                "side_project": [
                    "I'm working on something new. It automates the automation of the build script. Meta, right?"
                ]
            },
            "topicHints": "The SaaS dream, the joy of clean code."
        },
        "close_friend": {
            "greeting": [
                "Complete rewrite?",
                "Hey! Let's build something crazy."
            ],
            "topics": {
                "background": [
                    "I started coding on a calculator. TI-83. Snake game. The rest is history."
                ],
                "philosophy": [
                    "Full stack isn't a job, it's a lifestyle. You gotta know the DB *and* the CSS."
                ],
                "secret": [
                    "I have this patent. A tweeting toaster. It seemed like a good idea in 2014. Don't google it."
                ],
                "side_project": [
                    "I'm working on something new. It automates the automation of the build script. Meta, right?"
                ],
                "dream": [
                    "Passive income. That's the goal. Code once, get paid forever. Then? Beach."
                ]
            },
            "topicHints": "Freedom, mastery."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_keyboard": "Mechanical? Clicky? Nice.",
        "gift_coffee": "Runtime fuel. Thanks.",
        "compliment": "Thanks. My code is cleaner though."
    }
};
