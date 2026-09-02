// ... (existing code)

/**
 * DirtyDataSystem class - handles unethical data manipulation actions
 */
export class DirtyDataSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.unethicalActions = [];
        this.reputation = 100; // Initial reputation
    }

    /**
     * Get available unethical actions
     */
    getDirtyOptions() {
        return {
            manipulate_data: {
                name: 'Manipulate Data',
                description: 'Alter company data to your advantage',
                risk: 30,
                consequences: {
                    reputation: 10,
                    legal: 20
                }
            },
            // Add more unethical actions here
        };
    }

    /**
     * Perform an unethical action
     */
    performAction(actionId) {
        const actions = this.getDirtyOptions();
        const action = actions[actionId];

        if (!action) {
            return { success: false };
        }

        const randomChance = Math.random() * 100;

        if (randomChance < action.risk) {
            // Not caught
            this.unethicalActions.push({ actionId, caught: false });
            this.reputation -= action.consequences.reputation;
            return { success: true, caught: false };
        } else {
            // Caught
            this.handleCaught(actionId, action);
            return { success: true, caught: true };
        }
    }

    /**
     * Handle being caught for an unethical action
     */
    handleCaught(actionId, action) {
        this.reputation -= action.consequences.reputation * 2;

        if (this.gameState.legalSystem) {
            this.gameState.legalSystem.addLegalIssue({
                type: 'data_violation',
                severity: action.consequences.legal,
                actionId: actionId
            });
        }

        // Record the incident in history
        const date = this.gameState.timeManager ? this.gameState.timeManager.getDateString() : 1;
        this.unethicalActions.push({ actionId, caught: true, date });
    }

    /**
     * Get current reputation level
     */
    getReputationLevel() {
        if (this.reputation >= 70) {
            return 'Excellent';
        } else if (this.reputation >= 30) {
            return 'Moderate';
        } else if (this.reputation >= -10) {
            return 'Poor';
        } else if (this.reputation >= -30) {
            return 'Bad';
        } else if (this.reputation >= -50) {
            return 'Terrible';
        } else {
            return 'Worst';
        }
    }
}