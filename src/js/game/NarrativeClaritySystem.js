/**
 * NarrativeClaritySystem.js
 * Enhances story clarity with context, explanations, and narrative guidance
 * Provides clear story progression and character motivations
 */

export class NarrativeClaritySystem {
    constructor(gameState) {
        this.gameState = gameState;
        // Context is derived from live game state on every call
        // (getNarrativeContext); the old cached this.narrativeContext was
        // never read or updated (#1528)
    }

    /** Short player-facing descriptions of each motivation (#1533) */
    static MOTIVATION_TEXT = {
        survival: 'Survival: keep the lights on.',
        stability: 'Stability: build a safety net.',
        growth: 'Growth: turn skills into opportunities.',
        success: 'Success: make your mark.',
        legacy: 'Legacy: build something that outlasts you.'
    };

    /**
     * Get narrative context for current game state
     */
    getNarrativeContext() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const rank = this.gameState.rankIndex || 0;
        const money = this.gameState.money || 0;
        const reputation = this.gameState.reputation || 0;
        // Ethics lives on characterStats.ethics, not in the stats table
        const cs = this.gameState.characterStats;
        const ethics = typeof cs?.ethics === 'number' ? cs.ethics : (cs?.getStat?.('ethics') || 0);

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
    getPhaseSituation(days) {
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
     * The day-based phase, adjusted for where the player actually stands:
     * debt, reputation and ethics change the description and goals (#1529)
     */
    getSituationDescription(days, money = 0, reputation = 0, ethics = 0) {
        const base = this.getPhaseSituation(days);
        const notes = [];
        const goals = [...base.goals];
        if (money < 0) {
            notes.push('You\'re in debt, and every choice is shadowed by what you owe.');
            goals.unshift('Get out of debt');
        } else if (money >= 100000) {
            notes.push('Money is no longer the problem. What you do with it is.');
        }
        if (reputation > 1000) {
            notes.push('Your name opens doors across the city.');
            goals.push('Use your influence wisely');
        } else if (reputation < 0) {
            notes.push('People in the industry are wary of you.');
            goals.unshift('Repair your reputation');
        }
        if (ethics < -30) {
            notes.push('The shortcuts you\'ve taken are starting to follow you.');
        } else if (ethics > 30) {
            notes.push('You\'ve earned a reputation for doing things the right way.');
        }
        return {
            ...base,
            description: notes.length ? `${base.description} ${notes.join(' ')}` : base.description,
            goals: [...new Set(goals)]
        };
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

        // If no hardcoded motivation exists, generate a generic fallback based on NPC type and personality
        if (!npcMotivation) {
            return this.generateFallbackMotivation(npc, relationship);
        }

        if (relationship < 30) return npcMotivation.low;
        if (relationship < 70) return npcMotivation.medium;
        return npcMotivation.high;
    }

    /**
     * Generate a fallback motivation for NPCs without hardcoded entries
     * Uses NPC type and personality to create contextual motivation text
     */
    generateFallbackMotivation(npc, relationship) {
        const name = npc.name;
        const type = npc.type || 'acquaintance';
        const personality = npc.personality || 'neutral';
        const title = npc.title || 'someone';

        // Generate motivation based on NPC type and relationship level
        if (relationship < 30) {
            // Low relationship - they're just an acquaintance
            return this.generateLowMotivation(name, type, personality, title);
        } else if (relationship < 70) {
            // Medium relationship - they're warming up to you
            return this.generateMediumMotivation(name, type, personality, title);
        } else {
            // High relationship - they consider you important
            return this.generateHighMotivation(name, type, personality, title);
        }
    }

    /**
     * Generate low relationship motivation
     */
    generateLowMotivation(name, type, personality, title) {
        const typeTexts = {
            mentor: `${name} is your mentor. They're dedicated to helping people grow and believe in sharing knowledge with those who seek it.`,
            business: `${name} is a business professional. They're focused on career success and value reliable partners in their work.`,
            investor: `${name} is an investor. They're always looking for promising opportunities and talented individuals to work with.`,
            shopkeeper: `${name} runs their shop with dedication. They value friendly customers and enjoy the day-to-day interactions with people in the community.`,
            friend: `${name} is someone you've met. They seem approachable and friendly, always open to new connections and conversations.`,
            rival: `${name} is a competitor in your field. They're driven by ambition and the challenge of being the best.`,
            criminal: `${name} operates in the shadows. They're mysterious and careful about who they trust with their business.`,
            romance: `${name} is someone who caught your attention. They're living their own life and pursuing their own interests.`,
            authority: `${name} works in an official capacity. They're dedicated to their responsibilities and maintaining order.`
        };

        return typeTexts[type] || `${name} is a ${title}. You've just met them and don't know much about what drives them yet.`;
    }

    /**
     * Generate medium relationship motivation
     */
    generateMediumMotivation(name, type, personality, title) {
        const typeTexts = {
            mentor: `${name} has taken an interest in your development. They see potential in you and want to guide you toward success. They appreciate your willingness to learn.`,
            business: `${name} sees you as a reliable professional. You've demonstrated competence, and they're interested in finding ways to work together.`,
            investor: `${name} is watching your progress with interest. They're starting to see the potential in what you're building.`,
            shopkeeper: `${name} has become more than just a shopkeeper to you. They enjoy your visits and conversations, and appreciate your patronage.`,
            friend: `${name} has warmed up to you. You've shared some good times together, and they're starting to trust you more.`,
            rival: `${name} respects your skills and dedication. The competition brings out the best in both of you, and they see you as a worthy challenger.`,
            criminal: `${name} is becoming more comfortable with you. They're starting to trust you with information and opportunities.`,
            romance: `${name} has shown genuine interest in you. You've had some meaningful moments together, and there's a growing connection between you.`,
            authority: `${name} has come to know you through your interactions. They respect your attempts to follow proper procedures and conduct.`
        };

        return typeTexts[type] || `${name} is warming up to you. They're starting to see you as more than just a casual acquaintance.`;
    }

    /**
     * Generate high relationship motivation
     */
    generateHighMotivation(name, type, personality, title) {
        const typeTexts = {
            mentor: `${name} considers you a standout student. They're proud of your progress and deeply invested in your continued growth and success.`,
            business: `${name} values you highly as a partner. They trust your judgment and are excited about the opportunities you'll create together.`,
            investor: `${name} believes in you and what you're building. They're ready to back you financially and open doors for you in the industry.`,
            shopkeeper: `${name} considers you a true friend. You've become one of their favorite people to see, and they go out of their way to help you.`,
            friend: `${name} sees you as a close friend. They trust you completely and want to support you in all your endeavors.`,
            rival: `${name} respects you deeply as an equal. You bring out the best in each other, and there's a strong mutual appreciation beneath the competition.`,
            criminal: `${name} trusts you completely. You've proven yourself reliable, and they're willing to share their most valuable opportunities with you.`,
            romance: `${name} has grown deeply attached to you. You mean a lot to them, and they see a real future with you.`,
            authority: `${name} has come to respect and appreciate you. They see you as a responsible and trustworthy person in your dealings with them.`
        };

        return typeTexts[type] || `${name} considers you important in their life. You have a strong connection, and they value your presence and friendship.`;
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
            'criminal_opportunity': 'Someone has made you an offer that would change your financial situation dramatically. But it\'s clearly illegal. The temptation is strong, but so are the risks.',
            // The rest of the decisions StorylineManager can surface (#1532)
            'hire_friend': 'Your workload is growing and you need help. An old friend needs a break, but a stranger has the stronger resume. Loyalty and competence pull in different directions.',
            'startup_investment': 'You finally have some cash in reserve, and a founder with a big pitch wants a piece of it. It could be visionary or it could be vaporware.',
            'model_audit': 'The model that made your name has been quietly discriminating, and an audit proves it. You are the one who decides whether the world finds out.',
            'sell_company': 'Everything you built has caught the eye of a tech giant. Their offer would set you up for life, but your company as you know it would disappear.'
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
                // Keep the sign for losses: "Money -$500", not "Money $500"
                explanation += `Money ${cons.money > 0 ? '+' : cons.money < 0 ? '-' : ''}$${Math.abs(cons.money)}. `;
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
        // Non-binding: point out which choice fits the player's current
        // motivation and themes, using this decision's real consequences (#1531)
        const fallback = 'Consider how this decision aligns with your goals and values. Every choice shapes your story.';
        const choices = Object.entries(decision?.choices || {});
        if (choices.length === 0) return fallback;
        const ctx = context || this.getNarrativeContext();
        const themes = ctx.themes || [];
        const motivation = ctx.motivation || 'survival';

        let focus;
        let label;
        if (themes.includes('integrity')) { focus = 'ethics'; label = 'your principles'; }
        else if (themes.includes('corruption')) { focus = 'money'; label = 'the path you\'re already on'; }
        else if (motivation === 'survival' || motivation === 'stability') { focus = 'money'; label = 'your finances'; }
        else { focus = 'reputation'; label = 'your standing'; }

        const value = ([, c]) => Number(c?.consequences?.[focus]) || 0;
        const [bestId] = choices.reduce((best, cur) => (value(cur) > value(best) ? cur : best));
        const name = bestId.replace(/_/g, ' ');
        const riskiest = choices.find(([, c]) => c?.consequences?.risk);
        const risk = riskiest ? ` "${riskiest[0].replace(/_/g, ' ')}" carries risk: ${riskiest[1].consequences.risk}.` : '';
        return `Thinking about ${label}, "${name}" fits best.${risk} It's your call. Every choice shapes your story.`;
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
            news: news.length > 0 ? `Recent news: ${news[0]?.title || news[0]?.text || 'All quiet'}` : 'No major news',
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

