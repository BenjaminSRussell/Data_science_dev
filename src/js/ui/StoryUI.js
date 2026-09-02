class StoryUI {
    constructor(game) {
        this.game = game;
    }

    /**
     * Update story display
     */
    updateStoryDisplay() {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) {
            storylineManager.initialize();
        }

        const decisionTimeline = document.getElementById('decision-timeline');
        if (!decisionTimeline) return;

        const availableDecisions = storylineManager.getAvailableDecisions();
        decisionTimeline.innerHTML = availableDecisions.map(decision => `
            <div class="decision-timeline-item ${this.getPhaseClass(decision.phase)}">
                <div class="decision-timeline-title">${decision.title}</div>
                <div class="decision-timeline-description">${decision.description}</div>
            </div>
        `).join('');
    }

    /**
     * Get phase class
     */
    getPhaseClass(phase) {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) return '';
        
        const currentPhase = storylineManager.storylinePhase;
        if (currentPhase === 'early' && phase === 'early') {
            return 'completed';
        }
        if (currentPhase === 'mid' && phase === 'mid') {
            return 'active';
        }
        return '';
    }

    /**
     * Format consequences
     */
    formatConsequences(consequences) {
        const parts = [];
        if (consequences.ethics) {
            const sign = consequences.ethics > 0 ? '+' : (consequences.ethics < 0 ? '-' : '');
            parts.push(`Ethics ${sign}${consequences.ethics}`);
        }
        if (consequences.money) {
            const sign = consequences.money > 0 ? '+' : (consequences.money < 0 ? '-' : '');
            parts.push(`$${sign}${Math.abs(consequences.money).toLocaleString()}`);
        }
        if (consequences.reputation) {
            const sign = consequences.reputation > 0 ? '+' : (consequences.reputation < 0 ? '-' : '');
            parts.push(`Reputation ${sign}${consequences.reputation}`);
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