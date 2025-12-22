/**
 * ActTransitionScreen.js
 * Shows transition screens when moving between story acts
 * Priority 2: Narrative Structure
 */

export class ActTransitionScreen {
    constructor(game) {
        this.game = game;
    }

    /**
     * Show act transition screen
     */
    showActTransition(fromPhase, toPhase, summary) {
        const overlay = document.createElement('div');
        overlay.className = 'act-transition-overlay';
        overlay.innerHTML = this.getTransitionHTML(fromPhase, toPhase, summary);
        
        document.body.appendChild(overlay);

        // Animate in
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);

        // Auto-advance after delay or on click
        const continueBtn = overlay.querySelector('.act-continue-btn');
        continueBtn.addEventListener('click', () => {
            this.closeTransition(overlay);
        });

        // Also close on escape
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeTransition(overlay);
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }

    /**
     * Get transition HTML
     */
    getTransitionHTML(fromPhase, toPhase, summary) {
        const phaseInfo = {
            early: { name: 'Act 1: Beginning', number: 1 },
            mid: { name: 'Act 2: Rising Action', number: 2 },
            late: { name: 'Act 3: Climax', number: 3 },
            endgame: { name: 'Epilogue', number: 4 }
        };

        const fromInfo = phaseInfo[fromPhase] || phaseInfo.early;
        const toInfo = phaseInfo[toPhase] || phaseInfo.mid;

        const actDescriptions = {
            mid: {
                title: 'Act 2 Begins',
                subtitle: 'The stakes are rising',
                description: 'You\'ve established yourself in Data City. Now the real challenges begin. Your choices matter more than ever, and the consequences of your actions are becoming clear.',
                theme: 'rising'
            },
            late: {
                title: 'Act 3 Begins',
                subtitle: 'Everything comes to a head',
                description: 'The journey has led you here. All your choices, all your decisions, they\'ve built to this moment. The ultimate test awaits.',
                theme: 'climax'
            },
            endgame: {
                title: 'Epilogue',
                subtitle: 'Your story reaches its conclusion',
                description: 'Your journey in Data City is complete. Look back on the path you\'ve taken, the choices you\'ve made, and the person you\'ve become.',
                theme: 'resolution'
            }
        };

        const actDesc = actDescriptions[toPhase] || actDescriptions.mid;

        return `
            <div class="act-transition-content">
                <div class="act-transition-header">
                    <div class="act-number-badge">Act ${toInfo.number}</div>
                    <h1 class="act-transition-title">${actDesc.title}</h1>
                    <h2 class="act-transition-subtitle">${actDesc.subtitle}</h2>
                </div>

                <div class="act-transition-body">
                    <div class="act-summary-section">
                        <h3 class="act-summary-title">What Happened in Act ${fromInfo.number}</h3>
                        <div class="act-summary-content">
                            ${this.formatSummary(summary)}
                        </div>
                    </div>

                    <div class="act-description-section">
                        <p class="act-description">${actDesc.description}</p>
                    </div>

                    ${this.getCharacterArcPreview(toPhase)}
                </div>

                <div class="act-transition-footer">
                    <button class="act-continue-btn">Continue Your Journey →</button>
                </div>
            </div>
        `;
    }

    /**
     * Format summary data
     */
    formatSummary(summary) {
        if (!summary) {
            return '<p>Your journey continues...</p>';
        }

        const items = [];
        
        if (summary.decisions) {
            items.push(`<div class="summary-item"><strong>Major Decisions:</strong> ${summary.decisions}</div>`);
        }
        
        if (summary.progress) {
            items.push(`<div class="summary-item"><strong>Career Progress:</strong> ${summary.progress}</div>`);
        }
        
        if (summary.relationships) {
            items.push(`<div class="summary-item"><strong>Relationships:</strong> ${summary.relationships}</div>`);
        }
        
        if (summary.ethics) {
            const ethicsDesc = summary.ethics > 0 ? 'ethical' : summary.ethics < 0 ? 'questionable' : 'balanced';
            items.push(`<div class="summary-item"><strong>Your Path:</strong> ${ethicsDesc}</div>`);
        }

        return items.length > 0 ? items.join('') : '<p>Your journey continues...</p>';
    }

    /**
     * Get character arc preview
     */
    getCharacterArcPreview(phase) {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (!storylineManager) return '';

        const arc = storylineManager.getCurrentArc();
        const ethics = this.game?.gameState?.characterStats?.ethics || 0;

        let arcPreview = '';
        
        if (ethics < -30) {
            arcPreview = `
                <div class="arc-preview dark">
                    <div class="arc-preview-icon"></div>
                    <div class="arc-preview-text">
                        <strong>The Dark Path</strong><br>
                        Your choices have led you down a darker road. The world sees you differently now.
                    </div>
                </div>
            `;
        } else if (ethics > 30) {
            arcPreview = `
                <div class="arc-preview light">
                    <div class="arc-preview-icon"></div>
                    <div class="arc-preview-text">
                        <strong>The Righteous Path</strong><br>
                        You've stayed true to your values. Your integrity defines you.
                    </div>
                </div>
            `;
        } else {
            arcPreview = `
                <div class="arc-preview balanced">
                    <div class="arc-preview-icon"></div>
                    <div class="arc-preview-text">
                        <strong>The Balanced Path</strong><br>
                        You navigate the complexities of life, finding balance between ambition and ethics.
                    </div>
                </div>
            `;
        }

        return `<div class="act-arc-preview">${arcPreview}</div>`;
    }

    /**
     * Close transition screen
     */
    closeTransition(overlay) {
        overlay.classList.remove('active');
        overlay.classList.add('closing');
        
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }

    /**
     * Generate summary for phase transition
     */
    generateSummary(fromPhase) {
        const gameState = this.game?.gameState;
        if (!gameState) return null;

        const storylineManager = gameState.storylineManager;
        const timeManager = gameState.timeManager;
        const npcManager = gameState.npcManager;

        const summary = {
            decisions: 0,
            progress: '',
            relationships: 0,
            ethics: 0
        };

        // Count decisions
        if (storylineManager) {
            summary.decisions = storylineManager.majorDecisions?.length || 0;
        }

        // Career progress
        const rank = gameState.currentRank;
        if (rank) {
            summary.progress = `Reached ${rank.title}`;
        }

        // Relationships
        if (npcManager) {
            const metNPCs = npcManager.getMetNPCs?.() || [];
            summary.relationships = metNPCs.length;
        }

        // Ethics
        if (gameState.characterStats) {
            summary.ethics = gameState.characterStats.ethics || 0;
        }

        return summary;
    }
}
