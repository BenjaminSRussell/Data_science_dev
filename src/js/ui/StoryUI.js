/**
 * StoryUI.js
 * Manages the story interface - makes story visible to players
 * Priority 1: Story Visibility
 */

export class StoryUI {
    static ACTS = [
        { phase: 'mid', day: 30, text: 'You\'ve entered Act 2. The stakes are rising, and your choices matter more than ever.' },
        { phase: 'late', day: 90, text: 'You\'ve entered Act 3. Your reputation precedes you, and every choice is watched.' },
        { phase: 'endgame', day: 180, text: 'The final act begins. Everything you\'ve built comes down to what you do next.' }
    ];

    /**
     * Journal entries for every act reached so far. Uses the recorded
     * phaseHistory, falling back to the act's start day for older saves, so
     * an entry never disappears once you move on (#2151, #1772)
     */
    static actEntries(storylineManager) {
        if (!storylineManager) return [];
        const order = ['early', 'mid', 'late', 'endgame'];
        const reached = order.indexOf(storylineManager.storylinePhase);
        const history = Array.isArray(storylineManager.phaseHistory) ? storylineManager.phaseHistory : [];
        return StoryUI.ACTS
            .filter(act => order.indexOf(act.phase) <= reached || history.some(h => h.phase === act.phase))
            .map(act => {
                const recorded = history.find(h => h.phase === act.phase);
                const day = Number.isFinite(recorded?.day) ? recorded.day : act.day;
                return { day, order: -1, date: `Day ${day}`, text: act.text };
            });
    }

    /**
     * "Ethics +12 · Reputation +300 · Rank +1" from getArcSummary().changes
     */
    static formatArcChanges(changes) {
        if (!changes) return '';
        const labels = { ethics: 'Ethics', reputation: 'Reputation', rank: 'Rank' };
        return Object.entries(labels)
            .filter(([key]) => Number(changes[key]))
            .map(([key, label]) => `${label} ${changes[key] > 0 ? '+' : ''}${Number(changes[key]).toLocaleString()}`)
            .join(' · ');
    }

    constructor(game) {
        this.game = game;
        this.container = null;
        this.isOpen = false;
    }

    /**
     * Initialize story UI
     */
    initialize() {
        this.createStoryButton();
        this.createStoryScreen();
        this.setupEventListeners();
    }

    /**
     * Create story button in top bar
     */
    createStoryButton() {
        const topBarRight = document.querySelector('.top-bar-right');
        if (!topBarRight) return;

        // Check if button already exists
        if (document.getElementById('btn-nav-story')) return;

        const storyBtn = document.createElement('button');
        storyBtn.id = 'btn-nav-story';
        storyBtn.className = 'btn-grey';
        storyBtn.setAttribute('aria-label', 'Your Story');
        storyBtn.setAttribute('title', 'Your Story');
        // Visible label like the other nav buttons (MAP, BANK, OPTS) (#2393)
        storyBtn.textContent = 'STORY';
        
        // Insert before settings button
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            topBarRight.insertBefore(storyBtn, settingsBtn);
        } else {
            topBarRight.appendChild(storyBtn);
        }
    }

    /**
     * Create story screen
     */
    createStoryScreen() {
        const screenContainer = document.getElementById('screen-container');
        if (!screenContainer) return;

        // Check if screen already exists
        if (document.getElementById('screen-story')) return;

        const storyScreen = document.createElement('section');
        storyScreen.id = 'screen-story';
        storyScreen.className = 'screen screen-story hidden';
        storyScreen.innerHTML = this.getStoryScreenHTML();
        
        screenContainer.appendChild(storyScreen);
    }

    /**
     * Get story screen HTML
     */
    getStoryScreenHTML() {
        return `
            <div class="story-screen-container">
                <div class="story-header">
                    <h2 class="screen-title">Your Story</h2>
                    <button class="close-btn" id="btn-story-close" aria-label="Close">×</button>
                </div>

                <div class="story-content">
                    <!-- Current Arc Section -->
                    <div class="story-section story-arc-section">
                        <h3 class="story-section-title">Current Path</h3>
                        <div class="story-arc-card" id="story-arc-card">
                            <div class="story-arc-name" id="story-arc-name">The Balanced Path</div>
                            <div class="story-arc-description" id="story-arc-description">You navigate the complexities of life, trying to find balance.</div>
                            <div class="story-arc-theme" id="story-arc-theme"></div>
                            <ul class="story-arc-challenges" id="story-arc-challenges" aria-label="Challenges on this path"></ul>
                            <div class="story-arc-progress">
                                <div class="progress-label">Story Progress</div>
                                <div class="progress-bar" id="story-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="story-progress-text">
                                    <div class="progress-fill" id="story-progress-fill" style="width: 0%"></div>
                                </div>
                                <div class="progress-text" id="story-progress-text">0%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Narrative Context Section -->
                    <div class="story-section story-narrative-section">
                        <h3 class="story-section-title">Your Current Situation</h3>
                        <div class="story-narrative-info" id="story-narrative-info">
                            <div class="narrative-chapter" id="narrative-chapter">Chapter 1: The Beginning</div>
                            <div class="narrative-situation" id="narrative-situation">You're just starting out. Every choice matters.</div>
                            <div class="narrative-goals" id="narrative-goals">
                                <div class="goal-item">Get your first job</div>
                                <div class="goal-item">Learn the basics</div>
                                <div class="goal-item">Meet people</div>
                            </div>
                        </div>
                    </div>

                    <!-- Character Arc Section (#1475) -->
                    <div class="story-section story-character-arc-section">
                        <h3 class="story-section-title">Who You're Becoming</h3>
                        <div class="story-character-arc">
                            <div class="arc-row"><span class="arc-row-label">Where you started</span>
                                <div class="arc-start-description" id="arc-start-description">A newcomer with a laptop and a dream.</div></div>
                            <div class="arc-row"><span class="arc-row-label">Where you are now</span>
                                <div class="arc-current-description" id="arc-current-description">Still finding your way.</div></div>
                            <div class="arc-transformation" id="arc-transformation"></div>
                        </div>
                    </div>

                    <!-- Phase Section -->
                    <div class="story-section story-phase-section">
                        <h3 class="story-section-title">Current Phase</h3>
                        <div class="story-phase-info" id="story-phase-info">
                            <div class="phase-name" id="phase-name">Early Game</div>
                            <div class="phase-description" id="phase-description">You're just starting out. Every choice matters.</div>
                            <div class="phase-timeline">
                                <div class="timeline-item ${this.getPhaseClass('early')}" data-phase="early" ${this.getPhaseClass('early').includes('active') ? 'aria-current="step"' : ''}>
                                    <div class="timeline-marker" aria-hidden="true"></div>
                                    <div class="timeline-label">Act 1: Beginning<span class="visually-hidden"> ${this.getPhaseClass('early').includes('completed') ? '(completed)' : this.getPhaseClass('early').includes('active') ? '(current phase)' : ''}</span></div>
                                </div>
                                <div class="timeline-item ${this.getPhaseClass('mid')}" data-phase="mid" ${this.getPhaseClass('mid').includes('active') ? 'aria-current="step"' : ''}>
                                    <div class="timeline-marker" aria-hidden="true"></div>
                                    <div class="timeline-label">Act 2: Rising Action<span class="visually-hidden"> ${this.getPhaseClass('mid').includes('completed') ? '(completed)' : this.getPhaseClass('mid').includes('active') ? '(current phase)' : ''}</span></div>
                                </div>
                                <div class="timeline-item ${this.getPhaseClass('late')}" data-phase="late" ${this.getPhaseClass('late').includes('active') ? 'aria-current="step"' : ''}>
                                    <div class="timeline-marker" aria-hidden="true"></div>
                                    <div class="timeline-label">Act 3: Climax<span class="visually-hidden"> ${this.getPhaseClass('late').includes('completed') ? '(completed)' : this.getPhaseClass('late').includes('active') ? '(current phase)' : ''}</span></div>
                                </div>
                                <div class="timeline-item ${this.getPhaseClass('endgame')}" data-phase="endgame" ${this.getPhaseClass('endgame').includes('active') ? 'aria-current="step"' : ''}>
                                    <div class="timeline-marker" aria-hidden="true"></div>
                                    <div class="timeline-label">Epilogue<span class="visually-hidden"> ${this.getPhaseClass('endgame').includes('completed') ? '(completed)' : this.getPhaseClass('endgame').includes('active') ? '(current phase)' : ''}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Major Decisions Section -->
                    <div class="story-section story-decisions-section">
                        <h3 class="story-section-title">Major Decisions</h3>
                        <div class="decisions-list" id="decisions-list">
                            <div class="no-decisions">No major decisions yet. Your story is just beginning.</div>
                        </div>
                    </div>

                    <!-- Story Journal Section -->
                    <div class="story-section story-journal-section">
                        <h3 class="story-section-title">Your Story So Far</h3>
                        <div class="story-journal" id="story-journal">
                            <div class="journal-entry">
                                <div class="journal-date">Day 0</div>
                                <div class="journal-text">You arrived in Data City with nothing but a laptop and a dream.</div>
                            </div>
                        </div>
                    </div>

                    <!-- Next Story Beat -->
                    <div class="story-section story-next-beat-section">
                        <h3 class="story-section-title">What's Next</h3>
                        <div class="next-beat-card" id="next-beat-card">
                            <div class="next-beat-text" id="next-beat-text">Continue your journey and make choices that shape your path.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get phase class for timeline
     */
    getPhaseClass(phase) {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) return '';
        
        const currentPhase = storylineManager.storylinePhase || 'early';
        if (phase === currentPhase) return 'active';
        
        const phaseOrder = ['early', 'mid', 'late', 'endgame'];
        const currentIndex = phaseOrder.indexOf(currentPhase);
        const phaseIndex = phaseOrder.indexOf(phase);
        
        return phaseIndex < currentIndex ? 'completed' : '';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // initialize() can run more than once; only bind document-level and
        // button listeners the first time (#1773)
        if (this._listenersBound) return;
        this._listenersBound = true;

        // Story button
        const storyBtn = document.getElementById('btn-nav-story');
        if (storyBtn) {
            storyBtn.addEventListener('click', () => this.showStoryScreen());
        }

        // Close button
        const closeBtn = document.getElementById('btn-story-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideStoryScreen());
        }

        // Close on escape, but only while the story screen is really on
        // screen (#1763)
        this._onKeydown = (e) => {
            if (e.key === 'Escape' && this.isOpen && this.isStoryScreenVisible()) {
                this.hideStoryScreen();
            }
        };
        document.addEventListener('keydown', this._onKeydown);
    }

    /**
     * Show story screen
     */
    showStoryScreen() {
        const storyScreen = document.getElementById('screen-story');
        if (!storyScreen) return;

        this.updateStoryDisplay();
        
        // Use screen manager if available
        if (this.game?.screenManager) {
            // Remember whether ScreenManager really navigated here (and so
            // pushed a history entry); hiding only pops history if it did (#1359)
            const previous = this.game.screenManager.getCurrentScreen?.() ?? this.game.screenManager.currentScreen;
            const shown = this.game.screenManager.showScreen('screen-story') !== false;
            this._navigatedHere = shown && (previous !== 'screen-story' || !!this._navigatedHere);
        } else {
            storyScreen.classList.remove('hidden');
            storyScreen.classList.add('active');
        }

        // Only count as open if the screen actually displayed (#1763)
        this.isOpen = this.isStoryScreenVisible();
    }

    /** Is #screen-story currently showing? */
    isStoryScreenVisible() {
        const storyScreen = document.getElementById('screen-story');
        if (!storyScreen) return false;
        const sm = this.game?.screenManager;
        const current = sm?.getCurrentScreen?.() ?? sm?.currentScreen;
        if (current) return current === 'screen-story';
        return !storyScreen.classList.contains('hidden');
    }

    /** Remove document-level listeners (#1773) */
    destroy() {
        if (this._onKeydown) document.removeEventListener('keydown', this._onKeydown);
        this._onKeydown = null;
        this._listenersBound = false;
    }

    /**
     * Hide story screen
     */
    hideStoryScreen() {
        const storyScreen = document.getElementById('screen-story');
        if (!storyScreen) return;

        const sm = this.game?.screenManager;
        if (sm && this._navigatedHere && sm.goBack() !== false) {
            // returned to the screen the story was opened from
        } else {
            storyScreen.classList.add('hidden');
            storyScreen.classList.remove('active');
        }

        this._navigatedHere = false;
        this.isOpen = false;
    }

    /**
     * Update story display with current data
     */
    updateStoryDisplay() {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) {
            return;
        }
        storylineManager.initialize();

        const status = storylineManager.getStatus();
        const arc = status.arc || storylineManager.getCurrentArc();

        // Update narrative context
        this.updateNarrativeContext();

        // Update arc card
        const arcName = document.getElementById('story-arc-name');
        const arcDesc = document.getElementById('story-arc-description');
        if (arcName) arcName.textContent = arc?.name || 'The Balanced Path';
        if (arcDesc) arcDesc.textContent = arc?.description || 'Your journey continues.';

        // Theme and challenges the arc defines (#1422)
        const pretty = (id) => String(id).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
        const themeEl = document.getElementById('story-arc-theme');
        if (themeEl) themeEl.textContent = arc?.theme ? `Theme: ${pretty(arc.theme)}` : '';
        const challengesEl = document.getElementById('story-arc-challenges');
        if (challengesEl) {
            challengesEl.innerHTML = '';
            (arc?.challenges || []).forEach(ch => {
                const li = document.createElement('li');
                li.className = 'story-arc-challenge';
                li.textContent = pretty(ch);
                challengesEl.appendChild(li);
            });
        }

        // Update progress
        const progressFill = document.getElementById('story-progress-fill');
        const progressText = document.getElementById('story-progress-text');
        const progress = status.progress || 0;
        if (progressFill) progressFill.style.width = `${progress}%`;
        const progressBar = document.getElementById('story-progress-bar');
        if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round(progress)));
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;

        // Update phase
        this.updatePhaseDisplay(status.phase);

        // Update decisions
        this.updateDecisionsDisplay(status.decisions || []);

        // Update journal
        this.updateJournalDisplay();

        // Update next beat
        this.updateNextBeatDisplay(status.phase);

        // Update character arc
        this.updateCharacterArc();
    }

    /**
     * Update narrative context display
     */
    updateNarrativeContext() {
        const narrativeSystem = this.game?.gameState?.narrativeClaritySystem;
        if (!narrativeSystem) return;

        const context = narrativeSystem.getNarrativeContext();
        const situation = context.situation;

        // Update chapter
        const chapterEl = document.getElementById('narrative-chapter');
        if (chapterEl) chapterEl.textContent = context.chapter;

        // Motivation and themes were computed but never shown (#1533)
        const infoEl = chapterEl?.parentElement;
        if (infoEl) {
            let themesEl = document.getElementById('narrative-themes');
            if (!themesEl) {
                themesEl = document.createElement('div');
                themesEl.id = 'narrative-themes';
                themesEl.className = 'narrative-themes';
                chapterEl.insertAdjacentElement('afterend', themesEl);
            }
            const motivation = narrativeSystem.constructor?.MOTIVATION_TEXT?.[context.motivation] || '';
            themesEl.innerHTML = '';
            if (motivation) {
                const m = document.createElement('div');
                m.className = 'narrative-motivation';
                m.textContent = motivation;
                themesEl.appendChild(m);
            }
            for (const theme of context.themes || []) {
                const t = document.createElement('span');
                t.className = 'narrative-theme';
                t.textContent = theme;
                themesEl.appendChild(t);
            }
        }

        // Update situation
        const situationEl = document.getElementById('narrative-situation');
        if (situationEl) {
            situationEl.innerHTML = `
                <div class="situation-title">${situation.title}</div>
                <div class="situation-description">${situation.description}</div>
            `;
        }

        // Update goals
        const goalsEl = document.getElementById('narrative-goals');
        if (goalsEl && situation.goals) {
            goalsEl.innerHTML = situation.goals.map(goal => 
                `<div class="goal-item">${goal}</div>`
            ).join('');
        }
    }

    /**
     * Update phase display
     */
    updatePhaseDisplay(phase) {
        const phaseName = document.getElementById('phase-name');
        const phaseDesc = document.getElementById('phase-description');

        const phaseInfo = {
            early: {
                name: 'Act 1: Beginning',
                description: 'You\'re just starting out. Every choice matters. Establish yourself and make your first major decision.'
            },
            mid: {
                name: 'Act 2: Rising Action',
                description: 'The stakes are rising. Deal with the consequences of your earlier choices. The world is watching.'
            },
            late: {
                name: 'Act 3: Climax',
                description: 'Everything comes to a head. Face the ultimate test of your values and choices.'
            },
            endgame: {
                name: 'Epilogue',
                description: 'Your story reaches its conclusion. See the consequences of your journey.'
            }
        };

        const info = phaseInfo[phase] || phaseInfo.early;
        if (phaseName) phaseName.textContent = info.name;
        if (phaseDesc) phaseDesc.textContent = info.description;

        // Update timeline
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('active', 'completed');
            const itemPhase = item.dataset.phase;
            if (itemPhase === phase) {
                item.classList.add('active');
            } else {
                const phaseOrder = ['early', 'mid', 'late', 'endgame'];
                const currentIndex = phaseOrder.indexOf(phase);
                const itemIndex = phaseOrder.indexOf(itemPhase);
                if (itemIndex < currentIndex) {
                    item.classList.add('completed');
                }
            }
        });
    }

    /**
     * Update decisions display
     */
    updateDecisionsDisplay(decisions) {
        const decisionsList = document.getElementById('decisions-list');
        if (!decisionsList) return;

        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) return;

        const majorDecisions = decisions || [];

        if (majorDecisions.length === 0) {
            decisionsList.innerHTML = '<div class="no-decisions">No major decisions yet. Your story is just beginning.</div>';
            return;
        }

        decisionsList.innerHTML = majorDecisions.map((decision, index) => {
            const decisionData = this.getDecisionData(decision.decisionId);
            const choiceData = decisionData?.choices?.[decision.choice];
            
            return `
                <div class="decision-card">
                    <div class="decision-header">
                        <div class="decision-number">Decision ${index + 1}</div>
                        <div class="decision-week">Week ${(decision.week ?? 0) + 1}</div>
                    </div>
                    <div class="decision-title">${decisionData?.title || 'Major Decision'}</div>
                    <div class="decision-choice">
                        <span class="choice-label">You chose:</span>
                        <span class="choice-text">${choiceData?.message || decision.choice}</span>
                    </div>
                    ${choiceData?.consequences ? `
                        <div class="decision-consequences">
                            ${this.formatConsequences(choiceData.consequences)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Get decision data
     */
    getDecisionData(decisionId) {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) return null;

        return storylineManager.getDecision(decisionId);
    }

    /**
     * Format consequences for display
     */
    formatConsequences(consequences) {
        const parts = [];
        if (consequences.ethics !== undefined) {
            const sign = consequences.ethics > 0 ? '+' : '';
            parts.push(`<span class="consequence ethics">Ethics ${sign}${consequences.ethics}</span>`);
        }
        if (consequences.money !== undefined && consequences.money !== 0) {
            parts.push(`<span class="consequence money">${StoryUI.formatMoneyDelta(consequences.money)}</span>`);
        }
        if (consequences.reputation !== undefined) {
            const sign = consequences.reputation > 0 ? '+' : '';
            parts.push(`<span class="consequence reputation">Reputation ${sign}${consequences.reputation}</span>`);
        }
        // Career and legal consequences are shown up front too (#1503, #1504)
        if (consequences.fired) {
            parts.push('<span class="consequence danger">You lose your job (-1 rank)</span>');
        }
        if (consequences.risk === 'arrest') {
            parts.push('<span class="consequence danger">Arrest and jail</span>');
        }
        return parts.join(' ');
    }

    /**
     * "+$5,000" / "-$2,000": the sign goes before the dollar sign (#1775)
     */
    static formatMoneyDelta(amount) {
        const n = Number(amount) || 0;
        const sign = n > 0 ? '+' : n < 0 ? '-' : '';
        return `${sign}$${Math.abs(n).toLocaleString()}`;
    }

    /**
     * Update journal display
     */
    updateJournalDisplay() {
        const journal = document.getElementById('story-journal');
        if (!journal) return;

        const storylineManager = this.game?.gameState?.storylineManager;
        const timeManager = this.game?.gameState?.timeManager;
        const days = timeManager?.totalDays || 0;

        const entries = [
            {
                date: 'Day 0',
                text: 'You arrived in Data City with nothing but a laptop and a dream.'
            }
        ];

        // Decisions and act transitions, in the order they happened
        // (#2151, #1772)
        const timed = [];
        if (storylineManager?.majorDecisions) {
            storylineManager.majorDecisions.forEach((decision, i) => {
                const decisionData = this.getDecisionData(decision.decisionId);
                if (decisionData) {
                    const choiceData = decisionData.choices?.[decision.choice];
                    const impact = decision.outcome && choiceData?.outcomes?.[decision.outcome]?.storyImpact
                        ? choiceData.outcomes[decision.outcome].storyImpact
                        : choiceData?.storyImpact;
                    timed.push({
                        day: Number.isFinite(decision.day) ? decision.day : (decision.week ?? 0) * 7,
                        order: i,
                        date: `Week ${(decision.week ?? 0) + 1}`,
                        text: impact
                            ? `${decisionData.title}: ${impact}`
                            : `${decisionData.title}: You made a choice that shaped your path.`
                    });
                }
            });
        }
        StoryUI.actEntries(storylineManager).forEach(e => timed.push(e));
        timed.sort((a, b) => a.day - b.day || a.order - b.order);
        timed.forEach(e => entries.push({ date: e.date, text: e.text }));

        journal.innerHTML = entries.map(entry => `
            <div class="journal-entry">
                <div class="journal-date">${entry.date}</div>
                <div class="journal-text">${entry.text}</div>
            </div>
        `).join('');
    }

    /**
     * Update next beat display
     */
    updateNextBeatDisplay(phase) {
        const nextBeatText = document.getElementById('next-beat-text');
        if (!nextBeatText) return;

        const storylineManager = this.game?.gameState?.storylineManager;
        const storyBeatsSystem = this.game?.gameState?.storyBeatsSystem;
        
        // Check for pending story beats first: required beats of this act
        // lead (#2148), with the act's key-beat progress (#1106)
        if (storyBeatsSystem) {
            const nextBeat = storyBeatsSystem.getNextBeat?.();
            if (nextBeat) {
                const status = storyBeatsSystem.getCompletionStatus?.(phase);
                const progress = status && status.required > 0
                    ? ` (${status.completedRequired}/${status.required} key beats this act)`
                    : '';
                nextBeatText.textContent = `Story Beat: ${nextBeat.title}. ${nextBeat.description}${progress}`;
                return;
            }
        }
        
        // Then check for decisions
        const availableDecisions = storylineManager?.getAvailableDecisions() || [];
        if (availableDecisions.length > 0) {
            const nextDecision = availableDecisions[0];
            nextBeatText.textContent = `A major decision awaits: ${nextDecision.title}. ${nextDecision.description}`;
        } else {
            const phaseBeats = {
                early: 'Continue building your career. A major opportunity or challenge will present itself soon.',
                mid: 'The consequences of your early choices are becoming clear. Stay true to your path.',
                late: 'Everything is building toward a climax. Prepare for the ultimate test.',
                endgame: 'Your story is reaching its conclusion. Reflect on the journey you\'ve taken.'
            };
            nextBeatText.textContent = phaseBeats[phase] || phaseBeats.early;
        }
    }

    /**
     * Update character arc display
     */
    updateCharacterArc() {
        const characterArcSystem = this.game?.gameState?.characterArcSystem;
        if (!characterArcSystem) return;

        characterArcSystem.updateCurrentState();
        const summary = characterArcSystem.getArcSummary();

        const startDesc = document.getElementById('arc-start-description');
        const currentDesc = document.getElementById('arc-current-description');
        const transformation = document.getElementById('arc-transformation');

        if (startDesc) startDesc.textContent = summary.start;
        if (currentDesc) currentDesc.textContent = summary.current;
        if (transformation) {
            // getArcSummary().changes was computed and never shown (#1478)
            const changes = StoryUI.formatArcChanges(summary.changes);
            transformation.innerHTML = `
                <div class="transformation-label">Your Transformation</div>
                <div class="transformation-text">${summary.transformation}</div>
                ${changes ? `<div class="transformation-changes">${changes}</div>` : ''}
            `;
        }
    }

    /**
     * Show major decision modal
     */
    showDecisionModal(decision) {
        if (!decision) return;

        const modal = document.createElement('div');
        modal.className = 'story-decision-modal';
        // Proper dialog semantics, focus trap, Escape, focus restore (#1877)
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'decision-modal-title');
        const previouslyFocused = document.activeElement;
        modal.innerHTML = `
            <div class="decision-modal-content">
                <div class="decision-modal-header">
                    <h3 class="decision-modal-title" id="decision-modal-title">${decision.title}</h3>
                    <div class="decision-modal-importance">Major Decision</div>
                </div>
                <div class="decision-modal-description">${decision.description}</div>
                <div class="decision-modal-choices">
                    ${Object.entries(decision.choices || {}).map(([key, choice]) => `
                        <button class="decision-choice-btn" data-choice="${key}">
                            <div class="choice-text">${choice.message}</div>
                            ${choice.stakes ? `<div class="choice-stakes">${choice.stakes}</div>` : ''}
                            ${choice.consequences ? `
                                <div class="choice-consequences">
                                    ${this.formatConsequences(choice.consequences)}
                                </div>
                            ` : ''}
                        </button>
                    `).join('')}
                </div>
                <div class="decision-modal-footer">
                    <small>This choice will affect your story path</small>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            document.removeEventListener('keydown', onKeydown, true);
            modal.remove();
            if (previouslyFocused && typeof previouslyFocused.focus === 'function' && document.contains(previouslyFocused)) {
                previouslyFocused.focus();
            }
        };
        const onKeydown = (e) => {
            if (!document.body.contains(modal)) {
                document.removeEventListener('keydown', onKeydown, true);
                return;
            }
            // Another dialog opened on top (e.g. the ending screen) owns the keyboard
            const topDialog = [...document.querySelectorAll('[aria-modal="true"]')].pop();
            if (topDialog && topDialog !== modal) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
                return;
            }
            if (e.key === 'Tab') {
                const buttons = [...modal.querySelectorAll('button')];
                if (buttons.length === 0) return;
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                const inside = modal.contains(document.activeElement);
                if (e.shiftKey && (document.activeElement === first || !inside)) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        // Capture phase, so the story screen's own Escape handler doesn't also fire
        document.addEventListener('keydown', onKeydown, true);
        modal.querySelector('.decision-choice-btn')?.focus();

        // Add click handlers
        modal.querySelectorAll('.decision-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    const choice = btn.dataset.choice;
                    this.handleDecisionChoice(decision.id, choice);
                } catch (error) {
                    // Show error to player
                    if (this.game?.showToast) {
                        this.game.showToast(`Decision failed: ${error.message}`, 'error');
                    }
                    // Log the error for debugging
                    console.error('Error processing decision:', error);
                } finally {
                    // Always remove the modal, even if there was an error
                    closeModal();
                }
            });
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    /**
     * Handle decision choice
     */
    handleDecisionChoice(decisionId, choice) {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) return;

        const result = storylineManager.processDecision(decisionId, choice);
        
        if (result) {
            // Both systems live on gameState, not on the game object (#2395)
            const gs = this.game?.gameState;
            gs?.npcMemorySystem?.recordDecision?.(decisionId, choice);
            gs?.characterArcSystem?.updateCurrentState?.();

            // Show result notification, then what it means for the story (#1107)
            if (this.game?.showToast) {
                this.game.showToast(result.message, 'info');
                if (result.storyImpact) this.game.showToast(result.storyImpact, 'info');
            }

            // Update UI
            this.updateStoryDisplay();
            
            // Update other systems
            if (this.game?.uiUpdater) {
                this.game.uiUpdater.updateAllUI();
            }
        }
    }
}
