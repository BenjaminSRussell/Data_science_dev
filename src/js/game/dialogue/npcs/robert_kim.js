/**
 * Robert Kim (The Seed Investor) dialogue
 * Generated from story_line/robert_kim.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "robert_kim",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Robert Kim. Nice to meet you.",
                "Do you have a pitch deck?",
                "Hello."
            ],
            "topics": {},
            "topicHints": "Valuations, seed rounds, burn rates."
        },
        "friendly": {
            "greeting": [
                "Hey! Good to see you.",
                "Hello.",
                "How's the startup?"
            ],
            "topics": {
                "background": [
                    "I was there in the 90s. The Wild West. We built the internet with duct tape and hope."
                ]
            },
            "topicHints": "Market fit, \"the hustle\"."
        },
        "acquaintance": {
            "greeting": [
                "Hello! Any updates?",
                "Robert here.",
                "Good to connect."
            ],
            "topics": {
                "background": [
                    "I was there in the 90s. The Wild West. We built the internet with duct tape and hope."
                ],
                "philosophy": [
                    "Your spreadsheet looks nice. But tell me... why YOU? Why this? Why now?"
                ],
                "secret_method": [
                    "The numbers have to work, yes. But I look for the spark. The fire in the eyes. That's what sells me."
                ]
            },
            "topicHints": "Gut feeling vs Data, dot-com stories."
        },
        "friend": {
            "greeting": [
                "My friend! How's it going?",
                "Hey! Let's chat."
            ],
            "topics": {
                "background": [
                    "I was there in the 90s. The Wild West. We built the internet with duct tape and hope."
                ],
                "philosophy": [
                    "Your spreadsheet looks nice. But tell me... why YOU? Why this? Why now?"
                ],
                "secret_method": [
                    "The numbers have to work, yes. But I look for the spark. The fire in the eyes. That's what sells me."
                ],
                "regret": [
                    "I passed on a company once. They're worth billions now. It taught me that sometimes, you have to take the leap."
                ]
            },
            "topicHints": "The fear of missing out, believing in founders."
        },
        "close_friend": {
            "greeting": [
                "Robert. I trust you.",
                "Hey! You've got that spark."
            ],
            "topics": {
                "background": [
                    "I was there in the 90s. The Wild West. We built the internet with duct tape and hope."
                ],
                "philosophy": [
                    "Your spreadsheet looks nice. But tell me... why YOU? Why this? Why now?"
                ],
                "secret_method": [
                    "The numbers have to work, yes. But I look for the spark. The fire in the eyes. That's what sells me."
                ],
                "regret": [
                    "I passed on a company once. They're worth billions now. It taught me that sometimes, you have to take the leap."
                ],
                "dream": [
                    "I'm looking for the next generation. Someone with the vision to change things. Are you that person?"
                ]
            },
            "topicHints": "Mentoring the next generation, partnership."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_business_plans": "Intriguing. I'll take a look.",
        "gift_fine_wine": "A nice gesture. Thank you.",
        "compliment": "Thank you. I appreciate the kind words."
    }
};
