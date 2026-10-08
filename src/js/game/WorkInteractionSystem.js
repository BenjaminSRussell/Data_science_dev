/**
 * WorkInteractionSystem.js
 * Work interactions: coworkers, boss, promotions, quitting
 */

import { pickState, applyState } from '../utils/StateSerializer.js';
import { BOSSES } from '../data/bosses.js';

export class WorkInteractionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.coworkers = this.generateCoworkers();
        this.boss = this.generateBoss();
    }

    /**
     * Generate dynamic coworkers
     */
    generateCoworkers() {
        return [
            {
                id: 'coworker_sarah',
                name: 'Sarah',
                personality: 'friendly',
                relationship: 0,
                dialogue: this.getCoworkerDialogue.bind(this, 'friendly')
            },
            {
                id: 'coworker_mike',
                name: 'Mike',
                personality: 'competitive',
                relationship: 0,
                dialogue: this.getCoworkerDialogue.bind(this, 'competitive')
            },
            {
                id: 'coworker_jessica',
                name: 'Jessica',
                personality: 'gossipy',
                relationship: 0,
                dialogue: this.getCoworkerDialogue.bind(this, 'gossipy')
            }
        ];
    }

    /**
     * Generate boss
     */
    generateBoss() {
        // Reuse the real BOSSES roster TaskSystem uses (#1811)
        const template = BOSSES[Math.floor(Math.random() * BOSSES.length)] || {};
        return {
            id: template.id || 'boss',
            name: template.name || this.getBossName(),
            title: template.title,
            personality: template.personality || 'professional',
            relationship: 0,
            promotionReadiness: 0, // 0-100
            dialogue: this.getBossDialogue.bind(this)
        };
    }

    getBossName() {
        const names = ['Patricia Chen', 'Robert Martinez', 'Jennifer Kim', 'David Thompson'];
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * Talk to coworker
     */
    talkToCoworker(coworkerId) {
        const coworker = this.coworkers.find(c => c.id === coworkerId);
        if (!coworker) return null;

        const relationship = coworker.relationship;
        const dialogue = coworker.dialogue(relationship);

        // Small relationship gain from talking
        coworker.relationship = Math.min(100, coworker.relationship + 1);

        return {
            coworker,
            dialogue,
            relationship: coworker.relationship
        };
    }

    /**
     * Get coworker dialogue based on personality and relationship
     */
    getCoworkerDialogue(personality, relationship) {
        if (personality === 'friendly') {
            if (relationship < 20) {
                return [
                    "Hey! How's your day going?",
                    "I'm still figuring out this new system. You having any luck?",
                    "Coffee break soon? I need it."
                ];
            } else if (relationship < 50) {
                return [
                    "Oh hey! I was just thinking about that project you mentioned.",
                    "Want to grab lunch together? I know a great place.",
                    "You know, you're actually pretty good at this. I'm impressed."
                ];
            } else {
                return [
                    "You're my favorite person to work with, honestly.",
                    "I heard they're looking for someone to lead the new project. You should apply.",
                    "If you ever need a reference, I've got your back."
                ];
            }
        } else if (personality === 'competitive') {
            if (relationship < 20) {
                return [
                    "I finished that report already. What about you?",
                    "The boss seems to like my work better lately.",
                    "You know, speed matters in this industry."
                ];
            } else if (relationship < 50) {
                return [
                    "Okay, you're actually pretty good. I'll admit it.",
                    "We should team up on the next project. We'd crush it.",
                    "I respect your work, even if I don't always show it."
                ];
            } else {
                return [
                    "You know what? You're the only one here who can keep up with me.",
                    "I'd rather work with you than against you.",
                    "Let's dominate this place together."
                ];
            }
        } else { // gossipy
            if (relationship < 20) {
                return [
                    "Did you hear about what happened in accounting?",
                    "I shouldn't say this, but...",
                    "Between you and me, the boss is stressed about something."
                ];
            } else if (relationship < 50) {
                return [
                    "I trust you, so I'm telling you this first...",
                    "The rumor is they're planning layoffs. Be careful.",
                    "You're good people. I want to make sure you're okay."
                ];
            } else {
                return [
                    "You're like family to me. I'll always look out for you.",
                    "I heard something that could help your career. Let's talk.",
                    "Whatever happens, we stick together, okay?"
                ];
            }
        }
    }

    /**
     * Talk to boss
     */
    talkToBoss() {
        const relationship = this.boss.relationship;
        const promotionReadiness = this.boss.promotionReadiness;
        const dialogue = this.getBossDialogue(relationship, promotionReadiness);

        return {
            boss: this.boss,
            dialogue,
            relationship: this.boss.relationship,
            promotionReadiness: this.boss.promotionReadiness
        };
    }

    /**
     * Get boss dialogue
     */
    getBossDialogue(relationship, promotionReadiness) {
        if (relationship < 20) {
            return [
                "What do you need? I'm busy.",
                "Your work has been... adequate. Keep it up.",
                "We need better results. Step it up."
            ];
        } else if (relationship < 50) {
            return [
                "Good work on that last project. I noticed.",
                "I'm considering you for some bigger opportunities. Show me what you've got.",
                "You're reliable. That matters around here."
            ];
        } else {
            if (promotionReadiness > 70) {
                return [
                    "I've been watching your progress. You're ready for more responsibility.",
                    "There's an opening coming up. I think you'd be perfect for it.",
                    "You've earned this. Let's talk about your future here."
                ];
            } else {
                return [
                    "You're one of my best employees. Keep this up.",
                    "I appreciate your dedication. It doesn't go unnoticed.",
                    "You're doing great work. Just keep building your skills."
                ];
            }
        }
    }

    /**
     * Ask for promotion
     */
    askForPromotion() {
        const readiness = this.boss.promotionReadiness;
        const relationship = this.boss.relationship;
        const reputation = this.gameState.reputation || 0;
        // jobSystem.completedTasks alone never grows from chart work (#1542)
        const completedTasks = this.getCompletedTaskCount();

        // Calculate promotion chance
        let success = false;
        let message = "";

        if (readiness > 80 && relationship > 60 && reputation > 500 && completedTasks > 20) {
            success = true;
            message = "Congratulations! You got the promotion. Your salary increases and you have more responsibility.";
            this.boss.promotionReadiness = 0; // Reset
            this.gameState.reputation += 100;
        } else {
            // Identify the real blocker(s) so the feedback matches what's actually holding the player back
            const blockers = [];
            if (readiness <= 80) blockers.push("readiness");
            if (relationship <= 60) blockers.push("relationship");
            if (reputation <= 500) blockers.push("reputation");
            if (completedTasks <= 20) blockers.push("completedTasks");

            if (blockers.length === 1) {
                switch (blockers[0]) {
                    case "relationship":
                        message = "Your boss doesn't trust you enough yet. Build a stronger relationship before asking again.";
                        break;
                    case "reputation":
                        message = "You need a stronger reputation in the field before you're ready for this role.";
                        break;
                    case "completedTasks":
                        message = "You haven't completed enough projects yet. Finish more tasks to prove you're ready.";
                        break;
                    default:
                        if (readiness > 60) {
                            message = "Not quite yet, but you're close. Keep up the good work and check back in a few weeks.";
                            this.boss.promotionReadiness += 10;
                        } else {
                            message = "I appreciate your ambition, but you need more experience. Focus on your current role first.";
                            this.boss.promotionReadiness += 5;
                        }
                }
            } else {
                if (readiness > 60) {
                    message = "Not quite yet, but you're close. Keep up the good work and check back in a few weeks.";
                    this.boss.promotionReadiness += 10;
                } else {
                    message = "I appreciate your ambition, but you need more experience. Focus on your current role first.";
                    this.boss.promotionReadiness += 5;
                }
            }
        }

        // Relationship impact
        if (success) {
            this.boss.relationship += 10;
        } else if (readiness < 40) {
            this.boss.relationship -= 2; // Slightly annoyed if asked too early
        }
        this.clampBoss();

        return {
            success,
            message,
            newPromotionReadiness: this.boss.promotionReadiness,
            newRelationship: this.boss.relationship
        };
    }

    /**
     * Quit job
     */
    quitJob() {
        const relationship = this.boss.relationship;
        let message = "";

        if (relationship > 70) {
            message = "Your boss is disappointed but understanding. 'I hate to see you go, but I wish you the best.'";
        } else if (relationship > 40) {
            message = "Your boss accepts your resignation professionally. 'Good luck with your future endeavors.'";
        } else {
            message = "Your boss seems relieved. 'Okay. HR will handle the paperwork.'";
        }

        // Reset work state
        this.gameState.currentJob = null;
        this.boss.relationship = 0;
        this.boss.promotionReadiness = 0;

        return {
            success: true,
            message
        };
    }

    /**
     * Increase promotion readiness (called when completing tasks well)
     */
    increasePromotionReadiness(amount = 1) {
        this.boss.promotionReadiness += amount;
        this.clampBoss();
    }

    /**
     * Boss relationship and promotion readiness both live on 0-100; every
     * mutation goes through here (#1016, #219, #1810)
     */
    clampBoss() {
        const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
        this.boss.relationship = clamp(this.boss.relationship);
        this.boss.promotionReadiness = clamp(this.boss.promotionReadiness);
    }

    /**
     * A finished chart task: great work builds readiness and goodwill, poor
     * work costs a little goodwill. This is what feeds askForPromotion()'s
     * readiness and relationship gates (#1542, #1809).
     */
    recordTaskResult(stars) {
        const s = Number(stars) || 0;
        if (s >= 4) {
            this.boss.promotionReadiness += (s - 3) * 5;
            this.boss.relationship += s - 2;
        } else if (s > 0 && s <= 2) {
            this.boss.relationship -= 1;
        }
        this.clampBoss();
    }

    /** Tasks the boss has seen you finish: chart tasks plus JobSystem tasks */
    getCompletedTaskCount() {
        return (Number(this.gameState.tasksCompleted) || 0) +
            (this.gameState.jobSystem?.completedTasks?.length || 0);
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['coworkers', 'boss']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['coworkers', 'boss']);
    }
}
