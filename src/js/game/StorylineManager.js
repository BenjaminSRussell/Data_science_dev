// ... [previous code]

/**
 * Get available major decisions based on the current storyline phase
 * @param {string} phase - The current storyline phase
 * @returns {Array} - An array of available decisions
 */
getAvailableDecisions(phase) {
    const decisions = [];

    // ... [previous decision logic]

    // Ethics-based decisions
    if (ethics < -20) {
        const hasCriminalDecision = this.majorDecisions.some(d => d.decisionId === 'criminal_opportunity');
        if (!hasCriminalDecision) {
            decisions.push({
                id: 'criminal_opportunity',
                title: 'A Lucrative But Illegal Offer',
                description: 'A contact offers you $50,000 to manipulate stock market data to benefit their trading scheme. It\'s clearly illegal - market manipulation. But the money would change your life. No one would know. Probably.',
                context: 'You\'ve been struggling, or maybe you\'re just greedy. This is a lot of money. But it\'s fraud. If you get caught, you could face serious legal consequences. But if you don\'t get caught...',
                phase: phase,
                choices: {
                    accept: {
                        message: 'You take the deal. The money is incredible - $50,000 in your account. You\'ve crossed a line you can\'t uncross. You\'re now a criminal. The money feels good, but you\'re always looking over your shoulder.',
                        consequences: { ethics: -30, money: 50000, risk: 'arrest' },
                        progress: 20,
                        storyImpact: 'You\'ve chosen the dark path. The money is real, but so are the risks. Your relationships with ethical people suffer. New, shadier opportunities open up. The city\'s underworld knows your name.'
                    },
                    reject: {
                        message: 'You walk away. It\'s tempting - incredibly tempting - but you know better. The money isn\'t worth becoming someone you\'re not. You sleep well that night.',
                        consequences: { ethics: 10 },
                        progress: 5,
                        storyImpact: 'You\'ve reaffirmed your values. Walking away from easy money takes strength. The city respects those with principles, even if they\'re not the richest.'
                    }
                }
            });
        }
    }

    // Endgame decisions
    if (phase === 'endgame') {
        const hasSellDecision = this.majorDecisions.some(d => d.decisionId === 'sell_company');
        if (!hasSellDecision) {
            decisions.push({
                id: 'sell_company',
                title: 'The Exit Strategy',
                description: 'A tech giant offers to buy your entire operation. It is enough money to retire on an island. But they will dismantle your brand.',
                context: 'You built this from nothing. Is this the end, or just payday?',
                phase: 'endgame',
                choices: {
                    sell: {
                        message: 'You sign the papers. The wire transfer hits. You are rich, but unemployed. Was it worth it?',
                        consequences: { money: 1000000, reputation: -200, ethics: -100 },
                        progress: 100,
                        storyImpact: 'You sold out. You won capitalism, but lost your baby.'
                    },
                    keep: {
                        message: 'You tear up the contract. You are in this for the long haul. The tech giant vows to crush you.',
                        consequences: { money: 0, reputation: 500, ethics: 100 },
                        progress: 100,
                        storyImpact: 'You stood tall. You are a titan now, independent and feared.'
                    }
                }
            });
        }
    }

    return decisions;
}

// ... [remaining code]