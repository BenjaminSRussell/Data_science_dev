/**
 * StoryUI.js
 * Manages the story interface - makes story visible to players
 * Priority 1: Story Visibility
 */

export class StoryUI {
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
        storyBtn.innerHTML = '';
        
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
                            <div class="story-arc-progress">
                                <div class="progress-label">Story Progress</div>
                                <div class="progress-bar">
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

                    <!-- Phase Section -->
                    <div class="story-section story-phase-section">
                        <h3 class="story-section-title">Current Phase</h3>
                        <div class="story-phase-info" id="story-phase-info">
                            <div class="phase-name" id="phase-name">Early Game</div>
                            <div class="phase-description" id="phase-description">You're just starting out. Every choice matters.</div>
                            <div class="phase-timeline">
                                <div class="timeline-item ${this.getPhaseClass('early')}" data-phase="early">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-label">Act 1: Beginning</div>
                                </div>
                                <div class="timeline-item ${this.getPhaseClass('mid')}" data-phase="mid">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-label">Act 2: Rising Action</div>
                                </div>
                                <div class="timeline-item ${this.getPhaseClass('late')}" data-phase="late">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-label">Act 3: Climax</div>
                                </div>
                                <div class="timeline-item ${this.getPhaseClass('endgame')}" data-phase="endgame">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-label">Epilogue</div>
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

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hideStoryScreen();
            }
        });
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
            this.game.screenManager.showScreen('screen-story');
        } else {
            storyScreen.classList.remove('hidden');
            storyScreen.classList.add('active');
        }

        this.isOpen = true;
    }

    /**
     * Hide story screen
     */
    hideStoryScreen() {
        const storyScreen = document.getElementById('screen-story');
        if (!storyScreen) return;

        if (this.game?.screenManager) {
            this.game.screenManager.goBack();
        } else {
            storyScreen.classList.add('hidden');
            storyScreen.classList.remove('active');
        }

        this.isOpen = false;
    }

    /**
     * Update story display with current data
     */
    updateStoryDisplay() {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) {
            storylineManager.initialize();
        }

        const status = storylineManager.getStatus();
        const arc = status.arc || storylineManager.getCurrentArc();

        // Update narrative context
        this.updateNarrativeContext();

        // Update arc card
        const arcName = document.getElementById('story-arc-name');
        const arcDesc = document.getElementById('story-arc-description');
        if (arcName) arcName.textContent = arc?.name || 'The Balanced Path';
        if (arcDesc) arcDesc.textContent = arc?.description || 'Your journey continues.';

        // Update progress
        const progressFill = document.getElementById('story-progress-fill');
        const progressText = document.getElementById('story-progress-text');
        const progress = status.progress || 0;
        if (progressFill) progressFill.style.width = `${progress}%`;
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

        const majorDecisions = storylineManager.majorDecisions || [];

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
                        <div class="decision-week">Week ${decision.week || '?'}</div>
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
        if (consequences.money !== undefined) {
            const sign = consequences.money > 0 ? '+' : '';
            parts.push(`<span class="consequence money">$${sign}${consequences.money.toLocaleString()}</span>`);
        }
        if (consequences.reputation !== undefined) {
            const sign = consequences.reputation > 0 ? '+' : '';
            parts.push(`<span class="consequence reputation">Reputation ${sign}${consequences.reputation}</span>`);
        }
        return parts.join(' ');
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

        // Add decision entries
        if (storylineManager?.majorDecisions) {
            storylineManager.majorDecisions.forEach(decision => {
                const decisionData = this.getDecisionData(decision.decisionId);
                if (decisionData) {
                    entries.push({
                        date: `Week ${decision.week || '?'}`,
                        text: `${decisionData.title}: You made a choice that shaped your path.`
                    });
                }
            });
        }

        // Add phase transitions
        if (storylineManager) {
            const phase = storylineManager.storylinePhase;
            if (phase === 'mid' && days >= 30) {
                entries.push({
                    date: `Day ${days}`,
                    text: 'You\'ve entered Act 2. The stakes are rising, and your choices matter more than ever.'
                });
            }
        }

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
        
        // Check for pending story beats first
        if (storyBeatsSystem) {
            storyBeatsSystem.updatePendingBeats();
            const pendingBeats = storyBeatsSystem.pendingBeats || [];
            if (pendingBeats.length > 0) {
                const nextBeat = pendingBeats[0];
                nextBeatText.textContent = `Story Beat: ${nextBeat.title}. ${nextBeat.description}`;
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
            transformation.innerHTML = `
                <div class="transformation-label">Your Transformation</div>
                <div class="transformation-text">${summary.transformation}</div>
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
        modal.innerHTML = `
            <div class="decision-modal-content">
                <div class="decision-modal-header">
                    <h3 class="decision-modal-title">${decision.title}</h3>
                    <div class="decision-modal-importance">Major Decision</div>
                </div>
                <div class="decision-modal-description">${decision.description}</div>
                <div class="decision-modal-choices">
                    ${Object.entries(decision.choices || {}).map(([key, choice]) => `
                        <button class="decision-choice-btn" data-choice="${key}">
                            <div class="choice-text">${choice.message}</div>
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

        // Add click handlers
        modal.querySelectorAll('.decision-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                this.handleDecisionChoice(decision.id, choice);
                modal.remove();
            });
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
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
            // Record decision in NPC memory
            if (this.game?.npcMemorySystem) {
                this.game.npcMemorySystem.recordDecision(decisionId, choice);
            }

            // Update character arc
            if (this.game?.characterArcSystem) {
                this.game.characterArcSystem.updateCurrentState();
            }

            // Show result notification
            if (this.game?.showToast) {
                this.game.showToast(result.message, 'info');
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
