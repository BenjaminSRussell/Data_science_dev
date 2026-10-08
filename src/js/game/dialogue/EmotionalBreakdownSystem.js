/**
 * EmotionalBreakdownSystem.js
 * Handles emotional breakdowns, crying, yelling, fighting
 * Quick-time events for emotional moments
 * Only triggers under specific conditions
 */

export class EmotionalBreakdownSystem {
    // How long a rejection/betrayal/relationship drop stays "recent" (ms)
    static RECENT_WINDOW_MS = 10 * 60 * 1000;
    static DEFAULT_QTE_SECONDS = 5;
    static MIN_QTE_SECONDS = 3;
    static MAX_QTE_SECONDS = 30;

    constructor(gameState) {
        this.gameState = gameState;
        this.activeBreakdowns = new Map();
        this.breakdownHistory = [];
        // Event log the trigger checks read (#2070, #2260)
        this.relationshipEvents = new Map(); // npcId -> [{ delta, at }]
        this.peakRelationship = new Map();   // npcId -> highest level seen
        this.rejections = new Map();         // npcId -> timestamp
        this.betrayals = new Map();          // npcId -> timestamp
        this.now = () => Date.now();
    }

    /**
     * Record a relationship change so relationship_drop and low_relationship
     * can tell a real fall-out from a stranger (#2069, #2070). Call this from
     * wherever relationships are modified.
     */
    recordRelationshipChange(npcId, delta, newLevel = null) {
        const d = Number(delta) || 0;
        if (!npcId || d === 0) return;
        const list = this.relationshipEvents.get(npcId) || [];
        list.push({ delta: d, at: this.now() });
        this.relationshipEvents.set(npcId, this.pruneRecent(list));
        const level = Number.isFinite(Number(newLevel)) && newLevel !== null
            ? Number(newLevel)
            : (Number(this.gameState?.npcManager?.relationships?.[npcId]) || 0);
        this.peakRelationship.set(npcId, Math.max(this.peakRelationship.get(npcId) || 0, level, level - d));
    }

    /** The player turned this NPC down (#2260) */
    recordRejection(npcId) {
        if (npcId) this.rejections.set(npcId, this.now());
    }

    /** The player broke this NPC's trust (#2260) */
    recordBetrayal(npcId) {
        if (npcId) this.betrayals.set(npcId, this.now());
    }

    pruneRecent(list) {
        const cutoff = this.now() - EmotionalBreakdownSystem.RECENT_WINDOW_MS;
        return list.filter(e => e.at >= cutoff);
    }

    isRecent(timestamp) {
        return Number.isFinite(timestamp) && this.now() - timestamp <= EmotionalBreakdownSystem.RECENT_WINDOW_MS;
    }

    /**
     * Seconds the player gets to answer a breakdown (#887). Settings can
     * lengthen it (breakdownQteSeconds), or turn the timeout off entirely
     * (reduceTimePressure), which returns Infinity.
     */
    getQuickTimeSeconds() {
        const s = this.gameState?.settings || {};
        if (s.reduceTimePressure) return Infinity;
        const { DEFAULT_QTE_SECONDS, MIN_QTE_SECONDS, MAX_QTE_SECONDS } = EmotionalBreakdownSystem;
        const v = Number(s.breakdownQteSeconds);
        if (!Number.isFinite(v) || v <= 0) return DEFAULT_QTE_SECONDS;
        return Math.max(MIN_QTE_SECONDS, Math.min(MAX_QTE_SECONDS, v));
    }

    /** The unresolved breakdown for this NPC, if any (#1021) */
    getActiveBreakdownFor(npcId) {
        for (const b of this.activeBreakdowns.values()) {
            if (b.npcId === npcId && !b.resolved) return b;
        }
        return null;
    }
    
    /**
     * Check if breakdown should trigger
     */
    checkBreakdownConditions(npcId, trigger) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return false;
        
        const relationship = this.gameState.npcManager?.relationships[npcId] || 0;
        const conditions = this.getBreakdownConditions(npc, relationship, trigger);
        
        return conditions.shouldTrigger;
    }
    
    /**
     * Get breakdown conditions
     */
    getBreakdownConditions(npc, relationship, trigger) {
        // Breakdown triggers based on:
        // - Relationship level (too high or too low)
        // - Recent events (betrayal, rejection, success)
        // - NPC personality
        // - Player actions
        
        const triggers = {
            // Relationship too low - hurt feelings
            low_relationship: {
                threshold: 20,
                type: 'hurt',
                emotion: 'sad',
                quickTime: 'comfort'
            },
            // Relationship dropped suddenly - emotional breakdown
            relationship_drop: {
                threshold: -10, // Dropped by 10+ points
                type: 'breakdown',
                emotion: 'crying',
                quickTime: 'support'
            },
            // Player rejected them - yelling/fighting
            rejection: {
                type: 'anger',
                emotion: 'yelling',
                quickTime: 'defuse'
            },
            // Player betrayed trust - fighting
            betrayal: {
                type: 'rage',
                emotion: 'fighting',
                quickTime: 'apologize'
            },
            // Player succeeded while they failed - jealousy breakdown
            jealousy: {
                type: 'jealousy',
                emotion: 'crying',
                quickTime: 'reassure'
            }
        };
        
        const condition = triggers[trigger];
        if (!condition) return { shouldTrigger: false };
        
        // Check if conditions are met
        let shouldTrigger = false;
        
        switch (trigger) {
            case 'low_relationship':
                // Hurt feelings need a relationship that once existed: a
                // stranger at the default 0 has nothing to be hurt about (#2069)
                shouldTrigger = relationship < condition.threshold &&
                    (this.peakRelationship.get(npc.id) || 0) >= condition.threshold;
                break;
            case 'relationship_drop':
                // Check if relationship dropped recently
                const recentDrop = this.checkRecentRelationshipDrop(npc.id);
                shouldTrigger = recentDrop >= Math.abs(condition.threshold);
                break;
            case 'rejection':
                shouldTrigger = this.checkRejection(npc.id);
                break;
            case 'betrayal':
                shouldTrigger = this.checkBetrayal(npc.id);
                break;
            case 'jealousy':
                shouldTrigger = this.checkJealousy(npc.id);
                break;
        }
        
        return {
            shouldTrigger,
            condition: condition
        };
    }
    
    /**
     * Trigger emotional breakdown
     */
    triggerBreakdown(npcId, triggerType) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return null;

        // One breakdown per NPC at a time (#1021)
        if (this.getActiveBreakdownFor(npcId)) return null;
        
        const relationship = this.gameState.npcManager?.relationships[npcId] || 0;
        const conditions = this.getBreakdownConditions(npc, relationship, triggerType);
        
        if (!conditions.shouldTrigger) return null;
        
        const breakdown = {
            id: `breakdown_${npcId}_${Date.now()}`,
            npcId: npcId,
            npc: npc,
            type: conditions.condition.type,
            emotion: conditions.condition.emotion,
            quickTimeType: conditions.condition.quickTime,
            startedAt: Date.now(),
            stage: 'beginning',
            playerResponse: null,
            resolved: false
        };
        
        this.activeBreakdowns.set(breakdown.id, breakdown);
        this.breakdownHistory.push(breakdown);
        
        // Show breakdown UI
        this.showBreakdownUI(breakdown);
        
        return breakdown;
    }
    
    /**
     * Show breakdown UI with quick-time event
     */
    showBreakdownUI(breakdown) {
        const npc = breakdown.npc;
        const emotion = breakdown.emotion;
        
        // Create breakdown overlay
        const overlay = document.createElement('div');
        overlay.id = `breakdown-${breakdown.id}`;
        overlay.className = 'emotional-breakdown-overlay';
        
        // Get dialogue based on emotion and NPC
        const dialogue = this.getBreakdownDialogue(npc, emotion, breakdown.type);
        
        overlay.innerHTML = `
            <div class="breakdown-container">
                <div class="breakdown-character ${emotion}">
                    <div class="character-visual">${npc.icon || ''}</div>
                    <div class="emotion-indicator ${emotion}"></div>
                </div>
                <div class="breakdown-dialogue">
                    <p class="dialogue-text">${dialogue}</p>
                </div>
                <div class="quick-time-event" id="qte-${breakdown.id}">
                    <div class="qte-prompt">${this.getQuickTimePrompt(breakdown.quickTimeType)}</div>
                    <div class="qte-timer">
                        <div class="qte-bar" id="qte-bar-${breakdown.id}"></div>
                    </div>
                    <div class="qte-choices">
                        ${this.getQuickTimeChoices(breakdown.quickTimeType, breakdown.id)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Start quick-time event
        this.startQuickTimeEvent(breakdown.id, breakdown.quickTimeType);
    }
    
    /**
     * Get breakdown dialogue (minimal, emotional)
     */
    getBreakdownDialogue(npc, emotion, type) {
        const dialogues = {
            // low_relationship uses 'sad' (#1831)
            sad: {
                hurt: [
                    "I guess I thought we were friends.",
                    "You've barely said a word to me lately.",
                    "I miss how things used to be between us."
                ]
            },
            crying: {
                hurt: [
                    "I... I thought we were closer than this.",
                    "I can't believe you'd do that.",
                    "This hurts more than I thought it would."
                ],
                jealousy: [
                    "Why does everything work out for you?",
                    "I'm trying so hard...",
                    "It's not fair."
                ],
                breakdown: [
                    "I can't do this anymore.",
                    "Everything is falling apart.",
                    "I don't know what to do."
                ]
            },
            yelling: {
                anger: [
                    "How could you?!",
                    "I trusted you!",
                    "This is unacceptable!",
                    "After everything?!",
                    "You're just like everyone else!",
                    "I should have known better!"
                ]
            },
            fighting: {
                rage: [
                    "Get away from me.",
                    "I don't want to see you right now.",
                    "Leave me alone.",
                    "We're done.",
                    "I can't believe I trusted you.",
                    "Don't talk to me."
                ]
            }
        };
        
        const emotionDialogue = dialogues[emotion]?.[type] || dialogues[emotion]?.hurt || ["..."];
        return emotionDialogue[Math.floor(Math.random() * emotionDialogue.length)];
    }
    
    /**
     * Get quick-time prompt
     */
    getQuickTimePrompt(qteType) {
        const prompts = {
            comfort: "They need comfort. What do you do?",
            support: "They're breaking down. How do you respond?",
            defuse: "They're angry. Can you calm them?",
            apologize: "You've hurt them. Make it right?",
            reassure: "They're jealous. Reassure them?"
        };
        
        return prompts[qteType] || "How do you respond?";
    }
    
    /**
     * Get quick-time choices
     */
    getQuickTimeChoices(qteType, breakdownId) {
        const choices = {
            comfort: [
                { id: 'hug', text: 'Give them a hug', effect: 'positive' },
                { id: 'listen', text: 'Listen quietly', effect: 'neutral' },
                { id: 'leave', text: 'Give them space', effect: 'negative' }
            ],
            support: [
                { id: 'stay', text: 'Stay with them', effect: 'positive' },
                { id: 'advice', text: 'Offer advice', effect: 'neutral' },
                { id: 'dismiss', text: 'Tell them to get over it', effect: 'negative' }
            ],
            defuse: [
                { id: 'calm', text: 'Try to calm them', effect: 'positive' },
                { id: 'apologize', text: 'Apologize', effect: 'positive' },
                { id: 'argue', text: 'Argue back', effect: 'negative' }
            ],
            apologize: [
                { id: 'sincere', text: 'Sincere apology', effect: 'positive' },
                { id: 'explain', text: 'Explain yourself', effect: 'neutral' },
                { id: 'deflect', text: 'Blame circumstances', effect: 'negative' }
            ],
            reassure: [
                { id: 'compliment', text: 'Compliment them', effect: 'positive' },
                { id: 'encourage', text: 'Encourage them', effect: 'positive' },
                { id: 'ignore', text: 'Ignore the jealousy', effect: 'negative' }
            ]
        };
        
        const choiceSet = choices[qteType] || choices.comfort;
        
        return choiceSet.map((choice, index) => `
            <button class="qte-choice ${choice.effect}" 
                    data-breakdown-id="${breakdownId}"
                    data-choice-id="${choice.id}"
                    data-effect="${choice.effect}">
                ${choice.text}
            </button>
        `).join('');
    }
    
    /**
     * Start quick-time event
     */
    startQuickTimeEvent(breakdownId, qteType) {
        const breakdown = this.activeBreakdowns.get(breakdownId);
        if (!breakdown) return;
        
        const seconds = this.getQuickTimeSeconds(); // adjustable (#887)
        const bar = document.getElementById(`qte-bar-${breakdownId}`);
        if (!bar) return;

        const addChoiceListeners = () => {
            const choices = document.querySelectorAll(`[data-breakdown-id="${breakdownId}"]`);
            choices.forEach(choice => {
                choice.addEventListener('click', () => {
                    if (breakdown.timer) clearInterval(breakdown.timer);
                    breakdown.timer = null;
                    this.handleQuickTimeChoice(breakdownId, choice.dataset.choiceId, choice.dataset.effect);
                });
            });
        };

        if (!Number.isFinite(seconds)) {
            // No time pressure: full bar, wait for a choice
            bar.style.width = '100%';
            setTimeout(addChoiceListeners, 100);
            return;
        }

        const timer = seconds * 1000;
        let timeLeft = timer;
        const interval = setInterval(() => {
            timeLeft -= 16; // ~60fps
            const percent = (timeLeft / timer) * 100;
            
            if (bar) {
                bar.style.width = `${percent}%`;
                bar.style.background = percent > 50 ? '#4CAF50' : percent > 25 ? '#FF9800' : '#F44336';
            }
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                this.handleQuickTimeTimeout(breakdownId);
            }
        }, 16);
        
        breakdown.timer = interval;
        
        // Add choice listeners
        setTimeout(addChoiceListeners, 100);
    }
    
    /**
     * Handle quick-time choice
     */
    handleQuickTimeChoice(breakdownId, choiceId, effect) {
        const breakdown = this.activeBreakdowns.get(breakdownId);
        // Answer once: a second button click (or a click after the timeout)
        // must not apply the relationship change again (#1020)
        if (!breakdown || breakdown.playerResponse) return;
        
        breakdown.playerResponse = { choiceId, effect };
        
        // Apply effect to relationship
        const relationshipChange = this.calculateRelationshipChange(effect, breakdown.type);
        this.gameState.npcManager?.modifyRelationship(breakdown.npcId, relationshipChange);
        
        // Show result
        this.showBreakdownResult(breakdown, effect);
        
        // Resolve breakdown
        setTimeout(() => {
            this.resolveBreakdown(breakdownId);
        }, 2000);
    }
    
    /**
     * Handle quick-time timeout (no response)
     */
    handleQuickTimeTimeout(breakdownId) {
        const breakdown = this.activeBreakdowns.get(breakdownId);
        if (!breakdown || breakdown.playerResponse) return;
        
        breakdown.playerResponse = { choiceId: 'timeout', effect: 'negative' };
        
        // Silence counts as the negative response for this breakdown type, so
        // ignoring someone is never cheaper than answering badly (#2071)
        this.gameState.npcManager?.modifyRelationship(
            breakdown.npcId, this.calculateRelationshipChange('negative', breakdown.type));
        
        this.showBreakdownResult(breakdown, 'negative');
        
        setTimeout(() => {
            this.resolveBreakdown(breakdownId);
        }, 2000);
    }
    
    /**
     * Calculate relationship change
     */
    calculateRelationshipChange(effect, breakdownType) {
        const changes = {
            positive: {
                hurt: 10,
                breakdown: 15,
                anger: 8,
                rage: 5,
                jealousy: 12
            },
            neutral: {
                hurt: 2,
                breakdown: 3,
                anger: -2,
                rage: -5,
                jealousy: 0
            },
            negative: {
                hurt: -10,
                breakdown: -15,
                anger: -20,
                rage: -25,
                jealousy: -8
            }
        };
        
        return changes[effect]?.[breakdownType] || 0;
    }
    
    /**
     * Show breakdown result
     */
    showBreakdownResult(breakdown, effect) {
        const overlay = document.getElementById(`breakdown-${breakdown.id}`);
        if (!overlay) return;
        
        const resultText = {
            positive: "They seem to calm down. Your response helped.",
            neutral: "They're still upset, but listening.",
            negative: "Things got worse. The tension remains."
        };
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `breakdown-result ${effect}`;
        resultDiv.textContent = resultText[effect] || resultText.neutral;
        
        overlay.querySelector('.breakdown-container').appendChild(resultDiv);
    }
    
    /**
     * Resolve breakdown
     */
    resolveBreakdown(breakdownId) {
        const breakdown = this.activeBreakdowns.get(breakdownId);
        if (!breakdown) return;
        
        // Clear any active timers
        if (breakdown.timer) {
            clearInterval(breakdown.timer);
            breakdown.timer = null;
        }
        
        breakdown.resolved = true;
        breakdown.resolvedAt = Date.now();
        
        // Remove UI
        const overlay = document.getElementById(`breakdown-${breakdown.id}`);
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
        
        this.activeBreakdowns.delete(breakdownId);
    }
    
    /**
     * Check recent relationship drop
     */
    checkRecentRelationshipDrop(npcId) {
        // Net loss over the recent window, from recordRelationshipChange (#2070)
        const list = this.pruneRecent(this.relationshipEvents.get(npcId) || []);
        this.relationshipEvents.set(npcId, list);
        const net = list.reduce((sum, e) => sum + e.delta, 0);
        return net < 0 ? -net : 0;
    }
    
    /**
     * Check if rejection occurred
     */
    checkRejection(npcId) {
        // Rejected recently, per recordRejection (#2260)
        return this.isRecent(this.rejections.get(npcId));
    }
    
    /**
     * Check if betrayal occurred
     */
    checkBetrayal(npcId) {
        // Betrayed recently, per recordBetrayal (#2260)
        return this.isRecent(this.betrayals.get(npcId));
    }
    
    /**
     * Check if jealousy should trigger
     */
    checkJealousy(npcId) {
        // Read the real JealousySystem instead of a hard-coded stub (#1409)
        const js = this.gameState?.jealousySystem;
        if (!js?.getJealousyLevel) return false;
        if (js.isEnabled && !js.isEnabled()) return false;
        return js.getJealousyLevel(npcId) > 75;
    }
}

