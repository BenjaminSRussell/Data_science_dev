/**
 * StorylineManager.js
 * Main storyline about dealing with world changes and difficulty
 */

import { pickState, applyState } from '../utils/StateSerializer.js';
import { ethicsBand } from '../data/ethics.js';

/**
 * Whether any decision in `manager.majorDecisions` was made in `phase`.
 * The single answer to "was a major decision made in this act?", shared by
 * StorylineManager and StoryBeatsSystem so callers don't re-derive it (#515).
 * Records carry the act they were made in (#2266); older saves without it
 * fall back to the catalog's fixed phase.
 * @param {{majorDecisions?: Array, getDecision?: Function}} manager
 * @param {string} phase
 * @returns {boolean}
 */
export function decisionMadeInPhase(manager, phase) {
    if (!manager || !phase) return false;
    const decisions = Array.isArray(manager.majorDecisions) ? manager.majorDecisions : [];
    return decisions.some(d => {
        if (!d) return false;
        if (d.phase) return d.phase === phase;
        const catalogEntry = manager.getDecision?.(d.decisionId);
        return Boolean(catalogEntry) && catalogEntry.phase === phase;
    });
}

export class StorylineManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.gameState.mainGame = null; // Will be set by MainGame
        this.storylinePhase = 'early'; // early, mid, late, endgame
        this.majorDecisions = [];
        this.storylineProgress = 0; // 0-100
        this.currentArc = null;
        this.lastDecisionCheck = 0; // Timestamp of last decision check
        this.decisionCooldown = 30000; // 30 seconds between decision checks
        // When each act began, for the journal (#2151, #1772)
        this.phaseHistory = [];
        // Injectable for tests; used by gamble outcomes (#1762)
        this.random = Math.random;
    }

    // Per-act flavour for each arc (#1421)
    static ARC_PHASE_TEXT = {
        corruption: {
            early: 'Small compromises add up. Nobody is watching yet.',
            mid: 'Your shortcuts are paying off, and people are starting to ask how.',
            late: 'You have power and enemies in equal measure. One slip could end it all.',
            endgame: 'Everything you built sits on the choices you made in the dark.'
        },
        integrity: {
            early: 'Doing it right costs more when you have nothing.',
            mid: 'Your name means something now, and the temptations get bigger.',
            late: 'People bring you the hard cases because they trust you.',
            endgame: 'Your legacy is the line you never crossed.'
        },
        survival: {
            early: 'Rent, clients and long nights. You take what comes.',
            mid: 'You are finding your footing, one trade-off at a time.',
            late: 'The stakes are higher and the grey areas wider.',
            endgame: 'Balance got you here. Now decide what it was all for.'
        }
    };

    /**
     * Initialize storyline
     */
    initialize() {
        this.storylinePhase = this.determinePhase();
        this.currentArc = this.getCurrentArc();
    }

    /**
     * Determine current phase
     */
    determinePhase() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const reputation = this.gameState.reputation || 0;

        // Time sets the baseline; a strong reputation moves the story on
        // sooner (#1420)
        const PHASES = ['early', 'mid', 'late', 'endgame'];
        const byDays = days < 30 ? 0 : days < 90 ? 1 : days < 180 ? 2 : 3;
        const byReputation = reputation >= 5000 ? 2 : reputation >= 1000 ? 1 : 0;
        return PHASES[Math.max(byDays, byReputation)];
    }

    /**
     * Get current story arc
     */
    getCurrentArc() {
        const ethics = this.gameState.characterStats?.ethics || 0;
        const phase = this.storylinePhase || 'early';

        let arc;
        const band = ethicsBand(ethics); // shared with the newspaper (#1190)
        if (band === 'dark') {
            arc = {
                name: 'The Dark Path',
                description: 'Your choices have consequences. The world reacts to your actions.',
                theme: 'corruption',
                challenges: ['legal_trouble', 'relationship_loss', 'isolation']
            };
        } else if (band === 'righteous') {
            arc = {
                name: 'The Righteous Path',
                description: 'You stand for what\'s right, but the world tests your resolve.',
                theme: 'integrity',
                challenges: ['financial_struggle', 'temptation', 'sacrifice']
            };
        } else {
            arc = {
                name: 'The Balanced Path',
                description: 'You navigate the complexities of life, trying to find balance.',
                theme: 'survival',
                challenges: ['uncertainty', 'competition', 'change']
            };
        }
        // The act changes the telling, not just ethics (#1421)
        const flavour = StorylineManager.ARC_PHASE_TEXT[arc.theme]?.[phase];
        return { ...arc, phase, description: flavour ? `${arc.description} ${flavour}` : arc.description };
    }

    /**
     * Process major decision
     */
    processDecision(decisionId, choice) {
        const decision = this.getDecision(decisionId);
        if (!decision) return null;
        // getDecision sees the full catalog, so stop a decision being made twice
        if (this.majorDecisions.some(d => d.decisionId === decisionId)) return null;

        const chosen = decision.choices[choice];
        if (!chosen) return null;
        // A gamble resolves to one of its outcomes (#1762)
        const result = this.resolveOutcome(chosen);

        // Apply consequences
        if (result.consequences) {
            this.applyConsequences(result.consequences);
        }

        // Track decision
        this.majorDecisions.push({
            decisionId,
            choice,
            // The act it was made in; the catalog's phase can be dynamic (#2266)
            phase: decision.phase || this.storylinePhase,
            timestamp: Date.now(),
            day: this.gameState.timeManager?.totalDays || 0,
            week: Math.floor((this.gameState.timeManager?.totalDays || 0) / 7),
            ...(result.outcome ? { outcome: result.outcome } : {})
        });

        // Update storyline progress
        this.storylineProgress = Math.min(100, this.storylineProgress + (result.progress || 0));

        // Check for phase transitions
        this.checkPhaseTransition();

        return {
            success: true,
            message: result.message,
            // Shown to the player too, not only stored (#1107, #1505)
            storyImpact: result.storyImpact,
            consequences: result.consequences,
            outcome: result.outcome,
            progress: this.storylineProgress
        };
    }

    /**
     * Pick a gamble's outcome. A choice with `outcomes: { chance, win, lose }`
     * becomes the win or lose branch (message/consequences/storyImpact);
     * other choices are returned as-is.
     */
    resolveOutcome(choice) {
        const o = choice?.outcomes;
        if (!o || !o.win || !o.lose) return choice;
        const won = this.random() < (Number(o.chance) || 0);
        const branch = won ? o.win : o.lose;
        return { ...choice, ...branch, outcome: won ? 'win' : 'lose' };
    }

    /**
     * Was a major decision made in this act? (#515)
     * @param {string} phase
     */
    hasDecisionInPhase(phase) {
        return decisionMadeInPhase(this, phase);
    }

    /**
     * Get decision by ID
     */
    getDecision(decisionId) {
        // Look in the full catalog: decisions already made (majorDecisions)
        // must still resolve for the journal, story beats and news (#1102, #2394)
        return this.getAvailableDecisions({ includeAll: true }).find(d => d.id === decisionId);
    }

    /**
     * Get available decisions based on phase and progress
     * @param {{includeAll?: boolean}} [opts] - includeAll returns every decision
     *   regardless of phase, ethics, money or whether it was already made
     */
    getAvailableDecisions({ includeAll = false } = {}) {
        const phase = this.storylinePhase;
        const ethics = this.gameState.characterStats?.ethics || 0;

        const decisions = [];

        // Early game decisions
        if (includeAll || phase === 'early') {
            // Only show first_job_offer if player hasn't made it yet
            const hasFirstJobDecision = this.majorDecisions.some(d => d.decisionId === 'first_job_offer');
            if (includeAll || !hasFirstJobDecision) {
                decisions.push({
                    id: 'first_job_offer',
                    title: 'Your First Big Opportunity',
                    description: 'A company offers you a job, but they want you to manipulate data to make their product look better. The pay is excellent - $5,000 upfront plus a salary. But you\'d be helping them deceive customers.',
                    context: 'You\'re struggling financially. Rent is due soon, and this job would solve your immediate problems. But you know it\'s wrong.',
                    phase: 'early',
                    choices: {
                        accept: {
                            message: 'You take the job. The money is good, but something feels wrong. You tell yourself it\'s just temporary, but you know you\'re compromising your values.',
                            consequences: { ethics: -10, money: 5000, reputation: 50 },
                            progress: 10,
                            storyImpact: 'You\'ve taken your first step down a path where money matters more than principles. The city notices.'
                        },
                        reject: {
                            message: 'You decline. It\'s harder financially, but you sleep better at night. You\'ll find another way. Your integrity is worth more than quick money.',
                            consequences: { ethics: 10, reputation: 20 },
                            progress: 5,
                            storyImpact: 'You\'ve chosen integrity over convenience. This decision shapes who you become. Opportunities will come, but they\'ll respect your values.'
                        },
                        negotiate: {
                            message: 'You negotiate for ethical practices. They agree to be more transparent, but pay less. It\'s a compromise, but one you can live with.',
                            consequences: { ethics: 5, money: 3000, reputation: 40 },
                            progress: 8,
                            storyImpact: 'You\'ve found a middle ground. You\'re learning to navigate the business world while staying true to yourself.'
                        }
                    }
                });
            }
            // [NEW] Hiring Decision
            const hasHiringDecision = this.majorDecisions.some(d => d.decisionId === 'hire_friend');
            if (includeAll || !hasHiringDecision) {
                decisions.push({
                    id: 'hire_friend',
                    title: 'Hiring Decision',
                    description: 'An old college friend asks for a job. They are fun but unqualified. A stranger with a perfect resume also applied.',
                    context: 'Your team needs help. Your friend needs a break. But the project is critical.',
                    phase: 'early',
                    choices: {
                        hire_friend: {
                            message: 'You hire your friend. Morale is up, but work is slow. You spend late nights fixing their mistakes.',
                            consequences: { ethics: 5, money: -2000, reputation: 10 },
                            progress: 8,
                            storyImpact: 'You chose loyalty over efficiency. Your team is tight-knit but chaotic.'
                        },
                        hire_pro: {
                            message: 'You hire the pro. The work is flawless. Your friend stops calling. Business is business.',
                            consequences: { ethics: -5, money: 5000, reputation: 30 },
                            progress: 10,
                            storyImpact: 'You chose competence over connection. The company runs like a machine.'
                        }
                    }
                });
            }
        }

        // Mid game decisions
        if (includeAll || phase === 'mid') {
            const hasWhistleblowerDecision = this.majorDecisions.some(d => d.decisionId === 'whistleblower');
            if (includeAll || !hasWhistleblowerDecision) {
                decisions.push({
                    id: 'whistleblower',
                    title: 'You Discover Something Wrong',
                    description: 'While working on a project, you discover your company has been systematically hiding negative data about their product. Customers are being misled, and it could cause real harm. You have evidence.',
                    context: 'You\'ve built a career here. Exposing this could destroy your job, your reputation in the industry, and your financial stability. But people are being hurt. What kind of person are you?',
                    phase: 'mid',
                    choices: {
                        expose: {
                            message: 'You go public with the evidence. The story breaks, the company faces consequences, and you lose your job. But you did the right thing. Some people call you a hero, others a traitor. Your career path changes forever.',
                            // Losing the job is real: you drop a rank (#1504)
                            consequences: { ethics: 20, reputation: -50, money: -10000, fired: true },
                            progress: 15,
                            storyImpact: 'You\'ve chosen truth over security. The city respects your courage, but your path forward will be different. New opportunities emerge from those who value integrity.'
                        },
                        stay_quiet: {
                            message: 'You stay quiet. The money keeps coming, your career continues smoothly, but the guilt weighs on you. Every time you see the product, you remember what you know. You\'ve chosen comfort over conscience.',
                            consequences: { ethics: -15, money: 5000 },
                            progress: 5,
                            storyImpact: 'You\'ve chosen silence. The money is good, but you\'ve lost something of yourself. The city remembers those who look the other way.'
                        },
                        internal_report: {
                            message: 'You report internally through proper channels. The issue is addressed quietly, changes are made, and you\'re recognized for your integrity. It\'s handled without public scandal.',
                            consequences: { ethics: 5, reputation: 30 },
                            progress: 10,
                            storyImpact: 'You\'ve found a balanced approach. You did the right thing while working within the system. Your reputation grows among those who value both ethics and professionalism.'
                        }
                    }
                });
            }
            // [NEW] Investment Decision
            const hasInvestmentDecision = this.majorDecisions.some(d => d.decisionId === 'startup_investment');
            if (includeAll || (!hasInvestmentDecision && this.gameState.money > 20000)) {
                decisions.push({
                    id: 'startup_investment',
                    title: 'Risky Investment',
                    description: 'A charismatic founder pitches you a "revolutionary" AI startup. It sounds like vaporware, but if it hits, it hits big.',
                    context: 'You have some cash reserves. Do you gamble on the future?',
                    phase: 'mid',
                    choices: {
                        invest: {
                            // A real gamble: $10,000 in, 35% chance it pays 4x (#1762)
                            message: 'You write a $10,000 check and wait.',
                            consequences: { money: -10000 },
                            stakes: 'Costs $10,000. 35% chance it returns $40,000.',
                            outcomes: {
                                chance: 0.35,
                                win: {
                                    message: 'You write the check. Against the odds the tech works, and a buyout turns your $10,000 into $40,000.',
                                    consequences: { money: 30000, reputation: 80 },
                                    storyImpact: 'You took a shot at the moon and hit. People call it vision; you know it was luck.'
                                },
                                lose: {
                                    message: 'You write the check. Six months later the tech fails and your $10,000 is gone, but you learned a lot.',
                                    consequences: { money: -10000, reputation: 30 },
                                    storyImpact: 'You took a shot at the moon. You missed, but people respect the ambition.'
                                }
                            },
                            progress: 12,
                            storyImpact: 'You took a shot at the moon.'
                        },
                        decline: {
                            message: 'You pass. The startup folds a month later. You kept your money, but feel a bit boring.',
                            // Declining keeps your cash; it doesn't create any (#1762)
                            consequences: { reputation: 0 },
                            progress: 5,
                            storyImpact: 'You played it safe. Your empire is built on solid ground, not dreams.'
                        }
                    }
                });
            }
        }

        // Ethics-based decisions
        if (includeAll || ethics < -20) {
            const hasCriminalDecision = this.majorDecisions.some(d => d.decisionId === 'criminal_opportunity');
            if (includeAll || !hasCriminalDecision) {
                decisions.push({
                    id: 'criminal_opportunity',
                    title: 'A Lucrative But Illegal Offer',
                    description: 'A contact offers you $50,000 to manipulate stock market data to benefit their trading scheme. It\'s clearly illegal - market manipulation. But the money would change your life. No one would know. Probably.',
                    context: 'You\'ve been struggling, or maybe you\'re just greedy. This is a lot of money. But it\'s fraud. If you get caught, you could face serious legal consequences. But if you don\'t get caught...',
                    // Offered in whatever act the player is in, so the catalog
                    // has no fixed act for it; the full-catalog view must not
                    // report the current act as the one it was made in (#515)
                    phase: includeAll ? undefined : phase,
                    choices: {
                        accept: {
                            message: 'You take the deal. The money is incredible - $50,000 in your account. You\'ve crossed a line you can\'t uncross. You\'re now a criminal. The money feels good, but you\'re always looking over your shoulder.',
                            consequences: { ethics: -30, money: 50000, risk: 'arrest' },
                            // Say so before the click (#1503)
                            stakes: 'You WILL be arrested and jailed.',
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


        // Late-game decision: "The Ultimate Test" (#1761, #1501)
        if (includeAll || phase === 'late') {
            const hasAuditDecision = this.majorDecisions.some(d => d.decisionId === 'model_audit');
            if (includeAll || !hasAuditDecision) {
                decisions.push({
                    id: 'model_audit',
                    title: 'The Ultimate Test',
                    description: 'An outside audit finds that the flagship model you built quietly denies loans to entire neighborhoods. A regulator has not noticed yet. Your biggest client wants it buried before their IPO.',
                    context: 'Everything you have built rests on this model. Coming clean could cost you the client, the money and your reputation. Burying it keeps the party going, until it does not.',
                    phase: 'late',
                    choices: {
                        disclose: {
                            message: 'You publish the audit, notify the regulator and retrain the model. The client walks. The press calls you the data scientist who told the truth.',
                            consequences: { ethics: 25, reputation: 150, money: -15000 },
                            progress: 20,
                            storyImpact: 'You chose accountability over the payday. The industry now knows your name for the right reasons.'
                        },
                        fix_quietly: {
                            message: 'You patch the model without telling anyone. The bias shrinks, the IPO goes ahead, and nobody ever knows how close it came.',
                            consequences: { ethics: 5, money: 10000 },
                            progress: 12,
                            storyImpact: 'You fixed the harm but kept the secret. Good outcome, uneasy conscience.'
                        },
                        bury: {
                            message: 'You delete the audit. The client\'s IPO makes you rich. Somewhere, a family is denied a home loan by a model with your name on it.',
                            consequences: { ethics: -30, money: 40000, reputation: -50 },
                            progress: 15,
                            storyImpact: 'You buried it. The money is real, and so is the risk that someone digs it back up.'
                        }
                    }
                });
            }
        }

        // Endgame decisions
        if (includeAll || phase === 'endgame') {
            const hasSellDecision = this.majorDecisions.some(d => d.decisionId === 'sell_company');
            if (includeAll || !hasSellDecision) {
                decisions.push({
                    id: 'sell_company',
                    title: 'The Exit Strategy',
                    description: 'A tech giant offers to buy your entire operation. It is enough money to retire on an island. But they will dismantle your brand.',
                    context: 'You built this from nothing. Is this the end, or just payday?',
                    phase: 'endgame',
                    choices: {
                        sell: {
                            message: 'You sign the papers. The wire transfer hits. You are rich, but unemployed. Was it worth it?',
                            consequences: { money: 1000000, reputation: 200 },
                            progress: 100,
                            storyImpact: 'You sold out. You won capitalism, but lost your baby.'
                        },
                        keep: {
                            message: 'You tear up the contract. You are in this for the long haul. The tech giant vows to crush you.',
                            consequences: { reputation: 500, ethics: 50 },
                            progress: 100,
                            storyImpact: 'You stood tall. You are a titan now, independent and feared.'
                        }
                    }
                });
            }
        }

        return decisions;
    }

    /**
     * Apply consequences
     */
    applyConsequences(consequences) {
        if (consequences.ethics !== undefined) {
            this.gameState.characterStats?.modifyEthics(consequences.ethics);
        }
        if (consequences.money !== undefined) {
            this.gameState.money = (this.gameState.money || 0) + consequences.money;
        }
        if (consequences.reputation !== undefined) {
            this.gameState.reputation = (this.gameState.reputation || 0) + consequences.reputation;
        }
        if (consequences.fired) {
            // Fired: back down one rank (#1504)
            const rank = Number(this.gameState.rankIndex) || 0;
            this.gameState.rankIndex = Math.max(0, rank - 1);
        }
        if (consequences.risk === 'arrest') {
            // Trigger arrest event
            if (this.gameState.mainGame) {
                this.gameState.mainGame?.handleArrest('Illegal activity');
            }
        }
    }

    /**
     * Check for phase transition
     */
    checkPhaseTransition() {
        const newPhase = this.determinePhase();
        if (newPhase !== this.storylinePhase) {
            const oldPhase = this.storylinePhase;
            this.storylinePhase = newPhase;
            this.currentArc = this.getCurrentArc();
            this.recordPhase(newPhase);

            // Show act transition screen
            if (this.gameState.mainGame && this.gameState.mainGame.actTransitionScreen) {
                const summary = this.gameState.mainGame.actTransitionScreen.generateSummary(oldPhase);
                this.gameState.mainGame.actTransitionScreen.showActTransition(oldPhase, newPhase, summary);
            }

            // Trigger phase transition event
            return {
                phaseChanged: true,
                oldPhase,
                newPhase,
                arc: this.currentArc
            };
        }

        return { phaseChanged: false };
    }

    /**
     * Remember the day an act began (once per act) (#2151, #1772)
     */
    recordPhase(phase) {
        if (!Array.isArray(this.phaseHistory)) this.phaseHistory = [];
        if (phase === 'early' || this.phaseHistory.some(p => p.phase === phase)) return;
        this.phaseHistory.push({ phase, day: this.gameState.timeManager?.totalDays || 0 });
    }

    /**
     * Get current storyline status
     */
    getStatus() {
        return {
            phase: this.storylinePhase,
            progress: this.storylineProgress,
            arc: this.currentArc,
            decisions: this.majorDecisions
        };
    }

    /**
     * Check for and trigger available major decisions
     * Returns the decision if one is available, null otherwise
     */
    checkForAvailableDecisions() {
        const available = this.getAvailableDecisions();

        // Filter out decisions that have already been made
        const madeDecisionIds = this.majorDecisions.map(d => d.decisionId);
        const newDecisions = available.filter(d => !madeDecisionIds.includes(d.id));

        return newDecisions.length > 0 ? newDecisions[0] : null;
    }

    /**
     * Trigger a major decision if one is available
     * Returns true if a decision was triggered, false otherwise
     */
    triggerDecisionIfAvailable() {
        const now = Date.now();

        // Cooldown check - don't check too frequently
        if (now - this.lastDecisionCheck < this.decisionCooldown) {
            return false;
        }

        this.lastDecisionCheck = now;

        const decision = this.checkForAvailableDecisions();
        if (!decision) return false;

        // Notify the game to show the decision modal
        if (this.gameState.mainGame && this.gameState.mainGame.storyUI) {
            this.gameState.mainGame.storyUI.showDecisionModal(decision);
            return true;
        }

        return false;
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['storylinePhase', 'majorDecisions', 'storylineProgress', 'currentArc', 'phaseHistory']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['storylinePhase', 'majorDecisions', 'storylineProgress', 'currentArc', 'phaseHistory']);
        if (!Array.isArray(this.phaseHistory)) this.phaseHistory = [];
    }
}
