/**
 * Agent Smith (The IRS Investigator) dialogue
 * Generated from story_line/agent_smith.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "agent_smith",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Agent Smith.",
                "Receipts?",
                "Compliance check."
            ],
            "topics": {},
            "topicHints": "Audits, deductions."
        },
        "friendly": {
            "greeting": [
                "Mr./Ms. [Name].",
                "Smith.",
                "File on time."
            ],
            "topics": {
                "background": [
                    "Numbers don't lie. People do. My job is to find the discrepancy between the two."
                ]
            },
            "topicHints": "Tax law changes, loopholes (closing them)."
        },
        "acquaintance": {
            "greeting": [
                "Everything in order?",
                "Hello.",
                "Clean ledger?"
            ],
            "topics": {
                "background": [
                    "Numbers don't lie. People do. My job is to find the discrepancy between the two."
                ],
                "philosophy": [
                    "Society is a contract. Taxes are the dues. You don't pay, you're stealing from everyone."
                ],
                "secret": [
                    "Stamps. Tiny squares of history. Perfectly perforated. Organized. I find them... soothing."
                ]
            },
            "topicHints": "The Stamp Collection."
        },
        "friend": {
            "greeting": [
                "Off the record?",
                "Hey! Good books."
            ],
            "topics": {
                "background": [
                    "Numbers don't lie. People do. My job is to find the discrepancy between the two."
                ],
                "philosophy": [
                    "Society is a contract. Taxes are the dues. You don't pay, you're stealing from everyone."
                ],
                "secret": [
                    "Stamps. Tiny squares of history. Perfectly perforated. Organized. I find them... soothing."
                ],
                "goal": [
                    "The perfect system. Where every transaction is accounted for. No shadows. No leaks."
                ]
            },
            "topicHints": "The beauty of order."
        },
        "close_friend": {
            "greeting": [
                "Smith. How are you?",
                "Hey! No audit today."
            ],
            "topics": {
                "background": [
                    "Numbers don't lie. People do. My job is to find the discrepancy between the two."
                ],
                "philosophy": [
                    "Society is a contract. Taxes are the dues. You don't pay, you're stealing from everyone."
                ],
                "secret": [
                    "Stamps. Tiny squares of history. Perfectly perforated. Organized. I find them... soothing."
                ],
                "goal": [
                    "The perfect system. Where every transaction is accounted for. No shadows. No leaks."
                ],
                "respect": [
                    "You keep clean books. I respect that. In my line of work, that's rare."
                ]
            },
            "topicHints": "Justice and fairness."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_gifts": "Are you attempting to bribe a federal officer?",
        "gift_compliance": "Good.",
        "compliment": "Facts are preferred."
    }
};
