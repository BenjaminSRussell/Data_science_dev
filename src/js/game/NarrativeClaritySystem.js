/**
 * NarrativeClaritySystem.js
 * Enhances story clarity with context, explanations, and narrative guidance
 * Provides clear story progression and character motivations
 */

export class NarrativeClaritySystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.narrativeContext = {
            currentChapter: 'Prologue',
            storyThemes: [],
            playerMotivation: 'survival',
            worldState: 'normal'
        };
    }

    /**
     * Get narrative context for current game state
     */
    getNarrativeContext() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const rank = this.gameState.rankIndex || 0;
        const money = this.gameState.money || 0;
        const reputation = this.gameState.reputation || 0;
        const ethics = this.gameState.characterStats?.getStat?.('ethics') || 0;

        // Determine chapter
        let chapter = 'Prologue';
        if (days < 7) chapter = 'Chapter 1: The Beginning';
        else if (days < 30) chapter = 'Chapter 2: Finding Your Way';
        else if (days < 90) chapter = 'Chapter 3: Building Your Reputation';
        else if (days < 180) chapter = 'Chapter 4: The Climb';
        else chapter = 'Chapter 5: At The Top';

        // Determine player motivation
        let motivation = 'survival';
        if (money < 0) motivation = 'survival';
        else if (money < 1000) motivation = 'stability';
        else if (money < 10000) motivation = 'growth';
        else if (money < 100000) motivation = 'success';
        else motivation = 'legacy';

        // Determine themes
        const themes = [];
        if (ethics < -30) themes.push('corruption', 'power');
        else if (ethics > 30) themes.push('integrity', 'justice');
        else themes.push('balance', 'survival');

        if (reputation > 1000) themes.push('influence');
        if (rank >= 5) themes.push('leadership');

        return {
            chapter,
            motivation,
            themes,
            days,
            rank: this.gameState.currentRank?.title || 'Unknown',
            situation: this.getSituationDescription(days, money, reputation, ethics)
        };
    }

    /**
     * Get situation description for narrative clarity
     */
    getSituationDescription(days, money, reputation, ethics) {
        if (days < 7) {
            return {
                title: 'Starting Out',
                description: 'You\'ve just arrived in Data City. Everything is new, and you\'re trying to find your footing. Every decision matters as you build your career from the ground up.',
                goals: ['Get your first job', 'Learn the basics', 'Meet people', 'Survive financially']
            };
        } else if (days < 30) {
            return {
                title: 'Building Foundations',
                description: 'You\'re starting to understand how this city works. You\'ve made some connections and learned valuable skills. Now it\'s time to prove yourself and climb the ladder.',
                goals: ['Build reputation', 'Complete projects', 'Strengthen relationships', 'Save money']
            };
        } else if (days < 90) {
            return {
                title: 'Rising Star',
                description: 'People are starting to notice your work. You have opportunities opening up, but also more responsibilities. The stakes are getting higher.',
                goals: ['Reach senior positions', 'Make major decisions', 'Build your network', 'Establish your reputation']
            };
        } else if (days < 180) {
            return {
                title: 'Established Professional',
                description: 'You\'ve become a recognized name in Data City. Your choices have shaped your path, and you\'re seeing the consequences of your decisions. The city responds to who you\'ve become.',
                goals: ['Reach the top', 'Complete your story', 'Leave your mark', 'Achieve your goals']
            };
        } else {
            return {
                title: 'Master of Your Domain',
                description: 'You\'ve reached the pinnacle. Your journey has been long, and you\'ve shaped Data City through your actions. What legacy will you leave?',
                goals: ['Reflect on your journey', 'Help others', 'Build something lasting', 'Complete your story']
            };
        }
    }

    /**
     * Get character motivation explanation
     */
    getCharacterMotivation(npcId) {
        const npc = this.gameState.npcManager?.getNPC?.(npcId);
        if (!npc) return null;

        const relationship = this.gameState.npcManager?.getRelationship?.(npcId) || 0;

        const motivations = {
            'alex_rivera': {
                low: 'Alex is your friend from college. They\'re trying to make it in the startup world, but it\'s tough. They value friendship and loyalty.',
                medium: 'Alex has been through ups and downs. They appreciate your support and want to help you succeed too. They believe in building things together.',
                high: 'Alex sees you as a true partner. They\'ve shared their dreams and fears with you. Your friendship means everything to them.'
            },
            'professor_higgins': {
                low: 'Professor Higgins is your mentor. He\'s dedicated to education and wants to see his students succeed. He believes knowledge should be shared.',
                medium: 'The Professor has taken a special interest in your growth. He sees potential in you and wants to guide you on the right path.',
                high: 'Professor Higgins considers you one of his best students. He\'s proud of your progress and wants to help you achieve your full potential.'
            },
            'emma_bloom': {
                low: 'Emma works at the library. She\'s quiet but passionate about learning. She loves helping people discover new knowledge.',
                medium: 'Emma has opened up to you. She shares your love of learning and enjoys your conversations about data science and technology.',
                high: 'Emma considers you a close friend. She trusts you with her thoughts and dreams. Your relationship has grown beyond casual acquaintance.'
            }
        };

        const npcMotivation = motivations[npcId];
        if (!npcMotivation) return null;

        if (relationship < 30) return npcMotivation.low;
        if (relationship < 70) return npcMotivation.medium;
        return npcMotivation.high;
    }

    /**
     * Get story explanation for current phase
     */
    getStoryExplanation() {
        const context = this.getNarrativeContext();
        const storylineManager = this.gameState.storylineManager;
        const arc = storylineManager?.currentArc;

        let explanation = `You are in ${context.chapter}. `;
        explanation += context.situation.description + '\n\n';

        if (arc) {
            explanation += `Current Story Arc: ${arc.name}\n`;
            explanation += `${arc.description}\n\n`;
        }

        explanation += 'Your Current Goals:\n';
        context.situation.goals.forEach((goal, index) => {
            explanation += `${index + 1}. ${goal}\n`;
        });

        return explanation;
    }

    /**
     * Get decision context for major choices
     */
    getDecisionContext(decisionId) {
        const decision = this.gameState.storylineManager?.getDecision?.(decisionId);
        if (!decision) return null;

        const context = this.getNarrativeContext();

        return {
            background: this.getDecisionBackground(decisionId, context),
            consequences: this.getConsequenceExplanation(decision),
            recommendation: this.getDecisionRecommendation(decision, context)
        };
    }

    /**
     * Get background for a decision
     */
    getDecisionBackground(decisionId, context) {
        const backgrounds = {
            'first_job_offer': 'You\'ve been struggling to make ends meet. This job offer comes at a critical time. The money would solve your immediate problems, but you\'re not sure about the company\'s ethics.',
            'whistleblower': 'You\'ve discovered something that doesn\'t sit right with you. Your career is on the line, but so is your conscience. What kind of person do you want to be?',
            'criminal_opportunity': 'Someone has made you an offer that would change your financial situation dramatically. But it\'s clearly illegal. The temptation is strong, but so are the risks.'
        };

        return backgrounds[decisionId] || 'You face an important decision that will shape your future.';
    }

    /**
     * Get explanation of consequences
     */
    getConsequenceExplanation(decision) {
        const explanations = [];
        
        Object.entries(decision.choices || {}).forEach(([choiceId, choice]) => {
            const cons = choice.consequences || {};
            let explanation = `${choiceId}: `;
            
            if (cons.ethics !== undefined) {
                explanation += `Ethics ${cons.ethics > 0 ? '+' : ''}${cons.ethics}. `;
            }
            if (cons.money !== undefined) {
                explanation += `Money ${cons.money > 0 ? '+' : ''}$${Math.abs(cons.money)}. `;
            }
            if (cons.reputation !== undefined) {
                explanation += `Reputation ${cons.reputation > 0 ? '+' : ''}${cons.reputation}. `;
            }
            if (cons.risk) {
                explanation += `Risk: ${cons.risk}. `;
            }

            explanations.push({
                choice: choiceId,
                explanation: explanation.trim(),
                message: choice.message
            });
        });

        return explanations;
    }

    /**
     * Get decision recommendation (non-binding)
     */
    getDecisionRecommendation(decision, context) {
        // Don't force a choice, just provide context
        return 'Consider how this decision aligns with your goals and values. Every choice shapes your story.';
    }

    /**
     * Get tutorial explanation for new players
     */
    getTutorialExplanation() {
        return {
            title: 'Welcome to Data City',
            sections: [
                {
                    title: 'Your Goal',
                    content: 'Build your career from Data Entry Clerk to Chief Data Officer. Complete tasks, build relationships, make decisions, and shape your story.'
                },
                {
                    title: 'How to Play',
                    content: 'Navigate the city, talk to NPCs, complete tasks, and make choices. Time passes as you take actions. Manage your money, energy, and reputation.'
                },
                {
                    title: 'Key Systems',
                    content: 'Tasks earn money and reputation. Relationships unlock new opportunities. Decisions have consequences. Your ethics affect your story path.'
                },
                {
                    title: 'Story Clarity',
                    content: 'Check the story panel to understand your current situation, goals, and story context. The narrative adapts to your choices.'
                }
            ]
        };
    }

    /**
     * Get world state explanation
     */
    getWorldStateExplanation() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const news = this.gameState.newsManager?.getCurrentNews?.() || [];
        const events = this.gameState.worldEventManager?.getActiveEvents?.() || [];

        return {
            time: `Day ${days} of your journey in Data City`,
            news: news.length > 0 ? `Recent news: ${news[0]?.headline || 'All quiet'}` : 'No major news',
            events: events.length > 0 ? `${events.length} active world events` : 'No active events',
            economy: this.getEconomyState(),
            social: this.getSocialState()
        };
    }

    /**
     * Get economy state
     */
    getEconomyState() {
        const money = this.gameState.money || 0;
        if (money < 0) return 'Struggling financially';
        if (money < 1000) return 'Making ends meet';
        if (money < 10000) return 'Comfortable';
        if (money < 100000) return 'Wealthy';
        return 'Extremely wealthy';
    }

    /**
     * Get social state
     */
    getSocialState() {
        const npcManager = this.gameState.npcManager;
        if (!npcManager) return 'No connections yet';

        const metNPCs = npcManager.getMetNPCs?.() || [];
        const highRelationships = metNPCs.filter(npc => {
            const rel = npcManager.getRelationship?.(npc.id) || 0;
            return rel > 70;
        });

        if (highRelationships.length === 0) return 'Building connections';
        if (highRelationships.length < 3) return 'A few close friends';
        return 'Well-connected';
    }
}

