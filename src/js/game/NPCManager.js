// ... (rest of the file remains unchanged)

// Define personality traits and their relationship gain multipliers
const PERSONALITY_TRAITS = {
    friendly: { multiplier: 1.2, tone: 'warm' },
    professional: { multiplier: 1.0, tone: 'neutral' },
    mysterious: { multiplier: 0.8, tone: 'cool' },
    generous: { multiplier: 1.1, tone: 'kind' },
    aggressive: { multiplier: 0.9, tone: 'challenging' }
};

// ... (rest of the file remains unchanged)

// Define NPCs
const NPCs = {
    // ... (other NPCs remain unchanged)
    'mike_johnson': {
        id: 'mike_johnson',
        name: 'Mike Johnson',
        personality: 'professional', // Updated from 'friendly' to 'professional'
        gifts: ['networking', 'executive', 'business'],
        romanceOptions: true,
        storyReveals: [
            "People think I'm a natural networker.",
            "Truth is, I'm actually pretty introverted.",
            "These events? They drain me."
        ]
    },
    // ... (other NPCs remain unchanged)
};

// ... (rest of the file remains unchanged)